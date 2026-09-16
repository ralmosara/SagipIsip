'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Activity,
  ArrowUpRight,
  Stethoscope,
  Database
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const mockChartData = [
  { name: 'Mon', patients: 140, therapists: 24 },
  { name: 'Tue', patients: 152, therapists: 24 },
  { name: 'Wed', patients: 180, therapists: 26 },
  { name: 'Thu', patients: 195, therapists: 26 },
  { name: 'Fri', patients: 210, therapists: 28 },
  { name: 'Sat', patients: 225, therapists: 28 },
  { name: 'Sun', patients: 250, therapists: 30 },
];

interface SystemStats {
  totalUsers: number;
  totalPatients: number;
  totalTherapists: number;
  totalChats: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/stats`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setStats(data);
        } else {
           // Fallback if not authenticated yet for UI demo
           setStats({
              totalUsers: 1245,
              totalPatients: 1150,
              totalTherapists: 95,
              totalChats: 45892
           });
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleIngest = async () => {
    setIngesting(true);
    try {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/document-ingestion/trigger`, {
           method: "POST",
           headers: { Authorization: `Bearer ${token}` }
        });
        alert('RAG Document ingestion triggered successfully. Check server logs.');
    } catch (e) {
        console.error(e);
        alert('Failed to trigger ingestion.');
    } finally {
        setIngesting(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { title: 'Patients', value: stats?.totalPatients || 0, icon: UserPlus },
    { title: 'Therapists', value: stats?.totalTherapists || 0, icon: Stethoscope },
    { title: 'Chat Logs', value: stats?.totalChats || 0, icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
        <Activity className="h-4 w-4 mr-2 animate-spin" /> Fetching telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-semibold text-slate-900">System Overview</h1>
           <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Metrics and Telemetry</p>
        </div>
        <button 
           onClick={handleIngest}
           disabled={ingesting}
           className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
        >
           <Database size={16} className={`mr-2 ${ingesting ? 'animate-bounce' : ''}`} /> 
           {ingesting ? 'Ingesting...' : 'Trigger RAG Ingestion'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-md p-4 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{stat.title}</span>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-md p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">User Acquisition</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="therapists" stroke="#64748b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">System Logs</h2>
          </div>
          <div className="p-4 flex-1 overflow-auto text-sm space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <span className="text-slate-400 font-mono text-xs mt-0.5 shrink-0">14:0{i}</span>
                <div>
                  <p className="font-medium text-slate-900">User Registered</p>
                  <p className="text-slate-500 text-xs mt-0.5">ID: usr_9283{i} completed sign up.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
