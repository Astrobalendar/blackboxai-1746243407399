from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# MongoDB Atlas connection string
uri = "mongodb+srv://akurafamily:Akura@gmail.com@cluster0.5pizcxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # Trigger a server selection to verify connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas successfully.")
except ConnectionFailure as e:
    print("❌ Could not connect to MongoDB Atlas:", e)
