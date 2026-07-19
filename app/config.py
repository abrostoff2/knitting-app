from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ravelry_username: str
    ravelry_password: str
    ravelry_base_url: str = "https://api.ravelry.com"


@lru_cache
def get_settings() -> Settings:
    return Settings()
