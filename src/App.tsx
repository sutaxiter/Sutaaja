import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SendHorizontal, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Sparkles,
  Command,
  ChevronRight,
  Plus,
  Zap,
  Activity,
  Cpu,
  Layers,
  Paperclip,
} from 'lucide-react';
import { Role, Message } from './types';
import { sendMessageStream } from './services/gemini';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: Role.USER,
      content: input,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const modelMessage: Message = {
        role: Role.MODEL,
        content: '',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, modelMessage]);

      let fullContent = '';
      const stream = sendMessageStream(newMessages, input);

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === Role.MODEL) {
            return [...prev.slice(0, -1), { ...last, content: fullContent }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setMessages(prev => [...prev, {
        role: Role.MODEL,
        content: "Maaf, sepertinya ada sedikit kendala koneksi. Coba lagi ya!",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans bg-[#020205] overflow-hidden relative">
      {/* Atmospheric Background Glows */}
      <div className="atmosphere-glow-1" />
      <div className="atmosphere-glow-2" />

      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            SutaAi 
            <span className="text-[10px] font-mono text-cyan-400 opacity-80 uppercase tracking-widest ml-2 px-2 py-0.5 border border-cyan-400/30 rounded">Pro v2.4</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-mono text-green-400">API CONNECTED</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
            <User className="text-slate-400 w-5 h-5" />
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden z-10">
        {/* Sidebar: Projects & Sessions */}
        <aside className="hidden lg:flex w-64 border-r border-white/5 bg-black/40 p-4 flex-col">
          <button 
            onClick={clearChat}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-medium transition-all mb-6 flex items-center justify-center gap-2 text-slate-200"
          >
            <Plus size={16} />
            New Conversation
          </button>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">Recent Sessions</p>
            {[
              "Backend Logic Optimization",
              "Prompt Engineering Suite",
              "SutaAi Feature Roadmap",
              "Creative Writing Draft"
            ].map((session, i) => (
              <div 
                key={i}
                className={`p-2.5 text-sm transition-all cursor-pointer rounded-md ${
                  i === 0 
                  ? 'bg-cyan-500/10 border-l-2 border-cyan-500 text-cyan-100' 
                  : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {session}
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 bg-gradient-to-b from-blue-900/10 to-transparent border border-white/5 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-slate-400">Tokens Used</p>
              <Zap size={12} className="text-cyan-400" />
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
              <div className="w-[68%] h-full bg-cyan-500"></div>
            </div>
            <p className="text-[10px] text-slate-500">81.4k / 120k Monthly Limit</p>
          </div>
        </aside>

        {/* Chat Interface Area */}
        <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10 max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20"
                >
                  <Command className="text-white w-8 h-8" />
                </motion.div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-display font-bold tracking-tight text-white">
                    How can I assist you with your project today?
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    SutaAi is ready to help you analyze code, generate UI concepts, or dive into complex logic.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {[
                    { label: "Debug", text: "Analyze my recent source code for logic errors.", color: "text-cyan-400" },
                    { label: "Creative", text: "Help me generate a UI theme concept for SutaAi.", color: "text-purple-400" },
                  ].map((item, i) => (
                    <div 
                      key={i}
                      onClick={() => setInput(item.text)}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer text-left group"
                    >
                      <p className={`text-[10px] font-bold uppercase mb-1 tracking-widest ${item.color}`}>{item.label}</p>
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${message.role === Role.USER ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                        message.role === Role.USER 
                        ? 'bg-slate-800 border-white/10' 
                        : 'bg-cyan-500/20 border-cyan-500/30'
                      }`}>
                        {message.role === Role.USER ? (
                          <User size={14} className="text-slate-400" />
                        ) : (
                          <Bot size={14} className="text-cyan-400" />
                        )}
                      </div>
                      
                      <div className={`flex-1 space-y-2 ${message.role === Role.USER ? 'flex flex-col items-end' : ''}`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                          message.role === Role.USER 
                            ? 'bg-white/5 border border-white/10 rounded-tr-none text-slate-200' 
                            : 'text-white font-medium bg-transparent'
                        }`}>
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && messages[messages.length - 1].role === Role.USER && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 animate-pulse">
                      <Bot size={14} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 size={16} className="animate-spin text-cyan-500" />
                      <span className="text-slate-500 text-xs italic font-medium tracking-wide">Processing response...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Bar Area */}
          <div className="p-8 bg-gradient-to-t from-[#020205] to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-all duration-500" />
              
              <div className="relative bg-[#0d0d15] border border-white/10 rounded-xl p-2 flex items-center shadow-2xl">
                <div className="pl-4 text-slate-500">
                  <Layers size={18} />
                </div>
                
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) handleSend();
                  }}
                  placeholder="Message SutaAi..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-white placeholder-slate-500 text-sm outline-none"
                />
                
                <div className="flex items-center gap-2 pr-2">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`p-2.5 rounded-lg transition-all ${
                      input.trim() && !isLoading
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <p className="text-[10px] text-slate-600 flex items-center gap-1.5 uppercase tracking-[0.15em] font-medium">
                  <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">⌘</span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">Enter</span>
                  <span className="ml-1">to send</span>
                </p>
                <p className="text-[10px] text-slate-600 flex items-center gap-1.5 uppercase tracking-[0.15em] font-medium">
                  <Activity size={10} />
                  <span>Latency: 42ms</span>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel: System Metrics */}
        <aside className="hidden xl:flex w-72 border-l border-white/5 bg-black/40 p-6 flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Model Parameters</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Temperature</span>
                  <span className="text-xs text-white font-mono">0.7</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-cyan-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Top-K Complexity</span>
                  <span className="text-xs text-white font-mono">40</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">API Health</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                <span className="text-[11px] font-medium text-slate-200">Google Cloud Gateway</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Region</span>
                  <span className="text-slate-300">us-central1</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Provider</span>
                  <span className="text-slate-300">Gemini 3.0</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Status</span>
                  <span className="text-green-500 font-bold">READY</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/10 group hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-cyan-400" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Upgrade to Ultra</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Get 5x higher rate limits and early access to SutaAi v3 models.
              </p>
              <button className="w-full py-2 bg-white hover:bg-zinc-200 text-[#020205] text-[10px] font-bold rounded-lg uppercase tracking-widest transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
