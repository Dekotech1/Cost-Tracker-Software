import React, { useState, useMemo } from 'react';
import { Community, Program, SolarProject, UserRole, Expense } from '../types';
import { Plus, Edit2, Trash2, MapPin, Landmark, Globe, FileText, ChevronRight, X } from 'lucide-react';

interface CommunitiesProps {
  communities: Community[];
  programs: Program[];
  projects: SolarProject[];
  expenses: Expense[];
  currentUserRole: UserRole;
  onAddCommunity: (community: Omit<Community, 'id'>) => void;
  onUpdateCommunity: (community: Community) => void;
  onDeleteCommunity: (communityId: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function Communities({
  communities,
  programs,
  projects,
  expenses,
  currentUserRole,
  onAddCommunity,
  onUpdateCommunity,
  onDeleteCommunity,
  onAddAuditLog,
}: CommunitiesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('All');

  // Form states
  const [programId, setProgramId] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [description, setDescription] = useState('');

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

  const handleEditClick = (comm: Community) => {
    setEditingCommunity(comm);
    setProgramId(comm.programId);
    setName(comm.name);
    setState(comm.state);
    setLga(comm.lga);
    setGpsCoordinates(comm.gpsCoordinates || '');
    setDescription(comm.description);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingCommunity(null);
    setProgramId(programs[0]?.id || '');
    setName('');
    setState('');
    setLga('');
    setGpsCoordinates('');
    setDescription('');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) {
      alert('Unauthorized: Only Administrators, Project Managers, or Finance Officers can modify communities.');
      return;
    }

    if (!programId || !name || !state || !lga) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingCommunity) {
      const updated: Community = {
        ...editingCommunity,
        programId,
        name,
        state,
        lga,
        gpsCoordinates,
        description,
      };
      onUpdateCommunity(updated);
      onAddAuditLog('Edited Community', `Updated community: ${name} (State: ${state})`);
    } else {
      onAddCommunity({
        programId,
        name,
        state,
        lga,
        gpsCoordinates,
        description,
      });
      onAddAuditLog('Created Community', `Added community: ${name} (LGA: ${lga}, State: ${state})`);
    }
    setShowForm(false);
  };

  // Helper stats
  const getCommunityProjectsCount = (commId: string) => {
    return projects.filter((p) => p.communityId === commId).length;
  };

  const getCommunitySpent = (commId: string) => {
    return expenses
      .filter((e) => e.communityId === commId && e.status === 'Approved')
      .reduce((sum, e) => sum + e.totalCost, 0);
  };

  // Filtered list
  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      if (selectedProgramFilter === 'All') return true;
      return c.programId === selectedProgramFilter;
    });
  }, [communities, selectedProgramFilter]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Community Directory</h2>
          <p className="text-sm text-white/50">Manage electrification target locations and link them to programmes.</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          {canModify ? (
            <button
              onClick={handleCreateClick}
              id="btn-create-community"
              className="flex items-center gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition duration-155 cursor-pointer border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" />
              Add Community
            </button>
          ) : (
            <div className="text-xs font-semibold bg-white/5 border border-white/10 text-white/40 rounded-xl px-3 py-2">
              Viewing as {currentUserRole} (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-white/40" />
          <span className="text-xs font-bold text-white/80">Filter by Programme:</span>
        </div>
        <select
          value={selectedProgramFilter}
          onChange={(e) => setSelectedProgramFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent w-full md:w-64"
        >
          <option value="All" className="bg-slate-900 text-white">All Programmes ({programs.length})</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id} className="bg-slate-900 text-white">
              {p.code} - {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Communities Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((comm) => {
            const program = programs.find((p) => p.id === comm.programId);
            const projectsCount = getCommunityProjectsCount(comm.id);
            const totalSpent = getCommunitySpent(comm.id);

            return (
              <div
                key={comm.id}
                id={`community-card-${comm.id}`}
                className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xs hover:bg-white/10 transition duration-150 flex flex-col justify-between backdrop-blur-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 text-white shrink-0 border border-white/10">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-sans font-bold text-white leading-tight">{comm.name}</h3>
                        <p className="text-[10px] text-white/40 font-mono">
                          {comm.lga} LGA, {comm.state} State
                        </p>
                      </div>
                    </div>
                    {comm.gpsCoordinates && (
                      <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">
                        {comm.gpsCoordinates}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/50 mt-4 leading-relaxed line-clamp-3">{comm.description}</p>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5" /> Program
                      </span>
                      <span className="font-bold text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg text-[10px]">
                        {program ? program.code : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" /> Solar Projects
                      </span>
                      <span className="font-bold text-white">{projectsCount} active/completed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-mono text-white/40 uppercase">Approved Deployment Cost</p>
                    <p className="text-sm font-sans font-bold text-white">{formatCurrency(totalSpent)}</p>
                  </div>

                  {canModify && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditClick(comm)}
                        className="p-1.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition"
                        title="Edit Community"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete community: ${comm.name}? This will unlink projects!`)) {
                            onDeleteCommunity(comm.id);
                            onAddAuditLog('Deleted Community', `Removed community: ${comm.name}`);
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 rounded-xl cursor-pointer transition"
                        title="Delete Community"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <MapPin className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Communities Registered</h4>
            <p className="text-xs text-white/40 mt-1">Add a community or check program filter.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-sans font-bold text-lg text-white">
                {editingCommunity ? 'Edit Community Location' : 'Register New Community'}
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
                  <label className="text-xs font-semibold text-white/50">Parent Programme *</label>
                  <select
                    required
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  >
                    <option value="" disabled className="bg-slate-900 text-white">Select a Programme...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Community Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gwagwalada"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. FCT or Ondo"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">LGA (Local Govt Area) *</label>
                  <input
                    type="text"
                    required
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Gwagwalada"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">GPS Coordinates (Optional)</label>
                  <input
                    type="text"
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                    placeholder="e.g. 8.9431° N, 7.0811° E"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent text-xs font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Description / Demographics</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe solar needs, population size, major facilities, agricultural hubs..."
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
                  {editingCommunity ? 'Save Changes' : 'Register Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
