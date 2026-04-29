# Logger Service - Centralized logging with request tracking
import logging
import sys
import uuid
from contextvars import ContextVar
from typing import Optional
from datetime import datetime

# Request-scoped request ID
request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_request_id() -> Optional[str]:
    return request_id_ctx.get()


def set_request_id(request_id: Optional[str] = None) -> str:
    if request_id is None:
        request_id = str(uuid.uuid4())[:8]
    request_id_ctx.set(request_id)
    return request_id


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id() or "-"
        return True


class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.utcnow().isoformat()
        request_id = getattr(record, "request_id", "-")
        level = record.levelname
        logger_name = record.name
        message = record.getMessage()

        extra = ""
        if hasattr(record, "error"):
            extra = f' error="{record.error}"'

        return f'[{timestamp}] {level:8} [{request_id}] {logger_name:32} {message}{extra}'


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(logging.INFO)

        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        handler.addFilter(RequestIdFilter())
        handler.setFormatter(StructuredFormatter())

        logger.addHandler(handler)
        logger.propagate = False

    return logger


# Convenience function for creating loggers with extra context
def log_with_context(logger: logging.Logger, level: str, message: str, **kwargs):
    extra = {"extra": kwargs} if kwargs else {}
    getattr(logger, level.lower())(message, **kwargs)


# Request context manager for automatic request ID
class RequestContext:
    def __init__(self, request_id: Optional[str] = None):
        self.request_id = set_request_id(request_id)
        self.logger = get_logger("request")

    def __enter__(self):
        self.logger.info(f"Request started", extra={"request_id": self.request_id})
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.logger.error(f"Request failed", error=str(exc_val))
        else:
            self.logger.info(f"Request completed")
        return False
