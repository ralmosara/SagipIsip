"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Brain, Lightbulb } from "lucide-react";

export default function NewWorkbook() {
  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [alternative, setAlternative] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const content = JSON.stringify({
      situation,
      thoughts,
      emotions,
      alternative,
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workbooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: title || "Cognitive Restructuring Exercise",
          content,
        }),
      });
      
      if (res.ok) {
        router.push("/workbooks");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Cancel
          </button>
          <div className="text-lg font-bold text-slate-800 flex items-center">
            <Brain className="mr-2 text-teal-600" /> CBT Exercise
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Cognitive Restructuring</h1>
            <p className="text-teal-50 opacity-90">
              This exercise helps you identify and challenge negative or irrational thoughts.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Exercise Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Anxiety before presentation"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="flex items-center text-md font-bold text-slate-800 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs mr-3">1</span>
                  The Situation
                </label>
                <p className="text-sm text-slate-500 mb-3">What happened? Who were you with? Where were you?</p>
                <textarea
                  required
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none"
                  placeholder="I was in a meeting and..."
                />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="flex items-center text-md font-bold text-slate-800 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs mr-3">2</span>
                  Emotions & Feelings
                </label>
                <p className="text-sm text-slate-500 mb-3">How did you feel? (e.g., Anxious, Sad, Angry)</p>
                <input
                  required
                  type="text"
                  value={emotions}
                  onChange={(e) => setEmotions(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                  placeholder="I felt really anxious and overwhelmed."
                />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="flex items-center text-md font-bold text-slate-800 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs mr-3">3</span>
                  Automatic Thoughts
                </label>
                <p className="text-sm text-slate-500 mb-3">What went through your mind? What were you telling yourself?</p>
                <textarea
                  required
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none"
                  placeholder="They must think I'm incompetent..."
                />
              </div>

              <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 relative overflow-hidden">
                <Lightbulb size={120} className="absolute -bottom-6 -right-6 text-teal-500/10" />
                <label className="flex items-center text-md font-bold text-teal-900 mb-3 relative z-10">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs mr-3">4</span>
                  Alternative Perspective
                </label>
                <p className="text-sm text-teal-800 mb-3 relative z-10">Is there another way to look at this? What is a more balanced thought?</p>
                <textarea
                  required
                  value={alternative}
                  onChange={(e) => setAlternative(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none relative z-10 bg-white"
                  placeholder="Maybe they were just focused on the problem, not judging me personally..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 font-semibold"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                ) : (
                  <CheckCircle size={20} className="mr-3 text-teal-400" />
                )}
                Save Exercise
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
