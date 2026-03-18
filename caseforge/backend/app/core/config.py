from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    GROQ_CHAT_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    GROQ_GENERATION_MODEL: str = "moonshotai/kimi-k2-instruct-0905"
    SESSION_TTL_MINUTES: int = 60
    CORS_ORIGINS: str = '["*"]'

    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["*"]

    @property
    def groq_api_key(self) -> str:
        return self.GROQ_API_KEY

    @property
    def session_ttl_minutes(self) -> int:
        return self.SESSION_TTL_MINUTES

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
