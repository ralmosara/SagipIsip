'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ShieldCheck,
  Menu,
  Book,
  Activity,
  Shield,
  Settings,
  Database,
  Search,
  Bell,
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';

const sidebarGroups = [
  {
    label: 'Clinical Overview',
    links: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/users', icon: Users, label: 'Patient Directory' },
    ]
  },
  {
    label: 'Medical Content',
    links: [
      { href: '/admin/workbooks', icon: Book, label: 'Clinical Workbooks' },
      { href: '/admin/knowledge', icon: Database, label: 'Research & RAG' },
    ]
  },
  {
    label: 'Quality Assurance',
    links: [
      { href: '/admin/analytics', icon: Activity, label: 'Efficacy Analytics' },
      { href: '/admin/audit', icon: Shield, label: 'Compliance & Audit' },
    ]
  },
  {
    label: 'System Operations',
    links: [
      { href: '/admin/settings', icon: Settings, label: 'Configuration' },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F6F8] text-[#041E42] font-sans selection:bg-[#00CCFF] selection:text-[#041E42]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#041E42]/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Pfizer-styled Clinical Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E2E8F0] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-[4px_0_24px_rgba(4,30,66,0.02)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-[72px] items-center px-6 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#001CD6] to-[#00CCFF] text-white mr-3 shadow-md">
            <Stethoscope size={18} strokeWidth={2} />
          </div>
          <span className="text-[1.1rem] font-bold tracking-tight text-[#041E42]">
            SagipIsip <span className="font-light">Clinical</span>
          </span>
        </div>

        <nav className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-[72px])] custom-scrollbar">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                        ${isActive 
                          ? 'bg-[#F0F4FA] text-[#001CD6] border-l-4 border-[#001CD6]' 
                          : 'text-[#475569] border-l-4 border-transparent hover:bg-[#F8FAFC] hover:text-[#041E42]'}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`mr-3 h-[18px] w-[18px] ${isActive ? 'text-[#001CD6]' : 'text-[#64748B]'}`} strokeWidth={isActive ? 2.5 : 2} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-6 mt-6 border-t border-[#E2E8F0]">
            <Link
              href="/"
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-[#475569] hover:bg-[#F8FAFC] hover:text-[#041E42] transition-colors border-l-4 border-transparent"
            >
              <LogOut className="mr-3 h-[18px] w-[18px] text-[#64748B]" strokeWidth={2} />
              End Session
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F6F8]">
        {/* Header App Bar */}
        <header className="h-[72px] flex items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E2E8F0] z-10 sticky top-0 shadow-[0_4px_24px_rgba(4,30,66,0.02)]">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 -ml-2 mr-3 rounded-md text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
            <div className="hidden md:flex items-center bg-[#F8FAFC] px-4 py-2 rounded-md w-[400px] border border-[#E2E8F0] focus-within:border-[#001CD6] focus-within:ring-1 focus-within:ring-[#001CD6] transition-all">
              <Search className="h-4 w-4 text-[#94A3B8] mr-3" />
              <input 
                type="text" 
                placeholder="Search patient IDs, protocols, or audit logs..." 
                className="bg-transparent border-none outline-none text-sm w-full text-[#041E42] placeholder-[#94A3B8]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-[#64748B] hover:text-[#001CD6] transition-colors">
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
            </button>
            <button className="text-[#64748B] hover:text-[#001CD6] transition-colors">
              <Settings className="h-5 w-5" strokeWidth={2} />
            </button>
            <button className="text-[#64748B] hover:text-[#001CD6] transition-colors relative mr-2">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#00CCFF] ring-2 ring-white"></span>
            </button>
            
            <div className="h-8 border-l border-[#E2E8F0] mx-1"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#041E42] leading-none">Dr. Admin</p>
                <p className="text-[11px] text-[#64748B] mt-1">System Administrator</p>
              </div>
              <div className="h-10 w-10 rounded bg-[#F0F4FA] text-[#001CD6] flex items-center justify-center text-sm font-bold border border-[#E2E8F0] shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
