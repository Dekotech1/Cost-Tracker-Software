import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Package,
  Truck,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ArrowUpDown,
  Filter,
  Layers,
  ArrowRight,
  Landmark,
  Clock,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser } from '../../types/erp';

interface ErpDashboardProps {
  currentUser: EnterpriseUser;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: (type: string) => void;
}

export default function ErpDashboard({ currentUser, setActiveTab, onOpenCreateModal }: ErpDashboardProps) {
  // Sort state for user request #1: "Under Dashboard replace solar inventory statistics with inventory statistics. let the statistic be sort by Items, specification, OEM"
  const [inventorySortBy, setInventorySortBy] = useState<'item' | 'specification' | 'oem'>('item');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const programs = erpService.getPrograms();
  const communities = erpService.getCommunities();
  const items = erpService.getItems();
  const balances = erpService.getStockBalances();
  const requisitions = erpService.getRequisitions();
  const purchaseOrders = erpService.getPurchaseOrders();
  const transfers = erpService.getTransfers();
  const waybills = erpService.getWaybills();
  const matches = erpService.getThreeWayMatches();

  // Financial computations
  const totalInventoryValuation = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.totalValuation, 0);
  }, [balances]);

  const totalBudgetApproved = useMemo(() => {
    return programs.reduce((sum, p) => sum + p.approvedBudget, 0);
  }, [programs]);

  const totalBudgetCommitted = useMemo(() => {
    return programs.reduce((sum, p) => sum + p.committedBudget, 0);
  }, [programs]);

  const activeTransfersCount = useMemo(() => {
    return transfers.filter((t) => t.status === 'In Transit' || t.status === 'Dispatched').length;
  }, [transfers]);

  const exceptionsCount = useMemo(() => {
    return matches.filter((m) => m.status === 'EXCEPTION').length;
  }, [matches]);

  // Inventory Statistics aggregated across stores and sorted by Items, Specification, OEM
  const inventoryStatistics = useMemo(() => {
    // Map items with aggregate quantities across all stores
    const aggregated = items.map((item) => {
      const itemBalances = balances.filter((b) => b.itemId === item.id);
      const totalOnHand = itemBalances.reduce((sum, b) => sum + b.onHandQuantity, 0);
      const totalAvailable = itemBalances.reduce((sum, b) => sum + b.availableQuantity, 0);
      const totalReserved = itemBalances.reduce((sum, b) => sum + b.reservedQuantity, 0);
      const totalInTransit = itemBalances.reduce((sum, b) => sum + b.inTransitQuantity, 0);
      const totalQuarantined = itemBalances.reduce((sum, b) => sum + b.quarantinedQuantity, 0);
      const totalValue = totalOnHand * item.standardCost;

      // Specification string
      const specification =
        item.category === 'SOLAR PANELS'
          ? `${item.solarCapacityTier || ''} (${item.voltageRating || 'PERC'})`
          : item.voltageRating || item.subcategory || 'Standard OEM Spec';

      const oem = item.brand || item.manufacturer || 'Generic OEM';

      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        specification,
        oem,
        unitOfMeasure: item.unitOfMeasure,
        standardCost: item.standardCost,
        totalOnHand,
        totalAvailable,
        totalReserved,
        totalInTransit,
        totalQuarantined,
        totalValue,
        reorderLevel: item.reorderLevel,
        isLowStock: totalOnHand <= item.reorderLevel,
      };
    });

    // Category filter
    const filtered = selectedCategory === 'ALL'
      ? aggregated
      : aggregated.filter((i) => i.category === selectedCategory);

    // Sorting by Items, Specification, or OEM
    return filtered.sort((a, b) => {
      if (inventorySortBy === 'item') {
        return a.name.localeCompare(b.name);
      } else if (inventorySortBy === 'specification') {
        return a.specification.localeCompare(b.specification);
      } else {
        return a.oem.localeCompare(b.oem);
      }
    });
  }, [items, balances, selectedCategory, inventorySortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & System Pulse Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Enterprise Dashboard
            </span>
            <span className="text-xs text-slate-400 font-mono">Role: {currentUser.role}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Renewable Energy Operations &amp; Supply Chain Pulse
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized visibility across {programs.length} Programmes, {communities.length} Communities, and 3-Tier Logistics Warehouses.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateModal('requisition')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            New Requisition
          </button>
          <button
            onClick={() => onOpenCreateModal('transfer')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Dispatch Transfer (STT)
          </button>
        </div>
      </div>

      {/* KEY ENTERPRISE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Valuation */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Inventory Valuation</span>
            <Package className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₦{(totalInventoryValuation / 1e6).toFixed(2)}M
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">DDP Valuation</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across Central, Regional, &amp; Field Stores
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Total Items in Master: {items.length}</span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              View Warehouse ➔
            </button>
          </div>
        </div>

        {/* Program Budgets */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Programme Committed Capex</span>
            <Landmark className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ₦{(totalBudgetCommitted / 1e6).toFixed(1)}M
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              of ₦{(totalBudgetApproved / 1e6).toFixed(0)}M
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${(totalBudgetCommitted / totalBudgetApproved) * 100}%` }}
            />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{((totalBudgetCommitted / totalBudgetApproved) * 100).toFixed(1)}% Budget Utilized</span>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Finance Controls ➔
            </button>
          </div>
        </div>

        {/* Transfers & Logistics Velocity */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Transfers In Transit (STT)</span>
            <Truck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{activeTransfersCount}</span>
            <span className="text-[10px] text-indigo-400 font-mono">Shipments Highway Bound</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tracked with Digital Verification Hashes
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{waybills.length} Total Waybills</span>
            <button
              onClick={() => setActiveTab('waybills')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Waybills &amp; GPS ➔
            </button>
          </div>
        </div>

        {/* 3-Way Match Audit Guard */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>3-Way Match Exceptions</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{exceptionsCount}</span>
            <span className="text-[10px] text-amber-400 font-mono">Payments Blocked</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Automated PO vs GRN vs Invoice Safeguard
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Zero Overpayment Policy</span>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Review Exception ➔
            </button>
          </div>
        </div>
      </div>

      {/* USER REQUEST #1 FULFILLMENT: INVENTORY STATISTICS SORTABLE BY ITEMS, SPECIFICATION, OEM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Inventory Statistics</h2>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {inventoryStatistics.length} Items Listed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-store consolidated inventory metrics sorted by Items, Specification, and OEM manufacturer.
            </p>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Toggle Buttons (User Request #1) */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 p-1 rounded-xl">
              <span className="text-[10px] text-slate-400 px-2 font-mono flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-emerald-400" /> Sort by:
              </span>
              <button
                id="sort-by-items-btn"
                onClick={() => setInventorySortBy('item')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  inventorySortBy === 'item'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Items
              </button>
              <button
                id="sort-by-specification-btn"
                onClick={() => setInventorySortBy('specification')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  inventorySortBy === 'specification'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Specification
              </button>
              <button
                id="sort-by-oem-btn"
                onClick={() => setInventorySortBy('oem')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  inventorySortBy === 'oem'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                OEM
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded-xl">
              <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
              <select
                id="dashboard-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-900">All Categories (12)</option>
                <option value="SOLAR PANELS" className="bg-slate-900">Solar Panels</option>
                <option value="INVERTERS" className="bg-slate-900">Inverters</option>
                <option value="BATTERIES" className="bg-slate-900">Batteries</option>
                <option value="CHARGE CONTROLLERS" className="bg-slate-900">Charge Controllers</option>
                <option value="CABLES" className="bg-slate-900">Cables</option>
                <option value="MOUNTING STRUCTURES" className="bg-slate-900">Mounting Structures</option>
                <option value="PROTECTION EQUIPMENT" className="bg-slate-900">Protection Equipment</option>
                <option value="ELECTRICAL COMPONENTS" className="bg-slate-900">Electrical Components</option>
                <option value="TOOLS" className="bg-slate-900">Tools</option>
                <option value="SPARE PARTS" className="bg-slate-900">Spare Parts</option>
                <option value="CONSUMABLES" className="bg-slate-900">Consumables</option>
                <option value="OTHER MATERIALS" className="bg-slate-900">Other Materials</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Statistics Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">
                  <span className={inventorySortBy === 'item' ? 'text-emerald-400 font-bold' : ''}>
                    Item / SKU {inventorySortBy === 'item' && '▼'}
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className={inventorySortBy === 'specification' ? 'text-emerald-400 font-bold' : ''}>
                    Specification {inventorySortBy === 'specification' && '▼'}
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className={inventorySortBy === 'oem' ? 'text-emerald-400 font-bold' : ''}>
                    OEM Manufacturer {inventorySortBy === 'oem' && '▼'}
                  </span>
                </th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5 text-right">On Hand</th>
                <th className="py-3 px-3.5 text-right">Available</th>
                <th className="py-3 px-3.5 text-right">In Transit</th>
                <th className="py-3 px-3.5 text-right">Quarantined</th>
                <th className="py-3 px-3.5 text-right">Total Valuation</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {inventoryStatistics.map((stat) => (
                <tr key={stat.id} className="hover:bg-slate-800/40 transition">
                  {/* Item / SKU */}
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-white">{stat.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{stat.sku}</div>
                  </td>

                  {/* Specification */}
                  <td className="py-3 px-3.5">
                    <span className="font-mono text-xs text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                      {stat.specification}
                    </span>
                  </td>

                  {/* OEM */}
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-emerald-400">{stat.oem}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3.5">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {stat.category}
                    </span>
                  </td>

                  {/* On Hand */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    {stat.totalOnHand.toLocaleString()} {stat.unitOfMeasure}
                  </td>

                  {/* Available */}
                  <td className="py-3 px-3.5 text-right font-mono text-emerald-400">
                    {stat.totalAvailable.toLocaleString()}
                  </td>

                  {/* In Transit */}
                  <td className="py-3 px-3.5 text-right font-mono text-indigo-400">
                    {stat.totalInTransit > 0 ? stat.totalInTransit.toLocaleString() : '—'}
                  </td>

                  {/* Quarantined */}
                  <td className="py-3 px-3.5 text-right font-mono text-amber-400">
                    {stat.totalQuarantined > 0 ? (
                      <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {stat.totalQuarantined}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>

                  {/* Valuation */}
                  <td className="py-3 px-3.5 text-right font-mono font-medium text-slate-200">
                    ₦{stat.totalValue.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 text-center">
                    {stat.isLowStock ? (
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Optimal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO-COLUMN GRID: RECENT TRANSFERS & SMART PROCUREMENT SUGGESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Nationwide Inter-Store Transfers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Active Nationwide Logistics (STT)</h3>
            </div>
            <button
              onClick={() => setActiveTab('transfers')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              All Transfers ➔
            </button>
          </div>

          <div className="space-y-3">
            {transfers.map((stt) => (
              <div
                key={stt.id}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{stt.transferNumber}</span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.2 rounded-full font-medium">
                      {stt.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <span className="font-medium text-slate-200">{stt.sourceStoreName}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className="font-medium text-emerald-400">{stt.destinationStoreName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Carrier: {stt.carrierCompany} • Driver: {stt.driverName} ({stt.vehicleRegistration})
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <div className="text-[11px] font-mono text-slate-400">
                    {stt.items.reduce((s, i) => s + i.quantityDispatched, 0)} Units in Transit
                  </div>
                  <button
                    onClick={() => setActiveTab('waybills')}
                    className="mt-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-medium transition cursor-pointer"
                  >
                    View Waybill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Procurement Engine & Approval Workflows */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Smart Procurement Recommendations</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Inter-Store Transfer Priority
            </span>
          </div>

          <div className="space-y-3">
            {requisitions.slice(0, 3).map((pr) => (
              <div
                key={pr.id}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{pr.prNumber}</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.2 rounded-full">
                      {pr.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    ₦{(pr.estimatedTotalCost / 1e6).toFixed(2)}M
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Site: <span className="font-medium text-emerald-300">{pr.communityName}</span> (Prog: {pr.programName})
                </p>

                {/* Smart Procurement Banner */}
                {pr.items.some((item) => item.internalStockAvailableNear) && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-300 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-200">Internal Transfer Recommended</p>
                      <p className="text-[11px] text-emerald-400/90 mt-0.5">
                        Stock available at Apex National Central Depot (700 panels). Avoid external purchase order to save lead-time and procurement capex.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-mono">Req by {pr.requestingUserName}</span>
                  <button
                    onClick={() => setActiveTab('procurement')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Process Approval ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
