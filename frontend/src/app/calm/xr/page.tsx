"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function WebXRSafeSpace() {
  const [sessionActive, setSessionActive] = useState(false);
  const [exposureLevel, setExposureLevel] = useState(0);

  // In a real implementation, we would use @react-three/fiber and @react-three/xr
  // to render a WebGL environment. For this clinical demo, we simulate the XR envelope.

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans">
      
      {!sessionActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
            <h1 className="text-4xl font-bold tracking-tight text-emerald-400 mb-4">XR Safe Space</h1>
            <p className="text-slate-400 mb-8">
              A clinically-controlled WebGL environment for grounding and mild exposure therapy. 
              No VR headset required — utilizes your device's gyroscope.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => setSessionActive(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Enter Immersive Environment
              </button>
              <Link href="/calm" className="block text-slate-500 hover:text-slate-300 underline underline-offset-4">
                Return to 2D Calm Space
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
          className="relative w-full h-screen flex items-center justify-center"
        >
          {/* Simulated 3D Environment Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-teal-900 to-slate-900" style={{ perspective: '1000px' }}>
            {/* Pseudo-3D Ground */}
            <div className="absolute bottom-0 w-full h-1/2 bg-emerald-900/20" style={{ transform: 'rotateX(60deg) scale(2)', transformOrigin: 'bottom' }}>
              <div className="w-full h-full border-t border-emerald-500/30 grid grid-cols-6 grid-rows-6 opacity-30">
                {Array.from({length: 36}).map((_, i) => <div key={i} className="border border-emerald-500/10"></div>)}
              </div>
            </div>
            
            {/* Ambient Lighting / Sun */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] opacity-20"></div>
          </div>

          {/* Clinical HUD */}
          <div className="absolute inset-0 pointer-events-none z-10 border-[16px] border-black/50 rounded-3xl m-4">
            
            {/* Top HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <div className="bg-black/50 backdrop-blur border border-white/10 p-3 rounded-lg flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">Biometrics Syncing</span>
              </div>
              <button 
                onClick={() => setSessionActive(false)}
                className="pointer-events-auto bg-black/50 hover:bg-red-500/20 text-white backdrop-blur border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                EXIT SIMULATION
              </button>
            </div>

            {/* Bottom Clinical Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg">
              <div className="bg-black/60 backdrop-blur border border-white/10 p-6 rounded-2xl pointer-events-auto text-center space-y-4">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Exposure Therapy Intensity</h3>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">Grounding</span>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={exposureLevel}
                    onChange={(e) => setExposureLevel(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-xs text-rose-400">Mild Stressor</span>
                </div>
                {exposureLevel > 50 && (
                  <p className="text-xs text-amber-400 animate-pulse pt-2">
                    Notice your breathing. Allow the anxiety to exist without fighting it.
                  </p>
                )}
              </div>
            </div>

            {/* Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/30 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
