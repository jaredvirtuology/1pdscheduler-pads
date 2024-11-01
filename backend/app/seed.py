from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            # Create admin user
            admin_user = models.User(
                username="admin",
                email="admin@example.com",
                hashed_password=models.User.get_password_hash("admin"),
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists!")
    finally:
        db.close()

if __name__ == "__main__":
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    # Seed admin user
    seed_admin() 