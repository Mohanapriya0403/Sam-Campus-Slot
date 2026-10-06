import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, RotateCcw, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useChatbot } from '../../hooks/useChatbot';

/** Floating chat bubble + panel for Campus Assistant */
export default function ChatWidget() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, sending, error, sendMessage, clearChat, quickActions } = useChatbot();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function handleSend(text) {
    const target = text !== undefined ? text : input;
    if (!target.trim() || sending) return;
    sendMessage(target);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[min(34rem,calc(100vh-8rem))] flex flex-col rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-glow overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-ink-100 dark:border-ink-800 bg-brand-600 text-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Bot size={17} />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm leading-tight truncate">
                  Campus Assistant
                </p>
                <p className="text-[11px] text-white/80 leading-tight truncate">
                  Ask about rooms, timetable & more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  aria-label={t('chat_clear') || 'Clear conversation'}
                  title={t('chat_clear') || 'Clear conversation'}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label={t('chat_close_aria') || 'Close'}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-brand-600" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-ink-100 dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-700 dark:text-ink-200 max-w-[85%] leading-relaxed">
                    Hi {user?.name?.trim() || 'there'}! I'm <strong>Campus Assistant</strong>. How can I help you today?
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pl-9 space-y-2">
                  <p className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleSend(action)}
                        className="text-xs px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800/80 bg-brand-50/50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 hover:bg-brand-100/70 dark:hover:bg-brand-900/40 active:scale-95 transition-all text-left font-medium"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id || m.timestamp}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-brand-600" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-100 rounded-tl-sm border border-ink-200/50 dark:border-ink-700/50'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing State */}
            {sending && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-brand-600 animate-spin-slow" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-ink-100 dark:bg-ink-800 px-3.5 py-2 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <span>Campus Assistant is typing...</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-red-500" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 max-w-[85%]">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-ink-100 dark:border-ink-800 p-3 shrink-0 bg-ink-50/50 dark:bg-ink-900/50">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about rooms, timetable & more..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-24 text-ink-800 dark:text-ink-100 placeholder:text-ink-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                aria-label={t('chat_send') || 'Send message'}
                className="shrink-0 w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Campus Assistant' : 'Open Campus Assistant'}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-brand-600 text-white shadow-glow flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all duration-200"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && messages.length === 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slot-500 animate-pulse-slow border-2 border-white dark:border-ink-900" />
        )}
      </button>
    </>
  );
}
