import hmac
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.token_utils import generate_code, generate_token, hash_token
from app.models.verification_token import VerificationToken

TOKEN_TTL = timedelta(minutes=30)
CODE_TTL = timedelta(minutes=10)
MAX_ATTEMPTS = 5
ISSUE_COOLDOWN = timedelta(seconds=30)


class VerificationTokenService:
    def __init__(self, db: Session):
        self.db = db

    def issue_link(self, user_id, purpose: str) -> str | None:
        """Retorna None se um link/codigo do mesmo purpose foi emitido ha menos de ISSUE_COOLDOWN (rate limit)."""
        if self._recently_issued(user_id, purpose):
            return None
        raw = generate_token()
        self._create(user_id, hash_token(raw), purpose, TOKEN_TTL)
        return raw

    def issue_code(self, user_id, purpose: str) -> str | None:
        if self._recently_issued(user_id, purpose):
            return None
        self.invalidate_all(user_id, purpose)
        raw = generate_code()
        self._create(user_id, hash_token(raw), purpose, CODE_TTL)
        return raw

    def find_valid_link(self, raw: str, purpose: str) -> VerificationToken | None:
        """Valida o link sem queima-lo. Chame burn() so depois que a operacao associada tiver sucesso."""
        token = (
            self.db.query(VerificationToken)
            .filter(
                VerificationToken.token_hash == hash_token(raw),
                VerificationToken.purpose == purpose,
            )
            .first()
        )
        if token is None or not token.is_valid():
            return None
        return token

    def verify_code(self, user_id, raw: str, purpose: str) -> VerificationToken | None:
        """Confere o codigo (limitando tentativas) sem queima-lo. Chame burn() so apos sucesso da operacao associada."""
        token = self._latest(user_id, purpose)
        if token is None or not token.is_valid() or token.attempts >= MAX_ATTEMPTS:
            return None

        if not hmac.compare_digest(hash_token(raw), token.token_hash):
            token.attempts += 1
            self.db.commit()
            return None

        return token

    def burn(self, token: VerificationToken, purpose: str) -> None:
        self._burn(token, purpose)

    def revoke(self, user_id, purpose: str) -> None:
        self.invalidate_all(user_id, purpose)

    def invalidate_all(self, user_id, purpose: str) -> None:
        (
            self.db.query(VerificationToken)
            .filter(
                VerificationToken.user_id == user_id,
                VerificationToken.purpose == purpose,
                VerificationToken.used.is_(False),
            )
            .update({VerificationToken.used: True}, synchronize_session=False)
        )
        self.db.commit()

    def _create(self, user_id, token_hash: str, purpose: str, ttl: timedelta) -> VerificationToken:
        token = VerificationToken(
            user_id=user_id,
            token_hash=token_hash,
            purpose=purpose,
            expires_at=datetime.now(timezone.utc) + ttl,
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def _latest(self, user_id, purpose: str) -> VerificationToken | None:
        return (
            self.db.query(VerificationToken)
            .filter(
                VerificationToken.user_id == user_id,
                VerificationToken.purpose == purpose,
            )
            .order_by(VerificationToken.created_at.desc(), VerificationToken.id.desc())
            .first()
        )

    def _recently_issued(self, user_id, purpose: str) -> bool:
        latest = self._latest(user_id, purpose)
        if latest is None:
            return False
        return latest.created_at > datetime.now(timezone.utc) - ISSUE_COOLDOWN

    def _burn(self, token: VerificationToken, purpose: str) -> None:
        token.used = True
        self.db.commit()
        self.invalidate_all(token.user_id, purpose)
