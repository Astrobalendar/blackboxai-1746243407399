import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Load environment variables
load_dotenv()

# Fetch and print the MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
print("DEBUG MONGODB_URI:", mongodb_uri)

# Attempt to connect to MongoDB
try:
    client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=3000)
    client.admin.command("ping")
    print("✅ MongoDB connection successful.")
except ConnectionFailure as e:
    print("❌ MongoDB connection failed:", e)
