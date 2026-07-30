from fastapi import Request
from fastapi.responses import JSONResponse


class AuthError(Exception):
    """Exceção específica da camada de auth.

    Cada falha do middleware JWT levanta AuthError.
    O handler abaixo renderiza {error, code, message} padronizado.
    """

    def __init__(self, code: str, message: str, status_code: int = 401):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


_STATUS_TO_LABEL = {
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Server Error",
}


async def auth_error_handler(request: Request, exc: AuthError) -> JSONResponse:
    label = _STATUS_TO_LABEL.get(exc.status_code, "Error")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": label,
            "code": exc.code,
            "message": exc.message,
        },
    )

