import logging
import os
import time

import httpx

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 10.0
MAX_RETRIES = 3
RETRY_BACKOFF = 0.5


def _headers() -> dict:
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def _base_url() -> str | None:
    url = os.getenv("SUPABASE_URL")
    return url.rstrip("/") if url else None


def _request_with_retry(method: str, url: str, **kwargs) -> httpx.Response | None:
    """Chama o Supabase Admin tentando novamente em timeout/falha de rede, ate MAX_RETRIES vezes."""
    for tentativa in range(1, MAX_RETRIES + 1):
        try:
            return httpx.request(method, url, timeout=REQUEST_TIMEOUT, **kwargs)
        except httpx.TimeoutException as erro:
            if tentativa == MAX_RETRIES:
                logger.error(
                    "Timeout ao falar com o Supabase Admin apos %s tentativas (%s %s): %s",
                    MAX_RETRIES, method, url, erro,
                )
                return None
            logger.warning(
                "Timeout ao falar com o Supabase Admin (tentativa %s/%s, %s %s): %s",
                tentativa, MAX_RETRIES, method, url, erro,
            )
        except httpx.RequestError as erro:
            if tentativa == MAX_RETRIES:
                logger.error(
                    "Falha de rede ao falar com o Supabase Admin apos %s tentativas (%s %s): %s",
                    MAX_RETRIES, method, url, erro,
                )
                return None
            logger.warning(
                "Falha de rede ao falar com o Supabase Admin (tentativa %s/%s, %s %s): %s",
                tentativa, MAX_RETRIES, method, url, erro,
            )
        time.sleep(RETRY_BACKOFF * tentativa)
    return None


def set_user_password(user_id: str, new_password: str) -> bool:
    base = _base_url()
    if not (base and os.getenv("SUPABASE_SERVICE_ROLE_KEY")):
        logger.warning("Supabase Admin nao configurado - senha do usuario %s NAO foi alterada.", user_id)
        return False

    resposta = _request_with_retry(
        "PUT",
        f"{base}/auth/v1/admin/users/{user_id}",
        headers=_headers(),
        json={"password": new_password},
    )
    if resposta is None:
        return False
    if resposta.is_error:
        logger.error(
            "Supabase Admin recusou a troca de senha do usuario %s (HTTP %s): %s",
            user_id, resposta.status_code, resposta.text,
        )
    return resposta.is_success


def get_user_email(user_id: str) -> str | None:
    base = _base_url()
    if not (base and os.getenv("SUPABASE_SERVICE_ROLE_KEY")):
        logger.warning("Supabase Admin nao configurado - e-mail do usuario %s NAO foi obtido.", user_id)
        return None

    resposta = _request_with_retry(
        "GET",
        f"{base}/auth/v1/admin/users/{user_id}",
        headers=_headers(),
    )
    if resposta is None:
        return None
    if resposta.is_error:
        logger.error(
            "Supabase Admin recusou a busca do usuario %s (HTTP %s): %s",
            user_id, resposta.status_code, resposta.text,
        )
        return None
    return resposta.json().get("email")
