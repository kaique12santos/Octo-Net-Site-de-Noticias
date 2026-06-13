from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.services.news_service import NewsService

router = APIRouter(prefix="/news", tags=["News"])


@router.get("")
async def list_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = NewsService(db)
    news = service.get_all(skip=skip, limit=limit)
    return [{"id": str(n.id), "titulo": n.titulo, "resumo": n.resumo} for n in news]
