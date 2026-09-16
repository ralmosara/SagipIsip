"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Lock, Mail, User as UserIcon } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Save token and user info
      localStorage.setItem("token", data.access_token);
      
      // Decode JWT to get role
      try {
        const payloadStr = atob(data.access_token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        localStorage.setItem("userName", payload.name || "User");
        
        if (payload.role === 'ADMIN') {
          router.push("/admin");
        } else if (payload.role === 'THERAPIST') {
          router.push("/therapist");
        } else {
          router.push("/");
        }
      } catch (decodeErr) {
        // Fallback
        router.push("/");
      }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Pane - Branding/Context */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 text-white">
            <div className="bg-blue-600 p-2 rounded">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">SagipIsip Enterprise</span>
          </div>
          <div className="mt-24 max-w-lg">
            <h1 className="text-4xl font-semibold text-white tracking-tight leading-tight">
              Clinical Intelligence & <br />
              Patient Management.
            </h1>
            <p className="mt-6 text-lg text-slate-400">
              Secure, HIPAA-compliant infrastructure designed for modern mental health organizations and clinical professionals.
            </p>
          </div>
        </div>
        <div className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SagipIsip Systems. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          <div className="lg:hidden flex items-center gap-3 text-slate-900 mb-8">
            <div className="bg-blue-600 p-2 rounded">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SagipIsip</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {isLogin ? "Sign in to your account" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Enter your credentials to access the console." : "Register for clinical or administrative access."}
          </p>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Authenticating..." : (isLogin ? "Sign in" : "Create account")}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    {isLogin ? "New user?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isLogin ? "Request access" : "Sign in instead"}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
