from sqlalchemy import Column, String, Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base # Assumindo que seu declarative_base() está aqui

class Profile(Base):
    __tablename__ = 'profiles'

    # O as_uuid=True garante que o Python trate como UUID nativo
    id = Column(UUID(as_uuid=True), primary_key=True, index=True) 
    nome = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(20), default='user')
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())