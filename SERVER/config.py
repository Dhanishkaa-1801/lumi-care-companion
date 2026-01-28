import os

class Settings:
    PROJECT_NAME: str = "Lumi Voice for Care"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "sqlite:///./lumi.db"
    
    # Security
    SECRET_KEY: str = "super_secret_key_for_hackathon_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

settings = Settings()
