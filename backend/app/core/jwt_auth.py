import logging
import os
import json
import time
import urllib.request
import urllib.error
from uuid import UUID
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.core.auth_user import AuthUser, UserRole
from app.core.exceptions import AuthError
from app.database.connection import get_db
from app.models.user import User

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_REQUEST_TIMEOUT = 10
SUPABASE_MAX_RETRIES = 3
SUPABASE_RETRY_BACKOFF = 0.5

security_scheme = HTTPBearer(auto_error=False)


def _fetch_supabase_user(token: str) -> dict:
    """Busca o usuario no Supabase Auth, tentando novamente em falhas transitorias (timeout/rede)."""
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        },
    )

    for tentativa in range(1, SUPABASE_MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=SUPABASE_REQUEST_TIMEOUT) as response:
                return json.loads(response.read().decode())
        except urllib.error.HTTPError:
            # 401/403: token invalido/expirado - nao e transitorio, nao adianta tentar de novo
            raise
        except TimeoutError as erro:
            if tentativa == SUPABASE_MAX_RETRIES:
                logger.error(
                    "Timeout ao buscar usuario no Supabase apos %s tentativas: %s",
                    SUPABASE_MAX_RETRIES, erro,
                )
                raise
            logger.warning(
                "Timeout ao buscar usuario no Supabase (tentativa %s/%s): %s",
                tentativa, SUPABASE_MAX_RETRIES, erro,
            )
            time.sleep(SUPABASE_RETRY_BACKOFF * tentativa)
        except urllib.error.URLError as erro:
            if tentativa == SUPABASE_MAX_RETRIES:
                logger.error(
                    "Falha de rede ao buscar usuario no Supabase apos %s tentativas: %s",
                    SUPABASE_MAX_RETRIES, erro,
                )
                raise
            logger.warning(
                "Falha de rede ao buscar usuario no Supabase (tentativa %s/%s): %s",
                tentativa, SUPABASE_MAX_RETRIES, erro,
            )
            time.sleep(SUPABASE_RETRY_BACKOFF * tentativa)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> AuthUser:
    
    if credentials is None or not credentials.credentials:
        raise AuthError(code="TOKEN_MISSING", message="Token de autenticação não fornecido.", status_code=401)

    token = credentials.credentials

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise AuthError(
            code="SERVER_MISCONFIGURED",
            message="Variáveis do Supabase ausentes no .env",
            status_code=500,
        )

    try:
        user_data = _fetch_supabase_user(token)
        user_id = user_data.get("id")

        if not user_id:
            raise ValueError("ID não retornado pelo Supabase")

    except urllib.error.HTTPError:
        # Se o Supabase retornar 401 ou 403, o token é falso, expirou ou a conta foi banida
        raise AuthError(code="TOKEN_INVALID", message="Token expirado ou inválido.", status_code=401)
    except (TimeoutError, urllib.error.URLError):
        # Ja tentamos SUPABASE_MAX_RETRIES vezes (ver _fetch_supabase_user) - servico fora do ar
        raise AuthError(
            code="AUTH_SERVICE_UNAVAILABLE",
            message="Serviço de autenticação indisponível no momento. Tente novamente em instantes.",
            status_code=503,
        )
    except Exception:
        logger.exception("Erro inesperado ao buscar usuario no Supabase")
        raise AuthError(code="TOKEN_INVALID", message="Erro de comunicação com o serviço de autenticação.", status_code=401)

    # Busca no banco de dados local da aplicação
    profile = db.query(User).filter(User.id == str(user_id)).first()
    
    if profile is None:
        raise AuthError(code="USER_NOT_FOUND", message="Usuário autenticado, mas perfil não encontrado.", status_code=401)

    try:
        role = UserRole(profile.role)
    except ValueError:
        role = UserRole.USER

    return AuthUser(user_id=UUID(str(user_id)), role=role)