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

def test_chatbot_user_roles(client):
    for role in ["consumer", "logistics", "default"]:
        res = client.post('/ai/chatbot/query', json={
            "message": "Hello",
            "language": "en",
            "user_role": role
        })
        assert res.status_code == 200
        assert res.get_json()["success"] is True

def test_chatbot_missing_message(client):
    res = client.post('/ai/chatbot/query', json={
        "language": "en"
    })
    assert res.status_code == 400

def test_chatbot_voice_endpoint_valid(client):
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

def test_chatbot_voice_endpoint_missing_transcript(client):
    res = client.post('/ai/chatbot/voice', json={
        "language": "mr"
    })
    assert res.status_code == 400
