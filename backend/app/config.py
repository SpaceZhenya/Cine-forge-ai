from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CineForge AI"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cineforge"
    redis_url: str = "redis://localhost:6379/0"

    openai_api_key: str = ""
    openai_model: str = "gpt-4"  # fallback if 5.5 unavailable

    sora_api_key: str = ""
    sora_model: str = "sora-2"

    tts_model: str = "tts-1-hd"
    music_model: str = "musicgen"

    storage_endpoint: str = "http://localhost:9000"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_bucket: str = "cineforge"

    max_film_duration: int = 30  # minutes
    max_co_authors: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
