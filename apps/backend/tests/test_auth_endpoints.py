import pytest
from httpx import AsyncClient
from auth_test import app

@pytest.mark.asyncio
async def test_register_login_and_me():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register a new user
        response = await ac.post("/auth/register", json={
            "email": "testuser@example.com",
            "password": "testpassword",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testuser@example.com"
        user_id = data["id"]

        # Login with the new user
        response = await ac.post("/auth/login", data={
            "username": "testuser@example.com",
            "password": "testpassword"
        })
        assert response.status_code == 200
        tokens = response.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens

        access_token = tokens["access_token"]

        # Access /auth/me with the access token
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await ac.get("/auth/me", headers=headers)
        assert response.status_code == 200
        user_info = response.json()
        assert user_info["email"] == "testuser@example.com"

@pytest.mark.asyncio
async def test_protected_routes_access():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register and login user
        await ac.post("/auth/register", json={
            "email": "protecteduser@example.com",
            "password": "testpassword",
            "name": "Protected User"
        })
        login_resp = await ac.post("/auth/login", data={
            "username": "protecteduser@example.com",
            "password": "testpassword"
        })
        tokens = login_resp.json()
        access_token = tokens["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Access protected profile route
        response = await ac.get("/protected/profile", headers=headers)
        assert response.status_code == 200
        profile = response.json()
        assert profile["email"] == "protecteduser@example.com"

        # Access admin-only route should fail
        response = await ac.get("/admin/logs", headers=headers)
        assert response.status_code == 403

@pytest.mark.asyncio
async def test_token_refresh():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register and login user
        await ac.post("/auth/register", json={
            "email": "refreshuser@example.com",
            "password": "testpassword",
            "name": "Refresh User"
        })
        login_resp = await ac.post("/auth/login", data={
            "username": "refreshuser@example.com",
            "password": "testpassword"
        })
        tokens = login_resp.json()
        refresh_token = tokens["refresh_token"]

        # Refresh access token
        response = await ac.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert response.status_code == 200
        new_tokens = response.json()
        assert "access_token" in new_tokens
