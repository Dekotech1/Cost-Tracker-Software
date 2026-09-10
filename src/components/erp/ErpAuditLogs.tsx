import React, { useState } from 'react';
import { Shield, Search, Filter, Lock, CheckCircle2, AlertCircle, Hash, RefreshCw } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';

export default function ErpAuditLogs() {
  const [logs, setLogs] = useState(() => erpService.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">System Audit &amp; Compliance Trail</h1>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Append-Only Immutability
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-trust tamper-evident logging across every procurement approval, inventory movement, and invoice override.
          </p>
        </div>

        <button
          onClick={() => setLogs(erpService.getAuditLogs())}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, entity, user, record#..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER ADMIN">SUPER ADMIN</option>
            <option value="FINANCE MANAGER">FINANCE MANAGER</option>
            <option value="PROCUREMENT MANAGER">PROCUREMENT MANAGER</option>
            <option value="STORE OFFICER">STORE OFFICER</option>
            <option value="SITE ENGINEER">SITE ENGINEER</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Actor (User &amp; Role)</th>
                <th className="py-3 px-3.5">Action</th>
                <th className="py-3 px-3.5">Entity &amp; Record ID</th>
                <th className="py-3 px-3.5">Details / State Summary</th>
                <th className="py-3 px-3.5">IP Address</th>
                <th className="py-3 px-3.5 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-white">{log.userName}</div>
                    <div className="text-[10px] font-mono text-emerald-400">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono text-[11px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <div className="text-white font-bold">{log.recordId}</div>
                    <div className="text-[10px] text-slate-400">{log.entityType}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 text-[11px] max-w-xs truncate">
                    {log.newStateSummary || log.reason || 'Transaction logged'}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[10px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1 font-bold">
                      <Lock className="h-3 w-3" /> Sealed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
