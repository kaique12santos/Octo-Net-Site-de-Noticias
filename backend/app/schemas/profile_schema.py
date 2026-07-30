from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

# O que esperamos receber do Frontend (POST - Cadastro inicial)
class ProfileCreate(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    avatar_url: Optional[str] = None
    role: Optional[str] = 'user'

# PATCH (Atualização de Perfil)
class ProfileUpdate(BaseModel):
    nome: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    cpf: Optional[str] = None
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None

# O que vamos devolver para o Frontend (Response)
class ProfileResponse(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    avatar_url: Optional[str]
    role: str
    bio: Optional[str] = None 
    
    # Campos Corporativos (Opcionais pois usuários comuns não terão)
    cpf: Optional[str] = None
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True