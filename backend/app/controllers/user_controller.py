from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[dict])
async def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = UserService(db)
    users = service.get_all(skip=skip, limit=limit)
    return [{"id": str(u.id), "nome": u.nome, "avatar_url": u.avatar_url} for u in users]


@router.get("/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "nome": user.nome, "avatar_url": user.avatar_url}
