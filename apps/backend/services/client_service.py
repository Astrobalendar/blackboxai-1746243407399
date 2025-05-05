import json
import os
from typing import List, Optional
from apps.backend.models import ClientCreate, ClientUpdate, ClientOut

CLIENTS_FILE = "clients.json"

def load_clients() -> List[ClientOut]:
    if not os.path.exists(CLIENTS_FILE):
        return []
    with open(CLIENTS_FILE, "r") as f:
        try:
            data = json.load(f)
            return [ClientOut(**item) for item in data]
        except json.JSONDecodeError:
            return []

def save_clients(clients: List[ClientOut]):
    with open(CLIENTS_FILE, "w") as f:
        json.dump([client.dict() for client in clients], f, indent=2)

def get_all_clients() -> List[ClientOut]:
    return load_clients()

def get_client(client_id: str) -> Optional[ClientOut]:
    clients = load_clients()
    for client in clients:
        if client.id == client_id:
            return client
    return None

def create_client(client_data: ClientCreate) -> ClientOut:
    clients = load_clients()
    new_id = str(len(clients) + 1)
    client_out = ClientOut(id=new_id, **client_data.dict())
    clients.append(client_out)
    save_clients(clients)
    return client_out

def update_client(client_id: str, client_data: ClientUpdate) -> Optional[ClientOut]:
    clients = load_clients()
    for idx, client in enumerate(clients):
        if client.id == client_id:
            updated_data = client.dict()
            update_fields = client_data.dict(exclude_unset=True)
            updated_data.update(update_fields)
            updated_client = ClientOut(**updated_data)
            clients[idx] = updated_client
            save_clients(clients)
            return updated_client
    return None

def delete_client(client_id: str) -> bool:
    clients = load_clients()
    new_clients = [client for client in clients if client.id != client_id]
    if len(new_clients) == len(clients):
        return False
    save_clients(new_clients)
    return True
