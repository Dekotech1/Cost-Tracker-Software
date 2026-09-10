import React, { useState } from 'react';
import {
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Play,
  FileText,
  Landmark,
  Percent,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, ThreeWayMatchResult, ProgramBudgetFinancials } from '../../types/erp';

interface ErpFinanceProps {
  currentUser: EnterpriseUser;
}

export default function ErpFinance({ currentUser }: ErpFinanceProps) {
  const [activeTab, setActiveTab] = useState<'matching' | 'budgets'>('matching');
  const [matches, setMatches] = useState(() => erpService.getThreeWayMatches());
  const [budgets, setBudgets] = useState(() => erpService.getBudgets());
  const [selectedMatch, setSelectedMatch] = useState<ThreeWayMatchResult | null>(matches[0] || null);

  // Authorize Exception Override
  const handleAuthorizeException = (matchId: string) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          paymentBlocked: false,
          exceptionApprovalAuthorized: true,
          status: 'PARTIALLY MATCHED' as const,
        };
      }
      return m;
    });
    setMatches(updated);
    if (selectedMatch?.id === matchId) {
      setSelectedMatch({
        ...selectedMatch,
        paymentBlocked: false,
        exceptionApprovalAuthorized: true,
        status: 'PARTIALLY MATCHED',
      });
    }

    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'Invoice',
      recordId: matchId,
      action: '3-Way Match Exception Override Authorized',
      newStateSummary: `Authorized payment under credit note provision by ${currentUser.name}`,
      reason: `Authorized payment under credit note provision by ${currentUser.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Finance &amp; Budget Control</h1>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Part 13 &amp; 14 — Automated Safeguards
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated Three-Way Matching (PO vs GRN vs Invoice) and multi-programme capex allocation controls.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('matching')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'matching'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>3-Way Invoice Matching ({matches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'budgets'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="h-3.5 w-3.5" />
          <span>Programme Capex Budgets ({budgets.length})</span>
        </button>
      </div>

      {/* 1. THREE-WAY MATCHING VIEW */}
      {activeTab === 'matching' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match Record Selector */}
          <div className="space-y-3 lg:col-span-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Matching Records
            </div>
            {matches.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedMatch?.id === m.id
                    ? 'bg-slate-800 border-emerald-500/50 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{m.invoiceNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      m.status === 'EXCEPTION'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-0.5">
                  <p>PO: <span className="font-mono text-slate-200">{m.poNumber}</span></p>
                  <p>GRN: <span className="font-mono text-slate-200">{m.grnNumber}</span></p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">₦{(m.invoicePriceTotal / 1e6).toFixed(2)}M Billed</span>
                  {m.paymentBlocked && (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Hold
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Verification Panel */}
          {selectedMatch && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Three-Way Match Audit Verification</h3>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        selectedMatch.status === 'EXCEPTION'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {selectedMatch.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Audited by: {selectedMatch.checkedBy} on {new Date(selectedMatch.timestamp).toLocaleString()}
                  </p>
                </div>

                {selectedMatch.paymentBlocked ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <Lock className="h-4 w-4" />
                    <span>Payment Blocked</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <Unlock className="h-4 w-4" />
                    <span>Payment Released</span>
                  </div>
                )}
              </div>

              {/* Discrepancy Alert */}
              {selectedMatch.discrepancyMessage && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-200">Three-Way Match Discrepancy Detected</p>
                    <p className="text-xs text-rose-300 leading-relaxed">{selectedMatch.discrepancyMessage}</p>
                    <p className="text-[11px] text-rose-400/80 font-mono">
                      Accounting Safeguard Rule: Payment is automatically held until credit memo adjustment is posted or finance override is authorized.
                    </p>
                  </div>
                </div>
              )}

              {/* 3-Way Triangulation Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* 1. Purchase Order */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">1. Purchase Order</span>
                  <div className="font-mono text-sm font-bold text-white">{selectedMatch.poNumber}</div>
                  <p className="text-[11px] text-slate-300 font-mono">Ordered: {selectedMatch.poQuantityTotal} Units</p>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold">₦{(selectedMatch.poPriceTotal / 1e6).toFixed(2)}M</p>
                </div>

                {/* 2. Goods Receipt Note */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">2. Physical Receipt (GRN)</span>
                  <div className="font-mono text-sm font-bold text-white">{selectedMatch.grnNumber}</div>
                  <p className="text-[11px] text-amber-400 font-mono font-bold">Accepted: {selectedMatch.grnQuantityTotal} Units</p>
                  <p className="text-[11px] text-slate-400 font-mono">(7 damaged / missing)</p>
                </div>

                {/* 3. Vendor Invoice */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">3. Vendor Invoice</span>
                  <div className="font-mono text-sm font-bold text-white">{selectedMatch.invoiceNumber}</div>
                  <p className="text-[11px] text-rose-400 font-mono font-bold">Billed: {selectedMatch.invoiceQuantityTotal} Units</p>
                  <p className="text-[11px] text-white font-mono font-bold">₦{(selectedMatch.invoicePriceTotal / 1e6).toFixed(2)}M</p>
                </div>
              </div>

              {/* Override Authorization Controls */}
              {selectedMatch.paymentBlocked && (
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Authority Required: <span className="text-white font-semibold">FINANCE MANAGER or SUPER ADMIN</span>
                  </div>
                  <button
                    onClick={() => handleAuthorizeException(selectedMatch.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Authorize Payment with Credit Note Adjustment</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. PROGRAMME BUDGET FINANCIALS VIEW */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((b) => (
              <div
                key={b.programId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{b.programName}</h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {b.budgetUtilizationPct.toFixed(1)}% Spent
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Approved Allocation: ₦{(b.approvedBudget / 1e6).toFixed(1)}M</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(b.receivedExpensedAmount / b.approvedBudget) * 100}%` }}
                    title="Expensed"
                  />
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${((b.committedAmount - b.receivedExpensedAmount) / b.approvedBudget) * 100}%` }}
                    title="Committed"
                  />
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">Committed</span>
                    <p className="font-bold text-blue-400">₦{(b.committedAmount / 1e6).toFixed(1)}M</p>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">Expensed</span>
                    <p className="font-bold text-emerald-400">₦{(b.receivedExpensedAmount / 1e6).toFixed(1)}M</p>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">Paid Out</span>
                    <p className="font-bold text-white">₦{(b.paidAmount / 1e6).toFixed(1)}M</p>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">Remaining</span>
                    <p className="font-bold text-teal-400">₦{(b.availableBudget / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
