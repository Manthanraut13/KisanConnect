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

const greetings = {
  en: 'Hi! I am Kisan Mitra. How can I help you?',
  hi: 'नमस्ते! मैं किसान मित्र हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
};

const fallbackEn =
  'Sorry, I am having trouble right now. Please try again in a moment.';
const fallbackHi =
  'माफ कीजिए, अभी कोई तकनीकी समस्या है। थोड़ी देर बाद प्रयास करें।';

// Offline / demo keyword replies so the widget stays interactive
// even when Siddhesh's AI service is not reachable yet.
const demoEn = {
  order: 'You can track your order from the "My Orders" section in your account. Need the order ID?',
  track: 'You can track your order from the "My Orders" section in your account. Need the order ID?',
  list: 'To list a crop, go to your Farmer Dashboard → "List a crop", add photos, price, and available quantity.',
  produce: 'Fresh produce is available in the Marketplace. Search for tomatoes, onions, potatoes, and more near you.',
  support: 'For support, please raise a grievance from your profile page and our team will resolve it within 24 hours.',
  price: 'Today’s prices trend well for tomatoes and onions. Check the Farmer Dashboard for AI-suggested prices.',
  hello: 'Hi! I am Kisan Mitra. Ask me about orders, listings, prices, or support.',
};

const demoHi = {
  order:
    'आप अपने खाते में "My Orders" सेक्शन से अपना ऑर्डर ट्रैक कर सकते हैं। क्या आपके पास ऑर्डर आईडी है?',
  track:
    'आप अपने खाते में "My Orders" सेक्शन से अपना ऑर्डर ट्रैक कर सकते हैं। क्या आपके पास ऑर्डर आईडी है?',
  list:
    'फसल लिस्ट करने के लिए Farmer Dashboard → "List a crop" पर जाएं, फोटो, कीमत और उपलब्ध मात्रा जोड़ें।',
  produce:
    'ताज़ी उपज Marketplace में उपलब्ध है। टमाटर, प्याज़, आलू और अन्य चीज़ें अपने पास खोजें।',
  support:
    'सहायता के लिए अपने प्रोफ़ाइल से शिकायत दर्ज करें, हमारी टीम 24 घंटे में समाधान करेगी।',
  price:
    'आज टमाटर और प्याज़ की कीमतें अच्छी चल रही हैं। AI सुझाई गई कीमतों के लिए Farmer Dashboard देखें।',
  hello:
    'नमस्ते! मैं किसान मित्र हूँ। ऑर्डर, लिस्टिंग, कीमत या सहायता के बारे में पूछें।',
};

const getDemoReply = (text, lang) => {
  const t = text.toLowerCase();
  const dict = lang === 'hi' ? demoHi : demoEn;
  if (/(order|track|deliver)/.test(t)) return dict.order;
  if (/(list|sell|add)/.test(t)) return dict.list;
  if (/(produce|buy|vegetable|tomato|onion|potato)/.test(t)) return dict.produce;
  if (/(support|help|grievance|complaint)/.test(t)) return dict.support;
  if (/(price|cost|rate|forecast)/.test(t)) return dict.price;
  return dict.hello;
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([initialGreeting]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role || 'consumer';

  const localizedQuickReplies = language === 'hi'
    ? ['ऑर्डर ट्रैक करें', 'ताज़ी उपज खोजें', 'सहायता लें']
    : userRole === 'farmer'
      ? ['Track my order', 'List a crop', 'Talk to support']
      : ['Track my order', 'Find fresh produce', 'Talk to support'];

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].role !== 'assistant') return current;
      return [{ ...current[0], content: greetings[language] }];
    });
  }, [language]);

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
        (language === 'hi' ? fallbackHi : fallbackEn);

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
      // AI service offline - return a helpful demo reply
      const fallback = getDemoReply(text, language);
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
                placeholder={language === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
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
