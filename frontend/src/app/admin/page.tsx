"use client";

import React from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  FileBarChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const efficacyData = [
  { month: 'Jan', baseline: 2.8, postIntervention: 3.4 },
  { month: 'Feb', baseline: 2.7, postIntervention: 3.6 },
  { month: 'Mar', baseline: 2.9, postIntervention: 3.9 },
  { month: 'Apr', baseline: 2.8, postIntervention: 4.1 },
  { month: 'May', baseline: 2.6, postIntervention: 4.2 },
  { month: 'Jun', baseline: 2.7, postIntervention: 4.3 },
];

export default function AdminB2BDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded text-white">
              <Building2 size={20} />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight leading-none block">SagipIsip Enterprise</span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold block mt-0.5">B2B Clinical Telemetry</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Organization: <strong className="text-slate-900">Metropolitan Health Group</strong></span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Population Health Efficacy</h1>
            <p className="text-slate-500 text-sm mt-1">Aggregated, anonymized telemetry for ROI and clinical outcomes.</p>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <FileBarChart size={16} /> Export Insurance Report
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Patients</span>
              <Users size={16} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">1,248</div>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center"><TrendingUp size={12} className="mr-1"/> +12% this month</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Time-to-Stability</span>
              <Activity size={16} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">18 <span className="text-lg text-slate-500 font-medium">days</span></div>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center"><TrendingUp size={12} className="mr-1"/> 24% faster than baseline</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crisis Interventions</span>
              <ShieldCheck size={16} className="text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">42</div>
            <p className="text-xs text-slate-500 font-medium mt-2">Successfully routed to care</p>
          </div>

          <div className="bg-indigo-600 p-6 rounded-xl shadow-md text-white">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Clinical Efficacy (ROI)</span>
            </div>
            <div className="text-3xl font-bold">+48%</div>
            <p className="text-xs text-indigo-100 font-medium mt-2">Improvement in PHQ-9 scores</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Longitudinal Outcome Efficacy</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficacyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} domain={[1, 5]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.3} name="Baseline Mood" />
                  <Area type="monotone" dataKey="postIntervention" stroke="#4F46E5" fill="#818CF8" fillOpacity={0.3} name="Post-Intervention Mood" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Module Adherence Rates</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'CBT Restructuring', completion: 85 },
                  { name: 'DBT Mindfulness', completion: 72 },
                  { name: 'Voice Journal', completion: 94 },
                  { name: 'XR Safe Space', completion: 88 },
                ]} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} width={120} />
                  <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="completion" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
