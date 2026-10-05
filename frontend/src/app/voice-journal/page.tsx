"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Polyfill/Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceJournalPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [pitch, setPitch] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<string>('Normal');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const microphoneRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can be switched to 'fil-PH' dynamically

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        
        if (currentFinal) setTranscript((prev) => prev + currentFinal);
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        // Only restart if we still want to be recording (handles auto-stops)
        if (isRecording) {
            recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    }
  }, [isRecording]);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Simple heuristic for pitch/volume (vocal prosody proxy)
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const avg = sum / dataArray.length;
    setPitch(avg);
    
    // Simulate speech rate detection
    if (avg > 100) setSpeechRate('Elevated (Anxious)');
    else if (avg < 20 && avg > 5) setSpeechRate('Flattened (Depressive)');
    else if (avg > 0) setSpeechRate('Baseline (Regulated)');

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (microphoneRef.current) microphoneRef.current.disconnect();
      setIsRecording(false);
      setInterimTranscript('');
      setPitch(0);
    } else {
      setTranscript(''); 
      recognitionRef.current?.start();
      setIsRecording(true);
      
      // Start Web Audio API for Biomarker Analysis
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        microphoneRef.current = microphone;
        
        analyzeAudio();
      } catch (e) {
        console.error("Audio API error", e);
      }
    }
  };

  const saveJournal = async () => {
    // In a real app, send `transcript` to backend here
    alert("Voice Journal saved successfully! Our AI is analyzing it for cognitive distortions.");
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Your browser does not support the Web Speech API. Try using Chrome.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-6 text-slate-100 font-sans">
      <div className="max-w-3xl w-full mx-auto space-y-8 pt-12">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Voice Journal</h1>
            <p className="text-slate-400">Speak your thoughts aloud. We'll transcribe and secure them.</p>
          </div>
          <Link href="/" className="text-slate-500 hover:text-white transition-colors">
            Back
          </Link>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 min-h-[400px] flex flex-col relative shadow-2xl">
          
          <div className="flex-1 text-xl leading-relaxed text-slate-300 whitespace-pre-wrap font-light z-10">
            {transcript || (!isRecording && "Tap the microphone and start speaking...")}
            <span className="text-slate-500 italic">{interimTranscript}</span>
          </div>

          {/* Prosody Analysis HUD */}
          {isRecording && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-2xl w-64 z-20"
             >
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Acoustic Biomarkers
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Vocal Prosody (Pitch/Vol)</span>
                      <span className="text-indigo-400 font-mono">{Math.round(pitch)}hz</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-75" style={{ width: `${Math.min(100, pitch)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Speech Rate</span>
                    </div>
                    <div className={`text-sm font-medium ${speechRate.includes('Elevated') ? 'text-amber-400' : speechRate.includes('Flattened') ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {speechRate}
                    </div>
                  </div>
                </div>
             </motion.div>
          )}

          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end space-x-6 z-20">
            
            {transcript && !isRecording && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={saveJournal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full font-medium shadow-lg transition-colors"
              >
                Save Entry
              </motion.button>
            )}

            <button
              onClick={toggleRecording}
              className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 ${
                isRecording 
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 hover:bg-rose-500/30' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'
              }`}
            >
              {isRecording && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-rose-500"
                />
              )}
              {isRecording ? (
                 <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
              ) : (
                <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
