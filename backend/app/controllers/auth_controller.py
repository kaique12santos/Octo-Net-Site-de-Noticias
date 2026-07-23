from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Recuperação de acesso"])

RESPOSTA_NEUTRA = "Se os dados estiverem cadastrados, você receberá as instruções em instantes."
ERRO_NEUTRO = "Código ou token inválido, expirado ou já utilizado."

class MensagemResponse(BaseModel):
    mensagem: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=128)
    nova_senha: str = Field(min_length=8, max_length=128)

class ForgotEmailRequest(BaseModel):
    telefone: str = Field(min_length=8, max_length=20)

class VerifyEmailCodeRequest(BaseModel):
    telefone: str = Field(min_length=8, max_length=20)
    codigo: str = Field(pattern=r"^\d{6}$")

class VerifyEmailCodeResponse(BaseModel):
    email_mascarado: str

class LoginCodeRequest(BaseModel):
    email: EmailStr

class LoginCodeVerifyRequest(BaseModel):
    email: EmailStr
    codigo: str = Field(pattern=r"^\d{6}$")

class LoginCodeVerifyResponse(BaseModel):
    user_id: str
    nome: str

@router.post("/forgot-password", response_model=MensagemResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).forgot_password(payload.email)
    return MensagemResponse(mensagem=RESPOSTA_NEUTRA)

@router.post("/reset-password", response_model=MensagemResponse)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not AuthService(db).reset_password(payload.token, payload.nova_senha):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, ERRO_NEUTRO)
    return MensagemResponse(mensagem="Senha redefinida com sucesso.")

@router.post("/forgot-email", response_model=MensagemResponse)
async def forgot_email(payload: ForgotEmailRequest, db: Session = Depends(get_db)):
    AuthService(db).forgot_email(payload.telefone)
    return MensagemResponse(mensagem=RESPOSTA_NEUTRA)

@router.post("/verify-email-code", response_model=VerifyEmailCodeResponse)
async def verify_email_code(payload: VerifyEmailCodeRequest, db: Session = Depends(get_db)):
    mascarado = AuthService(db).verify_email_code(payload.telefone, payload.codigo)
    if mascarado is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, ERRO_NEUTRO)
    return VerifyEmailCodeResponse(email_mascarado=mascarado)

@router.post("/login-code", response_model=MensagemResponse)
async def login_code(payload: LoginCodeRequest, db: Session = Depends(get_db)):
    AuthService(db).request_login_code(payload.email)
    return MensagemResponse(mensagem=RESPOSTA_NEUTRA)

@router.post("/login-code/verify", response_model=LoginCodeVerifyResponse)
async def login_code_verify(payload: LoginCodeVerifyRequest, db: Session = Depends(get_db)):
    user = AuthService(db).verify_login_code(payload.email, payload.codigo)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, ERRO_NEUTRO)
    return LoginCodeVerifyResponse(user_id=str(user.id), nome=user.nome)