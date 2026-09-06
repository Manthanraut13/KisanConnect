import api from './api';

export const aiService = {
  getDemandForecast: (cropName, district, days = 7) =>
    api.post('/ai/forecast/demand', { crop_name: cropName, district, forecast_days: days }),
  getPriceRecommendation: (data) =>
    api.post('/ai/price/recommend', data),
  chatWithBot: (message, language, userRole, history) =>
    api.post('/ai/chatbot/query', {
      message, language, user_role: userRole, conversation_history: history
    }),
};