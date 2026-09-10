import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Landmark,
  Users2,
  FileCheck2,
  Package,
  Truck,
  FileText,
  ShieldCheck,
  DollarSign,
  BarChart3,
  History,
  Settings,
  Search,
  Plus,
  Bell,
  Wifi,
  WifiOff,
  ChevronDown,
  UserCheck,
  HelpCircle,
  Menu,
  X,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { EnterpriseUser, EnterpriseRole } from '../../types/erp';
import { erpService } from '../../services/erpStorageService';
import GlobalSearchModal from './GlobalSearchModal';

interface ErpLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: EnterpriseUser;
  onUserChange: (user: EnterpriseUser) => void;
  users: EnterpriseUser[];
  onOpenCreateModal: (entityType: string) => void;
  children: React.ReactNode;
}

export default function ErpLayout({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  users,
  onOpenCreateModal,
  children,
}: ErpLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  const notifications = erpService.getNotifications();
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Monitor connectivity
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'programmes', label: 'Programmes', icon: Landmark, count: erpService.getPrograms().length },
    { id: 'communities', label: 'Communities', icon: Users2, count: erpService.getCommunities().length },
    { id: 'procurement', label: 'Procurement', icon: FileCheck2, badge: 'Smart' },
    { id: 'inventory', label: 'Inventory Master', icon: Package, count: erpService.getItems().length },
    { id: 'transfers', label: 'Transfers (STT)', icon: ArrowRightLeft, count: erpService.getTransfers().length },
    { id: 'waybills', label: 'Digital Waybills', icon: Truck, count: erpService.getWaybills().length },
    { id: 'receiving', label: 'Goods Receiving (GRN)', icon: Layers, count: erpService.getGRNs().length },
    { id: 'assets', label: 'Asset Register', icon: ShieldCheck, count: erpService.getAssets().length },
    { id: 'finance', label: 'Finance & 3-Way Match', icon: DollarSign, badge: 'Control' },
    { id: 'reports', label: 'Management Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'admin', label: 'Administration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>Offline Operations Mode: All transactions, stock counts, and scans are queued locally.</span>
          </div>
          <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {offlineQueueCount} queued items
          </span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-slate-950 font-black text-sm tracking-tighter">EMW</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base">Ease My Work</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                  Enterprise ERP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Renewable Infrastructure & Logistics</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <button
            id="global-search-trigger-btn"
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70 hover:border-slate-600 rounded-xl px-3.5 py-1.5 text-xs flex items-center justify-between transition group shadow-inner cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400 group-hover:scale-105 transition" />
              <span>Search PO#, Waybill#, Asset Tag, SKU, Site...</span>
            </div>
            <kbd className="hidden sm:inline-block bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PRIMARY ACTION: + CREATE NEW DROPDOWN */}
          <div className="relative">
            <button
              id="primary-create-new-btn"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create New</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {isCreateMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsCreateMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Quick Create Actions
                </div>
                <button
                  onClick={() => onOpenCreateModal('requisition')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Requisition (PR)</span>
                  <span className="text-[10px] text-slate-500">Procurement</span>
                </button>
                <button
                  onClick={() => onOpenCreateModal('transfer')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Transfer Order (STT)</span>
                  <span className="text-[10px] text-slate-500">Logistics</span>
                </button>
                <button
                  onClick={() => onOpenCreateModal('waybill')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Digital Waybill</span>
                  <span className="text-[10px] text-slate-500">Dispatch</span>
                </button>
                <button
                  onClick={() => onOpenCreateModal('grn')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Goods Receipt (GRN)</span>
                  <span className="text-[10px] text-slate-500">Warehouse</span>
                </button>
                <button
                  onClick={() => onOpenCreateModal('asset')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Serialized Asset</span>
                  <span className="text-[10px] text-slate-500">Solar Registry</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={() => onOpenCreateModal('program')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Programme</span>
                  <span className="text-[10px] text-slate-500">Capex</span>
                </button>
                <button
                  onClick={() => onOpenCreateModal('community')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                >
                  <span>New Community Site</span>
                  <span className="text-[10px] text-slate-500">Deployment</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition relative cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white font-mono text-[9px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">System Alerts & Workflow Tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{unreadNotifications.length} Unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2 space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        erpService.markNotificationRead(notif.id);
                        if (notif.linkTab) setActiveTab(notif.linkTab);
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition ${
                        notif.read ? 'opacity-60 hover:bg-slate-800/40' : 'bg-slate-800/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            notif.severity === 'Critical'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : notif.severity === 'Warning'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {notif.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RBAC ROLE TESTING SWITCHER */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1.5 rounded-xl">
            <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <p className="text-[9px] font-mono text-slate-400 leading-none">Testing Role</p>
              <select
                id="role-impersonator-select"
                value={currentUser.id}
                onChange={(e) => {
                  const found = users.find((u) => u.id === e.target.value);
                  if (found) onUserChange(found);
                }}
                className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900/60 border-r border-slate-800/80 p-3 select-none">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
            Navigation Menu
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition ${
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer: Connectivity & Node Status */}
          <div className="pt-3 mt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'Live Firestore Synced' : 'Local Queue Active'}</span>
            </div>
            <span className="font-mono text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v2.8</span>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT MENU */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white text-sm">ERP Modules</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto mt-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
}
