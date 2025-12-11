import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import coffee_shops, auth
from app.core.database import engine, Base
from app.models import coffee_shop, user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coffee Filter API",
    description="API for managing coffee shop data",
    version="1.0.0"
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

