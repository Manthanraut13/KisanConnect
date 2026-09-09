import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Mic, Volume2 } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../lib/logger';

const initialGreeting = {
  role: 'assistant',
  content:
    'नमस्ते! 👋 I am Kisan Mitra. How can I help you? / मैं आपकी मदद कैसे करूँ?',
  timestamp: Date.now(),
};

const greetings = {
  en: 'Hi! I am Kisan Mitra. How can I help you?',
  hi: 'नमस्ते! मैं किसान मित्र हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
  mr: 'नमस्कार! मी किसान मित्र आहे. मी तुम्हाला कशी मदत करू शकतो?',
};

const fallbackMsg = {
  en: 'Sorry, I am having trouble right now. Please try again in a moment.',
  hi: 'माफ कीजिए, अभी कोई तकनीकी समस्या है। थोड़ी देर बाद प्रयास करें।',
  mr: 'माफ करा, सध्या तांत्रिक अडचण येत आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.',
};

const sanitizeBotResponse = (text) => {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  if (cleaned.includes('<think>')) {
    cleaned = cleaned.split('<think>')[0];
  }
  if (cleaned.includes('</think>')) {
    cleaned = cleaned.split('</think>').pop();
  }
  cleaned = cleaned.replace(/^(Here's a thinking process:|\*\*Thinking Process:\*\*).*?\n/gi, '');
  return cleaned.trim();
};

const formatInlineText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const FormattedMessage = ({ content }) => {
  if (!content || typeof content !== 'string') return content;
  const rawLines = content.split('\n');

  return (
    <div className="leading-relaxed text-sm text-gray-800 space-y-1">
      {rawLines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        const isChildBullet = line.startsWith('  - ') || line.startsWith('   - ') || line.startsWith('\t-');
        const isTopBullet = !isChildBullet && (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* '));

        if (isChildBullet) {
          const cleanLine = trimmed.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="pl-3 text-xs text-gray-600 flex items-start gap-1.5 my-0.5">
              <span className="text-gray-400 select-none">•</span>
              <span>{formatInlineText(cleanLine)}</span>
            </div>
          );
        }

        if (isTopBullet) {
          const cleanLine = trimmed.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="mt-1.5 font-medium text-gray-900 flex items-start gap-1.5">
              <span className="text-kisan-600 font-bold select-none">•</span>
              <span>{formatInlineText(cleanLine)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="my-0.5">
            {formatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([initialGreeting]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(new Audio());
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role || 'consumer';

  const localizedQuickReplies = language === 'hi'
    ? ['ऑर्डर ट्रैक करें', 'ताज़ी उपज खोजें', 'सहायता लें']
    : language === 'mr'
      ? ['ऑर्डर ट्रॅक करा', 'ताजी पिके शोधा', 'मदत घ्या']
      : userRole === 'farmer'
        ? ['Track my order', 'List a crop', 'Talk to support']
        : ['Track my order', 'Find fresh produce', 'Talk to support'];

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].role !== 'assistant') return current;
      return [{ ...current[0], content: greetings[language] || greetings.en }];
    });
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const playAudioResponse = (audioSrc, text) => {
    if (audioSrc && audioSrc.startsWith('data:audio')) {
      try {
        audioRef.current.src = audioSrc;
        audioRef.current.play();
        setIsPlayingAudio(true);
        audioRef.current.onended = () => setIsPlayingAudio(false);
        return;
      } catch (err) {
        logger.error('CHATBOT', 'Audio element playback failed', err);
      }
    }
    // Fallback to Web Speech API client synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (messageText, isVoice = false) => {
    const text = (messageText || '').trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    logger.info('CHATBOT', 'User message', { text, language, isVoice });

    try {
      const endpoint = isVoice ? '/ai/chatbot/voice' : '/ai/chatbot/query';
      const payload = isVoice
        ? { transcript: text, language, user_role: userRole }
        : {
            message: text,
            language,
            user_role: userRole,
            conversation_history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          };

      const response = await api.post(endpoint, payload);
      const data = response?.data?.data || response?.data;
      const rawReply = data?.response_text || data?.response || data?.message || fallbackMsg[language];
      const botReply = sanitizeBotResponse(rawReply) || fallbackMsg[language];

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: botReply,
          timestamp: Date.now(),
          is_fallback: data?.is_fallback || false,
        },
      ]);

      if (isVoice || data?.audio_base64) {
        playAudioResponse(data?.audio_base64, botReply);
      }
    } catch (err) {
      logger.error('CHATBOT', 'AI service failed', err);
      const fallback = fallbackMsg[language] || fallbackMsg.en;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallback,
          timestamp: Date.now(),
          is_fallback: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        if (transcript) {
          sendMessage(transcript, true);
        }
      };

      recognition.onerror = (event) => {
        logger.error('CHATBOT', 'Voice recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      logger.error('CHATBOT', 'Voice recording trigger failed', e);
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-kisan-700 rounded-full shadow-xl flex items-center justify-center hover:bg-kisan-800 transition-colors group"
          aria-label="Kisan Mitra"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="absolute right-20 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Kisan Mitra AI
          <span className="absolute right-20 whitespace-nowrap bg-on-surface text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Kisan Mitra
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed z-50 bottom-0 right-0 sm:bottom-6 sm:right-6 sm:w-96 sm:h-[520px] w-full h-[85vh] sm:rounded-2xl rounded-t-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
          <header className="bg-kisan-700 text-white p-4 sm:rounded-t-2xl flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-full bg-kisan-100 flex items-center justify-center relative">
              <span className="font-bold text-kisan-700">KM</span>
              {isPlayingAudio && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold leading-tight flex items-center gap-2">
                Kisan Mitra
                {isPlayingAudio && <Volume2 className="h-4 w-4 animate-pulse text-green-300" />}
              </p>
              <p className="text-xs text-kisan-100">Hybrid RAG & Voice AI</p>
            </div>

            {/* Language Switcher */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-kisan-800 text-white text-xs px-2 py-1 rounded border-none focus:ring-0 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-kisan-800 rounded"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 bg-surface space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div>
                      <div className="bg-kisan-700 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%] whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <p className="text-xs text-on-surface-variant/70 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-kisan-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-kisan-700">KM</span>
                    </div>
                    <div>
                      <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm p-3.5 max-w-[88%] shadow-sm border border-gray-100">
                        <FormattedMessage content={msg.content} />
                      <div className="bg-white text-on-surface rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs shadow-sm border border-outline-variant/60">
                        {msg.content}
                      </div>
                      <p className="text-xs text-on-surface-variant/70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {idx === messages.length - 1 && !isTyping && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {localizedQuickReplies.map((qr) => (
                            <button
                              key={qr}
                              onClick={() => sendMessage(qr)}
                              className="border border-kisan-600 text-kisan-600 text-xs px-3 py-1 rounded-full hover:bg-kisan-50"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-2">
                <div className="h-8 w-8 rounded-full bg-kisan-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-kisan-700">KM</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-outline-variant/60">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="p-3 bg-white border-t">
            <div className="flex items-center gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording
                    ? (language === 'hi' ? 'सुन रहा हूँ...' : language === 'mr' ? 'ऐकत आहे...' : 'Listening...')
                    : (language === 'hi' ? 'संदेश लिखें...' : language === 'mr' ? 'संदेश लिहा...' : 'Type a message...')
                }
                className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
              />

              {/* Voice Record Button */}
              <button
                onClick={startVoiceRecording}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Voice Search / Speak"
                aria-label="Voice Search"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                onClick={() => sendMessage(inputValue)}
                className="h-10 w-10 rounded-full bg-kisan-700 text-white flex items-center justify-center hover:bg-kisan-800"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
