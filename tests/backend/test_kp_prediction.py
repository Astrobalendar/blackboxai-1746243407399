import pytest
from api.prediction.kp import kp_predict  # Adjust import as needed

def test_kp_predict_basic():
    # Example input, adjust fields as per your implementation
    birth_data = {
        "date": "2000-01-01",
        "time": "12:00",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    result = kp_predict(birth_data)
    assert isinstance(result, dict)
    # Add more specific assertions as implementation matures
