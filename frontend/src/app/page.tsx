'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartPulse, 
  MessageSquare, 
  BookOpen, 
  LogOut,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  ArrowRight,
  Menu,
  Activity,
  Microscope,
  Stethoscope,
  Mic,
  Wind,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import Link from 'next/link';

interface MoodTrend {
  sevenDayAverage: number | null;
  thirtyDayAverage: number | null;
  weeklyData: { date: string; average: number; count: number }[];
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  anomalyDetected: boolean;
  anomalyDescription: string | null;
  recentLogs: { mood: number; notes: string | null; createdAt: string }[];
}

interface Achievement {
  id: string;
  earnedAt: string;
  achievement: { title: string; icon: string; description: string };
}

interface WorkbookEntry {
  id: string;
  title: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const moodLabels: Record<number, string> = {
  1: 'Critical/Very Low', 2: 'Low/Distressed', 3: 'Stable/Neutral', 4: 'Good/Elevated', 5: 'Optimal/Very High',
};

function generateAiInsight(trend: MoodTrend): string {
  if (!trend.sevenDayAverage) {
    return 'Initiate patient telemetry by logging an initial mood assessment. Continuous data collection is required for accurate clinical insights.';
  }

  if (trend.anomalyDetected && trend.anomalyDescription) {
    return 'CLINICAL ALERT: ' + trend.anomalyDescription + ' Please utilize support channels immediately.';
  }

  const avg = trend.sevenDayAverage;
  const trendDir = trend.trend;

  if (trendDir === 'improving') {
    return `Therapeutic efficacy indicated. 7-day trailing average (${avg}/5) shows positive trajectory. Continue adherence to current behavioral protocols.`;
  }
  if (trendDir === 'declining') {
    if (avg <= 2) {
      return `Elevated distress indicated (Avg: ${avg}/5). Recommend immediate review of Distress Tolerance modules. Contact a clinical professional if symptoms persist or escalate.`;
    }
    return `Slight downward trajectory noted (Avg: ${avg}/5). Recommend engaging with Cognitive Restructuring interventions to mitigate potential further decline.`;
  }
  if (trendDir === 'stable' && avg >= 4) {
    return `Optimal stability maintained (Avg: ${avg}/5). Current behavioral regimens appear highly effective. Recommend maintenance protocols.`;
  }
  if (trendDir === 'stable') {
    return `Baseline stability observed (Avg: ${avg}/5). Recommend implementation of Mindfulness modules to increase psychological resilience and buffer against future stressors.`;
  }
  return `Consistent longitudinal data is required for precise analytical insights. Please maintain daily logging cadence.`;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Patient');
  const [isClient, setIsClient] = useState(false);
  const [moodTrend, setMoodTrend] = useState<MoodTrend | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentWorkbooks, setRecentWorkbooks] = useState<WorkbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/moods/trend`, { headers }).then((r) => r.json()).catch(() => null),
      fetch(`${API_URL}/workbooks`, { headers }).then((r) => r.json()).catch(() => []),
    ]).then(([trendData, workbookData]) => {
      if (trendData && !trendData.statusCode) setMoodTrend(trendData);
      if (Array.isArray(workbookData)) setRecentWorkbooks(workbookData.slice(0, 3));
      setIsLoading(false);
    });
  }, [router]);

  if (!isClient) return null;

  const chartData = moodTrend?.weeklyData?.filter((d) => d.count > 0).map((d) => ({
    day: d.date.split(',')[0],
    mood: d.average,
  })) ?? [];

  const aiInsight = moodTrend ? generateAiInsight(moodTrend) : null;

  const trendIcon = moodTrend?.trend === 'improving'
    ? <TrendingUp size={16} className="text-[#009384]" />
    : moodTrend?.trend === 'declining'
    ? <TrendingDown size={16} className="text-[#D32F2F]" />
    : <Minus size={16} className="text-[#64748B]" />;

  const trendColor = moodTrend?.trend === 'improving'
    ? 'text-[#009384] bg-[#E0F2F1] border-[#B2DFDB]'
    : moodTrend?.trend === 'declining'
    ? 'text-[#D32F2F] bg-[#FFEBEE] border-[#FFCDD2]'
    : 'text-[#475569] bg-[#F1F5F9] border-[#E2E8F0]';

  const trendLabel = moodTrend?.trend === 'improving' ? 'Positive Trajectory'
    : moodTrend?.trend === 'declining' ? 'Intervention Recommended'
    : moodTrend?.trend === 'stable' ? 'Stable Baseline'
    : 'Data Collection Phase';

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-[#041E42] selection:bg-[#00CCFF] selection:text-[#041E42]">
      {/* Clinical Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-[0_2px_10px_rgba(4,30,66,0.03)]">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 rounded-md text-[#64748B] hover:bg-[#F1F5F9] transition-colors md:hidden">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-pfizer-gradient p-2 rounded text-white shadow-md">
                <Stethoscope size={24} strokeWidth={2} />
              </div>
              <div className="hidden sm:block">
                <span className="text-[1.25rem] font-bold tracking-tight text-[#041E42] leading-none block">
                  SagipIsip
                </span>
                <span className="text-[0.65rem] uppercase tracking-widest text-[#001CD6] font-bold block mt-0.5">
                  Patient Portal
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[13px] font-bold text-[#041E42] leading-none">Patient ID: {userName}</span>
              <span className="text-[11px] text-[#64748B] mt-1">Authenticated Session</span>
            </div>
            <div className="h-10 w-10 rounded border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#001CD6] text-sm font-bold shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 pb-20">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in duration-700">
          <div>
            <h1 className="text-[2rem] font-bold text-[#041E42] tracking-tight mb-2">Clinical Dashboard</h1>
            <p className="text-[15px] text-[#475569]">Comprehensive overview of behavioral and emotional telemetry.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded border text-[13px] font-bold uppercase tracking-wider ${trendColor}`}>
              {trendIcon} {trendLabel}
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#041E42] px-4 py-2 rounded text-[13px] font-bold uppercase tracking-wider shadow-sm">
              <span className="text-[#001CD6]">{moodTrend?.recentLogs?.length ?? 0}</span> Data Points
            </div>
          </div>
        </div>

        {/* Clinical Anomaly Alert */}
        {moodTrend?.anomalyDetected && (
          <div className="mb-10 bg-white border-l-4 border-l-[#D32F2F] border-y border-r border-[#E2E8F0] rounded-r p-6 flex items-start gap-4 shadow-[0_4px_12px_rgba(211,47,47,0.05)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AlertCircle size={24} className="text-[#D32F2F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#D32F2F] uppercase tracking-wide">Clinical Alert: Intervention Recommended</h3>
              <p className="text-[15px] text-[#475569] mt-2 mb-4 leading-relaxed">{moodTrend.anomalyDescription}</p>
              <Link href="/chat" className="inline-flex items-center text-[13px] font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] px-5 py-2.5 rounded transition-colors shadow-sm">
                Initiate AI Assessment <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Clinical Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* AI Assessment Card */}
          <Link href="/chat" className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#001CD6] hover:shadow-[0_8px_30px_rgba(0,28,214,0.08)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#001CD6] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#F0F4FA] flex items-center justify-center text-[#001CD6]">
                <MessageSquare size={28} strokeWidth={1.5} />
              </div>
              <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#001CD6] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">AI Diagnostic Interface</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed">
              Engage with the clinical AI agent for therapeutic dialogue based on CBT & DBT modalities.
            </p>
          </Link>

          {/* Workbooks Card */}
          <Link href="/workbooks" className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#00CCFF] hover:shadow-[0_8px_30px_rgba(0,204,255,0.08)] transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#00CCFF] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#E0F7FA] flex items-center justify-center text-[#00B8D4]">
                <BookOpen size={28} strokeWidth={1.5} />
              </div>
               <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#00B8D4] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">Clinical Protocols</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed mb-6">
              Access structured behavioral modules including Cognitive Restructuring and Behavioral Activation.
            </p>
            {recentWorkbooks.length > 0 && (
              <div className="mt-auto border-t border-[#E2E8F0] pt-4">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">Active Protocol</span>
                <span className="text-[13px] font-bold text-[#041E42] truncate block">
                  {recentWorkbooks[0]?.title}
                </span>
              </div>
            )}
          </Link>

          {/* Telemetry Card */}
          <div className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#009384] hover:shadow-[0_8px_30px_rgba(0,147,132,0.08)] transition-all duration-300 relative overflow-hidden cursor-pointer" onClick={() => router.push('/chat')}>
             <div className="absolute top-0 left-0 w-full h-1 bg-[#009384] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#E0F2F1] flex items-center justify-center text-[#009384]">
                <Activity size={28} strokeWidth={1.5} />
              </div>
               <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#009384] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">Telemetry & Logs</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed mb-6">
              {moodTrend?.sevenDayAverage
                ? `7-Day Moving Avg: ${moodTrend.sevenDayAverage}/5. Input daily biometrics to ensure accurate analytical models.`
                : 'Input daily behavioral data to establish baseline telemetry for predictive modeling.'}
            </p>
            <div className="mt-auto">
              <span className="inline-flex items-center justify-center text-[13px] font-bold text-white bg-[#041E42] hover:bg-[#001CD6] px-5 py-2.5 rounded transition-colors w-full uppercase tracking-wide">
                Log New Data Point
              </span>
            </div>
          </div>
          
          {/* Voice Journal Card */}
          <Link href="/voice-journal" className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#9C27B0] hover:shadow-[0_8px_30px_rgba(156,39,176,0.08)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#9C27B0] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#F3E5F5] flex items-center justify-center text-[#9C27B0]">
                <Mic size={28} strokeWidth={1.5} />
              </div>
              <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#9C27B0] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">Voice Journal</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed mb-6">
              Express your thoughts naturally through speech with AI cognitive analysis.
            </p>
          </Link>

          {/* Calm Space Card */}
          <Link href="/calm" className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#3F51B5] hover:shadow-[0_8px_30px_rgba(63,81,181,0.08)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3F51B5] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#E8EAF6] flex items-center justify-center text-[#3F51B5]">
                <Wind size={28} strokeWidth={1.5} />
              </div>
              <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#3F51B5] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">Calm Space</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed mb-6">
              Immediate access to grounding exercises and distress tolerance techniques.
            </p>
          </Link>

          {/* Insights Card */}
          <Link href="/insights" className="group flex flex-col h-full bg-white rounded border border-[#E2E8F0] p-8 hover:border-[#FF9800] hover:shadow-[0_8px_30px_rgba(255,152,0,0.08)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF9800] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded bg-[#FFF3E0] flex items-center justify-center text-[#FF9800]">
                <LineChartIcon size={28} strokeWidth={1.5} />
              </div>
              <ArrowRight size={20} className="text-[#CBD5E1] group-hover:text-[#FF9800] transition-colors transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-[#041E42] mb-3">Biopsychosocial Insights</h3>
            <p className="text-[#64748B] text-[15px] flex-1 leading-relaxed mb-6">
              Discover correlations between your daily habits and longitudinal mood trends.
            </p>
          </Link>
        </div>

        {/* Analytics & Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          
          {/* Scientific Chart Card */}
          <div className="lg:col-span-2 bg-white rounded border border-[#E2E8F0] p-8 shadow-[0_2px_12px_rgba(4,30,66,0.03)] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-bold text-[#041E42] uppercase tracking-wide flex items-center gap-2">
                  <Activity size={18} className="text-[#001CD6]" /> Longitudinal Efficacy
                </h2>
                <p className="text-[13px] text-[#64748B] mt-1 font-medium">Self-reported mood index (trailing 7 days)</p>
              </div>
              {moodTrend?.thirtyDayAverage && (
                <div className="border border-[#CBD5E1] px-4 py-2 rounded text-[12px] font-bold text-[#041E42] bg-[#F8FAFC]">
                  30D Baseline: {moodTrend.thirtyDayAverage}/5
                </div>
              )}
            </div>
            
            <div className="h-[320px] w-full flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#001CD6] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} domain={[1, 5]} ticks={[1,2,3,4,5]} />
                    {moodTrend?.sevenDayAverage && (
                      <ReferenceLine y={moodTrend.sevenDayAverage} stroke="#00CCFF" strokeDasharray="3 3" strokeOpacity={0.8} />
                    )}
                    <Tooltip 
                      contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#041E42', boxShadow: '0 4px 20px rgba(4,30,66,0.1)', fontSize: '13px', padding: '12px 16px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#001CD6' }}
                      formatter={(value: any) => [`${value}/5 — ${moodLabels[Math.round(value)] ?? ''}`, 'Index']}
                      labelStyle={{ color: '#64748B', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#001CD6" 
                      strokeWidth={2.5} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#001CD6' }}
                      activeDot={{ r: 6, fill: '#001CD6', stroke: '#00CCFF', strokeWidth: 4 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#64748B] border-2 border-dashed border-[#E2E8F0] rounded bg-[#F8FAFC]">
                  <Microscope size={32} className="text-[#CBD5E1] mb-4" />
                  <p className="font-bold text-[14px] text-[#041E42]">Insufficient Data</p>
                  <p className="text-[13px] mt-1 text-center max-w-xs">Data collection required to generate longitudinal efficacy reports.</p>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Insight & Activity Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#041E42] rounded p-8 border border-[#041E42] shadow-[0_4px_24px_rgba(4,30,66,0.15)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10">
                <Microscope size={140} className="text-[#00CCFF]" />
              </div>
              <h3 className="text-[15px] font-bold text-[#00CCFF] uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                <Sparkles size={16} /> Synthesis Report
              </h3>
              <p className="text-[15px] text-white leading-relaxed relative z-10 font-medium">
                {aiInsight ?? 'Processing behavioral metrics...'}
              </p>
            </div>

            {/* Quick Stats / Recent Activity */}
            <div className="bg-white rounded border border-[#E2E8F0] p-8 shadow-[0_2px_12px_rgba(4,30,66,0.03)] flex-1">
              <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-6">Recent Protocol Activity</h3>
              
              {recentWorkbooks.length > 0 ? (
                <div className="space-y-5">
                  {recentWorkbooks.map((wb, i) => (
                    <div key={wb.id} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/workbooks/${wb.id}`)}>
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-[#001CD6] group-hover:scale-150 group-hover:bg-[#00CCFF] transition-all"></div>
                      <div>
                        <p className="text-[14px] font-bold text-[#041E42] leading-snug group-hover:text-[#001CD6] transition-colors">{wb.title}</p>
                        <p className="text-[12px] text-[#64748B] mt-1 font-medium">{new Date(wb.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[#64748B]">No protocols initiated.</p>
              )}

              {moodTrend && (
                <div className="mt-8 pt-6 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[2.25rem] font-bold text-[#041E42] leading-none mb-1">{moodTrend.sevenDayAverage ?? '—'}</p>
                    <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">7D Moving Avg</p>
                  </div>
                  <div>
                    <p className="text-[2.25rem] font-bold text-[#001CD6] leading-none mb-1">{moodTrend.recentLogs?.length ?? 0}</p>
                    <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Data Points</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
