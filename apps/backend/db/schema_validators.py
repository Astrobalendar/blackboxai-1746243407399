users_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["userId", "email", "passwordHash", "birthDetails"],
        "additionalProperties": False,
        "properties": {
            "userId": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "email": {
                "bsonType": "string",
                "pattern": "^.+@.+$",
                "description": "must be a string and match the email format"
            },
            "passwordHash": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "birthDetails": {
                "bsonType": "object",
                "required": ["birthDate", "birthTime"],
                "properties": {
                    "birthDate": {
                        "bsonType": "date",
                        "description": "must be a date and is required"
                    },
                    "birthTime": {
                        "bsonType": "string",
                        "pattern": "^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$",
                        "description": "must be a string in HH:mm:ss format and is required"
                    },
                    "birthPlace": {
                        "bsonType": ["string", "null"],
                        "description": "can be a string or null"
                    }
                },
                "additionalProperties": False
            },
            "languagePreference": {
                "enum": ["en", "hi", "ta"],
                "description": "can only be one of the enum values"
            },
            "createdAt": {
                "bsonType": "date",
                "description": "must be a date if present"
            },
            "role": {
                "bsonType": "string",
                "description": "must be a string if present"
            }
        }
    }
}

calendar_events_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["eventId", "title", "eventDate", "eventType"],
        "additionalProperties": False,
        "properties": {
            "eventId": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "title": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "description": {
                "bsonType": ["string", "null"],
                "description": "can be a string or null"
            },
            "eventDate": {
                "bsonType": "date",
                "description": "must be a date and is required"
            },
            "eventType": {
                "enum": ["festival", "planetaryTransit", "eclipse"],
                "description": "can only be one of the enum values"
            },
            "region": {
                "bsonType": ["string", "null"],
                "description": "can be a string or null"
            },
            "createdAt": {
                "bsonType": "date",
                "description": "must be a date if present"
            },
            "source": {
                "bsonType": ["string", "null"],
                "description": "can be a string or null"
            }
        }
    }
}
