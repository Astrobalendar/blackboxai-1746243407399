from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_prediction_endpoint():
    response = client.post("/predict", json={
        "fullname": "John Doe",
        "dob": "1990-01-01",
        "time": "12:00",
        "pob": "Chennai"
    })
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
