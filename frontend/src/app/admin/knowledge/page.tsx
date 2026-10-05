'use client';

import { Database, Upload, RefreshCw, Search } from 'lucide-react';

export default function AdminKnowledgePage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Knowledge Base (RAG)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage AI context from clinical PDFs and EPUBs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-sync Vector DB
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ingested documents..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Base Active</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            22 books are currently indexed in the vector database. Upload new clinical literature to expand Isip's knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
