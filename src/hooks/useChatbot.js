import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from './useLocalStorage';
import { sendChatMessage } from '../api/chatbot';
import { ApiError } from '../api/client';

const MAX_STORED_MESSAGES = 40;

export const QUICK_ACTIONS = [
  "Today's Timetable",
  "Tomorrow's Timetable",
  'Upcoming Classes',
  'Next Class',
  'Smart Classrooms',
  'Venue Changes',
];

export function useChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useLocalStorage(
    `sam-campus-slot-chat-${user?.id || 'guest'}`,
    []
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || sending) return;

      setError('');
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory.slice(-MAX_STORED_MESSAGES));
      setSending(true);

      try {
        const historyPayload = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        const response = await sendChatMessage(trimmed, historyPayload);
        const replyText = response.reply || response.message || response.data?.message || 'I received your request.';

        const botMessage = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: response.intent,
          data: response.data,
        };

        setMessages((prev) => [...prev, botMessage].slice(-MAX_STORED_MESSAGES));
      } catch (err) {
        const errorMsg =
          err instanceof ApiError
            ? err.message
            : "I'm having trouble connecting to the campus system right now. Please try again.";
        setError(errorMsg);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, setMessages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError('');
  }, [setMessages]);

  return {
    messages,
    sending,
    error,
    sendMessage,
    clearChat,
    quickActions: QUICK_ACTIONS,
  };
}
