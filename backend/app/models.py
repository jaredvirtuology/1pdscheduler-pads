from sqlalchemy import Column, Integer, String, Boolean, DateTime, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from passlib.context import CryptContext

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

class ConnectionConfig(Base):
    __tablename__ = "connection_configs"

    id = Column(Integer, primary_key=True, index=True)
    api_key = Column(String, index=True)
    api_secret = Column(String)
    base_url = Column(String)
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin user exists
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_password_hash = User.get_password_hash("admin")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=admin_password_hash,
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
    
    db.close()

# Add this at the end of the file
init_db()