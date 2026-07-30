import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.jwt_auth import get_current_user
from app.database.connection import get_db


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)
