from fastapi import APIRouter, Depends
from app.core.jwt_auth import get_current_user
from app.core.auth_user import AuthUser

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_my_profile(current_user: AuthUser = Depends(get_current_user)):
    """
    Rota super protegida! Só chega aqui se o token JWT for válido.
    O middleware injeta os dados do usuário logado na variável current_user.
    """
    return {
        "message": "Acesso autorizado com sucesso!",
        "user_id": str(current_user.user_id),
        "role": current_user.role.value
    }