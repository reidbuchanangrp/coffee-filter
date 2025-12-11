import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import coffee_shops, auth
from app.core.database import engine, Base, SessionLocal
from app.core.auth import get_password_hash
from app.models import coffee_shop, user
from app.models.user import User

# Create database tables
Base.metadata.create_all(bind=engine)


def create_default_admin():
    """Create default admin user if none exists."""
    db = SessionLocal()
    try:
        # Check if any admin exists
        admin_exists = db.query(User).filter(User.is_admin == True).first()
        if not admin_exists:
            # Get credentials from environment or use defaults
            admin_username = os.getenv("ADMIN_USERNAME", "admin")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
            
            # Check if user with this username exists
            existing_user = db.query(User).filter(User.username == admin_username).first()
            if existing_user:
                # Make existing user an admin
                existing_user.is_admin = True
                db.commit()
                print(f"Updated existing user '{admin_username}' to admin")
            else:
                # Create new admin user
                hashed_password = get_password_hash(admin_password)
                admin_user = User(
                    username=admin_username,
                    hashed_password=hashed_password,
                    is_admin=True
                )
                db.add(admin_user)
                db.commit()
                print(f"Created admin user: {admin_username}")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create default admin if needed
    create_default_admin()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="Coffee Filter API",
    description="API for managing coffee shop data",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow requests from the frontend
# In production, set CORS_ORIGINS env var to your frontend URL(s)
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
cors_origins.extend([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:5175",
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(coffee_shops.router, prefix="/api/v1", tags=["coffee-shops"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Coffee Filter API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

