import React, { useState } from 'react';
import { Users2, Plus, Search, Filter, MapPin, Zap, BatteryCharging, Building2, ExternalLink } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';

interface ErpCommunitiesProps {
  onOpenCreateModal: () => void;
}

export default function ErpCommunities({ onOpenCreateModal }: ErpCommunitiesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const communities = erpService.getCommunities();

  const states = Array.from(new Set(communities.map((c) => c.state)));

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'ALL' || c.state === stateFilter;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-teal-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Community &amp; Site Management</h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {communities.length} Communities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Off-grid mini-grid sites, healthcare solar installations, and agro-processing cold hub communities.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Community Site</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search community name, LGA, programme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Communities Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((comm) => (
          <div
            key={comm.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition space-y-4 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-400">{comm.code}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{comm.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {comm.state} State, LGA: {comm.lga}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    comm.deploymentStatus === 'Operational' || comm.deploymentStatus === 'Commissioned'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {comm.deploymentStatus}
                </span>
              </div>

              <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400">
                  Programme: <span className="text-slate-200 font-medium">{comm.programName}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> {comm.miniGridCapacityKwp || 0} kWp Solar
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <BatteryCharging className="h-3.5 w-3.5" /> {comm.storageCapacityKwh || 0} kWh Storage
                  </span>
                </div>
              </div>

              {/* Beneficiary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-2 border-t border-slate-800/70">
                <div className="bg-slate-800/30 p-1.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Households</div>
                  <div className="text-xs font-bold text-white font-mono">{comm.householdsCount}</div>
                </div>
                <div className="bg-slate-800/30 p-1.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Businesses</div>
                  <div className="text-xs font-bold text-white font-mono">{comm.commercialEntitiesCount}</div>
                </div>
                <div className="bg-slate-800/30 p-1.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Citizens</div>
                  <div className="text-xs font-bold text-teal-400 font-mono">{comm.beneficiariesCount}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span className="font-mono">
                  {comm.gpsCoordinates ? `${comm.gpsCoordinates.lat}, ${comm.gpsCoordinates.lng}` : 'GPS Set'}
                </span>
              </div>
              <div className="text-slate-300 font-medium">{comm.siteManagerName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
