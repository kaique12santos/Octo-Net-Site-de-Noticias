from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Recuperação de acesso"])

RESPOSTA_NEUTRA = "Se os dados estiverem cadastrados, você receberá as instruções em instantes."
ERRO_NEUTRO = "Código ou token inválido, expirado ou já utilizado."

# Schemas
class MensagemResponse(BaseModel):
    mensagem: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=128)
    nova_senha: str = Field(min_length=8, max_length=128)

# Endpoints
@router.post("/forgot-password", response_model=MensagemResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).forgot_password(payload.email)
    return MensagemResponse(mensagem=RESPOSTA_NEUTRA)

@router.post("/reset-password", response_model=MensagemResponse)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not AuthService(db).reset_password(payload.token, payload.nova_senha):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, ERRO_NEUTRO)
    return MensagemResponse(mensagem="Senha redefinida com sucesso.")