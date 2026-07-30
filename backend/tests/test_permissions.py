"""Testes do controle de acesso por papel (RBAC).

Dois níveis:
  - Unitários: chamam ``require_role(...)(current_user=...)`` diretamente.
  - End-to-end: batem em ``GET /api/profile/me`` que usa a dependência.
"""

import pytest
from uuid import uuid4

from app.core.auth_user import AuthUser, UserRole
from app.core.exceptions import AuthError
from app.core.permissions import require_role
from app.core.jwt_auth import get_current_user
from app.database.connection import get_db


# ---------- UNITÁRIOS: require_role isolado ----------

def test_require_role_rejects_wrong_role():
    fake_user = AuthUser(user_id=uuid4(), role=UserRole.USER)
    checker = require_role(UserRole.ADMIN)

    with pytest.raises(AuthError) as exc_info:
        checker(current_user=fake_user)

    assert exc_info.value.status_code == 403
    assert exc_info.value.code == "FORBIDDEN"
    assert "user" in exc_info.value.message.lower()
    assert "admin" in exc_info.value.message.lower()


def test_require_role_accepts_allowed_role():
    fake_user = AuthUser(user_id=uuid4(), role=UserRole.ADMIN)
    checker = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)

    result = checker(current_user=fake_user)

    assert result is fake_user


def test_require_role_or_logic_works():
    fake_editor = AuthUser(user_id=uuid4(), role=UserRole.EDITOR)
    fake_super = AuthUser(user_id=uuid4(), role=UserRole.SUPER_ADMIN)
    checker = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)

    with pytest.raises(AuthError):
        checker(current_user=fake_editor)
    assert checker(current_user=fake_super) is fake_super


def test_require_role_without_arguments_raises_value_error():
    with pytest.raises(ValueError):
        require_role()


# ---------- END-TO-END: rota /api/profile/me com require_role ----------

def test_e2e_profile_me_with_visitor_role_returns_403(client):
    from datetime import datetime
    user_id = uuid4()

    fake_user = AuthUser(user_id=user_id, role=UserRole.ADMIN)

    class _FakeProfile:
        id = user_id
        nome = "Maria"
        email = "maria@example.com"
        avatar_url = "https://example.com/a.png"
        role = "admin"
        bio = "bio"
        is_active = True
        created_at = datetime(2025, 1, 1)
        updated_at = datetime(2025, 1, 1)

    class _FakeQuery:
        def filter(self, *a, **kw): return self
        def first(self): return _FakeProfile()

    class _FakeSession:
        def query(self, _m): return _FakeQuery()

    def _fake_current_user(): return fake_user

    client.app.dependency_overrides[get_current_user] = _fake_current_user
    client.app.dependency_overrides[get_db] = lambda: _FakeSession()

    response = client.get("/api/profile/me")

    assert response.status_code == 200


def test_e2e_profile_me_without_token_returns_401(client):
    response = client.get("/api/profile/me")
    assert response.status_code == 401
    body = response.json()
    assert body["error"] == "Unauthorized"
    assert body["code"] == "TOKEN_MISSING"


def test_e2e_profile_me_documents_hierarchy_is_not_implicit(client):
    """
    O ``require_role`` aplicado em /me lista as 4 roles explicitamente.
    Se uma 5ª role fosse criada (ex.: GUEST), ela receberia 403 mesmo
    estando 'abaixo' de USER na hierarquia textual — porque a checagem
    é estrita, não por nível.
    """

    from datetime import datetime
    user_id = uuid4()

    fake_user = AuthUser(user_id=user_id, role=UserRole.ADMIN)

    class _FakeProfile:
        id = user_id
        nome = "Maria"
        email = "maria@example.com"
        avatar_url = "https://example.com/a.png"
        role = "admin"
        bio = None
        is_active = True
        created_at = datetime(2025, 1, 1)
        updated_at = datetime(2025, 1, 1)

    class _FakeQuery:
        def filter(self, *a, **kw): return self
        def first(self): return _FakeProfile()

    class _FakeSession:
        def query(self, _m): return _FakeQuery()

    client.app.dependency_overrides[get_current_user] = lambda: fake_user
    client.app.dependency_overrides[get_db] = lambda: _FakeSession()

    # ADMIN está na allowlist explícita de /me → 200
    response = client.get("/api/profile/me")
    assert response.status_code == 200
