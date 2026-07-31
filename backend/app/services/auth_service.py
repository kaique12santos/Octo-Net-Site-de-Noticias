import logging
import os
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core import supabase_admin
from app.services.email_service import EmailService
from app.services.verification_token_service import VerificationTokenService
from app.models.verification_token import PASSWORD_RESET

logger = logging.getLogger(__name__)
RESET_URL_BASE = os.getenv("RESET_URL_BASE", "http://localhost:5173/resetsenha")

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.tokens = VerificationTokenService(db)
        self.email = EmailService()

    def _profile_id_by_email(self, email: str):
        row = self.db.execute(
            text("SELECT id FROM auth.users WHERE lower(email) = lower(:email)"),
            {"email": email.strip()},
        ).first()
        return row[0] if row else None

    # Envia e-mail de redefinição de senha
    def forgot_password(self, email: str) -> None:
        profile_id = self._profile_id_by_email(email)
        if profile_id is None:
            logger.info("Pedido de redefinicao para e-mail nao cadastrado (ignorado).")
            return
            
        raw = self.tokens.issue_link(profile_id, PASSWORD_RESET)
        if raw is None:
            logger.info("Pedido de redefinicao de senha ignorado (rate limit).")
            return
            
        link = f"{RESET_URL_BASE}?token={raw}"
        self.email.send(
            email,
            "Redefinição de senha — Octo-Net",
            f"Para criar uma nova senha, acesse:\n{link}\n\n"
            "O link vale por 30 minutos e só pode ser usado uma vez.\n"
            "Se não foi você quem pediu, ignore este e-mail.",
        )
    # Resete de senha com token
    def reset_password(self, token: str, nova_senha: str) -> bool:
        registro = self.tokens.find_valid_link(token, PASSWORD_RESET)
        if registro is None:
            return False
            
        if not supabase_admin.set_user_password(str(registro.user_id), nova_senha):
            return False
            
        self.tokens.burn(registro, PASSWORD_RESET)
        return True