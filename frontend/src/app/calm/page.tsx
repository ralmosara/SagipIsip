"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CalmSpacePage() {
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'grounding'>('intro');
  const [breathCycle, setBreathCycle] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    if (phase === 'breathing') {
      const interval = setInterval(() => {
        setBreathCycle((prev) => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          return 'inhale';
        });
      }, 4000); // 4-second cycle
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100 transition-colors duration-1000">
      
      {phase === 'intro' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center space-y-8"
        >
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-indigo-300">
            Calm Space
          </h1>
          <p className="text-slate-400 text-lg">
            A quiet place to center yourself when things feel overwhelming.
          </p>
          
          <div className="flex flex-col space-y-4 pt-8">
            <button 
              onClick={() => setPhase('breathing')}
              className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 rounded-xl px-6 py-4 text-lg font-medium transition-all"
            >
              Box Breathing
            </button>
            <button 
              onClick={() => setPhase('grounding')}
              className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-200 border border-teal-500/30 rounded-xl px-6 py-4 text-lg font-medium transition-all"
            >
              5-4-3-2-1 Grounding
            </button>
            
            <Link href="/" className="text-slate-500 hover:text-slate-300 pt-4 underline underline-offset-4">
              Return Home
            </Link>
          </div>
        </motion.div>
      )}

      {phase === 'breathing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-12"
        >
          <h2 className="text-2xl text-indigo-300 font-medium">
            {breathCycle === 'inhale' && 'Breathe In...'}
            {breathCycle === 'hold' && 'Hold...'}
            {breathCycle === 'exhale' && 'Breathe Out...'}
          </h2>
          
          <motion.div
            animate={{
              scale: breathCycle === 'inhale' ? 1.5 : breathCycle === 'exhale' ? 1 : 1.5,
              opacity: breathCycle === 'hold' ? 0.8 : 1
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500/40 to-teal-500/40 blur-xl flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-full border border-indigo-400/30 mix-blend-overlay"></div>
          </motion.div>

          <button 
            onClick={() => setPhase('intro')}
            className="mt-12 text-slate-500 hover:text-slate-300 underline underline-offset-4"
          >
            End Exercise
          </button>
        </motion.div>
      )}

      {phase === 'grounding' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg w-full space-y-8"
        >
          <h2 className="text-2xl text-teal-300 font-medium text-center mb-8">5-4-3-2-1 Technique</h2>
          
          <div className="space-y-6 text-lg text-slate-300">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="font-bold text-teal-400 text-xl mr-3">5</span> Things you can <strong>see</strong> around you.
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="font-bold text-teal-400 text-xl mr-3">4</span> Things you can <strong>feel</strong> (your feet on the ground, clothes on your skin).
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="font-bold text-teal-400 text-xl mr-3">3</span> Things you can <strong>hear</strong> right now.
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="font-bold text-teal-400 text-xl mr-3">2</span> Things you can <strong>smell</strong>.
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="font-bold text-teal-400 text-xl mr-3">1</span> Thing you can <strong>taste</strong>.
            </div>
          </div>

          <div className="text-center pt-8">
            <button 
              onClick={() => setPhase('intro')}
              className="text-slate-500 hover:text-slate-300 underline underline-offset-4"
            >
              End Exercise
            </button>
          </div>
        </motion.div>
      )}
      
    </div>
  );
}
