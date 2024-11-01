from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from . import models, database
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="passlib.handlers.bcrypt")
from urllib.parse import unquote_plus
import requests
import httpx
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()

# Use environment variables for configuration
TIGHTLOCK_IP = os.getenv('TIGHTLOCK_IP', '{ADDRESS}')
BASE_URL = f"http://{TIGHTLOCK_IP}/api/v1"
API_KEY = os.getenv('TIGHTLOCK_API_KEY', '{EXAMPLE_API_KEY}')

# Initialize FastAPI app
app = FastAPI(
    title="1pdscheduler-pads",
    description="Scheduling system for pads",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database and create admin user if it doesn't exist
models.init_db()

# Security configurations
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    is_admin: bool = False  # Default to regular user

class User(BaseModel):
    username: str
    email: str
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not models.User.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User)
async def create_user(
    user: UserCreate, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(database.get_db)
):
    # Only admins can create admin users
    if user.is_admin and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create admin users")
    
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = models.User.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/users/", response_model=list[User])
async def list_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view users")
    return db.query(models.User).all()

@app.delete("/users/{user_email}")
async def delete_user(
    user_email: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        # Decode the URL-encoded email
        decoded_email = unquote_plus(user_email)
        
        # Check if user has permission to delete
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete users")
        
        # Prevent deletion of current user
        if current_user.email == decoded_email:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
            
        # Verify user exists first
        user = db.query(models.User).filter(models.User.email == decoded_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

@app.post("/users/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if not models.User.verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = models.User.get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

# Add this new endpoint to your existing FastAPI app
@app.get("/healthcheck")
async def healthcheck():
    headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
    }
    
    url = f"{BASE_URL}/connect"
    response = requests.post(url, headers=headers)
    return response.text, response.status_code

@app.get("/schemas")
async def get_schemas():
    try:
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        }
        
        url = f"{BASE_URL}/schemas"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching schemas from TightLock: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch schemas from TightLock")