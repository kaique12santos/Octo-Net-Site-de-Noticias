import logging
import os

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core import supabase_admin
from app.core.token_utils import mask_email
from app.models.user import User
from app.models.verification_token import EMAIL_RECOVERY, LOGIN_CODE, PASSWORD_RESET
from app.services.email_service import EmailService
from app.services.phone_service import PhoneService
from app.services.user_service import UserService
from app.services.verification_token_service import VerificationTokenService

logger = logging.getLogger(__name__)

RESET_URL_BASE = os.getenv("RESET_URL_BASE", "http://localhost:5173/redefinir-senha")

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.profiles = UserService(db)
        self.tokens = VerificationTokenService(db)
        self.email = EmailService()
        self.phone = PhoneService()

    def _profile_id_by_email(self, email: str):
        row = self.db.execute(
            text("SELECT id FROM auth.users WHERE lower(email) = lower(:email)"),
            {"email": email.strip()},
        ).first()
        return row[0] if row else None

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

    def reset_password(self, token: str, nova_senha: str) -> bool:
        registro = self.tokens.find_valid_link(token, PASSWORD_RESET)
        if registro is None:
            return False

        if not supabase_admin.set_user_password(str(registro.user_id), nova_senha):
            return False

        self.tokens.burn(registro, PASSWORD_RESET)
        self.tokens.revoke(registro.user_id, LOGIN_CODE)
        return True

    def forgot_email(self, telefone: str) -> None:
        profile = self.profiles.get_by_telefone(telefone)
        if profile is None:
            logger.info("Pedido de recuperacao de e-mail para telefone desconhecido (ignorado).")
            return

        codigo = self.tokens.issue_code(profile.id, EMAIL_RECOVERY)
        if codigo is None:
            logger.info("Pedido de recuperacao de e-mail ignorado (rate limit).")
            return

        self.phone.send_sms(
            profile.telefone,
            f"Octo-Net: seu codigo para recuperar o e-mail e {codigo}. Vale 10 minutos.",
        )

    def verify_email_code(self, telefone: str, codigo: str) -> str | None:
        profile = self.profiles.get_by_telefone(telefone)
        if profile is None:
            return None

        token = self.tokens.verify_code(profile.id, codigo, EMAIL_RECOVERY)
        if token is None:
            return None

        email = supabase_admin.get_user_email(str(profile.id))
        if email is None:
            return None

        self.tokens.burn(token, EMAIL_RECOVERY)
        return mask_email(email)

    def request_login_code(self, email: str) -> None:
        profile_id = self._profile_id_by_email(email)
        if profile_id is None:
            return

        codigo = self.tokens.issue_code(profile_id, LOGIN_CODE)
        if codigo is None:
            logger.info("Pedido de codigo de login ignorado (rate limit).")
            return

        self.email.send(
            email,
            "Seu código de acesso — Octo-Net",
            f"Código de acesso: {codigo}\nVálido por 10 minutos.",
        )

    def verify_login_code(self, email: str, codigo: str) -> User | None:
        profile_id = self._profile_id_by_email(email)
        if profile_id is None:
            return None

        token = self.tokens.verify_code(profile_id, codigo, LOGIN_CODE)
        if token is None:
            return None

        user = self.profiles.get_by_id(profile_id)
        if user is None:
            return None

        self.tokens.burn(token, LOGIN_CODE)
        return user
