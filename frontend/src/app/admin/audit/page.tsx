'use client';

import { Shield, Search, Download, Filter } from 'lucide-react';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit & Compliance</h1>
          <p className="text-sm text-slate-500 mt-1">HIPAA-compliant system access and activity logs.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 py-2">
          <Download className="mr-2 h-4 w-4" />
          Export Logs (CSV)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by User ID, Action, or Resource..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2">
            <Filter className="mr-2 h-4 w-4" />
            Filter Level
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
                <th className="px-6 py-3 font-semibold">Actor</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Resource</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">2026-09-24 09:12 AM</td>
                <td className="px-6 py-4 font-medium text-slate-900">Admin (sys_01)</td>
                <td className="px-6 py-4 text-slate-600">TRIGGER_INGESTION</td>
                <td className="px-6 py-4 text-slate-500">VectorDB</td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Success</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">2026-09-24 08:45 AM</td>
                <td className="px-6 py-4 font-medium text-slate-900">System (Isip)</td>
                <td className="px-6 py-4 text-rose-600 font-medium">CRISIS_ALERT</td>
                <td className="px-6 py-4 text-slate-500">User (usr_892)</td>
                <td className="px-6 py-4"><span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Triggered</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">2026-09-23 14:30 PM</td>
                <td className="px-6 py-4 font-medium text-slate-900">Dr. Jane Doe</td>
                <td className="px-6 py-4 text-slate-600">VIEW_PATIENT_RECORD</td>
                <td className="px-6 py-4 text-slate-500">User (usr_104)</td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
