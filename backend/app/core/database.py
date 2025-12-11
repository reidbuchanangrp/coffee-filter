from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - defaults to SQLite, but can be overridden with environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coffee_shops.db")

# For SQLite, we need to handle threading differently
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # For PostgreSQL or other databases - use connection pooling for performance
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,              # Maintain 5 connections in the pool
        max_overflow=10,          # Allow up to 10 additional connections
        pool_timeout=30,          # Wait up to 30s for a connection
        pool_recycle=1800,        # Recycle connections after 30 minutes
        pool_pre_ping=True,       # Verify connections are alive before using
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

