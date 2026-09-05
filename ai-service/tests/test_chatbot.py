# Unit tests for Chatbot route
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_chatbot_english_query(client):
    res = client.post('/ai/chatbot/query', json={
        "message": "How do I list my crop?",
        "language": "en",
        "user_role": "farmer",
        "conversation_history": []
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "response" in data["data"]
    assert "is_fallback" in data["data"]

def test_chatbot_hindi_query(client):
    res = client.post('/ai/chatbot/query', json={
        "message": "फसल कैसे बेचें?",
        "language": "hi",
        "user_role": "farmer",
        "conversation_history": []
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "response" in data["data"]

def test_chatbot_marathi_query(client):
    res = client.post('/ai/chatbot/query', json={
        "message": "पिकाची नोंदणी कशी करावी?",
        "language": "mr",
        "user_role": "farmer",
        "conversation_history": []
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "response" in data["data"]

def test_chatbot_voice_endpoint(client):
    res = client.post('/ai/chatbot/voice', json={
        "transcript": "टोमॅटोचा भाव सांगा",
        "language": "mr",
        "user_role": "farmer"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "response_text" in data["data"]
    assert "tts_provider" in data["data"]
