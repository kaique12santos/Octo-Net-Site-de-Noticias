from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.base import TimestampMixin

PASSWORD_RESET = "password_reset"
EMAIL_RECOVERY = "email_recovery"
LOGIN_CODE = "login_code"


class VerificationToken(Base, TimestampMixin):
    __tablename__ = "verification_tokens"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    token_hash = Column(String(64), nullable=False, index=True)
    purpose = Column(String(32), nullable=False)

    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    attempts = Column(Integer, nullable=False, default=0)

    user = relationship("User", back_populates="verification_tokens")

    def is_valid(self) -> bool:
        return not self.used and self.expires_at > datetime.now(timezone.utc)
