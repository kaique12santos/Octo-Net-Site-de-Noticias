from enum import Enum
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class UserRole(str, Enum):
    """Papéis aceitos pela aplicação. Manter em sync com profiles_role_check (migration 003).

    Hierarquia (cada um herda permissões dos mais baixos):
        super_admin > admin > editor > user
    """
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    USER = "user"
    # "visitante" (anônimo)


class AuthUser(BaseModel):
    user_id: UUID
    role: UserRole = UserRole.USER
    nome: str
    avatar_url: Optional[str] = None
