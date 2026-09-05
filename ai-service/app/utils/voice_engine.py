# Voice engine helper supporting Web Speech API payloads and Sarvam AI STT/TTS
import os
import logging
import requests

logger = logging.getLogger(__name__)

class VoiceEngine:
    """
    Dual-engine voice handler:
    1. Browser Native Web Speech API (Client-side zero-latency STT/TTS)
    2. Sarvam AI Server-side STT (saaras:v1) & TTS (bulbul:v1) when SARVAM_API_KEY is present
    """

    def __init__(self):
        self.sarvam_key = os.getenv('SARVAM_API_KEY')

    def process_stt(self, audio_data, language: str = 'hi') -> str:
        """Speech-to-Text conversion using Sarvam AI if available."""
        if not self.sarvam_key or self.sarvam_key.startswith('your_'):
            logger.info("Sarvam API key not set. Web Speech API client-side STT recommended.")
            return None

        try:
            # Sarvam saaras STT endpoint
            url = "https://api.sarvam.ai/speech-to-text"
            headers = {"api-subscription-key": self.sarvam_key}
            files = {"file": ("audio.wav", audio_data, "audio/wav")}
            data = {"language_code": self._map_lang_code(language), "model": "saaras:v1"}

            resp = requests.post(url, headers=headers, files=files, data=data, timeout=10)
            if resp.status_code == 200:
                return resp.json().get("transcript", "")
            return None
        except Exception as e:
            logger.error(f"Sarvam STT failed: {e}")
            return None

    def process_tts(self, text: str, language: str = 'hi') -> str:
        """Text-to-Speech conversion returning Base64 audio string using Sarvam AI."""
        if not self.sarvam_key or self.sarvam_key.startswith('your_'):
            logger.info("Sarvam API key not set. Web Speech API client-side TTS recommended.")
            return None

        try:
            # Sarvam bulbul TTS endpoint
            url = "https://api.sarvam.ai/text-to-speech"
            headers = {"api-subscription-key": self.sarvam_key, "Content-Type": "application/json"}
            payload = {
                "inputs": [text],
                "target_language_code": self._map_lang_code(language),
                "speaker": "meera",
                "model": "bulbul:v1"
            }

            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            if resp.status_code == 200:
                audios = resp.json().get("audios", [])
                return audios[0] if audios else None
            return None
        except Exception as e:
            logger.error(f"Sarvam TTS failed: {e}")
            return None

    def _map_lang_code(self, lang: str) -> str:
        mapping = {'hi': 'hi-IN', 'mr': 'mr-IN', 'en': 'en-IN'}
        return mapping.get(lang.lower(), 'hi-IN')
