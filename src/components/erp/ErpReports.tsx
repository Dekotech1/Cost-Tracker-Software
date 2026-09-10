import React, { useState } from 'react';
import { BarChart3, Download, FileText, Printer, PieChart, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { erpService } from '../../services/erpStorageService';

export default function ErpReports() {
  const [reportType, setReportType] = useState('inventory-valuation');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const balances = erpService.getStockBalances();
  const programs = erpService.getPrograms();
  const transfers = erpService.getTransfers();
  const poList = erpService.getPurchaseOrders();

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'inventory-valuation') {
      csvContent += 'Store,Item,SKU,Category,On Hand,Available,Unit Cost (NGN),Total Valuation (NGN)\n';
      balances.forEach((b) => {
        csvContent += `"${b.storeName}","${b.itemName}","${b.itemSku}","${b.category}",${b.onHandQuantity},${b.availableQuantity},${b.averageUnitCost},${b.totalValuation}\n`;
      });
    } else {
      csvContent += 'Program,Code,Donor,Approved Budget,Committed,Spend,Status\n';
      programs.forEach((p) => {
        csvContent += `"${p.name}","${p.code}","${p.clientDonor}",${p.approvedBudget},${p.committedBudget},${p.actualSpend},"${p.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erp_report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Management Reports</h1>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Real-time Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated inventory valuation, procurement lead times, budget burn velocity, and logistics efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Report CSV generated and downloaded successfully.</span>
        </div>
      )}

      {/* Report Selector Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setReportType('inventory-valuation')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === 'inventory-valuation'
              ? 'bg-slate-800 border-emerald-500/50 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <p className="font-bold text-white text-xs">Inventory Valuation Report</p>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tier warehouse valuation, stock reserves, and quarantine breakdown.</p>
        </button>

        <button
          onClick={() => setReportType('programme-budget')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === 'programme-budget'
              ? 'bg-slate-800 border-emerald-500/50 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <p className="font-bold text-white text-xs">Programme Budget Burn Rate</p>
          <p className="text-[11px] text-slate-400 mt-1">Capex allocations, PO commitments, and donor expense variance.</p>
        </button>

        <button
          onClick={() => setReportType('logistics-velocity')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === 'logistics-velocity'
              ? 'bg-slate-800 border-emerald-500/50 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <p className="font-bold text-white text-xs">Logistics &amp; Transfer Velocity</p>
          <p className="text-[11px] text-slate-400 mt-1">Inter-store transfer transit times, carrier performance, and delivery rates.</p>
        </button>
      </div>

      {/* Report Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {reportType === 'inventory-valuation'
              ? 'Consolidated Store Valuation Data'
              : reportType === 'programme-budget'
              ? 'Programme Capex Allocation Summary'
              : 'Inter-Store Transfers Transit Performance'}
          </span>
          <span className="text-xs font-mono text-slate-500">Generated: {new Date().toLocaleDateString()}</span>
        </div>

        {reportType === 'inventory-valuation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Depot Store</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">On Hand</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Valuation (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {balances.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 text-white font-medium">{b.storeName}</td>
                    <td className="py-2 px-3">{b.itemName}</td>
                    <td className="py-2 px-3 text-slate-400">{b.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-white font-bold">{b.onHandQuantity}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">₦{b.averageUnitCost.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">₦{b.totalValuation.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'programme-budget' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Programme</th>
                  <th className="py-2.5 px-3">Donor / Client</th>
                  <th className="py-2.5 px-3 text-right">Approved Budget</th>
                  <th className="py-2.5 px-3 text-right">Committed</th>
                  <th className="py-2.5 px-3 text-right">Actual Spend</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {programs.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 text-white font-bold">{p.name}</td>
                    <td className="py-2 px-3 text-slate-300">{p.clientDonor}</td>
                    <td className="py-2 px-3 text-right font-mono text-white">₦{(p.approvedBudget / 1e6).toFixed(1)}M</td>
                    <td className="py-2 px-3 text-right font-mono text-blue-400">₦{(p.committedBudget / 1e6).toFixed(1)}M</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">₦{(p.actualSpend / 1e6).toFixed(1)}M</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'logistics-velocity' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Transfer STT#</th>
                  <th className="py-2.5 px-3">Source Store</th>
                  <th className="py-2.5 px-3">Destination Store</th>
                  <th className="py-2.5 px-3">Carrier / Driver</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 px-3 font-mono text-white font-bold">{t.transferNumber}</td>
                    <td className="py-2 px-3 text-slate-300">{t.sourceStoreName}</td>
                    <td className="py-2 px-3 text-emerald-400">{t.destinationStoreName}</td>
                    <td className="py-2 px-3 text-slate-400">{t.carrierCompany} ({t.driverName})</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
