from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

# O que esperamos receber do Frontend (POST)
class ProfileCreate(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    avatar_url: Optional[str] = None
    role: Optional[str] = 'user'

# O que vamos devolver para o Frontend (Response)
class ProfileResponse(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    avatar_url: Optional[str]
    role: str
    bio: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Essencial para converter o Model do SQLAlchemy em JSON