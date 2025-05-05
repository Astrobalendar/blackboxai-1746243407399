# Authentication Module - AstroBalendar

## Overview
This module provides a complete authentication system for the AstroBalendar backend, including user registration, login, JWT-based authentication, role-based access control, token refresh, and email verification flow.

## File Structure
- `routes.py`: Defines `/auth` endpoints for registration, login, token refresh, and user info.
- `advanced_features.py`: Implements token refresh, role-based access control, and email verification.
- `dependencies.py`: JWT token validation and current user retrieval dependencies.
- `schemas.py`: Pydantic models for request and response validation.
- `utils.py`: Password hashing, token creation, and verification utilities.
- `protected_routes.py`: Example protected routes demonstrating token and role-based access.

## Environment Variables
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET_KEY`: Secret key for JWT encoding/decoding.
- `JWT_ALGORITHM`: Algorithm used for JWT (default: HS256).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time.
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time.

## Endpoints

### Public
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Login and receive access and refresh tokens.

### Token Management
- `POST /auth/refresh`: Refresh access token using a valid refresh token.

### User Info
- `GET /auth/me`: Get current authenticated user info (JWT protected).

### Email Verification
- `GET /auth/verify-email/{user_id}`: Verify user email (mock implementation).

### Protected Routes (Examples)
- `GET /protected/profile`: Get profile info (JWT protected).
- `GET /protected/example`: Example protected route.
- `GET /predict`: Example prediction route (requires authentication).
- `GET /admin/logs`: Admin-only route (role-based access).

## Usage
1. Include the auth routers in your FastAPI app:
```python
from auth.routes import router as auth_router
from protected_routes import router as protected_router

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(protected_router, prefix="/protected", tags=["Protected"])
```

2. Ensure environment variables are set and loaded before app startup.

3. Use the provided dependencies for route protection and role-based access control.

## Testing
- Use the `auth_test.py` standalone app for isolated testing of authentication features.
- Test registration, login, token refresh, and protected routes.
- Validate role-based access by assigning roles in the user document.

## Notes
- Email verification is mocked; integrate with an email service for production.
- Adjust token expiration times as needed.
- Follow security best practices for secret management.

## Next Steps
- Integrate into main backend once file editing is available.
- Expand protected routes for application-specific features.
- Add automated tests and OpenAPI documentation.

---
AstroBalendar Authentication Module
