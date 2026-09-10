import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Package, Truck, FileText, Landmark, Users2, ShieldCheck, DollarSign, Database } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string, recordId?: string) => void;
}

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all searchable entities
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();

    const results: {
      type: string;
      title: string;
      subtitle: string;
      tabId: string;
      recordId: string;
      icon: any;
      badgeColor: string;
    }[] = [];

    // 1. POs
    erpService.getPurchaseOrders().forEach((po) => {
      if (po.poNumber.toLowerCase().includes(term) || po.vendorName.toLowerCase().includes(term)) {
        results.push({
          type: 'Purchase Order',
          title: po.poNumber,
          subtitle: `${po.vendorName} • ₦${(po.totalAmount / 1e6).toFixed(1)}M (${po.status})`,
          tabId: 'procurement',
          recordId: po.id,
          icon: FileText,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        });
      }
    });

    // 2. Requisitions
    erpService.getRequisitions().forEach((pr) => {
      if (pr.prNumber.toLowerCase().includes(term) || pr.programName.toLowerCase().includes(term)) {
        results.push({
          type: 'Requisition',
          title: pr.prNumber,
          subtitle: `${pr.programName} • ₦${(pr.estimatedTotalCost / 1e6).toFixed(1)}M (${pr.status})`,
          tabId: 'procurement',
          recordId: pr.id,
          icon: FileText,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        });
      }
    });

    // 3. Waybills
    erpService.getWaybills().forEach((wb) => {
      if (wb.waybillNumber.toLowerCase().includes(term) || wb.driverName.toLowerCase().includes(term) || wb.carrierCompany.toLowerCase().includes(term)) {
        results.push({
          type: 'Waybill',
          title: wb.waybillNumber,
          subtitle: `${wb.sourceStoreName} ➔ ${wb.destinationStoreName} (Driver: ${wb.driverName})`,
          tabId: 'waybills',
          recordId: wb.id,
          icon: Truck,
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        });
      }
    });

    // 4. GRNs
    erpService.getGRNs().forEach((grn) => {
      if (grn.grnNumber.toLowerCase().includes(term) || grn.receivingStoreName.toLowerCase().includes(term)) {
        results.push({
          type: 'Goods Receipt (GRN)',
          title: grn.grnNumber,
          subtitle: `${grn.receivingStoreName} • PO: ${grn.poNumber} (${grn.receiptType})`,
          tabId: 'receiving',
          recordId: grn.id,
          icon: Package,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        });
      }
    });

    // 5. Assets
    erpService.getAssets().forEach((ast) => {
      if (
        ast.assetTag.toLowerCase().includes(term) ||
        ast.serialNumber.toLowerCase().includes(term) ||
        ast.itemName.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'Serialized Asset',
          title: `${ast.assetTag} (${ast.serialNumber})`,
          subtitle: `${ast.itemName} @ ${ast.communityName}`,
          tabId: 'assets',
          recordId: ast.id,
          icon: ShieldCheck,
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        });
      }
    });

    // 6. Inventory Items / SKUs
    erpService.getItems().forEach((item) => {
      if (
        item.sku.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.brand && item.brand.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Catalogue SKU',
          title: `${item.sku} - ${item.name}`,
          subtitle: `${item.category} • Standard Cost: ₦${item.standardCost.toLocaleString()}`,
          tabId: 'inventory',
          recordId: item.id,
          icon: Database,
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        });
      }
    });

    // 7. Communities
    erpService.getCommunities().forEach((comm) => {
      if (comm.name.toLowerCase().includes(term) || comm.state.toLowerCase().includes(term) || comm.code.toLowerCase().includes(term)) {
        results.push({
          type: 'Community Site',
          title: `${comm.name} (${comm.code})`,
          subtitle: `${comm.state}, LGA: ${comm.lga} • ${comm.deploymentStatus}`,
          tabId: 'communities',
          recordId: comm.id,
          icon: Users2,
          badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        });
      }
    });

    // 8. Programmes
    erpService.getPrograms().forEach((prog) => {
      if (prog.name.toLowerCase().includes(term) || prog.code.toLowerCase().includes(term)) {
        results.push({
          type: 'Programme',
          title: `${prog.name} (${prog.code})`,
          subtitle: `Budget: ₦${(prog.approvedBudget / 1e6).toFixed(1)}M • Donor: ${prog.clientDonor}`,
          tabId: 'programmes',
          recordId: prog.id,
          icon: Landmark,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        });
      }
    });

    return results.slice(0, 15);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/40">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            id="global-search-modal-input"
            autoFocus
            type="text"
            placeholder="Type PO#, PR#, Waybill#, GRN#, Serial#, Asset Tag, SKU, Community, Programme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white p-1 rounded-md transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 space-y-1 divide-y divide-slate-800/50">
          {searchTerm.trim() === '' ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="h-10 w-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">Enterprise Unified Global Search</p>
              <p className="text-xs text-slate-500 mt-1">
                Instantly index POs, Waybills, GRNs, Assets, Communities, Programmes, and SKUs.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-700" onClick={() => setSearchTerm('PO-2026')}>Try &quot;PO-2026&quot;</span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-700" onClick={() => setSearchTerm('Canadian')}>Try &quot;Canadian&quot;</span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-700" onClick={() => setSearchTerm('Rigasa')}>Try &quot;Rigasa&quot;</span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-700" onClick={() => setSearchTerm('DWB')}>Try &quot;DWB&quot;</span>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-300">No records found for &quot;{searchTerm}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Check the spelling or try searching by SKU, tag, or code.</p>
            </div>
          ) : (
            searchResults.map((res, idx) => {
              const Icon = res.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(res.tabId, res.recordId);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                          {res.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${res.badgeColor}`}>
                          {res.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{res.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
