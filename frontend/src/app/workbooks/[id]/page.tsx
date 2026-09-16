"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

interface WorkbookData {
  id: string;
  title: string;
  createdAt: string;
  content: string; // JSON string
}

export default function WorkbookDetails({ params }: { params: Promise<{ id: string }> }) {
  const [entry, setEntry] = useState<WorkbookData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Use `use()` to unwrap the params promise in Next.js 15+
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchEntry = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workbooks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setEntry(data);
        } else {
          router.push("/workbooks");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!entry) return null;

  let parsedContent;
  try {
    parsedContent = JSON.parse(entry.content);
  } catch (e) {
    parsedContent = { text: entry.content };
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
          </button>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center text-teal-600 mb-4">
            <BookOpen size={24} className="mr-3" />
            <h1 className="text-2xl font-bold text-slate-800">{entry.title}</h1>
          </div>
          <div className="flex items-center text-sm font-medium text-slate-400">
            <Clock size={16} className="mr-1.5" />
            {new Date(entry.createdAt).toLocaleString()}
          </div>
        </div>

        {parsedContent.situation ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">1. The Situation</h2>
              <p className="text-slate-800 whitespace-pre-wrap">{parsedContent.situation}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">2. Emotions</h2>
              <p className="text-slate-800 whitespace-pre-wrap">{parsedContent.emotions}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-orange-400">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">3. Automatic Thoughts</h2>
              <p className="text-slate-800 whitespace-pre-wrap italic">"{parsedContent.thoughts}"</p>
            </div>

            <div className="bg-teal-50 p-6 rounded-2xl shadow-sm border border-teal-100 border-l-4 border-l-teal-500">
              <h2 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-3">4. Alternative Perspective</h2>
              <p className="text-slate-800 whitespace-pre-wrap">{parsedContent.alternative}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-slate-800 whitespace-pre-wrap">
            {entry.content}
          </div>
        )}
      </main>
    </div>
  );
}
