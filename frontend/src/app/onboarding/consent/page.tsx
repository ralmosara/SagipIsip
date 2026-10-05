"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, FileSignature, CheckCircle } from 'lucide-react';

export default function DPAConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConsentSubmit = async () => {
    if (!agreed) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // In a real implementation, we'd hit /auth/consent or similar
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agreedToTerms: true, consentDate: new Date() })
      });
      
      // Route to dashboard
      router.push('/');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <ShieldCheck size={64} className="mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-bold tracking-tight relative z-10">Data Privacy & Telehealth Consent</h1>
          <p className="text-indigo-100 mt-2 relative z-10">In compliance with DOH Guidelines and the Data Privacy Act of 2012 (R.A. 10173)</p>
        </div>

        <div className="p-8 space-y-6 text-slate-700 text-sm leading-relaxed max-h-[50vh] overflow-y-auto">
          <section>
            <h2 className="font-bold text-lg text-slate-900 mb-2">1. Collection of Sensitive Personal Information</h2>
            <p>By using SagipIsip, you consent to the collection and processing of your personal and sensitive health information, including mood logs, journal entries, voice recordings, and chat transcripts with the AI companion.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-slate-900 mb-2">2. Localized Processing & AI Supervision</h2>
            <p>Your chat data is processed by an AI (Isip) hosted securely on our local servers. No clinical data is sent to foreign third-party LLM providers. A licensed mental health professional may review aggregated risk alerts (e.g., suicide ideation) to provide emergency clinical supervision as required by the Philippine Mental Health Act.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-slate-900 mb-2">3. Right to Erasure</h2>
            <p>You have the absolute right to withdraw your consent at any time. You may request the permanent deletion of your account and all associated health records via the Settings panel.</p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-slate-900 mb-2">4. Emergency Protocols</h2>
            <p>SagipIsip is NOT a replacement for emergency medical services. In the event the system detects high-risk behavior, your data may be surfaced to crisis intervention teams in compliance with DOH protocols.</p>
          </section>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="mt-0.5">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            </div>
            <div className="select-none">
              <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">I have read and agree to the Consent Form</span>
              <span className="text-xs text-slate-500">This serves as my electronic signature acknowledging the terms.</span>
            </div>
          </label>

          <button 
            onClick={handleConsentSubmit}
            disabled={!agreed || loading}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              agreed 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <FileSignature size={20} /> I Provide My Informed Consent
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
