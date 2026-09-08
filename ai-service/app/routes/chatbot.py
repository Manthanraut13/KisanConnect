# Multilingual RAG AI Chatbot blueprint using Hybrid RAG Engine (BM25 + TF-IDF Vector Search), Groq LLaMA 3.1 & Voice Engine
import os
import logging
from flask import Blueprint, request
from groq import Groq
import google.generativeai as genai
from app.utils.response import success_response, error_response
from app.utils.voice_engine import VoiceEngine
from app.utils.rag_engine import HybridRAGEngine

chatbot_bp = Blueprint('chatbot', __name__)
logger = logging.getLogger(__name__)

voice_engine = VoiceEngine()
rag_engine = HybridRAGEngine()

def get_groq_client():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key or api_key.startswith('your_'):
        return None
    try:
        return Groq(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None

def generate_llm_response(messages, user_language='en'):
    """Generate LLM response with Groq (LLaMA 3.1 8B) primary and Gemini secondary fallback."""
    groq_client = get_groq_client()
    if groq_client:
        try:
            res = groq_client.chat.completions.create(
                model='llama-3.1-8b-instant',
                messages=messages,
                max_tokens=350,
                temperature=0.4
            )
            return res.choices[0].message.content.strip(), False
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}. Trying Gemini API fallback...")

    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key and not gemini_key.startswith('your_'):
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
            res = model.generate_content(prompt)
            if res and res.text:
                return res.text.strip(), False
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}")

    # Robust local fallback response if external APIs fail
    fallback_map = {
        'hi': "नमस्कार! Kisan Connect पर मैं आपका सहायक हूँ। आप फसल की कीमत, ऑर्डर, लिस्टिंग या मार्केटप्लेस के बारे में पूछ सकते हैं।",
        'mr': "नमस्कार! Kisan Connect वर मी तुमचा सहाय्यक आहे. तुम्ही पिकांचे भाव, ऑर्डर, लिस्टिंग किंवा मार्केटप्लेस बद्दल विचारू शकता.",
        'en': "Hello! I am Kisan Mitra, your Kisan Connect assistant. Ask me about crop prices, listings, orders, or marketplace features."
    }
    return fallback_map.get(user_language, fallback_map['en']), True


@chatbot_bp.route('/query', methods=['POST'])
def chat():
    """
    POST /ai/chatbot/query
    RAG-augmented chat endpoint using BM25 + Vector Search Knowledge Base.
    Payload: { "message": "...", "language": "hi"|"mr"|"en", "user_role": "farmer", "conversation_history": [] }
    """
    language = 'en'
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return error_response(message="Missing required field: message", status_code=400)

        message = str(data['message']).strip()
        language = str(data.get('language', 'en')).strip().lower()
        user_role = str(data.get('user_role', 'farmer')).strip().lower()
        conversation_history = data.get('conversation_history', [])

        if not message:
            return error_response(message="Empty message content", status_code=400)

        # 1. Hybrid RAG Context Search over documentation & pricing data
        rag_context = rag_engine.get_context_str(message, top_k=4)

        # 2. Construct RAG System Prompt
        lang_name = {'hi': 'Hindi', 'mr': 'Marathi', 'en': 'English'}.get(language, 'English')
        system_prompt = (
            f"You are Kisan Mitra, the friendly AI assistant for Kisan Connect direct farm-to-consumer marketplace. "
            f"Role of user: {user_role}. Respond directly in {lang_name}.\n"
            f"RULES:\n"
            f"1. Use the verified Kisan Connect Knowledge Base context below to provide accurate, real-time answers.\n"
            f"2. Keep responses concise (2 to 4 short sentences).\n"
            f"3. Be warm, polite, and practical.\n\n"
            f"VERIFIED KNOWLEDGE BASE CONTEXT:\n{rag_context}"
        )

        messages = [{'role': 'system', 'content': system_prompt}]
        for msg in (conversation_history[-4:] if isinstance(conversation_history, list) else []):
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                messages.append({'role': msg['role'], 'content': str(msg['content'])})
        messages.append({'role': 'user', 'content': message})

        # 3. LLM Inference
        reply, is_fallback = generate_llm_response(messages, user_language=language)

        return success_response(data={
            'response': reply,
            'is_fallback': is_fallback,
            'language': language,
            'rag_used': bool(rag_context)
        }, message="Chatbot query processed successfully")

    except Exception as e:
        logger.error(f"Chatbot endpoint error: {e}")
        return error_response(message=f"Failed to process chatbot query: {str(e)}", status_code=500)


@chatbot_bp.route('/voice', methods=['POST'])
def voice_chat():
    """
    POST /ai/chatbot/voice
    Supports voice input transcript or audio payload, performs RAG retrieval, and generates TTS audio.
    Payload: { "transcript": "...", "audio_base64": "...", "language": "hi"|"mr"|"en", "user_role": "farmer" }
    """
    try:
        data = request.get_json() or {}
        language = str(data.get('language', 'hi')).strip().lower()
        user_role = str(data.get('user_role', 'farmer')).strip().lower()

        # Step 1: STT transcript extraction (Sarvam STT or provided transcript)
        transcript = data.get('transcript', data.get('message', '')).strip()
        audio_input = data.get('audio_base64') or data.get('audio')

        if audio_input:
            stt_result = voice_engine.process_stt(audio_input, language=language)
            if stt_result:
                transcript = stt_result

        if not transcript:
            return error_response(message="Missing voice transcript or audio data", status_code=400)

        # Step 2: RAG Context Search
        rag_context = rag_engine.get_context_str(transcript, top_k=4)
        lang_name = {'hi': 'Hindi', 'mr': 'Marathi', 'en': 'English'}.get(language, 'Hindi')

        system_prompt = (
            f"You are Kisan Mitra, the friendly AI assistant for Kisan Connect direct farm-to-consumer marketplace. "
            f"Role of user: {user_role}. Respond in {lang_name}.\n"
            f"RULES:\n"
            f"1. Use the verified Kisan Connect Knowledge Base context below to answer accurately.\n"
            f"2. Keep responses very short (max 2-3 spoken sentences) as this will be spoken aloud to the user.\n\n"
            f"KNOWLEDGE BASE CONTEXT:\n{rag_context}"
        )

        messages = [{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': transcript}]
        response_text, is_fallback = generate_llm_response(messages, user_language=language)

        # Step 3: TTS Synthesis (Sarvam AI -> gTTS fallback -> Web Speech API)
        audio_b64, tts_provider = voice_engine.process_tts(response_text, language=language)

        return success_response(data={
            "transcript": transcript,
            "response_text": response_text,
            "audio_base64": audio_b64,
            "language": language,
            "tts_provider": tts_provider,
            "is_fallback": is_fallback,
            "rag_used": bool(rag_context)
        }, message="Voice chat processed successfully")

    except Exception as e:
        logger.error(f"Voice chat endpoint error: {e}")
        return error_response(message=f"Failed to process voice query: {str(e)}", status_code=500)
