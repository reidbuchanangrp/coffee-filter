import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import coffee_shops
from app.core.database import engine, Base
from app.models import coffee_shop

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coffee Filter API",
    description="API for managing coffee shop data",
    version="1.0.0"
)

# Configure CORS to allow requests from the frontend
cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:5175",
    # Production frontend URLs
    "https://coffee-filter-ui-production.up.railway.app",
]

# Add any additional origins from environment variable
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    cors_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(coffee_shops.router, prefix="/api/v1", tags=["coffee-shops"])

@app.get("/")
async def root():
    return {"message": "Coffee Filter API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

