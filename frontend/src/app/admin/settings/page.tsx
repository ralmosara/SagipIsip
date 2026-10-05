'use client';

import { Settings, Save, Server, ShieldCheck, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage core platform settings, LLM integration, and notifications.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* AI / LLM Config */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <Server className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">LLM Integration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ollama Host URL</label>
              <input type="text" defaultValue="http://127.0.0.1:11434" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Model Name</label>
              <input type="text" defaultValue="llama3" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-slate-700">System Persona Prompt Base</label>
            <textarea rows={3} defaultValue="You are Isip, an empathetic mental health companion..." className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Security & Privacy</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Enforce 2FA for Therapists</p>
              <p className="text-xs text-slate-500">Require two-factor authentication for all clinical staff.</p>
            </div>
            <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">Data Anonymization Mode</p>
              <p className="text-xs text-slate-500">Mask PII before logs hit the audit trail.</p>
            </div>
            <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
