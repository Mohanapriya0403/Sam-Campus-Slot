import { api } from './client';

// Sends user message and conversation history to SAM CAMPUS SLOT Assistant
// history: [{ role: 'user' | 'assistant', content: string }]
export const sendChatMessage = (message, history = [], context = {}) =>
  api.post('/chatbot', { message, history, ...context });
