"""RailMadad AI Platform — Core Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ──────────────────────────────────
    APP_NAME: str = "RailMadad-AI-Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"

    # ── Database ─────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/railmadad"

    # ── Redis ────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ── Vector DB ────────────────────────────
    VECTOR_DB_PROVIDER: str = "pgvector"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "railmadad_embeddings"

    # ── JWT / Auth ───────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OTP_EXPIRY_SECONDS: int = 300
    OTP_LENGTH: int = 6

    # ── LLM ──────────────────────────────────
    LLM_PROVIDER: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = ""
    LLAMA_API_URL: str = ""
    LLAMA_MODEL: str = ""

    # ── LangChain ────────────────────────────
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "railmadad"

    # ── Embeddings ───────────────────────────
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Whisper ──────────────────────────────
    WHISPER_MODEL_SIZE: str = "base"
    OPENAI_API_KEY: str = ""

    # ── Computer Vision ─────────────────────
    CV_PROVIDER: str = ""
    HUGGINGFACE_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    NVIDIA_INFERENCE_URL: str = ""

    # ── Classification ──────────────────────
    CLASSIFICATION_STRATEGY: str = ""
    SENTIMENT_MODEL: str = "nlptown/bert-base-multilingual-uncased-sentiment"

    # ── Forecasting ─────────────────────────
    FORECASTING_MODEL: str = ""

    # ── Maps ────────────────────────────────
    MAPS_PROVIDER: str = ""
    GOOGLE_MAPS_API_KEY: str = ""

    # ── Notifications ───────────────────────
    SMS_PROVIDER: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    EMAIL_PROVIDER: str = ""
    SENDGRID_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@railmadad.in"
    PUSH_PROVIDER: str = ""
    FCM_SERVER_KEY: str = ""

    # ── Monitoring ──────────────────────────
    PROMETHEUS_ENABLED: bool = True

    # ── Misc ────────────────────────────────
    UPLOAD_MAX_SIZE_MB: int = 25
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
