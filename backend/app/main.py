"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.core.config import settings
from app.api.v1.api import api_router  # Import the aggregated router
from app.core.logger import logger

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Include API router with /api/v1 prefix
app.include_router(api_router, prefix="/api/v1")

# CORS Configuration - IMPORTANT for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],#["https://lawmate-gilt.vercel.app","https://lawmate-qainburv0-niranjana-ambadis-projects.vercel.app"],  # Explicit for SSE
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Important for SSE
)


@app.get("/")
def read_root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Lawmate API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# @app.on_event("startup")
# async def startup_event():
#     """Run on application startup"""
#     logger.info("Lawmate API started")


# @app.on_event("shutdown")
# async def shutdown_event():
#     """Run on application shutdown"""
#     logger.info("Lawmate API shutdown")
    






