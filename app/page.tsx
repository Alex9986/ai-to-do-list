"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle2, Circle, Send, ListTodo, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const Home: React.FC = () => {
  // --- STATE ---
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Try saying 'Add go to the gym'", completed: false }
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'I am your task agent. Tell me what to do!' }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- AI LOGIC (UI Placeholder) ---
  const askTheAI = async () => {
    if (inputMessage.trim() === '') return;

    setIsProcessing(true);
    const userMessage = { role: 'user' as const, content: inputMessage };
    
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          currentTodos: todos // Send the actual tasks
        }),
      });

      const data = await response.json();

      if (data.updatedTodos) {
        // We REPLACE the state with the AI's version, we don't [...todos, data.updatedTodos]
        setTodos(data.updatedTodos); 
        console.log("List updated by AI:", data.updatedTodos);
      } else {
        console.log("AI did not trigger a list update.");
      }

      setMessages(prev => [...prev, userMessage, { role: 'assistant', content: data.response }]);
      setInputMessage('');
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      
      {/* HEADER */}
      <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ListTodo size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">AI Task Manager</h1>
        </div>
        <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {todos.length} TASKS TOTAL
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT: THE TASK LIST */}
        <section className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Tasks</h2>
          <div className="grid gap-3">
            {todos.map((todo) => (
              <div key={todo.id} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <button className={`transition-colors ${todo.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}>
                    {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <span className={`${todo.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {todo.text}
                  </span>
                </div>
                <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: THE CHAT LOG (The Memory) */}
        <section className="w-full md:w-80 bg-slate-50 border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2 text-slate-500">
            <MessageSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">AI Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-50 text-blue-700 ml-4' : 'bg-white border border-slate-200 text-slate-600 mr-4'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </section>
      </div>

      {/* BOTTOM: COMMAND BAR */}
      <footer className="p-6 bg-white border-top border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Sparkles className={`w-5 h-5 ${isProcessing ? 'text-blue-500 animate-pulse' : 'text-slate-300'}`} />
          </div>
          <input 
            type="text"
            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
            placeholder="E.g. 'Add buy eggs' or 'Remove the first task'..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askTheAI()}
            disabled={isProcessing}
          />
          <button 
            onClick={askTheAI}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;