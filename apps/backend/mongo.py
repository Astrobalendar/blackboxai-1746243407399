from pymongo import MongoClient
import os

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise EnvironmentError("❌ MONGODB_URI is not set. Make sure to load environment variables before importing mongo.py")

try:
    client = MongoClient(MONGODB_URI)
    db = client.get_default_database() or client["test"]
    print("✅ mongo.py: Connected to MongoDB")
except Exception as e:
    raise ConnectionError(f"❌ mongo.py: Failed to connect to MongoDB: {str(e)}")
