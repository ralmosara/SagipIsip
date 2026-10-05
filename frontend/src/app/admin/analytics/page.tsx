'use client';

import { Activity, Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Platform usage, mood trends, and AI interactions.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2">
          <Calendar className="mr-2 h-4 w-4" />
          Last 30 Days
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Users size={18} />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">2,451</div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
            <TrendingUp size={12} className="mr-1" /> +12% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Activity size={18} />
            <span className="text-sm font-medium">Avg Mood Score</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">3.8<span className="text-lg text-slate-400 font-normal">/5</span></div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
            <TrendingUp size={12} className="mr-1" /> +0.2 this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Modules Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">1,204</div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Across all active patients
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Crisis Alerts Triggered</span>
          </div>
          <div className="text-3xl font-bold text-rose-700">14</div>
          <p className="text-xs text-rose-600 font-medium mt-2">
            Requires immediate review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col items-center justify-center p-6 text-center">
           <Activity className="h-8 w-8 text-slate-300 mb-3" />
           <p className="text-sm font-semibold text-slate-600">Mood Trend Chart</p>
           <p className="text-xs text-slate-400 mt-1">Data visualization will render here.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col items-center justify-center p-6 text-center">
           <Users className="h-8 w-8 text-slate-300 mb-3" />
           <p className="text-sm font-semibold text-slate-600">AI Engagement Metrics</p>
           <p className="text-xs text-slate-400 mt-1">Chat volume and session length.</p>
        </div>
      </div>
    </div>
  );
}
