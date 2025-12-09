import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { sendMessageToGemini } from '../services/gemini';
import type { ChatMessage, User } from '../types';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setMessages(StorageService.getChats(currentUser.id));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    // Update UI immediately
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    StorageService.saveChat(user.id, userMsg);
    setInput('');
    setIsLoading(true);

    // Call Gemini with Bio Context
    const responseText = await sendMessageToGemini(messages, userMsg.text, user.name, user.bio);

    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
    };

    const finalHistory = [...newHistory, botMsg];
    setMessages(finalHistory);
    StorageService.saveChat(user.id, botMsg);
    setIsLoading(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col bg-surface rounded-2xl shadow-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/20 rounded-full">
          <Bot className="text-indigo-400" size={24} />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">MindBase Companion</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>Hello {user?.name}. How are you feeling today?</p>
            <p className="text-sm">I'm here to listen and support you.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1
              ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
            `}>
              {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] flex flex-col
              ${msg.role === 'user' ? 'items-end' : 'items-start'}
            `}>
              <div className={`
                px-4 py-3 rounded-2xl text-sm leading-relaxed relative min-w-[120px]
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'}
              `}>
                <div className="mb-3">{msg.text}</div>
                <div className="text-[10px] opacity-70 absolute bottom-1 right-3">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-none">
               <Loader2 className="animate-spin text-slate-400" size={20} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;