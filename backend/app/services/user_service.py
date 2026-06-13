from sqlalchemy.orm import Session
from app.models.user import User
from app.services.base_service import BaseService


class UserService(BaseService[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_name(self, nome: str):
        return self.db.query(User).filter(User.nome.ilike(f"%{nome}%")).all()
