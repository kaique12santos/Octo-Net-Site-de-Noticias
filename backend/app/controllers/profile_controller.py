from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.profile_schema import ProfileCreate, ProfileResponse
from app.services import profile_service
from app.database.connection import get_db

# Importações vitais para a rota protegida
from app.core.jwt_auth import get_current_user
from app.core.auth_user import AuthUser

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

# NOVA ROTA PROTEGIDA: A prova de fogo do JWT
@router.get("/me")
def get_my_profile(current_user: AuthUser = Depends(get_current_user)):
    """
    Rota protegida! Só chega aqui se o token JWT for válido.
    O middleware injeta os dados do usuário logado na variável current_user.
    """
    print(f"Perfil do usuário logado: {current_user}")
    return {
        "message": "Acesso autorizado com sucesso!!",
        "user_id": str(current_user.user_id),
        "role": current_user.role.value,
        "nome": current_user.nome,
        "avatar_url": current_user.avatar_url
    }