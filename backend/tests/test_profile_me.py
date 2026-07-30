"""Testes do endpoint GET /api/profile/me."""

from datetime import datetime
from uuid import uuid4

from app.core.auth_user import AuthUser, UserRole


class _FakeProfile:
    def __init__(self, user_id, role: str = "user"):
        self.id = user_id
        self.nome = "Maria Silva"
        self.email = "maria@example.com"
        self.avatar_url = "https://example.com/avatar.png"
        self.role = role
        self.bio = "Apaixonada por jornalismo"
        self.is_active = True
        self.created_at = datetime(2025, 1, 1, 12, 0, 0)
        self.updated_at = datetime(2025, 1, 1, 12, 0, 0)


def _override_user_and_db(client, role: UserRole = UserRole.USER):
    from app.core.jwt_auth import get_current_user
    from app.database.connection import get_db

    user_id = uuid4()
    fake_user = AuthUser(user_id=user_id, role=role)
    fake_profile = _FakeProfile(user_id, role.value)

    class _FakeQuery:
        def filter(self, *args, **kwargs): return self
        def first(self): return fake_profile

    class _FakeSession:
        def query(self, _model): return _FakeQuery()

    client.app.dependency_overrides[get_current_user] = lambda: fake_user
    client.app.dependency_overrides[get_db] = lambda: _FakeSession()

    return fake_user, fake_profile


# ---------- 200: retorna perfil completo ----------

def test_me_returns_full_profile(client):
    user, _ = _override_user_and_db(client, role=UserRole.ADMIN)

    response = client.get("/api/profile/me")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(user.user_id)
    assert body["nome"] == "Maria Silva"
    assert body["email"] == "maria@example.com"
    assert body["avatar_url"] == "https://example.com/avatar.png"
    assert body["role"] == "admin"
    assert body["is_active"] is True
    assert "created_at" in body
    assert "updated_at" in body


def test_me_works_for_user_role(client):
    _, _ = _override_user_and_db(client, role=UserRole.USER)
    response = client.get("/api/profile/me")
    assert response.status_code == 200
    assert response.json()["role"] == "user"


def test_me_works_for_editor_role(client):
    _, _ = _override_user_and_db(client, role=UserRole.EDITOR)
    response = client.get("/api/profile/me")
    assert response.status_code == 200
    assert response.json()["role"] == "editor"


# ---------- 401: sem token ----------

def test_me_without_token_returns_401(client):
    response = client.get("/api/profile/me")
    assert response.status_code == 401
    body = response.json()
    assert body["error"] == "Unauthorized"
    assert body["code"] == "TOKEN_MISSING"


# ---------- 404: token válido, perfil ausente no banco ----------

def test_me_returns_404_when_profile_missing(client):
    from app.core.jwt_auth import get_current_user
    from app.database.connection import get_db

    user_id = uuid4()
    fake_user = AuthUser(user_id=user_id, role=UserRole.USER)

    class _EmptyQuery:
        def filter(self, *args, **kwargs): return self
        def first(self): return None

    class _EmptySession:
        def query(self, _model): return _EmptyQuery()

    client.app.dependency_overrides[get_current_user] = lambda: fake_user
    client.app.dependency_overrides[get_db] = lambda: _EmptySession()

    response = client.get("/api/profile/me")

    assert response.status_code == 404
    body = response.json()
    assert body["error"] == "Not Found"
    assert body["code"] == "USER_NOT_FOUND"
