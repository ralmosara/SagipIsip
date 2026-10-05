"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Activity, ArrowRight, Home, Sparkles, Trophy, Star, Shield } from "lucide-react";
import Link from 'next/link';

interface WorkbookEntry {
  id: string;
  title: string;
  createdAt: string;
}

export default function WorkbooksDashboard() {
  const [entries, setEntries] = useState<WorkbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchWorkbooks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workbooks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        } else if (res.status === 401) {
          router.push("/auth");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkbooks();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] via-[#E0F2F1] to-[#E3F2FD] font-inter text-slate-800 selection:bg-emerald-300/30 overflow-hidden relative pb-12">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#A5D6A7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#80DEEA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/40 border-b border-white/30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition shadow-sm border border-white/60">
                <Home size={18} className="text-slate-600" />
             </Link>
             <div className="flex flex-col">
                <h1 className="text-xl font-outfit font-bold tracking-wide text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-500" /> Therapy Workbooks
                </h1>
             </div>
          </div>
          <button 
            onClick={() => router.push("/chat")}
            className="text-sm font-semibold text-emerald-700 bg-white/50 border border-white/50 px-4 py-2 rounded-full hover:bg-white/80 transition-colors shadow-sm"
          >
            Switch to Chat
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-outfit font-bold text-slate-900 tracking-tight drop-shadow-sm flex items-center gap-3">
              Your Journey <span className="bg-emerald-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Star size={14} fill="currentColor" /> Level 3</span>
            </h2>
            <p className="text-slate-600 mt-2 font-medium">Reflect, reframe, and earn rewards as you grow.</p>
          </div>
          <button
            onClick={() => router.push("/workbooks/new")}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-md hover:scale-105 transition-transform font-bold"
          >
            <Plus size={20} className="mr-2" /> New Exercise
          </button>
        </div>

        {/* Gamified Progress Map */}
        <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Trophy size={120} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
            <Shield size={20} className="text-emerald-500" /> Cognitive Mastery Map
          </h3>
          
          <div className="relative z-10">
            <div className="absolute top-1/2 left-0 w-full h-2 bg-emerald-100 rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 w-[60%] h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full -translate-y-1/2 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
            
            <div className="flex justify-between relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border-4 border-white z-10">
                  <Star size={20} fill="currentColor" />
                </div>
                <span className="mt-3 font-bold text-slate-700 text-sm">Initiation</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border-4 border-white z-10">
                  <BookOpen size={20} fill="currentColor" />
                </div>
                <span className="mt-3 font-bold text-slate-700 text-sm">Awareness</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(20,184,166,0.6)] border-4 border-white z-10 scale-110">
                  <Shield size={24} fill="currentColor" />
                </div>
                <span className="mt-3 font-bold text-teal-700 text-sm drop-shadow-sm">Current Node</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-300 shadow-sm border-4 border-white z-10">
                  <Trophy size={20} />
                </div>
                <span className="mt-3 font-bold text-slate-400 text-sm">Resilience</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-6 text-center font-medium">Complete 2 more exercises to unlock the Resilience module!</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-sm border border-white/70 p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/30 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Sparkles size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-outfit font-bold text-slate-800 mb-3">Begin Your First Module</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">Cognitive Behavioral Therapy (CBT) helps you identify and change negative thought patterns. Take the first step today.</p>
              <button
                onClick={() => router.push("/workbooks/new")}
                className="inline-flex items-center px-8 py-4 bg-emerald-100/80 text-emerald-800 rounded-2xl hover:bg-emerald-200 transition-colors font-bold shadow-sm"
              >
                Start an Exercise
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                onClick={() => router.push(`/workbooks/${entry.id}`)}
                className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 hover:bg-white/80 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-2xl text-white shadow-sm group-hover:scale-110 transition-transform">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-lg">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-outfit font-bold text-slate-800 line-clamp-2 drop-shadow-sm">
                  {entry.title}
                </h3>
                <div className="mt-6 flex items-center text-emerald-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 rounded-xl px-4 py-2 w-fit">
                  Review Entry <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
