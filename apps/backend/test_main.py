import os
os.environ["TESTING"] = "true"

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "LifeOS" in response.json()["message"]

def test_create_event():
    response = client.post("/api/events", json={
        "user_id": "test_user",
        "event_type": "task_created",
        "event_category": "productivity",
        "title": "Test Task"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["user_id"] == "test_user"
