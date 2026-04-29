# Request ID Middleware - Sets request ID for each request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.services.logger import set_request_id, get_logger

logger = get_logger(__name__)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID")
        if request_id:
            set_request_id(request_id)
        else:
            set_request_id()

        response = await call_next(request)
        return response
