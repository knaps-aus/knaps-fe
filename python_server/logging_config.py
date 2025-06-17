import json
import logging
import logging.config
import os
from logging.handlers import TimedRotatingFileHandler


class JsonFormatter(logging.Formatter):
    """Format log records as compact JSON."""

    def format(self, record: logging.LogRecord) -> str:
        data = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for attr in ("request_id", "method", "path", "status", "duration_ms", "body"):
            value = getattr(record, attr, None)
            if value is not None:
                data[attr] = value
        return json.dumps(data)


LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {"format": "%(levelname)s %(name)s - %(message)s"},
        "json": {"()": "python_server.logging_config.JsonFormatter"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "console"},
        "file": {
            "class": "logging.handlers.TimedRotatingFileHandler",
            "filename": os.path.join("logs", "api.log"),
            "when": "midnight",
            "backupCount": 7,
            "formatter": "json",
        },
    },
    "loggers": {
        "knaps": {"handlers": ["console", "file"], "level": "INFO"},
        "uvicorn.error": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
    },
}


def setup_logging() -> logging.Logger:
    os.makedirs("logs", exist_ok=True)
    logging.config.dictConfig(LOG_CONFIG)
    return logging.getLogger("knaps")


LOG = setup_logging()
