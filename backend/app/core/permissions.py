from fastapi import Depends
from app.core.auth_user import AuthUser, UserRole
from app.core.exceptions import AuthError
from app.core.jwt_auth import get_current_user


def require_role(*allowed_roles: UserRole):
    if not allowed_roles:
        raise ValueError(
            "require_role precisa de ao menos um UserRole. "
            "Ex.: Depends(require_role(UserRole.ADMIN))"
        )

    allowed = set(allowed_roles)

    def _checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        """
        Verifica se o usuário autenticado possui um dos papéis requeridos por parametro.
        """
        if current_user.role not in allowed:
            allowed_str = ", ".join(
                r.value for r in sorted(allowed, key=lambda x: x.value)
            )
            raise AuthError(
                code="FORBIDDEN",
                message=(
                    f"Acesso negado. Seu papel '{current_user.role.value}' "
                    f"não tem permissão. Necessário um dos: {allowed_str}."
                ),
                status_code=403,
            )
        return current_user

    return _checker
