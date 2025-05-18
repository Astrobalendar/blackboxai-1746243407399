import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
from pathlib import Path

# Path to service account key file
SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", "serviceAccountKey.json")

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # Check if using environment variable for Render deployment
    key_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    
    if key_json:
        # For production (Render)
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.json') as temp:
            temp.write(key_json)
            temp.flush()
            cred = credentials.Certificate(temp.name)
            firebase_admin.initialize_app(cred)
    else:
        # For local development
        if os.path.exists(SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
        else:
            raise FileNotFoundError(
                f"Firebase service account file not found at {SERVICE_ACCOUNT_PATH}. "
                "Please set FIREBASE_SERVICE_ACCOUNT_JSON environment variable or place the service account file."
            )

# Firestore client
db = firestore.client()

def verify_token(token: str):
    """
    Verify Firebase ID token
    
    Args:
        token: Firebase ID token string
        
    Returns:
        dict: Decoded token claims if valid, None otherwise
    """
    try:
        return auth.verify_id_token(token)
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

# Get Firestore client
def get_firestore_client():
    return db

# Example CRUD operations
async def get_document(collection: str, doc_id: str):
    db = get_firestore_client()
    doc_ref = db.collection(collection).document(doc_id)
    doc = doc_ref.get()
    return doc.to_dict() if doc.exists else None

async def set_document(collection: str, doc_id: str, data: dict):
    db = get_firestore_client()
    doc_ref = db.collection(collection).document(doc_id)
    doc_ref.set(data)
    return doc_id

async def update_document(collection: str, doc_id: str, updates: dict):
    db = get_firestore_client()
    doc_ref = db.collection(collection).document(doc_id)
    doc_ref.update(updates)
    return True

async def delete_document(collection: str, doc_id: str):
    db = get_firestore_client()
    db.collection(collection).document(doc_id).delete()
    return True
