"use client";
import { useState } from 'react';
import { Sparkles, Trash2, CheckCircle2, Circle, Command } from 'lucide-react'; // Suggested icons

export default function Home() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Welcome! Try typing 'Add buy milk' below", completed: false }
  ]);
  const [input, setInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // This is where your OpenAI logic will eventually go
  const handleAiCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAiProcessing(true);
    
    // TEMPORARY: Simulating AI delay
    setTimeout(() => {
      setIsAiProcessing(false);
      setInput("");
      // Logic for AI actions will be inserted here later
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans p-6">
      <div className="max-w-2xl mx-auto mt-20">
        
        {/* AI Command Bar */}
        <div className="relative mb-12 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Sparkles className={`w-5 h-5 ${isAiProcessing ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <form onSubmit={handleAiCommand}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI to 'add coffee', 'delete task 1', or 'mark all as done'..."
              className="w-full pl-12 pr-4 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:shadow-md focus:border-blue-300 transition-all outline-none text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">Enter</kbd>
            </div>
          </form>
          {isAiProcessing && (
             <p className="absolute -bottom-7 left-2 text-xs text-blue-500 font-medium animate-pulse">
               AI is updating your list...
             </p>
          )}
        </div>

        {/* Task List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Tasks</h2>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{todos.length} Total</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {todos.map((todo, index) => (
              <div key={todo.id} className="group flex items-center justify-between p-5 border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-300">0{index + 1}</span>
                  <p className={`${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'} font-medium`}>
                    {todo.text}
                  </p>
                </div>
                <div className="flex gap-2">
                   {/* We'll use icons now for a cleaner look */}
                   <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><CheckCircle2 size={18} /></button>
                   <button className="p-2 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}