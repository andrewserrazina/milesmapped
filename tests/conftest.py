import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("EMAIL_API_KEY", "test-email-key")

from app.api.deps import get_db
from app.core.config import settings
from app.db.base import Base
from app.main import app

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_session: Session, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: db_session

    from app.api.routes import concierge
    from app.core import security

    monkeypatch.setattr(concierge, "send_email", lambda *args, **kwargs: None)

    monkeypatch.setattr(security, "get_password_hash", lambda password: f"hashed-{password}")
    monkeypatch.setattr(
        security, "verify_password", lambda password, hashed: hashed == f"hashed-{password}"
    )

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
