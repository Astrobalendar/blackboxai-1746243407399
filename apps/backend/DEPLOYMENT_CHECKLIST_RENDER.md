# Deployment Checklist for AstroBalendar Backend on Render

## 1. Required Environment Variables
- `MONGODB_URI`: MongoDB connection string with proper credentials and SSL enabled.
- `JWT_SECRET_KEY`: Secret key for signing JWT tokens (keep this secure).
- `JWT_ALGORITHM`: JWT signing algorithm (default: HS256).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration time in minutes (e.g., 30).
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time in days (e.g., 7).
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins for frontend apps.
- `DEBUG`: Set to `False` for production.

## 2. Production Settings
- Set `DEBUG=False` in environment variables.
- Configure CORS middleware to allow only trusted origins.
- Enable HTTPS enforcement if applicable.
- Configure logging to capture errors and important events.

## 3. Start Command
Use the following command to start the FastAPI app on Render:
```
uvicorn main:app --host 0.0.0.0 --port 10000 --reload
```
- Note: Render assigns dynamic ports; ensure the port is set via environment variable if needed.

## 4. Files to Include
- `Procfile` (optional): To specify the start command for Render.
- `requirements.txt`: List all Python dependencies.
- `.env.example`: Template for environment variables (do NOT include secrets).
- All source code files and folders.

## 5. Securing Secrets and API Exposure
- Use Render's secret management to store environment variables securely.
- Do not commit `.env` files with secrets to version control.
- Restrict API access with authentication and role-based access control.
- Monitor logs and set up alerts for suspicious activity.

## 6. Additional Recommendations
- Set up a staging environment on Render for testing before production rollout.
- Use Render's health checks and auto-restart features.
- Configure backups for MongoDB and other critical data.
- Document deployment steps and rollback procedures.

---

This checklist ensures a smooth and secure deployment of the AstroBalendar backend on Render.

Please let me know if you need assistance creating any deployment scripts or configuration files.
