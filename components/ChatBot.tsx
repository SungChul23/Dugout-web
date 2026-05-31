import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

const LOCAL_STORAGE_CONV_KEY = 'dugout_conversation_id';
const LOCAL_STORAGE_HISTORY_KEY = 'dugout_chat_history';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'ai',
  text: '안녕하세요! 더그아웃 AI입니다. KBO 성적, 일정, 그리고 AI 기반 골든글러브/FA 예측까지 야구의 모든 것을 물어보세요! ⚾'
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  useEffect(() => {
    // Load or generate conversation UI
    let storedId = localStorage.getItem(LOCAL_STORAGE_CONV_KEY);
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem(LOCAL_STORAGE_CONV_KEY, storedId);
    }
    setConversationId(storedId);

    // Load history
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setMessages(parsedHistory);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (e) {
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleReset = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(LOCAL_STORAGE_CONV_KEY, newId);
    setConversationId(newId);
    const resetMessages = [WELCOME_MESSAGE];
    setMessages(resetMessages);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(resetMessages));
};

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMsgText = inputValue.trim();
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userMsgText
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('https://dugout.cloud/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMsgText,
          conversationId: localStorage.getItem('dugout_conversation_id') || conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: data?.answer || '응답을 받지 못했습니다.'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: '일시적인 오류가 발생했습니다. 다시 시도해주세요.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Split the line by ** to identify bold segments
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              // Remove the surrounding ** for the bolded text
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
          {i !== text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-brand-accent text-brand-dark rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center z-[9999] text-2xl md:text-3xl"
            aria-label="더그아웃 AI 열기"
          >
            💬
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] h-[85dvh] max-h-[800px] md:bottom-8 md:right-8 md:w-[520px] md:h-[800px] md:max-h-[85vh] rounded-3xl bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-[9999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex bg-[#0f1629] items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🤖</span>
                <h3 className="text-white font-bold tracking-tight md:text-lg">더그아웃 AI</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  aria-label="채팅 초기화"
                  title="대화 초기화"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-3 min-h-0 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.95, originX: msg.role === 'user' ? 1 : 0 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={msg.role === 'user' ? 'flex justify-end w-full shrink-0' : 'flex justify-start w-full shrink-0'}
                  >
                    <div 
                      className={
                        msg.role === 'user' 
                          ? 'max-w-[80%] rounded-2xl rounded-br-sm px-5 py-3 text-[15px] md:text-[16px] leading-relaxed break-words bg-brand-accent text-[#020617]' 
                          : 'max-w-[80%] rounded-2xl rounded-bl-sm px-5 py-3 text-[15px] md:text-[16px] leading-relaxed break-words bg-[#1e293b]/70 border border-white/5 text-slate-200'
                      }
                    >
                      {msg.role === 'ai' ? (
                        <div className="markdown-body overflow-x-auto">
                          <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                        </div>
                      ) : (
                        renderText(msg.text)
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div 
                    key="loading-indicator"
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.95, originX: 0 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex justify-start w-full shrink-0"
                  >
                    <div className="bg-[#1e293b]/70 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5 opacity-60">
                      <motion.div 
                        animate={{ y: [0, -3, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} 
                        className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -3, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} 
                        className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -3, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} 
                        className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                      />
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#0f1629] border-t border-white/10 shrink-0">
              <div className="relative flex items-center bg-[#1e293b]/60 rounded-xl border border-white/5 overflow-hidden">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={loading ? "더그아웃 AI가 답변 중입니다..." : "메시지를 입력하세요..."}
                  disabled={loading}
                  className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-slate-500 disabled:opacity-50 text-[15px] md:text-[16px]"
                />
                <AnimatePresence>
                  {inputValue.trim() && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleSend}
                      disabled={loading || !inputValue.trim()}
                      className="px-4 py-2 text-brand-accent hover:text-cyan-300 disabled:opacity-30 transition-colors font-bold flex items-center justify-center"
                      aria-label="전송"
                    >
                      <motion.svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBot;
