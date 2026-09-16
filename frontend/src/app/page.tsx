'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartPulse, 
  MessageSquare, 
  BookOpen, 
  Activity,
  LogOut,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';

const mockMoodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 4 },
  { day: 'Wed', mood: 2 },
  { day: 'Thu', mood: 4 },
  { day: 'Fri', mood: 5 },
  { day: 'Sat', mood: 4 },
  { day: 'Sun', mood: 5 },
];

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Patient');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  if (!isClient) return null; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2F1] via-[#E3F2FD] to-[#FFF3E0] font-inter text-slate-800 selection:bg-blue-300/30 overflow-hidden relative">
      {/* Background Orbs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#80DEEA] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-[#FFCC80] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] bg-[#A5D6A7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      {/* Glassmorphic Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/40 border-b border-white/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-[#0288D1] to-[#26C6DA] p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Activity size={20} />
            </div>
            <span className="text-lg font-outfit font-bold tracking-wide text-slate-800">
              SagipIsip Sanctuary
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Welcome back, {userName}</span>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/auth");
              }}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-500 transition-colors bg-white/50 px-4 py-2 rounded-full border border-white/50 hover:bg-white/80 shadow-sm"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 mt-10 pb-16 z-10">
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-outfit font-bold text-slate-900 tracking-tight drop-shadow-sm">Your Daily Overview</h1>
            <p className="text-base text-slate-600 mt-2 font-medium">Breathe deeply. Here is your personalized wellness snapshot.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-orange-600">
                <Flame size={16} /> 3 Day Streak
             </div>
             <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-emerald-600">
                <Award size={16} /> 12 Badges
             </div>
          </div>
        </div>

        {/* Action Cards (Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <Link href="/chat" className="group block h-full transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-full bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/60 hover:bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(2,136,209,0.15)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare size={80} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl shadow-md">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-outfit font-semibold text-slate-800">AI Companion</h3>
              </div>
              <p className="text-slate-600 text-sm flex-1 mb-6 leading-relaxed font-medium">Chat with your empathetic, 24/7 mental health assistant. Practice roleplay scenarios or vent safely.</p>
              <div className="flex items-center text-blue-600 font-bold text-sm bg-blue-50/50 rounded-xl px-4 py-2 self-start group-hover:bg-blue-100/50 transition-colors">
                Start Session <Sparkles size={14} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/workbooks" className="group block h-full transform hover:-translate-y-1 transition-all duration-300">
            <div className="h-full bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/60 hover:bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(165,214,167,0.2)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BookOpen size={80} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-md">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-outfit font-semibold text-slate-800">CBT Workbooks</h3>
              </div>
              <p className="text-slate-600 text-sm flex-1 mb-6 leading-relaxed font-medium">Engage with guided modules designed to reframe negative thoughts and boost your coping skills.</p>
              <div className="flex items-center text-emerald-700 font-bold text-sm bg-emerald-50/50 rounded-xl px-4 py-2 self-start group-hover:bg-emerald-100/50 transition-colors">
                Continue Module <span className="ml-2 text-lg leading-none">→</span>
              </div>
            </div>
          </Link>

          <div className="group block cursor-pointer h-full transform hover:-translate-y-1 transition-all duration-300" onClick={() => router.push('/chat')}>
            <div className="h-full bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/60 hover:bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(255,152,0,0.15)] flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <HeartPulse size={80} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-rose-400 text-white rounded-2xl shadow-md">
                  <HeartPulse size={24} />
                </div>
                <h3 className="text-xl font-outfit font-semibold text-slate-800">Mood & Habits</h3>
              </div>
              <p className="text-slate-600 text-sm flex-1 mb-6 leading-relaxed font-medium">Log your daily vitals, track your habits, and build a routine that supports your mental wellness.</p>
              <div className="flex items-center text-orange-600 font-bold text-sm bg-orange-50/50 rounded-xl px-4 py-2 self-start group-hover:bg-orange-100/50 transition-colors">
                Log Today <span className="ml-2 text-lg leading-none">+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/70 shadow-sm relative overflow-hidden">
             {/* Subtle gradient behind chart */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-xl font-outfit font-bold text-slate-800 tracking-wide">Mood Trends</h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 shadow-sm backdrop-blur-sm">
                +15% Growth
              </span>
            </div>
            
            <div className="h-[280px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0288D1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0288D1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} domain={[1, 5]} ticks={[1,2,3,4,5]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}
                    formatter={(value: any) => [value, 'Mood Rating']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#0288D1" 
                    strokeWidth={4} 
                    dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#0288D1' }}
                    activeDot={{ r: 8, fill: '#0288D1', stroke: 'rgba(2,136,209,0.3)', strokeWidth: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity & AI Insight Log */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 shadow-sm flex flex-col relative overflow-hidden">
            <div className="p-6 border-b border-white/50 bg-gradient-to-r from-blue-50/50 to-transparent">
              <h3 className="text-xl font-outfit font-bold text-slate-800 tracking-wide flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500" /> AI Insights
              </h3>
            </div>
            <div className="p-6 flex-1">
              <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-100 mb-6">
                <p className="text-sm text-blue-900 font-medium italic leading-relaxed">
                  "You've logged 'anxious' for two days. I recommend trying the **Distress Tolerance** workbook module today. You've got this!"
                </p>
              </div>

              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Milestones</h4>
              <div className="space-y-5">
                {[
                  { title: "Completed 'Cognitive Reframing' module", time: "2 hours ago", color: "bg-emerald-400" },
                  { title: "Logged Mood: 4/5 (Hopeful)", time: "Yesterday", color: "bg-blue-400" },
                  { title: "Achieved 'Habit Hero' Badge", time: "2 days ago", color: "bg-orange-400" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`mt-1.5 w-3 h-3 rounded-full ${item.color} shrink-0 ring-4 ring-white shadow-sm group-hover:scale-125 transition-transform`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
