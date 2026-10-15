"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { 
  Send, 
  User, 
  Bot, 
  ArrowRight, 
  X, 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  Home, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Loader2, 
  ExternalLink 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface Citation {
  bookTitle: string;
  snippet: string;
  similarity?: number;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  hasRagContext?: boolean;
  sources?: string[];
  citations?: Citation[];
}

export default function ChatSession() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [moodValue, setMoodValue] = useState(3);
  const [moodNotes, setMoodNotes] = useState("");
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  // Clinical Library Search Modal state
  const [consultQuery, setConsultQuery] = useState("");
  const [consultSearching, setConsultSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [directAnswer, setDirectAnswer] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    // Fetch chat history
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/chat/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        setMessages(data.map((msg: any) => ({
          sender: msg.sender,
          text: msg.message,
          hasRagContext: msg.hasRagContext,
          sources: msg.sources,
          citations: msg.citations
        })));
      }
    })
    .catch(console.error);

    // Connect to NestJS backend WebSocket (port 3001)
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => {
        // Prevent duplicate user messages if echo'd back
        if (msg.sender === 'user' && prev.length > 0 && prev[prev.length - 1].text === msg.text) {
           return prev;
        }
        return [...prev, msg];
      });
      if (msg.sender === 'ai') {
        setIsLoading(false);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSend = () => {
    if (inputText.trim() && socket && !isLoading) {
      setMessages((prev) => [...prev, { sender: "user", text: inputText }]);
      socket.emit("sendMessage", { text: inputText });
      setInputText("");
      setIsLoading(true);
    }
  };

  const toggleSource = (idx: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleLogMood = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/moods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mood: moodValue, notes: moodNotes })
      });
      if (res.ok) {
        setShowMoodModal(false);
        setMoodNotes("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchLibrary = async () => {
    if (!consultQuery.trim()) return;
    setConsultSearching(true);
    setDirectAnswer(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/chat/consult/search?q=${encodeURIComponent(consultQuery)}&limit=4`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error("Consult search error:", e);
    } finally {
      setConsultSearching(false);
    }
  };

  const handleAskClinicalQuestion = async () => {
    if (!consultQuery.trim()) return;
    setConsultSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/chat/consult`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ query: consultQuery, topK: 4 })
        }
      );
      if (res.ok) {
        const data = await res.json();
        setDirectAnswer(data.answer);
        setSearchResults(data.chunks || []);
      }
    } catch (e) {
      console.error("Consultation query error:", e);
    } finally {
      setConsultSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-inter text-slate-800 selection:bg-blue-300/30 overflow-hidden relative bg-gradient-to-br from-[#E0F2F1] via-[#E3F2FD] to-[#FFF3E0]">
      {/* Background Orbs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-[#80DEEA] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[40%] right-[-10%] w-80 h-80 bg-[#FFCC80] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/40 border-b border-white/30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition shadow-sm border border-white/60">
                <Home size={18} className="text-slate-600" />
             </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-outfit font-bold tracking-wide text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500" /> AI Companion
              </h1>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Online & Ready (18k Clinical Vectors Active)
              </span>
            </div>
          </div>
          <div className="flex space-x-2 sm:space-x-3 items-center">
            <button
              onClick={() => setShowConsultModal(true)}
              className="flex items-center px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 rounded-full text-xs font-semibold transition-colors shadow-sm"
              title="Search and consult 22 clinical books directly"
            >
              <BookOpen size={15} className="mr-1.5 text-teal-600" />
              <span className="hidden sm:inline">Consult</span> Library
            </button>
            <button 
              onClick={() => setShowMoodModal(true)}
              className="flex items-center px-3.5 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-sm border border-white/50 rounded-full text-xs font-semibold text-orange-600 transition-colors shadow-sm"
            >
              <Heart size={15} className="mr-1.5" /> Log Mood
            </button>
            <button 
              onClick={() => router.push("/workbooks")}
              className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full text-xs font-semibold transition-colors shadow-md"
            >
              Workbooks <ArrowRight size={15} className="ml-1.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center z-10 relative scrollbar-hide">
        <div className="w-full max-w-3xl flex flex-col space-y-6 pb-20">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 mt-10">
              <div className="w-24 h-24 bg-white/60 backdrop-blur-xl border border-white/70 rounded-full flex items-center justify-center mb-6 shadow-xl relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-50"></div>
                <Bot size={48} className="text-blue-600 relative z-10" />
              </div>
              <h2 className="text-3xl font-outfit font-bold text-slate-800 mb-3 drop-shadow-sm">Safe Space Enabled</h2>
              <p className="text-base text-center max-w-md text-slate-600 font-medium leading-relaxed bg-white/40 p-4 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm">
                I'm your empathetic AI companion, grounded in our 22 clinical psychology textbooks. Whether you want to explore negative thoughts, learn DBT distress tolerance, or just talk—I am here.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isCrisis = msg.text.includes("reach out to a professional or a crisis hotline") || msg.text.includes("NCMH Crisis Hotline");
              
              return (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`flex items-start max-w-[88%] md:max-w-[85%] rounded-3xl p-4 shadow-sm backdrop-blur-md border ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-tr-sm border-blue-400/50"
                        : isCrisis 
                          ? "bg-rose-50/90 text-rose-900 border-rose-200 shadow-rose-100 rounded-tl-sm"
                          : "bg-white/85 text-slate-800 rounded-tl-sm border-white"
                    }`}
                  >
                    <div className="mr-3 mt-1 shrink-0">
                      {msg.sender === "user" ? (
                        <div className="bg-white/20 p-1.5 rounded-full"><User size={16} className="text-white" /></div>
                      ) : isCrisis ? (
                        <div className="bg-rose-200 p-1.5 rounded-full"><ShieldAlert size={16} className="text-rose-700" /></div>
                      ) : (
                        <div className="bg-blue-100 p-1.5 rounded-full relative">
                          <Bot size={16} className="text-blue-600" />
                          {msg.hasRagContext && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow-sm" title="Clinical Knowledge Active">
                              <Sparkles size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 leading-relaxed whitespace-pre-wrap font-medium text-[15px] ${isCrisis ? 'font-semibold' : ''}`}>
                      {msg.text}

                      {/* Clinical Knowledge & Source Citations */}
                      {msg.hasRagContext && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between text-teal-700 font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-teal-600" />
                              Clinical Vector Consultation
                            </span>
                            {msg.citations && msg.citations.length > 0 && (
                              <button
                                onClick={() => toggleSource(idx)}
                                className="flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-800 underline font-medium cursor-pointer"
                              >
                                {expandedSources[idx] ? (
                                  <>Hide Evidence <ChevronUp size={12} /></>
                                ) : (
                                  <>View {msg.citations.length} Cited Sources <ChevronDown size={12} /></>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Source book pills */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {msg.sources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-block bg-teal-50 text-teal-800 border border-teal-200/70 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                                >
                                  📖 {src.length > 42 ? src.substring(0, 39) + '...' : src}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Expandable Citation Snippets */}
                          {expandedSources[idx] && msg.citations && (
                            <div className="mt-2.5 space-y-2 bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-slate-700 text-[11px]">
                              {msg.citations.map((c, cIdx) => (
                                <div key={cIdx} className="border-b border-slate-200/70 pb-2 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-center text-slate-900 font-semibold text-[11px]">
                                    <span className="truncate max-w-[70%]">📄 {c.bookTitle}</span>
                                    {c.similarity !== undefined && (
                                      <span className="text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                        {(c.similarity * 100).toFixed(0)}% match
                                      </span>
                                    )}
                                  </div>
                                  <p className="italic text-slate-600 mt-1 line-clamp-3 font-normal leading-snug">
                                    "{c.snippet}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="flex items-center max-w-[85%] rounded-3xl p-4 shadow-sm backdrop-blur-md bg-white/80 text-slate-800 rounded-tl-sm border border-white">
                <div className="mr-3 mt-1 shrink-0">
                  <div className="bg-blue-100 p-1.5 rounded-full"><Bot size={16} className="text-blue-600" /></div>
                </div>
                <div className="flex space-x-2 items-center h-6 px-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/30 backdrop-blur-xl border-t border-white/40 flex justify-center sticky bottom-0 z-20">
        <div className="w-full max-w-3xl flex items-center relative group">
          <input
            type="text"
            className="flex-1 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full py-4 px-6 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all shadow-sm text-brand-gray disabled:opacity-50 font-medium text-sm"
            placeholder={isLoading ? "Isip is consulting the clinical library..." : "Share what's on your mind or ask for coping guidance..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md flex items-center justify-center cursor-pointer"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </footer>

      {/* Clinical Library Consultation Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-600 text-white rounded-xl shadow-sm">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-outfit font-bold text-slate-800">
                    Clinical Library Consultation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search and query 18,047 textbook chunks (Beck CBT, DBT, Attachment Theory, Dissociation)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConsultModal(false);
                  setSearchResults([]);
                  setDirectAnswer(null);
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={consultQuery}
                    onChange={(e) => setConsultQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchLibrary()}
                    placeholder="e.g. Cognitive distortions, Paced breathing 4-4-6, Anxious attachment..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
                <button
                  onClick={handleSearchLibrary}
                  disabled={consultSearching || !consultQuery.trim()}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {consultSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Find Excerpts
                </button>
                <button
                  onClick={handleAskClinicalQuestion}
                  disabled={consultSearching || !consultQuery.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {consultSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Synthesize
                </button>
              </div>

              {/* Direct Synthesized Answer */}
              {directAnswer && (
                <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 p-4 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={14} className="text-blue-600" /> Evidence-Based Clinical Synthesis
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {directAnswer}
                  </p>
                </div>
              )}

              {/* Matched Excerpts from PostgreSQL pgvector */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Matched Clinical Literature ({searchResults.length} excerpts)
                  </h4>
                  {searchResults.map((r, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 hover:bg-slate-100/70 transition">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-teal-900 truncate max-w-[80%]">
                          📖 {r.bookTitle}
                        </span>
                        {r.similarity !== undefined && (
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                            {(r.similarity * 100).toFixed(1)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{r.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && !directAnswer && !consultSearching && (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <BookOpen size={36} className="mx-auto text-slate-300" />
                  <p className="text-sm">Type any clinical concept to search across 18,047 vectors.</p>
                  <p className="text-xs text-slate-400">Supported: CBT, DBT, Attachment, Dissociation, Youth Mental Health, NICE Guidelines.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white">
            <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-orange-50 to-rose-50">
              <h3 className="text-xl font-outfit font-bold text-orange-900 flex items-center">
                <Sparkles className="mr-2 text-orange-500" size={20} /> How are you?
              </h3>
              <button onClick={() => setShowMoodModal(false)} className="text-orange-900/50 hover:text-orange-900 transition-colors bg-orange-900/5 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8 px-2 mt-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMoodValue(val)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer ${
                      moodValue === val 
                        ? 'bg-gradient-to-br from-orange-400 to-rose-400 text-white scale-110 shadow-lg shadow-orange-500/30' 
                        : 'bg-slate-100/80 text-brand-gray hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    {val === 1 ? '😢' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '😄'}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-brand-gray mb-2 pl-1">Journal Note (Optional)</label>
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="What's making you feel this way?"
                  className="w-full bg-brand-light/50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-orange-400 outline-none resize-none transition-all text-sm"
                  rows={3}
                ></textarea>
              </div>

              <button
                onClick={handleLogMood}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
