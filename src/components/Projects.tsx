import React, { useState, useMemo } from 'react';
import { SolarProject, Community, Program, UserRole, ProjectType, ProjectStatus, Expense } from '../types';
import { Plus, Edit2, CheckCircle2, User, Landmark, DollarSign, Calendar, SlidersHorizontal, MapPin, X } from 'lucide-react';

interface ProjectsProps {
  projects: SolarProject[];
  communities: Community[];
  programs: Program[];
  expenses: Expense[];
  currentUserRole: UserRole;
  onAddProject: (project: Omit<SolarProject, 'id'>) => void;
  onUpdateProject: (project: SolarProject) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

const PROJECT_TYPES: ProjectType[] = [
  'Solar Mini Grid',
  'Solar Home Systems',
  'Solar Boreholes',
  'Solar Street Lights',
  'Commercial Solar Installation',
  'Residential Solar Installation',
  'Solar Water Pump',
  'Solar Farm',
];

const PROJECT_STATUSES: ProjectStatus[] = ['Active', 'Completed', 'On Hold', 'Cancelled'];

export default function Projects({
  projects,
  communities,
  programs,
  expenses,
  currentUserRole,
  onAddProject,
  onUpdateProject,
  onAddAuditLog,
}: ProjectsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<SolarProject | null>(null);

  // Filters
  const [progFilter, setProgFilter] = useState('All');
  const [commFilter, setCommFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states
  const [name, setName] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Solar Mini Grid');
  const [budget, setBudget] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [projectEngineer, setProjectEngineer] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');

  // Role permissions
  const canModify = currentUserRole === 'Administrator' || currentUserRole === 'Project Manager' || currentUserRole === 'Finance Officer';

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleEditClick = (proj: SolarProject) => {
    setEditingProject(proj);
    setName(proj.name);
    setCommunityId(proj.communityId);
    setProjectType(proj.projectType);
    setBudget(proj.budget);
    setStartDate(proj.startDate);
    setCompletionDate(proj.completionDate);
    setProjectEngineer(proj.projectEngineer);
    setStatus(proj.status);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setName('');
    setCommunityId(communities[0]?.id || '');
    setProjectType('Solar Mini Grid');
    setBudget(0);
    setStartDate('');
    setCompletionDate('');
    setProjectEngineer('');
    setStatus('Active');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) {
      alert('Unauthorized: Only Administrators, Project Managers, or Finance Officers can create or edit projects.');
      return;
    }

    if (!name || !communityId || !projectType || budget <= 0 || !startDate || !completionDate || !projectEngineer) {
      alert('Please fill out all required fields.');
      return;
    }

    const selectedComm = communities.find((c) => c.id === communityId);
    const programId = selectedComm ? selectedComm.programId : '';

    if (editingProject) {
      const updated: SolarProject = {
        ...editingProject,
        name,
        communityId,
        programId,
        projectType,
        budget,
        startDate,
        completionDate,
        projectEngineer,
        status,
      };
      onUpdateProject(updated);
      onAddAuditLog('Edited Project', `Modified project ${name} under community ID ${communityId}`);
    } else {
      onAddProject({
        name,
        communityId,
        programId,
        projectType,
        budget,
        startDate,
        completionDate,
        projectEngineer,
        status,
      });
      onAddAuditLog('Created Project', `Added project ${name} with budget ₦${budget.toLocaleString()}`);
    }
    setShowForm(false);
  };

  // Spent on a project (Approved Expenses)
  const getProjectSpent = (projId: string) => {
    return expenses
      .filter((e) => e.projectId === projId && e.status === 'Approved')
      .reduce((sum, e) => sum + e.totalCost, 0);
  };

  // Filtered communities for the form
  const availableCommunities = useMemo(() => {
    return communities;
  }, [communities]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const comm = communities.find((c) => c.id === proj.communityId);
      const prog = programs.find((p) => p.id === proj.programId);

      if (progFilter !== 'All' && proj.programId !== progFilter) return false;
      if (commFilter !== 'All' && proj.communityId !== commFilter) return false;
      if (typeFilter !== 'All' && proj.projectType !== typeFilter) return false;
      if (statusFilter !== 'All' && proj.status !== statusFilter) return false;

      return true;
    });
  }, [projects, communities, programs, progFilter, commFilter, typeFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Solar Projects Directory</h2>
          <p className="text-sm text-white/50">Track and manage specifications, budgets, and engineering status for physical installation assets.</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          {canModify ? (
            <button
              onClick={handleCreateClick}
              id="btn-create-project"
              className="flex items-center gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition duration-155 cursor-pointer border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          ) : (
            <div className="text-xs font-semibold bg-white/5 border border-white/10 text-white/40 rounded-xl px-3 py-2">
              Viewing as {currentUserRole} (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-xs space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <SlidersHorizontal className="h-4 w-4 text-white/50" />
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Filter Directory</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Program filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Programme</label>
            <select
              value={progFilter}
              onChange={(e) => setProgFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Programmes</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.code}
                </option>
              ))}
            </select>
          </div>

          {/* Community filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Community</label>
            <select
              value={commFilter}
              onChange={(e) => setCommFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Communities</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Project Type filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Project Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Types</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Statuses</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => {
            const spent = getProjectSpent(proj.id);
            const pct = proj.budget > 0 ? (spent / proj.budget) * 100 : 0;
            const rem = proj.budget - spent;

            const community = communities.find((c) => c.id === proj.communityId);
            const program = programs.find((p) => p.id === proj.programId);

            return (
              <div
                key={proj.id}
                id={`project-card-${proj.id}`}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/10 transition duration-150 relative overflow-hidden backdrop-blur-md"
              >
                {/* Budget warning threshold banners */}
                {pct >= 100 ? (
                  <div className="absolute top-0 right-0 left-0 bg-rose-600/95 text-white text-[10px] font-mono font-bold text-center py-1 flex items-center justify-center gap-1.5 px-4 backdrop-blur-sm border-b border-rose-500/20">
                    <span>⚠️ CRITICAL: BUDGET EXCEEDED ({(pct).toFixed(0)}%)</span>
                  </div>
                ) : pct >= 80 ? (
                  <div className="absolute top-0 right-0 left-0 bg-amber-500/95 text-white text-[10px] font-mono font-bold text-center py-1 flex items-center justify-center gap-1.5 px-4 backdrop-blur-sm border-b border-amber-400/20">
                    <span>⚠️ WARNING: BUDGET RUNNING LOW ({(pct).toFixed(0)}%)</span>
                  </div>
                ) : null}

                <div className={pct >= 80 ? 'pt-4' : ''}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {proj.projectType}
                      </span>
                      <h3 className="font-sans font-bold text-base text-white mt-1.5 leading-snug">{proj.name}</h3>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : proj.status === 'Active'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : proj.status === 'On Hold'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Hierarchy breadcrumb */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-white/40 mt-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Landmark className="h-3 w-3 shrink-0" /> {program ? program.code : 'Unknown'}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> {community ? community.name : 'Unknown'}
                    </span>
                  </div>

                  {/* Spec grid */}
                  <div className="grid grid-cols-2 gap-3 my-4 pt-3 border-t border-white/5 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white/40 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-white/40">Engineer</p>
                        <p className="font-semibold text-white/90 truncate max-w-[120px]">{proj.projectEngineer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/40 shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-white/40">Timeline</p>
                        <p className="font-semibold text-[10px] text-white/90">
                          {proj.startDate} to {proj.completionDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Progress block */}
                <div className="space-y-2 pt-3 border-t border-white/5 mt-auto">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 font-semibold text-white">
                      <DollarSign className="h-3.5 w-3.5 text-white/40" />
                      <span>{formatCurrency(proj.budget)}</span>
                    </div>
                    <span className={`font-mono font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {pct.toFixed(0)}% Spent
                    </span>
                  </div>

                  {/* Utilization Bar */}
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-350 ${
                        pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-white/40 pt-1">
                    <span>Spent: {formatCurrency(spent)}</span>
                    <span className={rem < 0 ? 'text-rose-400 font-semibold' : ''}>
                      {rem < 0 ? 'Exceeded by ' : 'Balance: '}
                      {formatCurrency(Math.abs(rem))}
                    </span>
                  </div>

                  {canModify && (
                    <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-2">
                      <button
                        onClick={() => handleEditClick(proj)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <Landmark className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Projects Found</h4>
            <p className="text-xs text-white/40 mt-1">Refine your filters or create a solar project to populate.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-sans font-bold text-lg text-white">
                {editingProject ? 'Edit Project Specifications' : 'Add Solar Project'}
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
                  <label className="text-xs font-semibold text-white/50">Target Community *</label>
                  <select
                    required
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  >
                    <option value="" disabled className="bg-slate-900 text-white">Select community location...</option>
                    {availableCommunities.map((c) => {
                      const prog = programs.find((p) => p.id === c.programId);
                      return (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} (LGA: {c.lga}, Prog: {prog ? prog.code : 'Unknown'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Solar Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Solar Mini Grid Installation"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Project Type *</label>
                  <select
                    required
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Project Status *</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Allocated Budget (₦) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={budget || ''}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    placeholder="Budget size in Naira"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Assigned Project Engineer *</label>
                  <input
                    type="text"
                    required
                    value={projectEngineer}
                    onChange={(e) => setProjectEngineer(e.target.value)}
                    placeholder="e.g. Engr. Sarah Nnaji"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Estimated Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Target Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
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
                  {editingProject ? 'Save Changes' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
