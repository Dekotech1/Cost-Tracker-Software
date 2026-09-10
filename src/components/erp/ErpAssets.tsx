import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Filter, QrCode, MapPin, Calendar, Wrench, CheckCircle } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, SerializedAssetRecord } from '../../types/erp';

interface ErpAssetsProps {
  currentUser: EnterpriseUser;
  onOpenCreateAsset: () => void;
}

export default function ErpAssets({ currentUser, onOpenCreateAsset }: ErpAssetsProps) {
  const [assets, setAssets] = useState(() => erpService.getAssets());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.communityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ast.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Serialized Asset Register</h1>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Part 12 — Lifecycle Tracking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking high-value solar modules, hybrid inverters, and lithium battery banks across community deployment sites.
          </p>
        </div>

        <button
          onClick={onOpenCreateAsset}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search asset tag, serial#, model, community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Asset Categories</option>
            <option value="SOLAR PANELS">Solar Panels</option>
            <option value="INVERTERS">Inverters</option>
            <option value="BATTERIES">Batteries</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((ast) => (
          <div
            key={ast.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition space-y-4 relative flex flex-col justify-between"
          >
            <div>
              {/* Asset Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400">{ast.assetTag}</span>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">{ast.itemName}</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">SN: {ast.serialNumber}</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {ast.operationalStatus}
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Capacity / Rating:</span>
                  <span className="font-semibold text-white font-mono">{ast.capacityRating}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location:</span>
                  <span className="font-medium text-emerald-300">{ast.communityName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Site Enclosure:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">{ast.deploymentSiteName}</span>
                </div>
              </div>

              {/* Maintenance & Warranty */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Warranty Until:</span>
                  <p className="text-slate-300">{ast.warrantyExpiryDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Next Service:</span>
                  <p className="text-amber-400">{ast.nextMaintenanceDate}</p>
                </div>
              </div>
            </div>

            {/* Footer: Custodian */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[160px]">Custodian: {ast.currentCustodian}</span>
              <span className="font-mono font-bold text-white">₦{ast.purchaseCost.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
