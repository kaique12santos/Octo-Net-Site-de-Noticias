from sqlalchemy.orm import Session
from app.models.news import News
from app.services.base_service import BaseService


class NewsService(BaseService[News]):
    def __init__(self, db: Session):
        super().__init__(db, News)

    def get_by_category(self, categoria_id: str):
        return self.db.query(News).filter(News.categoria_id == categoria_id).all()
