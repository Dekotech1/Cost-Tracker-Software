import React, { useState } from 'react';
import { Layers, Plus, Search, Filter, AlertTriangle, CheckCircle2, ShieldAlert, PackageCheck, Ban } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, GoodsReceiptNote } from '../../types/erp';

interface ErpGoodsReceivingProps {
  currentUser: EnterpriseUser;
  onOpenCreateGrn: () => void;
}

export default function ErpGoodsReceiving({ currentUser, onOpenCreateGrn }: ErpGoodsReceivingProps) {
  const [grns, setGrns] = useState(() => erpService.getGRNs());
  const [discrepancies, setDiscrepancies] = useState(() => erpService.getDiscrepancies());
  const [activeTab, setActiveTab] = useState<'grns' | 'discrepancies' | 'quarantine'>('grns');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGrns = grns.filter((g) => {
    return (
      g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.receivingStoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.poNumber && g.poNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Goods Receiving Notes (GRN)</h1>
            <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              Inspection &amp; Quarantine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical receiving inspection, discrepancy flagging, damaged panel quarantine segregation, and 3-way match input.
          </p>
        </div>

        <button
          onClick={onOpenCreateGrn}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Goods Receipt (GRN)</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('grns')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'grns'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Goods Receipt Notes ({grns.length})
        </button>
        <button
          onClick={() => setActiveTab('discrepancies')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'discrepancies'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>Discrepancy Records ({discrepancies.length})</span>
        </button>
      </div>

      {/* 1. GRN CARDS */}
      {activeTab === 'grns' && (
        <div className="space-y-4">
          {filteredGrns.map((grn) => (
            <div
              key={grn.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{grn.grnNumber}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        grn.hasDiscrepancies
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {grn.hasDiscrepancies ? 'Discrepancy Flagged' : 'Full Clear Receipt'}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      PO: {grn.poNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Store: <span className="font-semibold text-white">{grn.receivingStoreName}</span> • Received by:{' '}
                    <span className="font-medium text-purple-300">{grn.receivingOfficerName}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                  <span>Received Date: {new Date(grn.receivedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Quarantine Bay Banner */}
              {grn.quarantineRequired && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-200">Quarantine Isolation Active</p>
                    <p className="text-amber-300/90 mt-0.5">
                      Damaged units segregated to: <span className="font-mono font-bold text-white">{grn.quarantineLocation}</span>.
                      These items are strictly excluded from available inventory balances and will not be issued for site installation.
                    </p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Expected</th>
                      <th className="py-2.5 px-3 text-right">Received</th>
                      <th className="py-2.5 px-3 text-right">Accepted</th>
                      <th className="py-2.5 px-3 text-right">Damaged</th>
                      <th className="py-2.5 px-3 text-right">Missing</th>
                      <th className="py-2.5 px-3">Condition Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {grn.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-white">{item.itemName}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">{item.expectedQuantity}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">{item.receivedQuantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">{item.acceptedQuantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-400 font-bold">{item.damagedQuantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-400 font-bold">{item.missingQuantity}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{item.conditionNotes || 'Clean inspection'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              {grn.remarks && (
                <p className="text-xs text-slate-400 bg-slate-800/30 p-2 rounded-lg font-mono">
                  Remarks: {grn.remarks}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. DISCREPANCY LOGS */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-3">
          {discrepancies.map((disc) => (
            <div
              key={disc.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">{disc.id}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {disc.discrepancyType} ({disc.severity} Severity)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    GRN: {disc.grnNumber}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{disc.itemName}</h4>
                <p className="text-xs text-slate-300">
                  Expected: <span className="font-mono font-bold text-white">{disc.expectedQty}</span>, Received:{' '}
                  <span className="font-mono font-bold text-rose-400">{disc.receivedQty}</span> (Variance of {disc.expectedQty - disc.receivedQty} units)
                </p>
                <p className="text-xs text-slate-400 mt-1">Resolution: {disc.resolutionNotes}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  Status: {disc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
