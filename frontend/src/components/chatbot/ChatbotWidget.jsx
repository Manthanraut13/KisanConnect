import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const initialGreeting = {
  role: 'assistant',
  content:
    'नमस्ते! 👋 I am Kisan Mitra. How can I help you? / मैं आपकी मदद कैसे करूँ?',
  timestamp: Date.now(),
};

const fallbackEn =
  'Sorry, I am having trouble right now. Please try again in a moment.';
const fallbackHi =
  'माफ कीजिए, अभी कोई तकनीकी समस्या है। थोड़ी देर बाद प्रयास करें।';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([initialGreeting]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role || 'consumer';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (messageText) => {
    const text = (messageText || '').trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const conversationHistory = messages
        .slice(-5)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.post('/ai/chatbot/query', {
        message: text,
        language,
        user_role: userRole,
        conversation_history: conversationHistory,
      });

      const data = response?.data?.data || response?.data;
      const botReply =
        (data && (data.response || data.message)) ||
        fallbackEn;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: botReply,
          timestamp: Date.now(),
          is_fallback: data?.is_fallback || false,
        },
      ]);
    } catch (err) {
      const fallback = language === 'hi' ? fallbackHi : fallbackEn;
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

  const quickReplies =
    userRole === 'farmer'
      ? ['Track my order', 'List a crop', 'Talk to support']
      : ['Track my order', 'Find fresh produce', 'Talk to support'];

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
            Kisan Mitra
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed z-50 bottom-0 right-0 sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] w-full h-[85vh] sm:rounded-2xl rounded-t-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
          <header className="bg-kisan-700 text-white p-4 sm:rounded-t-2xl flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-full bg-kisan-100 flex items-center justify-center">
              <span className="font-bold text-kisan-700">KM</span>
            </div>
            <div className="flex-1">
              <p className="font-bold leading-tight">Kisan Mitra</p>
              <p className="text-xs text-kisan-100">AI Assistant</p>
            </div>
            <button
              onClick={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
              className="px-2 py-1 text-xs bg-kisan-800 rounded hover:bg-kisan-900"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-kisan-800 rounded"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div>
                      <div className="bg-kisan-700 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">
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
                      <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs shadow-sm border border-gray-100">
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {idx === messages.length - 1 && !isTyping && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {quickReplies.map((qr) => (
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
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="p-3 bg-white border-t ml-auto">
            <div className="flex items-center gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
              />
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
