from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
from app.models.base import TimestampMixin
import uuid


class User(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False)
    avatar_url = Column(String, nullable=True)
