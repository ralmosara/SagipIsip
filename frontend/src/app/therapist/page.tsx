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
  BrainCircuit
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
      <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
        <Activity className="h-4 w-4 mr-2 animate-spin" /> Fetching patient telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clinical Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
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
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <Icon size={16} className={`text-${stat.color}-600`} />
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span className={`text-xs font-medium ${stat.color === 'red' && parseInt(stat.value) > 0 ? 'text-red-600' : 'text-slate-500'}`}>
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
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> Patient Watchlist
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
                <tr className="bg-white border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
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
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{patient.name}</div>
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
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 text-xs font-medium bg-slate-50 text-slate-700">Stable</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/therapist/patient/${patient.id}`} className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors border border-transparent hover:border-indigo-200 hover:bg-indigo-50">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {patients.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No patients found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Average Chart */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} /> Active Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-1">High risk chat sessions.</p>
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
    </div>
  );
}
