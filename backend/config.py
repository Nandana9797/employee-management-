import os

from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()


class Config:
    """Application configuration derived from environment variables."""

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", "3306"))
    DB_NAME = os.environ.get("DB_NAME", "employee_db")
    DB_USER = os.environ.get("DB_USER", "employee_user")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "change_me")
    PORT = int(os.environ.get("PORT", "5000"))
    DEBUG = os.environ.get("FLASK_ENV", "development") == "development"
