from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost/knaps"
    node_env: str = "development"

settings = Settings()
