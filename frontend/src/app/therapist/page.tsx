'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  ChevronRight, 
  Search,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  BookOpen,
  Sparkles,
  Loader2
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
import Link from 'next/link';

const mockChartData = [
  { day: 'Mon', averageMood: 3.2 },
  { day: 'Tue', averageMood: 3.5 },
  { day: 'Wed', averageMood: 3.1 },
  { day: 'Thu', averageMood: 3.8 },
  { day: 'Fri', averageMood: 4.0 },
  { day: 'Sat', averageMood: 4.2 },
  { day: 'Sun', averageMood: 3.9 },
];

export default function TherapistDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [vectorQuery, setVectorQuery] = useState('');
  const [vectorSearching, setVectorSearching] = useState(false);
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [clinicalSynthesis, setClinicalSynthesis] = useState<string | null>(null);

  const handleVectorSearch = async () => {
    if (!vectorQuery.trim()) return;
    setVectorSearching(true);
    setClinicalSynthesis(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/therapist/consult/search?q=${encodeURIComponent(vectorQuery)}&limit=3`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setVectorResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVectorSearching(false);
    }
  };

  const handleClinicalConsult = async () => {
    if (!vectorQuery.trim()) return;
    setVectorSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/therapist/consult`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ query: vectorQuery, topK: 3 })
        }
      );
      if (res.ok) {
        const data = await res.json();
        setClinicalSynthesis(data.answer);
        setVectorResults(data.chunks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVectorSearching(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const [patientsRes, alertsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/therapist/patients`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/therapist/alerts`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          setPatients(pData);
        }
        if (alertsRes.ok) {
          const aData = await alertsRes.json();
          setAlerts(aData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const statCards = [
    { title: 'Active Patients', value: patients.length.toString(), icon: Users, color: 'indigo', trend: 'Assigned to you' },
    { title: 'Biopsychosocial Insights', value: '4', icon: BrainCircuit, color: 'orange', trend: 'New correlations' },
    { title: 'Critical Alerts', value: alerts.length.toString(), icon: AlertTriangle, color: 'red', trend: 'Requires attention' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-gray text-sm">
        <Activity className="h-4 w-4 mr-2 animate-spin" /> Fetching patient telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-brand-dark">Clinical Dashboard</h1>
          <p className="text-xs text-brand-gray mt-1 uppercase tracking-wider">
            Patient telemetry and recent activities
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-brand-gray uppercase tracking-wider">{stat.title}</span>
                <Icon size={16} className={`text-${stat.color}-600`} />
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl font-bold text-brand-dark">{stat.value}</span>
                <span className={`text-xs font-medium ${stat.color === 'red' && parseInt(stat.value) > 0 ? 'text-red-600' : 'text-brand-gray'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Patient Status Board */}
        <div className="xl:col-span-2 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-brand-light flex justify-between items-center">
            <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-brand-red" /> Patient Watchlist
            </h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={12} className="absolute left-3 top-2 text-slate-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-brand-gray uppercase tracking-wider text-xs">
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Latest Session Summary</th>
                  <th className="px-4 py-3 font-semibold">Habit Correlation</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((patient) => {
                  const latestSummary = patient.sessionSummaries && patient.sessionSummaries.length > 0 ? patient.sessionSummaries[0] : null;
                  const isCritical = latestSummary?.riskLevel === 'HIGH';
                  
                  return (
                    <tr key={patient.id} className="hover:bg-brand-light transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-dark">{patient.name}</div>
                        <div className="text-xs text-slate-400 font-mono">ID: {patient.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                        {latestSummary ? latestSummary.summary : 'No sessions yet.'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-orange-200 text-xs font-medium bg-orange-50 text-orange-700">Sleep/Mood (0.8r)</span>
                      </td>
                      <td className="px-4 py-3">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-200 text-xs font-medium bg-red-50 text-red-700"><TrendingDown size={12}/> Critical</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 text-xs font-medium bg-brand-light text-brand-gray">Stable</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/therapist/patient/${patient.id}`} className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-brand-red rounded transition-colors border border-transparent hover:border-indigo-200 hover:bg-indigo-50">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {patients.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-brand-gray text-sm">No patients found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Average Chart */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-wider text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} /> Active Alerts
            </h2>
            <p className="text-xs text-brand-gray mt-1">High risk chat sessions.</p>
          </div>
          
          <div className="flex-1 w-full overflow-y-auto space-y-3">
             {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-100 rounded-md">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-red-800">{alert.user?.name}</span>
                      <span className="text-[10px] text-red-500">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                   </div>
                   <p className="text-xs text-red-700 line-clamp-3">{alert.summary}</p>
                </div>
             )) : (
                <div className="text-sm text-slate-400 text-center py-10">No active alerts.</div>
             )}
          </div>
        </div>

      </div>

      {/* Clinical Vector Consultation Tool for Therapists */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-md border border-teal-200">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                Clinical Knowledge Consultation (18,047 Vector Chunks)
              </h2>
              <p className="text-xs text-brand-gray">
                Cross-reference evidence-based clinical protocols (CBT, DBT, Attachment, Dissociation, NICE Guidelines)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            pgvector HNSW Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="e.g. Dissociation treatment protocol, NICE Guideline antenatal depression, TIPP distress tolerance..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={vectorQuery}
              onChange={(e) => setVectorQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVectorSearch()}
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleVectorSearch}
              disabled={vectorSearching || !vectorQuery.trim()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
            >
              {vectorSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              Search Literature
            </button>
            <button
              onClick={handleClinicalConsult}
              disabled={vectorSearching || !vectorQuery.trim()}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              {vectorSearching ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Synthesize Guidance
            </button>
          </div>
        </div>

        {/* Synthesized Guidance */}
        {clinicalSynthesis && (
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <Sparkles size={14} className="text-teal-700" /> Clinical Recommendation
            </div>
            <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {clinicalSynthesis}
            </p>
          </div>
        )}

        {/* Matched Literature Results */}
        {vectorResults.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Relevant Textbook Excerpts:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {vectorResults.map((chunk, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-teal-950 truncate max-w-[75%]" title={chunk.bookTitle}>
                      📖 {chunk.bookTitle}
                    </span>
                    {chunk.similarity !== undefined && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                        {(chunk.similarity * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 line-clamp-4 italic text-[11px] leading-relaxed">
                    "{chunk.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
