import React, { useState } from 'react';
import { Settings, Building2, Users, Shield, Database, Plus, CheckCircle, MapPin } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, EnterpriseStore } from '../../types/erp';

interface ErpAdminProps {
  currentUser: EnterpriseUser;
  onSwitchUser: (user: EnterpriseUser) => void;
  onOpenCreateStore: () => void;
}

export default function ErpAdmin({ currentUser, onSwitchUser, onOpenCreateStore }: ErpAdminProps) {
  const [activeTab, setActiveTab] = useState<'stores' | 'users' | 'system'>('stores');
  const stores = erpService.getStores();
  const users = erpService.getUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">System Administration</h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              Enterprise Configuration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage the 3-tier warehouse network, RBAC enterprise roles, and security compliance configuration.
          </p>
        </div>

        {activeTab === 'stores' && (
          <button
            onClick={onOpenCreateStore}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Depot Store</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('stores')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stores'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>3-Tier Storage Hierarchy ({stores.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>RBAC Personnel &amp; Roles ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Database &amp; Zero-Trust Rules</span>
        </button>
      </div>

      {/* 1. STORES TAB */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{store.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      store.level.startsWith('Level 1')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : store.level.startsWith('Level 2')
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}
                  >
                    {store.level.split(' - ')[0]}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{store.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{store.state} State ({store.city})</span>
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Manager:</span>
                  <span className="text-white font-medium">{store.managerName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>GPS:</span>
                  <span>{store.gpsCoordinates.lat}, {store.gpsCoordinates.lng}</span>
                </div>
                {store.parentStoreId && (
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Supplied by Depot:</span>
                    <span className="text-emerald-400 font-mono">{store.parentStoreId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. USERS TAB (RBAC Switcher) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">Active Authenticated Persona</p>
              <p className="text-slate-400">
                Logged in as <span className="text-emerald-400 font-bold">{currentUser.name}</span> ({currentUser.role}).
                Click "Switch Role" below to simulate and test different authorization workflows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((usr) => (
              <div
                key={usr.id}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-xl space-y-3 ${
                  currentUser.id === usr.id ? 'border-emerald-500/80 bg-slate-800/40' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{usr.name}</h4>
                    <p className="text-[11px] text-slate-400">{usr.email}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded">
                    {usr.role}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">Department: {usr.department}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  {currentUser.id === usr.id ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Current User
                    </span>
                  ) : (
                    <button
                      onClick={() => onSwitchUser(usr)}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      Switch to This Role
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SYSTEM & FIREBASE TAB */}
      {activeTab === 'system' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle className="h-5 w-5" />
            <span className="text-base text-white">Firestore Rules &amp; Database Architecture Verified</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The ERP database is backed by Google Cloud Firestore with zero-trust RBAC authorization and immutable append-only constraints for <span className="font-mono text-emerald-400">audit_logs</span> and <span className="font-mono text-emerald-400">stock_transactions</span>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Local-First Persistence</span>
              <p className="text-slate-400">
                All changes are committed instantly to browser LocalStorage and queued for synchronization to Firestore, providing zero latency and field offline readiness.
              </p>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Cryptographic Ledger Seals</span>
              <p className="text-slate-400">
                Waybills, Goods Receipt Notes, and stock transfer movements compute a deterministic SHA-256 verification string preventing post-dispatch modification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
