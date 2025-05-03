from fastapi import APIRouter, HTTPException, status
from typing import List
from apps.backend.models import ClientCreate, ClientUpdate, ClientOut
from apps.backend.services.client_service import (
    get_all_clients,
    get_client,
    create_client,
    update_client,
    delete_client,
)

router = APIRouter()

@router.get("/", response_model=List[ClientOut])
async def list_clients():
    return get_all_clients()

@router.post("/", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def add_client(client: ClientCreate):
    return create_client(client)

@router.get("/{client_id}", response_model=ClientOut)
async def get_client_by_id(client_id: str):
    client = get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientOut)
async def update_client_by_id(client_id: str, client_update: ClientUpdate):
    updated_client = update_client(client_id, client_update)
    if not updated_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client_by_id(client_id: str):
    success = delete_client(client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return
