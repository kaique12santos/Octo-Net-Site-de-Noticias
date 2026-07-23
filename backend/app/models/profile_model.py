# Consolidado em app.models.user.User (mesma tabela 'profiles') para evitar dois
# mappers SQLAlchemy declarando __tablename__ = "profiles" ao mesmo tempo.
# Mantido como alias para não quebrar imports antigos.
from app.models.user import User as Profile

__all__ = ["Profile"]
