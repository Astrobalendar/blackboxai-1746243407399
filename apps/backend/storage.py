import json
import os

STORAGE_FILE = "predictions.json"

def save_prediction(prediction):
    """
    Save prediction to a local JSON file as a placeholder for DB storage.
    """
    data = []
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    data.append(prediction)
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)
    return True
