from bson.objectid import ObjectId
from .mongo import db

users_collection = db["users"]
events_collection = db["calendar_events"]

# Users
def create_user(user_data):
    return users_collection.insert_one(user_data).inserted_id

def get_user_by_email(email):
    return users_collection.find_one({"email": email})

# Events
def create_event(event_data):
    return events_collection.insert_one(event_data).inserted_id

def get_events_by_user(user_id):
    return list(events_collection.find({"user_id": ObjectId(user_id)}))
