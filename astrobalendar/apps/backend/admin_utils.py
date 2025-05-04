from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_admin
from db.mongo import db
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", summary="List all users", description="Retrieve a list of all registered users. Admin access required.")
async def list_users(admin=Depends(get_current_admin)):
    users = await db.users.find().to_list(100)
    return [{"id": str(user["_id"]), "email": user["email"], "role": user.get("role", "user"), "verified": user.get("verified", False)} for user in users]

@router.get("/logs", summary="Get admin logs", description="Retrieve admin activity logs. Admin access required.")
async def get_logs(admin=Depends(get_current_admin)):
    # Placeholder for actual log retrieval logic
    logs = [
        {"timestamp": "2024-01-01T12:00:00Z", "action": "User login", "user": "admin@example.com"},
        {"timestamp": "2024-01-02T15:30:00Z", "action": "User role changed", "user": "admin@example.com"},
    ]
    return logs

@router.post("/revoke-token", summary="Revoke a user token", description="Revoke a user's token to prevent further access. Admin access required.")
async def revoke_token(token: str, admin=Depends(get_current_admin)):
    # Implement token revocation logic, e.g., add token to blacklist collection
    # For now, just a placeholder response
    return {"message": f"Token {token} revoked successfully."}
