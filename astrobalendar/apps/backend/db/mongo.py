from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

from pymongo.errors import ConfigurationError

import os
from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ConnectionFailure

from dotenv import load_dotenv
import os
from pymongo import MongoClient
from pymongo.errors import ConfigurationError

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ConfigurationError(
        "\n❌ MONGODB_URI environment variable is not set.\n"
        "   Please set it before starting the backend, e.g.:\n"
        "   export MONGODB_URI='your-mongo-uri'\n"
    )

client = MongoClient(MONGO_URI)
db = client[os.getenv("DATABASE_NAME", "astrobalendar")]

async def check_db_connection():
    try:
        # The ping command is cheap and does not require auth.
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False
DATABASE_NAME = os.getenv("DATABASE_NAME", "astrobalendar")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

async def check_db_connection():
    try:
        # The ping command is cheap and does not require auth.
        await client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False
