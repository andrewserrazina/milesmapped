from datetime import date
from uuid import uuid4

from fastapi.testclient import TestClient

BASE_USER_DATA = {
    "password": "secure-password",
    "full_name": "Test User",
    "role": "user",
}


def build_user() -> dict[str, str]:
    return {**BASE_USER_DATA, "email": f"user-{uuid4().hex}@example.com"}


def register_user(client: TestClient, user_data: dict[str, str]) -> None:
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 201


def login_user(client: TestClient, user_data: dict[str, str]) -> str:
    response = client.post(
        "/auth/login", json={"email": user_data["email"], "password": user_data["password"]}
    )
    assert response.status_code == 200
    token_pair = response.json()
    assert "access_token" in token_pair
    return token_pair["access_token"]


def test_user_registration_and_login_flow(client: TestClient) -> None:
    user_data = build_user()
    register_user(client, user_data)
    access_token = login_user(client, user_data)
    assert access_token


def test_create_concierge_search_request(client: TestClient) -> None:
    user_data = build_user()
    register_user(client, user_data)
    access_token = login_user(client, user_data)

    search_payload = {
        "origin": "JFK",
        "destination": "LAX",
        "departure_date": date.today().isoformat(),
        "return_date": None,
        "cabin": "economy",
        "passengers": 1,
        "notes": "Aisle seat preferred",
    }

    response = client.post(
        "/concierge/requests/",
        json=search_payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    for field, value in search_payload.items():
        assert data[field] == value
    assert data["status"] == "new"
    assert data["user_id"] > 0
