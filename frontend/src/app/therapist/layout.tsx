'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  Stethoscope,
  Menu,
  Bell
} from 'lucide-react';
import { useState } from 'react';

const sidebarLinks = [
  { href: '/therapist', icon: Activity, label: 'Dashboard' },
  { href: '/therapist/patients', icon: Users, label: 'My Patients' },
  { href: '/therapist/alerts', icon: Bell, label: 'Critical Alerts' },
  { href: '/therapist/settings', icon: Settings, label: 'Settings' },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Strict Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-14 items-center px-4 border-b border-slate-800">
          <div className="bg-indigo-600 p-1.5 rounded mr-3 text-white">
            <Stethoscope size={16} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white uppercase">
            Provider Portal
          </span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-3.5rem)] flex flex-col">
          <div className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === '/therapist' ? pathname === '/therapist' : pathname.startsWith(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 z-10 sticky top-0">
          <button 
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer">
                <Bell className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="h-5 w-px bg-slate-200 mx-1"></div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Dr. Sarah Smith</p>
                <p className="text-xs text-slate-500">Clinical Therapist</p>
              </div>
              <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                SS
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
