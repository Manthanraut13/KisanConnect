# Voice engine helper supporting Web Speech API, Sarvam AI, and gTTS fallback
import os
import io
import base64
import logging
import requests
from gtts import gTTS

logger = logging.getLogger(__name__)

class VoiceEngine:
    """
    Multi-tiered fail-safe voice engine:
    1. Primary: Sarvam AI Server-side STT (saaras:v1) & TTS (bulbul:v1)
    2. Secondary Fallback: gTTS (Google Text-to-Speech) - Free, keyless server-side audio generation in Marathi, Hindi, & English
    3. Tertiary Fallback: Browser Native Web Speech API metadata flag (Client-side zero-latency speech synthesis)
    """

    def __init__(self):
        self.sarvam_key = os.getenv('SARVAM_API_KEY')

    def process_stt(self, audio_data, language: str = 'hi') -> str:
        """Speech-to-Text conversion using Sarvam AI with fallback to client-side STT."""
        if not self.sarvam_key or self.sarvam_key.startswith('your_'):
            logger.info("Sarvam API key unconfigured. Using Web Speech API client-side STT.")
            return None

        try:
            url = "https://api.sarvam.ai/speech-to-text"
            headers = {"api-subscription-key": self.sarvam_key}
            files = {"file": ("audio.wav", audio_data, "audio/wav")}
            data = {"language_code": self._map_lang_code(language), "model": "saaras:v1"}

            resp = requests.post(url, headers=headers, files=files, data=data, timeout=5)
            if resp.status_code == 200:
                transcript = resp.json().get("transcript", "").strip()
                if transcript:
                    return transcript
        except Exception as e:
            logger.error(f"Sarvam STT failed or quota exhausted: {e}. Falling back to client-side STT.")

        return None

    def process_tts(self, text: str, language: str = 'hi') -> tuple[str, str]:
        """
        Text-to-Speech conversion returning tuple (audio_base64, provider_name).
        Tiers: Sarvam AI -> gTTS -> Web Speech API flag
        """
        if not text:
            return None, "none"

        # Tier 1: Try Sarvam AI TTS (bulbul:v1)
        if self.sarvam_key and not self.sarvam_key.startswith('your_'):
            try:
                url = "https://api.sarvam.ai/text-to-speech"
                headers = {"api-subscription-key": self.sarvam_key, "Content-Type": "application/json"}
                payload = {
                    "inputs": [text],
                    "target_language_code": self._map_lang_code(language),
                    "speaker": "meera",
                    "model": "bulbul:v1"
                }
                resp = requests.post(url, headers=headers, json=payload, timeout=5)
                if resp.status_code == 200:
                    audios = resp.json().get("audios", [])
                    if audios and audios[0]:
                        logger.info("Generated TTS audio via Sarvam AI.")
                        return audios[0], "sarvam"
            except Exception as e:
                logger.warning(f"Sarvam TTS failed or quota exhausted: {e}. Triggering Tier 2 gTTS fallback.")

        # Tier 2: Secondary Fallback - gTTS (Google Text-to-Speech, Free & Keyless)
        try:
            gtts_lang = {'hi': 'hi', 'mr': 'mr', 'en': 'en'}.get(language.lower(), 'hi')
            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            encoded_audio = base64.b64encode(fp.read()).decode('utf-8')
            logger.info(f"Generated TTS audio via gTTS fallback for language '{gtts_lang}'.")
            return f"data:audio/mp3;base64,{encoded_audio}", "gtts_fallback"
        except Exception as e:
            logger.error(f"gTTS fallback failed: {e}. Triggering Tier 3 Web Speech API client flag.")

        # Tier 3: Client-side Browser Web Speech API
        return None, "web_speech_api"

    def _map_lang_code(self, lang: str) -> str:
        mapping = {'hi': 'hi-IN', 'mr': 'mr-IN', 'en': 'en-IN'}
        return mapping.get(lang.lower(), 'hi-IN')
