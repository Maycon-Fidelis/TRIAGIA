from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Banco de dados
    database_url: str = "postgresql://radia:radia123@localhost:5432/radia"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Armazenamento de imagens
    storage_path: str = "/app/storage"
    supabase_url: str = ""
    supabase_key: str = ""

    # IA: "ml" usa DenseNet121 PyTorch, "demo" usa heurística rápida sem GPU
    ai_mode: str = "demo"

    # App
    environment: str = "development"
    secret_key: str = "chave-insegura-troque-em-producao"
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
