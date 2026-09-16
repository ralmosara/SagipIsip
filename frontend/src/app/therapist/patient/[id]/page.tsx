"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Activity, BookOpen, Calendar, AlertTriangle, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PatientDetails {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  moods: { id: string; mood: number; notes: string; createdAt: string }[];
  workbooks: { id: string; title: string; content: string; createdAt: string }[];
  sessionSummaries: { id: string; summary: string; sentiment: number; riskLevel: string; createdAt: string }[];
}

export default function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchPatient = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/therapist/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        } else {
          router.push("/therapist");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!patient) return null;

  // Format data for Recharts (reverse to show chronological order)
  const chartData = [...patient.moods].reverse().map(m => ({
    date: new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    mood: m.mood
  }));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/therapist')}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Patient List
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Patient Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-start space-x-6">
          <div className="w-20 h-20 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-3xl font-bold">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{patient.name}</h1>
            <div className="flex items-center text-slate-500 space-x-6 text-sm">
              <span className="flex items-center"><User size={16} className="mr-2" /> {patient.email}</span>
              <span className="flex items-center"><Calendar size={16} className="mr-2" /> Joined {new Date(patient.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Activity className="mr-2 text-teal-600" /> Mood Trend (Last 30 Logs)
              </h2>
              
              {chartData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        domain={[1, 5]} 
                        ticks={[1, 2, 3, 4, 5]} 
                        tick={{fontSize: 12, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => {
                          return val === 1 ? '😢' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '😄';
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}/5`, 'Mood']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#0d9488" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No mood logs available yet.
                </div>
              )}
            </div>

            {/* CBT Workbooks */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="mr-2 text-teal-600" /> Recent CBT Exercises
              </h2>
              
              {patient.workbooks.length > 0 ? (
                <div className="space-y-4">
                  {patient.workbooks.map(wb => (
                    <div key={wb.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-700">{wb.title}</h3>
                        <span className="text-xs text-slate-400 font-medium">{new Date(wb.createdAt).toLocaleDateString()}</span>
                      </div>
                      {/* Preview content if it's JSON */}
                      <div className="text-sm text-slate-500 line-clamp-2">
                        {wb.content.includes('"situation"') 
                          ? JSON.parse(wb.content).situation 
                          : wb.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No CBT workbooks completed yet.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column: Recent Notes + AI Session Summaries */}
          <div className="space-y-8">
            {/* AI Session Summaries */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Brain className="mr-2 text-purple-600" size={20} /> AI Risk Logs
              </h2>
              {patient.sessionSummaries && patient.sessionSummaries.length > 0 ? (
                <div className="space-y-3">
                  {patient.sessionSummaries.map(s => (
                    <div key={s.id} className={`p-3 rounded-xl border text-sm ${
                      s.riskLevel === 'HIGH'
                        ? 'bg-red-50 border-red-200'
                        : s.riskLevel === 'MEDIUM'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          s.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700'
                          : s.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {s.riskLevel === 'HIGH' && <AlertTriangle size={10} />}
                          {s.riskLevel}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 text-xs line-clamp-3">{s.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-4 text-sm">No AI sessions yet.</div>
              )}
            </div>

            {/* Recent Mood Notes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Notes</h2>
              <div className="space-y-3">
                {patient.moods.filter(m => m.notes).length > 0 ? (
                  patient.moods.filter(m => m.notes).slice(0, 5).map(m => (
                    <div key={m.id} className="flex gap-3">
                      <span className="text-xl shrink-0">
                        {m.mood === 1 ? '😢' : m.mood === 2 ? '😕' : m.mood === 3 ? '😐' : m.mood === 4 ? '🙂' : '😄'}
                      </span>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                        <time className="text-xs font-medium text-teal-600 block mb-1">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </time>
                        <p className="text-sm text-slate-600 italic">"{m.notes}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-4 text-sm">No notes logged.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
