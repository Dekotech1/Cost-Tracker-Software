import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';
import { History, Search, User, ShieldAlert, Clock, Info, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuditTrailProps {
  auditLogs: AuditLog[];
  onClearLogs?: () => void;
}

export default function AuditTrail({ auditLogs, onClearLogs }: AuditTrailProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approve')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (act.includes('reject')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (act.includes('create')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (act.includes('edit') || act.includes('update')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-white/5 text-white/80 border-white/10';
  };

  const getRoleIconColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      case 'Project Manager':
        return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'Finance Officer':
        return 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
      case 'Field Engineer':
        return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
      default:
        return 'text-white/80 bg-white/5 border border-white/10';
    }
  };

  const filteredLogs = useMemo(() => {
    return [...auditLogs]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .filter((log) => {
        const query = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.userName.toLowerCase().includes(query) ||
          log.userRole.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query)
        );
      });
  }, [auditLogs, searchQuery]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">System Audit Trail</h2>
          <p className="text-sm text-white/50">Unalterable history logs of cost edits, role authentications, and project approvals.</p>
        </div>
        {onClearLogs && auditLogs.length > 5 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear system audit trail history? This is irreversible.')) {
                onClearLogs();
              }
            }}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 rounded-xl border border-rose-500/20 transition cursor-pointer"
          >
            Clear Log Cache
          </button>
        )}
      </div>

      {/* SEARCH FILTERS */}
      <div className="relative bg-white/5 border border-white/10 p-4 rounded-2xl shadow-xs backdrop-blur-md">
        <Search className="absolute left-7 top-7 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search audit trail by operator name, action, role, or log details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
        />
      </div>

      {/* LOG TIMELINE LIST */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xs backdrop-blur-md">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-white/40" />
            <h4 className="text-xs font-bold text-white/90">Unalterable Events Ledger ({filteredLogs.length})</h4>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-indigo-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 animate-pulse" /> Integrity Secure
          </span>
        </div>

        <div className="divide-y divide-white/5 max-h-[550px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const timeFormatted = new Date(log.timestamp).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row gap-3 hover:bg-white/10 transition">
                  {/* Left Column: Timestamp & Action Badge */}
                  <div className="sm:w-56 shrink-0 text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{timeFormatted}</span>
                    </div>

                    <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>

                  {/* Middle Column: Operator details & detailed message */}
                  <div className="flex-1 text-left space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${getRoleIconColor(log.userRole)}`}>
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-bold font-sans">{log.userName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">({log.userRole})</span>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
                      <Info className="h-3.5 w-3.5 text-white/40 shrink-0 mt-0.5" />
                      <p className="text-xs text-white/80 leading-relaxed font-semibold">{log.details}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-white/40 text-xs">
              <History className="h-8 w-8 text-white/20 mx-auto mb-2" />
              <h4 className="font-semibold text-white/90">No Logs Found</h4>
              <p className="mt-1">Try resetting or narrowing down your search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
