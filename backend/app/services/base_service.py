from typing import Generic, TypeVar, List, Optional
from sqlalchemy.orm import Session

T = TypeVar("T")


class BaseService(Generic[T]):
    def __init__(self, db: Session, model_class: type):
        self.db = db
        self.model_class = model_class

    def get_by_id(self, id: str) -> Optional[T]:
        return self.db.query(self.model_class).filter(self.model_class.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model_class).offset(skip).limit(limit).all()

    def create(self, obj_in: dict) -> T:
        db_obj = self.model_class(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> bool:
        obj = self.get_by_id(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False
