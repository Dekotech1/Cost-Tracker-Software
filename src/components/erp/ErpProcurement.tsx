import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Building2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, PurchaseRequisition, PurchaseOrder } from '../../types/erp';

interface ErpProcurementProps {
  currentUser: EnterpriseUser;
  onOpenCreateModal: (type: string) => void;
  onConvertToTransfer: (pr: PurchaseRequisition) => void;
}

export default function ErpProcurement({ currentUser, onOpenCreateModal, onConvertToTransfer }: ErpProcurementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'requisitions' | 'orders' | 'smart-engine'>('requisitions');
  const [searchTerm, setSearchTerm] = useState('');

  const [requisitions, setRequisitions] = useState(() => erpService.getRequisitions());
  const [purchaseOrders, setPurchaseOrders] = useState(() => erpService.getPurchaseOrders());

  // Handle Approvals
  const handleApproveRequisition = (prId: string) => {
    const pr = requisitions.find((p) => p.id === prId);
    if (!pr) return;

    const newApproval = {
      timestamp: new Date().toISOString(),
      approverId: currentUser.id,
      approverName: currentUser.name,
      approverRole: currentUser.role,
      action: 'Approved' as const,
      comments: `Approved by ${currentUser.name} (${currentUser.role}) via Enterprise ERP workflow`,
    };

    const updatedStatus =
      currentUser.role === 'FINANCE MANAGER' || currentUser.role === 'SUPER ADMIN'
        ? 'Approved'
        : 'Pending Finance Review';

    const updated: PurchaseRequisition = {
      ...pr,
      status: updatedStatus,
      approvalHistory: [...(pr.approvalHistory || []), newApproval],
    };

    erpService.saveRequisition(updated);
    setRequisitions(erpService.getRequisitions());

    // Record audit log
    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'Requisition',
      recordId: pr.prNumber,
      action: `PR Approval (${updatedStatus})`,
      newStateSummary: `Approved by ${currentUser.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Procurement &amp; Purchasing</h1>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Smart Stock Prioritization
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end purchasing lifecycle: Requisitions, automated multi-store stock search, and 3-way matching purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateModal('requisition')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            + New Requisition (PR)
          </button>
          <button
            onClick={() => onOpenCreateModal('po')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            + Issue Purchase Order (PO)
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveSubTab('requisitions')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeSubTab === 'requisitions'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Purchase Requisitions ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeSubTab === 'orders'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('smart-engine')}
          className={`pb-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'smart-engine'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Smart Procurement Engine (Part 5)</span>
        </button>
      </div>

      {/* 1. REQUISITIONS VIEW */}
      {activeSubTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="space-y-4">
            {requisitions.map((pr) => {
              const hasTransferOption = pr.items.some((i) => i.internalStockAvailableNear);

              return (
                <div
                  key={pr.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{pr.prNumber}</span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                            pr.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {pr.status}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          Priority: {pr.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Programme: <span className="font-medium text-emerald-300">{pr.programName}</span> • Site:{' '}
                        <span className="font-medium text-white">{pr.communityName}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400 font-mono">Estimated Commitment</div>
                      <div className="text-lg font-black text-white font-mono">
                        ₦{pr.estimatedTotalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Smart Procurement Transfer Banner */}
                  {hasTransferOption && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-emerald-200">
                            Smart Procurement Engine: Sourced Internally!
                          </p>
                          <p className="text-[11px] text-emerald-300/90 mt-0.5 leading-snug">
                            Requested material is already available in Apex National Central Depot (700 units available).
                            Issuing an Inter-Store Transfer Order (STT) saves approximately ₦32.5M and 14 days vendor delivery.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onConvertToTransfer(pr)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow transition cursor-pointer"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Convert to Transfer (STT)</span>
                      </button>
                    </div>
                  )}

                  {/* Requested Items Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Item / Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Estimated Unit Cost</th>
                          <th className="py-2.5 px-3 text-right">Total Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {pr.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3">
                              <div className="font-semibold text-white">{item.itemName}</div>
                              <div className="font-mono text-[10px] text-slate-500">{item.itemSku}</div>
                            </td>
                            <td className="py-2 px-3 text-slate-400">{item.category}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white">
                              {item.quantityRequested}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300">
                              ₦{item.estimatedUnitCost.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold">
                              ₦{item.estimatedTotalCost.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approval Actions & History */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400 font-mono text-[11px]">
                      Requested by <span className="text-white">{pr.requestingUserName}</span> on{' '}
                      {new Date(pr.createdDate).toLocaleDateString()}
                    </div>

                    {pr.status !== 'Approved' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRequisition(pr.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Requisition</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. PURCHASE ORDERS VIEW */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-400">{po.poNumber}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        {po.status}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        Ref: {po.prNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Vendor: <span className="font-bold text-white">{po.vendorName}</span> ({po.vendorTaxId})
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400 font-mono">PO Net Total (Inc. VAT)</div>
                    <div className="text-lg font-black text-white font-mono">
                      ₦{po.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Items in PO */}
                <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                        <th className="py-2.5 px-3 text-right">Received Qty</th>
                        <th className="py-2.5 px-3 text-right">Outstanding</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {po.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-semibold text-white">{item.itemName}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{item.quantityOrdered}</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold">{item.quantityReceived}</td>
                          <td className="py-2 px-3 text-right font-mono text-amber-400">{item.quantityOutstanding}</td>
                          <td className="py-2 px-3 text-right font-mono">₦{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono text-white font-bold">₦{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Delivery Terms: {po.deliveryTerms}</span>
                  <span>Payment Terms: {po.paymentTerms}</span>
                  <span className="text-emerald-400">Budget Verification: Passed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SMART ENGINE ARCHITECTURE VIEW */}
      {activeSubTab === 'smart-engine' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Smart Procurement Recommendation Logic</h2>
              <p className="text-xs text-slate-400">
                Rule engine preventing duplicate purchases and optimizing inventory velocity across Nigerian regional hubs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <div className="font-bold text-emerald-400 font-mono">STEP 1: Requisition Scrutiny</div>
              <p className="text-slate-300">
                Whenever a Site or Project Manager submits a material requisition, the engine runs an automated query across all 3 storage tiers.
              </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <div className="font-bold text-blue-400 font-mono">STEP 2: Proximity &amp; Cost Ranking</div>
              <p className="text-slate-300">
                Stores are evaluated based on distance (km) and unreserved available stock. Nearby hubs take precedence over Level 1 Central Depot.
              </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <div className="font-bold text-amber-400 font-mono">STEP 3: STT Over PO Trigger</div>
              <p className="text-slate-300">
                The Procurement Manager receives an automated suggestion to dispatch an Inter-Store Transfer (STT) instead of cutting a new Purchase Order.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
