# # app/core/config.py
"""
Application configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Application
    APP_NAME: str = "Lawmate"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "ap-south-1"
    
    # S3
    S3_BUCKET_NAME: str = "lawmate-case-pdfs"
    
    # DynamoDB (optional)
    DYNAMODB_TABLE_NAME: str = "lawmate-activity-trail"
    
    # CORS
    CORS_ORIGINS: str = '["http://localhost:3000"]'
    
    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # KEY FIX: Ignore extra fields in .env
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from string to list"""
        try:
            if isinstance(self.CORS_ORIGINS, str):
                return json.loads(self.CORS_ORIGINS)
            return self.CORS_ORIGINS
        except:
            return ["http://localhost:3000"]


# Create settings instance
settings = Settings()
# from pydantic_settings import BaseSettings
# from typing import Optional

# class Settings(BaseSettings):
#     # App
#     APP_NAME: str = "Lawmate API"
#     VERSION: str = "1.0.0"
#     DEBUG: bool = False
    
#     # Database
#     DATABASE_URL: str
    
#     # JWT
#     JWT_SECRET_KEY: str
#     JWT_ALGORITHM: str = "HS256"
#     JWT_EXPIRATION_HOURS: int = 24
    
#     # AWS
#     AWS_REGION: str = "ap-south-1"
#     S3_BUCKET: str = "lawmate-case-pdfs"
#     AWS_ACCESS_KEY_ID: Optional[str] = None
#     AWS_SECRET_ACCESS_KEY: Optional[str] = None
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
#     ENVIRONMENT: str = "development"
#     #S3
#     S3_BUCKET_NAME: str  # Add this line
    
#     # Bedrock
#     BEDROCK_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20241022"
    
#     # CORS
#     CORS_ORIGINS: list = ["https://lawmate.in", "chrome-extension://*"]
    
#     class Config:
#         env_file = ".env"
#         case_sensitive = True

# settings = Settings()

# from pydantic_settings import BaseSettings
# from typing import List
# import json

# class Settings(BaseSettings):
#     APP_NAME: str = "Lawmate"
#     DEBUG: bool = True
    
#     # Database
#     DATABASE_URL: str
    
#     # JWT
#     JWT_SECRET_KEY: str
#     JWT_ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
#     # AWS
#     AWS_ACCESS_KEY_ID: str
#     AWS_SECRET_ACCESS_KEY: str
#     AWS_REGION: str = "ap-south-2"
#     S3_BUCKET_NAME: str
    
#     # CORS
#     CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
#     class Config:
#         env_file = ".env"
        
#     @property
#     def cors_origins_list(self) -> List[str]:
#         if isinstance(self.CORS_ORIGINS, str):
#             return json.loads(self.CORS_ORIGINS)
#         return self.CORS_ORIGINS

# settings = Settings()

# """
# Application configuration using Pydantic Settings
# """
# from pydantic_settings import BaseSettings, SettingsConfigDict
# from typing import List, Optional
# import json


# class Settings(BaseSettings):
#     """
#     Application settings loaded from environment variables
#     """
#     # Application
#     APP_NAME: str = "Lawmate"
#     ENVIRONMENT: str = "development"  # development, staging, production
#     DEBUG: bool = True
    
#     # Database
#     DATABASE_URL: str
    
#     # JWT Authentication
#     JWT_SECRET_KEY: str
#     JWT_ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
#     REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
#     # AWS Configuration
#     AWS_ACCESS_KEY_ID: str
#     AWS_SECRET_ACCESS_KEY: str
#     AWS_REGION: str = "ap-south-1"
#     S3_BUCKET_NAME: str
    
#     # AWS Bedrock (Claude)
#     BEDROCK_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    
#     # DynamoDB (Optional - for audit trail)
#     DYNAMODB_TABLE_NAME: Optional[str] = "lawmate-activity-trail"
    
#     # CORS
#     CORS_ORIGINS: str = '["http://localhost:3000"]'  # JSON string
    
#     # File Upload
#     MAX_UPLOAD_SIZE: int = 52428800  # 50MB in bytes
#     ALLOWED_EXTENSIONS: List[str] = [".pdf"]
    
#     # Logging
#     LOG_LEVEL: str = "INFO"
    
#     # Model configuration (Pydantic v2)
#     model_config = SettingsConfigDict(
#         env_file=".env",
#         env_file_encoding="utf-8",
#         case_sensitive=True,
#         extra="ignore"  # Ignore extra fields in .env
#     )
    
#     @property
#     def cors_origins_list(self) -> List[str]:
#         """Parse CORS_ORIGINS JSON string to list"""
#         try:
#             return json.loads(self.CORS_ORIGINS)
#         except json.JSONDecodeError:
#             # Fallback if not valid JSON
#             return self.CORS_ORIGINS.split(",") if isinstance(self.CORS_ORIGINS, str) else []
    
#     @property
#     def is_development(self) -> bool:
#         """Check if running in development mode"""
#         return self.ENVIRONMENT.lower() == "development"
    
#     @property
#     def is_production(self) -> bool:
#         """Check if running in production mode"""
#         return self.ENVIRONMENT.lower() == "production"
    
#     # Aliases for backward compatibility
#     @property
#     def S3_BUCKET(self) -> str:
#         """Alias for S3_BUCKET_NAME"""
#         return self.S3_BUCKET_NAME
    
#     class Config:
#         env_file = ".env"
#         case_sensitive = False


# # Create settings instance
# settings = Settings()