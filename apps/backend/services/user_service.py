import json
import os
from typing import Optional
from apps.backend.models import UserSettings, UserSettingsUpdate

USER_SETTINGS_FILE = "user_settings.json"

def load_user_settings() -> UserSettings:
    if not os.path.exists(USER_SETTINGS_FILE):
        return UserSettings()
    with open(USER_SETTINGS_FILE, "r") as f:
        try:
            data = json.load(f)
            return UserSettings(**data)
        except json.JSONDecodeError:
            return UserSettings()

def save_user_settings(settings: UserSettings):
    with open(USER_SETTINGS_FILE, "w") as f:
        json.dump(settings.dict(), f, indent=2)

def get_user_settings() -> UserSettings:
    return load_user_settings()

def update_user_settings(update: UserSettingsUpdate) -> UserSettings:
    current_settings = load_user_settings()
    updated_data = current_settings.dict()
    update_fields = update.dict(exclude_unset=True)
    updated_data.update(update_fields)
    new_settings = UserSettings(**updated_data)
    save_user_settings(new_settings)
    return new_settings
