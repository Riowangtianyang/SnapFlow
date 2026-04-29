from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./spec.db"

    VISION_MODEL: str = "minimax/video-01"
    VISION_API_KEY: str = ""
    VISION_API_BASE: str = "https://api.minimax.com"

    REASONING_MODEL: str = "minimax/moe-01"
    REASONING_API_KEY: str = ""
    REASONING_API_BASE: str = "https://api.minimax.com"

    UPLOAD_DIR: str = "./uploads"
    OUTPUT_DIR: str = "./output"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()