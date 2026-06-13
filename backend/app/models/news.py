import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.connection import Base
from app.models.base import TimestampMixin

class News(Base, TimestampMixin):
    __tablename__ = "news"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String(255), nullable=False)
    resumo = Column(Text, nullable=False)
    conteudo = Column(Text, nullable=False)
    autor_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    categoria_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    autor = relationship("User", backref="news")
    
    # (Aviso: O colega precisará criar o arquivo app/models/category.py para mapear a tabela categories depois)