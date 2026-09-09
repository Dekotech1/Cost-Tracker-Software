import React, { useState, useMemo } from 'react';
import {
  DynamicStockBalance,
  StoreWarehouse,
  RenewableProduct,
  ProductCategory,
} from '../../types/logistics';
import {
  Calculator,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Download,
  Warehouse,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Package,
} from 'lucide-react';

interface DynamicStockBalancesViewProps {
  balances: DynamicStockBalance[];
  stores: StoreWarehouse[];
  products: RenewableProduct[];
}

export default function DynamicStockBalancesView({
  balances,
  stores,
  products,
}: DynamicStockBalancesViewProps) {
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [onlyReorderRequired, setOnlyReorderRequired] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBalances = useMemo(() => {
    return balances.filter((b) => {
      if (selectedStoreFilter !== 'All' && b.storeId !== selectedStoreFilter) return false;
      if (selectedCategoryFilter !== 'All' && b.category !== selectedCategoryFilter) return false;
      if (onlyReorderRequired && !b.reorderRequired) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSku = b.sku.toLowerCase().includes(q);
        const matchProd = b.productName.toLowerCase().includes(q);
        const matchStore = b.storeName.toLowerCase().includes(q);
        if (!matchSku && !matchProd && !matchStore) return false;
      }
      return true;
    });
  }, [balances, selectedStoreFilter, selectedCategoryFilter, onlyReorderRequired, searchQuery]);

  const summary = useMemo(() => {
    let totalVal = 0;
    let totalUnits = 0;
    let lowStockCount = 0;
    filteredBalances.forEach((b) => {
      totalVal += b.totalValuation;
      totalUnits += b.currentStock;
      if (b.reorderRequired) lowStockCount++;
    });
    return { totalVal, totalUnits, lowStockCount };
  }, [filteredBalances]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    const headers = [
      'Store ID',
      'Store Name',
      'SKU',
      'Product Name',
      'Category',
      'Initial CMS Stock',
      'Inward Transfers (+)',
      'Purchases (+)',
      'Outward Transfers (-)',
      'Site Dispatch (-)',
      'Current Calculated Stock',
      'Min Threshold',
      'Reorder Alert',
      'Total Valuation (NGN)',
    ];

    const rows = filteredBalances.map((b) => [
      b.storeId,
      `"${b.storeName}"`,
      b.sku,
      `"${b.productName}"`,
      b.category,
      b.initialCmsStock,
      b.inwardTransfers,
      b.purchases,
      b.outwardTransfers,
      b.siteDispatch,
      b.currentStock,
      b.minThreshold,
      b.reorderRequired ? 'YES' : 'NO',
      b.totalValuation,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dynamic_stock_balances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Formula Explanation Callout */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Dynamic Store Stock Calculation Engine
          </h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Stock levels are continuously computed from immutable ledger transactions:
        </p>
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs text-amber-300 flex flex-wrap items-center gap-2">
          <span className="text-white font-bold">Current Warehouse Balance =</span>
          <span>Initial CMS Base Stock</span>
          <span className="text-emerald-400 font-bold">+ Inward STT Transfers</span>
          <span className="text-emerald-400 font-bold">+ Purchase Inwards</span>
          <span className="text-rose-400 font-bold">- Outward STT Transfers</span>
          <span className="text-rose-400 font-bold">- Site Deployments</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, product, or store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Warehouse Locations</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.state})
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Categories</option>
            <option value="Solar Panels" className="bg-slate-900 text-white">Solar Panels</option>
            <option value="Inverters" className="bg-slate-900 text-white">Inverters</option>
            <option value="Energy Storage/Batteries" className="bg-slate-900 text-white">Energy Storage/Batteries</option>
            <option value="Charge Controllers" className="bg-slate-900 text-white">Charge Controllers</option>
            <option value="BOS/Cabling" className="bg-slate-900 text-white">BOS/Cabling</option>
            <option value="Mounting Hardware" className="bg-slate-900 text-white">Mounting Hardware</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={onlyReorderRequired}
              onChange={(e) => setOnlyReorderRequired(e.target.checked)}
              className="rounded border-white/20 text-rose-500 focus:ring-rose-400"
            />
            <span>Low Stock Alerts Only</span>
          </label>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors font-mono"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stock Ledger Table */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-white/10 text-white/60 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Warehouse & SKU</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-2 text-right">Initial CMS</th>
                <th className="py-3 px-2 text-right text-emerald-400">Inward STT</th>
                <th className="py-3 px-2 text-right text-rose-400">Outward STT</th>
                <th className="py-3 px-2 text-right text-rose-400">Site Deploy</th>
                <th className="py-3 px-3 text-right font-bold text-white">Calculated Stock</th>
                <th className="py-3 px-2 text-right">Min Reorder</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredBalances.map((b) => (
                <tr key={`${b.storeId}-${b.productId}`} className="hover:bg-white/5 transition-colors font-mono">
                  <td className="py-3 px-4">
                    <span className="font-bold text-amber-300 block">{b.sku}</span>
                    <span className="text-[11px] text-white/50">{b.storeName}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="font-semibold text-white block truncate max-w-[200px]">{b.productName}</span>
                    <span className="text-[10px] text-white/40">{b.category}</span>
                  </td>
                  <td className="py-3 px-2 text-right text-white/70">{b.initialCmsStock}</td>
                  <td className="py-3 px-2 text-right text-emerald-400 font-bold">+{b.inwardTransfers}</td>
                  <td className="py-3 px-2 text-right text-rose-400">-{b.outwardTransfers}</td>
                  <td className="py-3 px-2 text-right text-rose-300">-{b.siteDispatch}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-white text-sm bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {b.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-white/60">{b.minThreshold}</td>
                  <td className="py-3 px-3 text-center">
                    {b.currentStock <= 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Out of Stock
                      </span>
                    ) : b.reorderRequired ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Reorder Needed
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Optimal Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-400">
                    {formatCurrency(b.totalValuation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Summary Footer */}
        <div className="bg-black/40 border-t border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3 text-white/60">
            <span>Displaying {filteredBalances.length} stock line items</span>
            {summary.lowStockCount > 0 && (
              <span className="text-amber-400 font-bold">• {summary.lowStockCount} Reorder Alerts</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60">Total Units: {summary.totalUnits.toLocaleString()}</span>
            <span className="text-white font-semibold">
              Valuation: <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(summary.totalVal)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
