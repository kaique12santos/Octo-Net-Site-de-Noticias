import os
import json
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
from app.models.profile_model import Profile

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

security_scheme = HTTPBearer(auto_error=False)

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
        url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
        )
        
        with urllib.request.urlopen(req) as response:
            user_data = json.loads(response.read().decode())
            user_id = user_data.get("id")
            
            if not user_id:
                raise ValueError("ID não retornado pelo Supabase")
                
    except urllib.error.HTTPError:
        # Se o Supabase retornar 401 ou 403, o token é falso, expirou ou a conta foi banida
        raise AuthError(code="TOKEN_INVALID", message="Token expirado ou inválido.", status_code=401)
    except Exception as e:
        raise AuthError(code="TOKEN_INVALID", message=f"Erro de comunicação com o Auth: {str(e)}", status_code=401)

    # Busca no banco de dados local da aplicação
    profile = db.query(Profile).filter(Profile.id == str(user_id)).first()
    
    if profile is None:
        raise AuthError(code="USER_NOT_FOUND", message="Usuário autenticado, mas perfil não encontrado.", status_code=401)

    try:
        role = UserRole(profile.role)
    except ValueError:
        role = UserRole.USER

    return AuthUser(user_id=UUID(str(user_id)), role=role)