"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ShieldAlert, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // In a real app, call a secure deletion endpoint
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/delete-account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.clear();
      router.push('/auth');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="flex items-center gap-4 border-b border-slate-200 pb-6 mt-6">
          <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Settings size={28} className="text-indigo-600" /> Account Settings
          </h1>
        </header>

        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-500" /> Data Privacy & Right to Erasure
          </h2>
          
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-rose-900">
            <p className="font-bold mb-2">Warning: Permanent Action</p>
            <p className="text-sm opacity-80 mb-6">
              Under the Data Privacy Act of 2012, you have the right to request the deletion of your personal and health data. 
              Clicking this button will permanently delete your account, mood logs, journal entries, and chat history from our servers. 
              This action cannot be undone.
            </p>

            {!showConfirm ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} /> Request Data Deletion
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-rose-200 shadow-sm animate-in fade-in zoom-in duration-200">
                <p className="font-bold text-slate-900 mb-4">Are you absolutely sure?</p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleDeleteData}
                    disabled={loading}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded flex-1 transition-colors flex justify-center"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Yes, Delete My Data'}
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
