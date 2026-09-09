import React from 'react';
import { User, UserRole } from '../types';
import { Sun, ShieldAlert, FileText, Landmark, Users2, LayoutDashboard, History, PiggyBank, HelpCircle, Warehouse, Truck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  users: User[];
  onRestartOnboarding?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  users,
  onRestartOnboarding,
}: HeaderProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logistics', label: 'Nationwide Logistics (STT)', icon: Truck },
    { id: 'solar-panels', label: 'Solar Panels CMS', icon: Sun },
    { id: 'programmes', label: 'Programmes', icon: Landmark },
    { id: 'communities', label: 'Communities', icon: Users2 },
    { id: 'projects', label: 'Solar Projects', icon: Sun },
    { id: 'store', label: 'General Warehouse', icon: Warehouse },
    { id: 'expenses', label: 'Expenses', icon: PiggyBank },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 print:bg-transparent print:border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-emerald-500 text-slate-900 p-2 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Sun className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">EaseMe</h1>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-none">Internal Cost Portal</p>
            </div>
          </div>

          {/* Role Impersonation & User Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-mono text-white/40 font-medium leading-none">Testing Role</p>
                <select
                  id="user-impersonator"
                  value={currentUser.email}
                  onChange={(e) => {
                    const found = users.find((u) => u.email === e.target.value);
                    if (found) onUserChange(found);
                  }}
                  className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4"
                >
                  {users.map((u) => (
                    <option key={u.email} value={u.email} className="bg-slate-900 text-white">
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Pill */}
            <div className="hidden md:flex items-center gap-2 pl-2">
              {onRestartOnboarding && (
                <button
                  onClick={onRestartOnboarding}
                  className="mr-1 flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer"
                  title="Restart onboarding registration & system navigation tutorial"
                >
                  <HelpCircle className="h-3.5 w-3.5 animate-pulse" />
                  System Tour
                </button>
              )}
              <div className="h-8 w-8 bg-white/10 text-white border border-white/15 rounded-full flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-none">{currentUser.name}</p>
                <p className="text-[10px] font-mono text-white/50 leading-normal">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-white/5 mt-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
