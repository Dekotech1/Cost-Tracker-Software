import React, { useState } from 'react';
import { Landmark, Plus, Search, Filter, Calendar, Users, DollarSign, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseProgram } from '../../types/erp';

interface ErpProgrammesProps {
  onOpenCreateModal: () => void;
  onSelectProgram?: (program: EnterpriseProgram) => void;
}

export default function ErpProgrammes({ onOpenCreateModal }: ErpProgrammesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const programs = erpService.getPrograms();

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientDonor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Programme Management</h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {programs.length} Active Programmes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Renewable energy deployment initiatives funded by institutional clients and multilateral donors.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Programme</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search programme, donor, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Programmes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((prog) => {
          const spendPct = Math.round((prog.actualSpend / prog.approvedBudget) * 100);
          const committedPct = Math.round((prog.committedBudget / prog.approvedBudget) * 100);

          return (
            <div
              key={prog.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition space-y-4 relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{prog.code}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      {prog.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 leading-snug">{prog.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Donor/Client: <span className="text-slate-200 font-medium">{prog.clientDonor}</span></p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                {prog.description}
              </p>

              {/* Financial Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Approved Capex Budget</span>
                  <span className="font-mono font-bold text-white">₦{(prog.approvedBudget / 1e6).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${spendPct}%` }} title={`Actual Spend: ${spendPct}%`} />
                  <div className="bg-blue-500 h-full" style={{ width: `${committedPct - spendPct}%` }} title={`Committed: ${committedPct}%`} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-emerald-400">Actual Spend: ₦{(prog.actualSpend / 1e6).toFixed(1)}M ({spendPct}%)</span>
                  <span className="text-blue-400">Committed: ₦{(prog.committedBudget / 1e6).toFixed(1)}M</span>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span>{prog.leadManagerName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>{prog.startDate} to {prog.targetEndDate}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {prog.totalCommunitiesCount} Deployment Sites
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
