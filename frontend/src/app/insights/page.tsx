"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'correlations' | 'habits'>('correlations');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto pt-12 space-y-10">
        
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Biopsychosocial Insights</h1>
            <p className="text-slate-400">Discover how your daily habits influence your mood.</p>
          </div>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Return to Dashboard
          </Link>
        </header>

        <div className="flex space-x-4 border-b border-slate-700/50 pb-2">
          <button 
            onClick={() => setActiveTab('correlations')}
            className={`pb-2 px-2 text-lg font-medium transition-colors border-b-2 ${activeTab === 'correlations' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Mood Correlations
          </button>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`pb-2 px-2 text-lg font-medium transition-colors border-b-2 ${activeTab === 'habits' ? 'border-teal-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Daily Habits
          </button>
        </div>

        {activeTab === 'correlations' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Correlation Card 1 */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sleep & Mood</h3>
              <p className="text-slate-400 mb-6">Days with 8+ hours of sleep strongly correlate with a +1.5 boost in average mood.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">8+ Hours Sleep</span>
                  <span className="text-emerald-400 font-bold">Avg Mood: 4.2 / 5</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
                
                <div className="flex justify-between text-sm pt-4">
                  <span className="text-slate-300">&lt;6 Hours Sleep</span>
                  <span className="text-rose-400 font-bold">Avg Mood: 2.7 / 5</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '54%' }}></div>
                </div>
              </div>
            </div>

            {/* Correlation Card 2 */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Exercise Impact</h3>
              <p className="text-slate-400 mb-6">Logging physical activity reduces reports of "anxious thoughts" by 40% the following day.</p>
              
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-indigo-200 text-sm italic">
                  "AI Observation: You tend to feel significantly more grounded on days you take a 20-minute walk."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'habits' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Log Today's Habits</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-6 bg-slate-700/50 hover:bg-teal-600/30 rounded-2xl border border-slate-600 hover:border-teal-500 transition-all group">
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">💧</span>
                  <span className="text-slate-300 font-medium">Hydration</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-emerald-600/20 rounded-2xl border border-emerald-500 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10"></div>
                  <span className="text-3xl mb-3 z-10">🏃‍♂️</span>
                  <span className="text-emerald-300 font-medium z-10">Exercise</span>
                  <svg className="absolute bottom-2 right-2 w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-slate-700/50 hover:bg-indigo-600/30 rounded-2xl border border-slate-600 hover:border-indigo-500 transition-all group">
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🧘‍♀️</span>
                  <span className="text-slate-300 font-medium">Meditation</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-slate-700/50 hover:bg-rose-600/30 rounded-2xl border border-slate-600 hover:border-rose-500 transition-all group">
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🛏️</span>
                  <span className="text-slate-300 font-medium">Sleep (8h+)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
