from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://ammaar:knaps@127.0.0.1/ammaar"
    node_env: str = "development"

settings = Settings()
