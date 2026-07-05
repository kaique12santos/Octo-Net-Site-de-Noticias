from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.profile_schema import ProfileCreate, ProfileResponse
from app.services import profile_service

from app.database.connection import get_db

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.post("/register", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def register_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    """
    Sincroniza o usuário recém-criado no Supabase Auth com a tabela 'profiles' pública.
    """
    try:
        return profile_service.sync_profile(db=db, profile_data=profile)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar perfil: {str(e)}")