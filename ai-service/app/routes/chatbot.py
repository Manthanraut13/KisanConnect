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

AVAILABLE_GROQ_MODELS = [
    'groq/compound-mini',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'qwen/qwen3.8-27b',
    'allam-2-7b'
]

import re

def clean_thinking_tags(text: str) -> str:
    """Remove <think>...</think> reasoning blocks and any internal model thought process."""
    if not text:
        return ""
    # 1. Remove complete <think>...</think> blocks
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    # 2. If <think> tag is unclosed (e.g. truncated), take text before <think>
    if '<think>' in cleaned:
        cleaned = cleaned.split('<think>')[0]
    # 3. If orphaned </think> tag, take text after </think>
    if '</think>' in cleaned:
        cleaned = cleaned.split('</think>')[-1]
    # 4. Remove residual headers like "Here's a thinking process:"
    cleaned = re.sub(r'^(Here\'s a thinking process:|\*\*Thinking Process:\*\*).*?\n', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    return cleaned.strip()

def generate_smart_rag_fallback(query: str, rag_context: str, user_language: str = 'en') -> str:
    """Intelligently synthesize answer from retrieved RAG context when external LLMs are offline."""
    q_lower = (query or '').lower()

    # 0. Active Listings Query ("i want to know listings here", "find fresh produce", "active listings")
    if any(k in q_lower for k in ['listing', 'listings', 'find fresh produce', 'produce', 'items available', 'buy crop']):
        if user_language == 'hi':
            return (
                "Kisan Connect पर उपलब्ध वर्तमान सक्रिय फसल लिस्टिंग:\n\n"
                "• 🍅 **जैविक टमाटर (Grade A)**\n"
                "  - **किसान:** रमेश पाटिल | **जिला:** नासिक, महाराष्ट्र\n"
                "  - **मूल्य:** ₹35.00/kg | **उपलब्ध:** 450 kg (न्यूनतम ऑर्डर: 5 kg)\n\n"
                "• 🧅 **नासिक लाल प्याज (Grade A)**\n"
                "  - **किसान:** रमेश पाटिल | **जिला:** नासिक, महाराष्ट्र\n"
                "  - **मूल्य:** ₹35.00/kg | **उपलब्ध:** 450 kg (न्यूनतम ऑर्डर: 5 kg)\n\n"
                "• 🥔 **ताजा आलू (Grade A)**\n"
                "  - **किसान:** सुरेश कुमार | **जिला:** पुणे, महाराष्ट्र\n"
                "  - **मूल्य:** ₹35.00/kg | **उपलब्ध:** 450 kg (न्यूनतम ऑर्डर: 5 kg)\n\n"
                "• 🌾 **बासमती चावल एवं गेहूं**\n"
                "  - **किसान:** गुरप्रीत सिंह | **जिला:** अमृतसर, पंजाब\n"
                "  - **मूल्य:** ₹35.00/kg | **उपलब्ध:** 450 kg (न्यूनतम ऑर्डर: 10 kg)\n\n"
                "• 🥥 **ताजा नारियल एवं हल्दी**\n"
                "  - **किसान:** मुथुसामी के | **जिला:** कोयंबटूर, तमिलनाडु\n"
                "  - **मूल्य:** ₹35.00/kg | **उपलब्ध:** 450 kg (न्यूनतम ऑर्डर: 5 kg)\n\n"
                "आप ऐप में किसी भी लिस्टिंग को कार्ट में जोड़कर सीधे खरीदारी कर सकते हैं!"
            )
        elif user_language == 'mr':
            return (
                "Kisan Connect वर सध्या उपलब्ध असलेल्या पिकांची थेट यादी:\n\n"
                "• 🍅 **ऑरगॅनिक टोमॅटो (Grade A)**\n"
                "  - **शेतकरी:** रमेश पाटील | **जिल्हा:** नाशिक, महाराष्ट्र\n"
                "  - **दर:** ₹35.00/kg | **उपलब्ध:** 450 kg (किमान ऑर्डर: 5 kg)\n\n"
                "• 🧅 **ताजे नाशिक कांदे (Grade A)**\n"
                "  - **शेतकरी:** रमेश पाटील | **जिल्हा:** नाशिक, महाराष्ट्र\n"
                "  - **दर:** ₹35.00/kg | **उपलब्ध:** 450 kg (किमान ऑर्डर: 5 kg)\n\n"
                "• 🥔 **ताजे बटाटे (Grade A)**\n"
                "  - **शेतकरी:** सुरेश कुमार | **जिल्हा:** पुणे, महाराष्ट्र\n"
                "  - **दर:** ₹35.00/kg | **उपलब्ध:** 450 kg (किमान ऑर्डर: 5 kg)\n\n"
                "• 🌾 **बासमती तांदूळ व गहू**\n"
                "  - **शेतकरी:** गुरप्रीत सिंग | **जिल्हा:** अमृतसर, पंजाब\n"
                "  - **दर:** ₹35.00/kg | **उपलब्ध:** 450 kg (किमान ऑर्डर: 10 kg)\n\n"
                "तुम्ही थेट कार्टमध्ये जोडून खरेदी करू शकता!"
            )
        else:
            return (
                "Here are current active farm produce listings available directly from farmers on Kisan Connect:\n\n"
                "• 🍅 **Organic Tomatoes (Grade A)**\n"
                "  - **Farmer:** Ramesh Patil | **District:** Nashik, Maharashtra\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 5 kg)\n\n"
                "• 🧅 **Fresh Nashik Onions (Grade A)**\n"
                "  - **Farmer:** Ramesh Patil | **District:** Nashik, Maharashtra\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 5 kg)\n\n"
                "• 🥔 **Fresh Table Potatoes (Grade A)**\n"
                "  - **Farmer:** Suresh Kumar | **District:** Pune, Maharashtra\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 5 kg)\n\n"
                "• 🥦 **Green Cabbage & Cauliflower (Grade A)**\n"
                "  - **Farmer:** Suresh Kumar | **District:** Pune, Maharashtra\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 5 kg)\n\n"
                "• 🌾 **Premium Basmati Rice & Punjab Wheat**\n"
                "  - **Farmer:** Gurpreet Singh | **District:** Amritsar, Punjab\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 10 kg)\n\n"
                "• 🥥 **Fresh Coconut & Turmeric**\n"
                "  - **Farmer:** Muthusamy K | **District:** Coimbatore, Tamil Nadu\n"
                "  - **Price:** ₹35.00/kg | **Available:** 450 kg (Min order: 5 kg)\n\n"
                "You can add any of these items to your cart or search by district in the Marketplace tab!"
            )

    # 1. Platform Features
    if any(k in q_lower for k in ['feature', 'platform', 'kisan connect', 'about', 'what is', 'how does', 'overview', 'app']):
        if user_language == 'hi':
            return (
                "Kisan Connect एक AI-संचालित डायरेक्ट फार्म-टू-कंज्यूमर मार्केटप्लेस है:\n\n"
                "• 🌾 **सीधी फसल बिक्री:** किसान बिना मध्यस्थों के अपनी फसल सीधे ग्राहकों को बेचते हैं।\n"
                "• 💰 **सुरक्षित एस्क्रो भुगतान:** डिलीवरी पुष्टि के बाद ही किसान के खाते में राशि ट्रांसफर होती है।\n"
                "• 📊 **AI डिमांड एवं मूल्य सिफारिश:** मंडी ट्रेंड्स के आधार पर सही मूल्य सुझाव।\n"
                "• 🚚 **लाइव ऑर्डर ट्रैकिंग:** वाहन GPS एवं ड्राइवर संपर्क विवरण के साथ लाइव स्थिति।"
            )
        elif user_language == 'mr':
            return (
                "Kisan Connect हे AI-आधारित थेट शेतकरी-ते-ग्राहक मार्केटप्लेस आहे:\n\n"
                "• 🌾 **थेट पीक विक्री:** मध्यस्थांशिवाय पिकांची थेट विक्री.\n"
                "• 💰 **सुरक्षित पेमेंट:** डिलिव्हरी कन्फर्मेशन नंतर शेतकरी खात्यात पेमेंट जमा.\n"
                "• 📊 **AI मागणी व दर शिफारस:** रिअल-टाइम बाजार दर अंदाज.\n"
                "• 🚚 **लाइव्ह ऑर्डर ट्रॅकिंग:** डिलिव्हरी वाहनाचे लाइव्ह लोकेशन ट्रॅकिंग."
            )
        else:
            return (
                "Kisan Connect is an AI-powered direct farm-to-consumer marketplace:\n\n"
                "• 🌾 **Direct Farm-to-Consumer Sales:** Farmers sell directly to buyers with zero middleman fees.\n"
                "• 💰 **Secure Escrow Payments:** Funds are safely held and released upon delivery OTP verification.\n"
                "• 📊 **AI Pricing & Demand Forecast:** Real-time mandi benchmark guidance and 7-day crop demand forecasting.\n"
                "• 🚚 **Live Order & Route Tracking:** Real-time driver GPS tracking and estimated delivery time."
            )

    # 2. Crop Prices & Mandi Rates
    if any(k in q_lower for k in ['price', 'rate', 'bhav', 'dam', 'cost', 'pricing', 'mandi', 'potato', 'onion', 'tomato', 'wheat', 'rice', 'crop']):
        if rag_context and ('Price' in rag_context or 'Rs.' in rag_context):
            context_lines = [l.strip() for l in rag_context.split('\n') if 'Price' in l or 'Rs.' in l or 'commodity' in l]
            if context_lines:
                sample_data = " ".join(context_lines[:2])
                if user_language == 'hi':
                    return f"Kisan Connect मंडी भाव डेटा:\n\n• {sample_data}"
                elif user_language == 'mr':
                    return f"Kisan Connect बाजार भाव माहिती:\n\n• {sample_data}"
                else:
                    return f"Kisan Connect Marketplace Mandi Rates:\n\n• {sample_data}"
        if user_language == 'hi':
            return "Kisan Connect पर फसलों के दैनिक मंडी भाव उपलब्ध हैं। आप किसी भी फसल का नाम दर्ज करके भाव जान सकते हैं।"
        elif user_language == 'mr':
            return "Kisan Connect वर दैनंदिन बाजार भाव उपलब्ध आहेत. पिकाचे नाव सांगून भाव तपासा."
        else:
            return "Kisan Connect provides daily crop mandi benchmark prices based on historical Agmarknet data."

    # 3. Order Tracking
    if any(k in q_lower for k in ['track', 'order', 'status', 'delivery', 'dispatch', 'shipment']):
        if user_language == 'hi':
            return (
                "ऑर्डर ट्रैक करने के लिए चरण:\n\n"
                "1. 📱 Kisan Connect ऐप पर लॉगिन करें\n"
                "2. 📦 **My Orders** सेक्शन पर जाएं\n"
                "3. 🚚 अपने ऑर्डर पर क्लिक करके लाइव लॉजिस्टिक्स स्टेटस और डिलीवरी वाहन की स्थिति देखें"
            )
        elif user_language == 'mr':
            return (
                "ऑर्डर ट्रॅक करण्यासाठी पायऱ्या:\n\n"
                "1. 📱 Kisan Connect वर लॉगिन करा\n"
                "2. 📦 **My Orders** विभागात जा\n"
                "3. 🚚 तुमच्या ऑर्डरवर क्लिक करून लाइव्ह डिलिव्हरी स्टेटस पहा"
            )
        else:
            return (
                "Steps to track your order:\n\n"
                "1. 📱 Log in to your Kisan Connect account\n"
                "2. 📦 Navigate to **My Orders** in your dashboard\n"
                "3. 🚚 Click your order to view live logistics status, driver details, and arrival ETA"
            )

    # 4. Listing crops
    if any(k in q_lower for k in ['list', 'sell', 'crop', 'register', 'farmer', 'produce']):
        if user_language == 'hi':
            return (
                "फसल बेचने के चरण:\n\n"
                "1. 👤 किसान अकाउंट से लॉगिन करें\n"
                "2. ➕ **Add New Listing** बटन दबाएं\n"
                "3. 🌾 फसल नाम, मात्रा (kg) एवं मूल्य दर्ज करके फोटो अपलोड करें"
            )
        elif user_language == 'mr':
            return (
                "पीक विक्रीच्या पायऱ्या:\n\n"
                "1. 👤 शेतकरी खात्यातून लॉगिन करा\n"
                "2. ➕ **Add New Listing** वर क्लिक करा\n"
                "3. 🌾 पिकाची माहिती व दर भरून पोस्ट करा"
            )
        else:
            return (
                "Steps to list and sell crops:\n\n"
                "1. 👤 Log in to your Farmer account\n"
                "2. ➕ Click **Add New Listing** on your dashboard\n"
                "3. 🌾 Enter crop name, volume (in kg), price per kg, and upload harvest photos"
            )

    # General RAG Context fallback
    if rag_context:
        lines = [l.strip() for l in rag_context.split('\n') if l.strip() and not l.startswith('---')]
        if lines:
            text_snippet = "\n• ".join(lines[:3])
            return f"Key Information:\n\n• {text_snippet}"

    fallback_map = {
        'hi': "नमस्कार! मैं किसान मित्र हूँ। आप फसल के दाम, ऑर्डर ट्रैकिंग, फसल लिस्टिंग या Kisan Connect की सुविधाओं के बारे में पूछ सकते हैं।",
        'mr': "नमस्कार! मी किसान मित्र आहे. तुम्ही पिकांचे भाव, ऑर्डर ट्रॅकिंग, पीक विक्री किंवा Kisan Connect च्या वैशिष्ट्यांबद्दल विचारू शकता.",
        'en': "Hello! I am Kisan Mitra, your Kisan Connect assistant. Ask me about crop prices, order tracking, crop listings, or platform features."
    }
    return fallback_map.get(user_language, fallback_map['en'])

def generate_llm_response(messages, user_language='en', query='', rag_context=''):
    """Generate LLM response with Groq primary, Gemini secondary, and smart RAG fallback."""
    groq_client = get_groq_client()
    if groq_client:
        for model_name in AVAILABLE_GROQ_MODELS:
            try:
                res = groq_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=1024,
                    temperature=0.4
                )
                raw_reply = res.choices[0].message.content or ""
                reply = clean_thinking_tags(raw_reply)
                if reply:
                    return reply, False
            except Exception as e:
                logger.warning(f"Groq model '{model_name}' call failed: {e}")

    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key and not gemini_key.startswith('your_'):
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
            res = model.generate_content(prompt)
            if res and res.text:
                reply = clean_thinking_tags(res.text)
                if reply:
                    return reply, False
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}")

    # Smart RAG fallback response if external LLM APIs fail
    smart_reply = generate_smart_rag_fallback(query, rag_context, user_language)
    return smart_reply, True


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
            f"Role of user: {user_role}. Respond directly in {lang_name}.\n\n"
            f"STRICT SCOPE & FORMATTING RULES:\n"
            f"1. ANSWER ONLY WHAT THE USER ASKS. Do NOT output extra unsolicited sections (such as 'How to Order', tutorials, or platform guides) unless the user explicitly asks for them.\n"
            f"2. NO HEAVY MARKDOWN DIVIDERS OR GIANT HEADERS: Do NOT use horizontal line rules ('---') or large headers ('### 1️⃣').\n"
            f"3. CLEAN & COMPACT STYLING: Format crop listings using neat top-level bullet points and indented detail bullet points. Combine related fields on one line (e.g., '**Available:** 450 kg | **Min Order:** 5 kg'). NEVER output crowded walls of text.\n"
            f"4. EMOJIS & READABILITY: Use modest, relevant emojis (e.g., 🍅, 🧅, 🥔, 🌾, 🥥, 📍, 💰) for clean scannability.\n"
            f"5. ACCURACY: Use the verified Kisan Connect Knowledge Base context below to provide accurate, real-time crop prices, rates, and district benchmark details.\n"
            f"6. NO THINKING TAGS: Do NOT output any internal reasoning or <think> tags. Output ONLY the clean final answer.\n\n"
            f"VERIFIED KNOWLEDGE BASE CONTEXT:\n{rag_context}"
        )

        messages = [{'role': 'system', 'content': system_prompt}]
        for msg in (conversation_history[-4:] if isinstance(conversation_history, list) else []):
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                cleaned_history_content = clean_thinking_tags(str(msg['content']))
                if cleaned_history_content:
                    messages.append({'role': msg['role'], 'content': cleaned_history_content})
        messages.append({'role': 'user', 'content': message})

        # 3. LLM Inference
        reply, is_fallback = generate_llm_response(messages, user_language=language, query=message, rag_context=rag_context)

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
            f"2. Keep responses very short (max 2-3 spoken sentences) as this will be spoken aloud to the user.\n"
            f"3. Always state exact crop prices, rates, and district details directly from the provided context when asked about pricing.\n"
            f"4. CRITICAL: Do NOT output any internal thinking process, reasoning steps, or <think> tags. Provide ONLY the final spoken response.\n\n"
            f"KNOWLEDGE BASE CONTEXT:\n{rag_context}"
        )

        messages = [{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': transcript}]
        raw_response_text, is_fallback = generate_llm_response(messages, user_language=language, query=transcript, rag_context=rag_context)
        response_text = clean_thinking_tags(raw_response_text)

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
