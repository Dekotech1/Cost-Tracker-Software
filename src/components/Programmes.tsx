import React, { useState, useMemo } from 'react';
import { Program, UserRole, Expense, ProgramStatus } from '../types';
import { Plus, Edit2, Archive, CheckCircle2, DollarSign, Calendar, User, Briefcase, FileText, RefreshCw, X } from 'lucide-react';

interface ProgrammesProps {
  programs: Program[];
  expenses: Expense[];
  currentUserRole: UserRole;
  onAddProgram: (program: Omit<Program, 'id'>) => void;
  onUpdateProgram: (program: Program) => void;
  onArchiveProgram: (programId: string) => void;
  onUnarchiveProgram: (programId: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function Programmes({
  programs,
  expenses,
  currentUserRole,
  onAddProgram,
  onUpdateProgram,
  onArchiveProgram,
  onUnarchiveProgram,
  onAddAuditLog,
}: ProgrammesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Archived'>('All');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientDonor, setClientDonor] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [budget, setBudget] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProgramStatus>('Active');
  const [description, setDescription] = useState('');

  // Role permissions
  const canModify = currentUserRole === 'Administrator' || currentUserRole === 'Finance Officer';

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Open modal for editing
  const handleEditClick = (prog: Program) => {
    setEditingProgram(prog);
    setName(prog.name);
    setCode(prog.code);
    setClientDonor(prog.clientDonor);
    setProjectManager(prog.projectManager);
    setBudget(prog.budget);
    setStartDate(prog.startDate);
    setEndDate(prog.endDate);
    setStatus(prog.status);
    setDescription(prog.description);
    setShowForm(true);
  };

  // Open modal for creating new
  const handleCreateClick = () => {
    setEditingProgram(null);
    setName('');
    setCode('');
    setClientDonor('');
    setProjectManager('');
    setBudget(0);
    setStartDate('');
    setEndDate('');
    setStatus('Active');
    setDescription('');
    setShowForm(true);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) {
      alert('Unauthorized: Only Administrators or Finance Officers can create or update programmes.');
      return;
    }

    if (!name || !code || !clientDonor || !projectManager || budget <= 0 || !startDate || !endDate) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingProgram) {
      const updated: Program = {
        ...editingProgram,
        name,
        code,
        clientDonor,
        projectManager,
        budget,
        startDate,
        endDate,
        status,
        description,
      };
      onUpdateProgram(updated);
      onAddAuditLog('Edited Program', `Updated details for programme code: ${code}`);
    } else {
      onAddProgram({
        name,
        code,
        clientDonor,
        projectManager,
        budget,
        startDate,
        endDate,
        status,
        description,
      });
      onAddAuditLog('Created Program', `Created new programme: ${name} (Code: ${code}) with budget ₦${budget.toLocaleString()}`);
    }
    setShowForm(false);
  };

  // Total spent calculation for a program
  const getProgramSpent = (programId: string) => {
    return expenses
      .filter((e) => e.programId === programId && e.status === 'Approved')
      .reduce((sum, e) => sum + e.totalCost, 0);
  };

  // Filter programmes
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (filterStatus === 'All') return true;
      return p.status === filterStatus;
    });
  }, [programs, filterStatus]);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Programme Management</h2>
          <p className="text-sm text-white/50">Add, edit, or archive federal and regional solar electrification schemes.</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          {canModify ? (
            <button
              onClick={handleCreateClick}
              id="btn-create-programme"
              className="flex items-center gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition duration-150 cursor-pointer border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" />
              New Programme
            </button>
          ) : (
            <div className="text-xs font-semibold bg-white/5 border border-white/10 text-white/40 rounded-xl px-3 py-2">
              Viewing as {currentUserRole} (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex overflow-x-auto gap-2 py-1">
        {(['All', 'Active', 'Completed', 'Archived'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filterStatus === st
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {st} Programmes ({st === 'All' ? programs.length : programs.filter((p) => p.status === st).length})
          </button>
        ))}
      </div>

      {/* Programme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => {
            const spent = getProgramSpent(prog.id);
            const utilization = prog.budget > 0 ? (spent / prog.budget) * 100 : 0;
            const remaining = prog.budget - spent;

            return (
              <div
                key={prog.id}
                id={`program-card-${prog.id}`}
                className={`bg-white/5 backdrop-blur-md border p-6 rounded-2xl flex flex-col justify-between transition-all hover:bg-white/10 ${
                  prog.status === 'Archived' ? 'opacity-65 border-dashed border-white/10 bg-white/2' : 'border-white/10 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {prog.code}
                      </span>
                      <h3 className="font-sans font-bold text-lg text-white mt-1.5">{prog.name}</h3>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        prog.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : prog.status === 'Completed'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-white/10 text-white/60 border border-white/10'
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>

                  <p className="text-white/50 text-xs mt-3 line-clamp-3 leading-relaxed">{prog.description}</p>

                  <div className="grid grid-cols-2 gap-4 my-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-white/40" />
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-white/40">Client / Donor</p>
                        <p className="text-xs font-semibold text-white/80 truncate max-w-[140px]">{prog.clientDonor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white/40" />
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-white/40">Manager</p>
                        <p className="text-xs font-semibold text-white/80 truncate max-w-[140px]">{prog.projectManager}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/40" />
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-white/40">Start Date</p>
                        <p className="text-xs font-semibold text-white/80">{prog.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/40" />
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-white/40">End Date</p>
                        <p className="text-xs font-semibold text-white/80">{prog.endDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Section */}
                <div className="space-y-2 pt-3 border-t border-white/5 mt-auto">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 font-semibold text-white">
                      <DollarSign className="h-3.5 w-3.5 text-white/40" />
                      <span>{formatCurrency(prog.budget)}</span>
                    </div>
                    <span className={`font-mono font-bold ${utilization >= 100 ? 'text-rose-400' : utilization >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {utilization.toFixed(1)}% Used
                    </span>
                  </div>

                  {/* Utilization Bar */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-350 ${
                        utilization >= 100 ? 'bg-rose-500' : utilization >= 80 ? 'bg-amber-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-white/40 pt-1">
                    <span>Spent: {formatCurrency(spent)}</span>
                    <span className={remaining < 0 ? 'text-rose-400 font-semibold' : ''}>
                      {remaining < 0 ? 'Overspent: ' : 'Rem: '}
                      {formatCurrency(Math.abs(remaining))}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  {canModify && (
                    <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-2">
                      <button
                        onClick={() => handleEditClick(prog)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Details
                      </button>

                      {prog.status === 'Archived' ? (
                        <button
                          onClick={() => {
                            onUnarchiveProgram(prog.id);
                            onAddAuditLog('Unarchived Program', `Restored program: ${prog.name}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 rounded-xl text-xs font-semibold cursor-pointer transition"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to archive the programme: ${prog.name}?`)) {
                              onArchiveProgram(prog.id);
                              onAddAuditLog('Archived Program', `Archived program: ${prog.name}`);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 rounded-xl text-xs font-semibold cursor-pointer transition"
                        >
                          <Archive className="h-3 w-3" />
                          Archive
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <Briefcase className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Programmes Found</h4>
            <p className="text-xs text-white/40 mt-1">Try switching to a different filter state above.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-sans font-bold text-lg text-white">
                {editingProgram ? 'Edit Programme Details' : 'Create New Programme'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/40 hover:text-white rounded-full p-1.5 hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Programme Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Northern Solar Electrification Programme"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Programme Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. NSEP-2026"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProgramStatus)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  >
                    <option className="bg-slate-900 text-white" value="Active">Active</option>
                    <option className="bg-slate-900 text-white" value="Completed">Completed</option>
                    <option className="bg-slate-900 text-white" value="Archived">Archived</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Client / Donor *</label>
                  <input
                    type="text"
                    required
                    value={clientDonor}
                    onChange={(e) => setClientDonor(e.target.value)}
                    placeholder="e.g. World Bank & Ministry of Power"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Project Manager *</label>
                  <input
                    type="text"
                    required
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    placeholder="e.g. Engr. Ibrahim Bello"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Budget (₦) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={budget || ''}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    placeholder="Budget amount in Naira"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive summary of the programme's key electrification objectives..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-white/10 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
                >
                  {editingProgram ? 'Save Changes' : 'Create Programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
