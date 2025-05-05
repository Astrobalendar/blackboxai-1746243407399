import urllib.parse
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def encode_mongo_credentials(username: str, password: str) -> str:
    encoded_username = urllib.parse.quote_plus(username)
    encoded_password = urllib.parse.quote_plus(password)
    return encoded_username, encoded_password

def test_mongo_connection(uri: str) -> bool:
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas successfully.")
        return True
    except ConnectionFailure as e:
        print(f"❌ MongoDB Atlas connection failed: {e}")
        return False

def get_mongo_uri_from_env() -> str:
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise EnvironmentError("MONGODB_URI environment variable is not set.")
    return uri
