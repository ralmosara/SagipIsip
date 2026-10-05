'use client';

import { Book, Plus, Search, Filter } from 'lucide-react';

export default function AdminWorkbooksPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Workbooks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage CBT and DBT therapeutic modules for patients.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search workbooks..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Book className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No workbooks found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Get started by creating a new clinical workbook module. You can add CBT, DBT, or Mindfulness exercises.
          </p>
        </div>
      </div>
    </div>
  );
}
