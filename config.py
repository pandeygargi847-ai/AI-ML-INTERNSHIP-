import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:

    SECRET_KEY = "health_monitor_secret_key"

    DATABASE = os.path.join(
        BASE_DIR,
        "database",
        "users.db"
    )

    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "uploads"
    )

    MODEL_FOLDER = os.path.join(
        BASE_DIR,
        "models"
    )

    REPORT_FOLDER = os.path.join(
        BASE_DIR,
        "reports"
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024