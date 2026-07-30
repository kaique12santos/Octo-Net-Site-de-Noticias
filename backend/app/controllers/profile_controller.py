from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.profile_schema import ProfileCreate, ProfileResponse, ProfileUpdate
from app.services import profile_service
from app.database.connection import get_db

# Importações vitais para a rota protegida
from app.core.jwt_auth import get_current_user
from app.core.auth_user import AuthUser, UserRole
from app.core.permissions import require_role
from app.core.exceptions import AuthError

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

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: AuthUser = Depends(
        require_role(
            UserRole.USER,
            UserRole.EDITOR,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    Retorna o perfil completo do usuário autenticado.
    Acesso restrito a usuários autenticados com role válida.
    """
    profile = profile_service.get_profile_by_id(db=db, user_id=current_user.user_id)
    if profile is None:
        raise AuthError(
            code="USER_NOT_FOUND",
            message="Usuário autenticado, mas perfil não encontrado no banco.",
            status_code=404,
        )
    return profile

@router.patch("/me", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: AuthUser = Depends(
        require_role(
            UserRole.USER,
            UserRole.EDITOR,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    """
    Atualiza os dados do perfil do usuário autenticado.
    Apenas os campos enviados no corpo da requisição serão alterados.
    """
    # 1. Busca o perfil atual usando o service que você já tem importado
    profile = profile_service.get_profile_by_id(db=db, user_id=current_user.user_id)
    
    if profile is None:
        raise AuthError(
            code="USER_NOT_FOUND",
            message="Usuário autenticado, mas perfil não encontrado no banco.",
            status_code=404,
        )

    try:
        # 2. Extrai APENAS os dados que o frontend enviou (ignora os nulos/não enviados)
        update_data = payload.model_dump(exclude_unset=True)
        
        # 3. Atualiza dinamicamente as colunas no objeto do banco
        for key, value in update_data.items():
            setattr(profile, key, value)

        # 4. Salva as alterações
        db.commit()
        db.refresh(profile)
        
        return profile

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar perfil: {str(e)}")