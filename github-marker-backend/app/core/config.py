from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GITHUB_API_BASE_URL: str = "https://api.github.com/"
    CORS_ORIGINS: str

    class Config:
        env_file = ".env"

    @property
    def github_search_repos_path(self) -> str:
        return self.GITHUB_API_BASE_URL + "search/repositories"

    @property
    def github_search_user_path(self) -> str:
        return self.GITHUB_API_BASE_URL + "search/users"

    @property
    def github_get_repo_byid(self) -> str:
        return self.GITHUB_API_BASE_URL + "repositories"

    @property
    def cors_origins_list(self) -> list:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
