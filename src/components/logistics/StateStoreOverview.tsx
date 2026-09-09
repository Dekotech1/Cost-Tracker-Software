import React, { useState, useMemo } from 'react';
import {
  StoreWarehouse,
  RenewableProduct,
  InterStoreTransfer,
  DynamicStockBalance,
} from '../../types/logistics';
import {
  Warehouse,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface StateStoreOverviewProps {
  stores: StoreWarehouse[];
  products: RenewableProduct[];
  transfers: InterStoreTransfer[];
  stockBalances: DynamicStockBalance[];
  onSelectStore?: (storeId: string) => void;
  onInitiateTransferToStore?: (storeId: string) => void;
}

export default function StateStoreOverview({
  stores,
  products,
  transfers,
  stockBalances,
  onSelectStore,
  onInitiateTransferToStore,
}: StateStoreOverviewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Aggregate Nationwide Metrics
  const metrics = useMemo(() => {
    let totalValuation = 0;
    let totalItems = 0;
    let totalSqMeters = 0;

    stores.forEach((s) => {
      totalSqMeters += s.capacitySqMeters;
    });

    stockBalances.forEach((b) => {
      totalValuation += b.totalValuation;
      totalItems += b.currentStock;
    });

    const activeTransfers = transfers.filter((t) => t.status === 'In Transit' || t.status === 'Approved');
    const lowStockAlerts = stockBalances.filter((b) => b.reorderRequired);

    return {
      totalValuation,
      totalItems,
      totalSqMeters,
      activeTransfersCount: activeTransfers.length,
      lowStockAlertsCount: lowStockAlerts.length,
    };
  }, [stores, stockBalances, transfers]);

  // Filtered Stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (selectedRegion !== 'All' && s.region !== selectedRegion) return false;
      if (selectedStatus !== 'All' && s.operatingStatus !== selectedStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchState = s.state.toLowerCase().includes(query);
        const matchMgr = s.storeManagerName.toLowerCase().includes(query);
        if (!matchName && !matchState && !matchMgr) return false;
      }
      return true;
    });
  }, [stores, selectedRegion, selectedStatus, searchQuery]);

  // Per Store Stock Calculation
  const storeStockSummaries = useMemo(() => {
    const map: Record<
      string,
      {
        totalValue: number;
        itemCount: number;
        lowStockItems: DynamicStockBalance[];
        outOfStockItems: DynamicStockBalance[];
      }
    > = {};

    stores.forEach((s) => {
      map[s.id] = { totalValue: 0, itemCount: 0, lowStockItems: [], outOfStockItems: [] };
    });

    stockBalances.forEach((b) => {
      if (!map[b.storeId]) {
        map[b.storeId] = { totalValue: 0, itemCount: 0, lowStockItems: [], outOfStockItems: [] };
      }
      map[b.storeId].totalValue += b.totalValuation;
      map[b.storeId].itemCount += b.currentStock;

      if (b.currentStock <= 0) {
        map[b.storeId].outOfStockItems.push(b);
      } else if (b.reorderRequired) {
        map[b.storeId].lowStockItems.push(b);
      }
    });

    return map;
  }, [stores, stockBalances]);

  // In-Transit and Pending Active Transfers
  const activeRouteTransfers = useMemo(() => {
    return transfers
      .filter((t) => t.status === 'In Transit' || t.status === 'Approved' || t.status === 'Requested')
      .slice(0, 4);
  }, [transfers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Nationwide Inventory Value</span>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2 font-mono tracking-tight">
            {formatCurrency(metrics.totalValuation)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
            <span className="text-emerald-400 font-semibold">{metrics.totalItems.toLocaleString()} units</span>
            <span>across {stores.length} state warehouses</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Regional Stores Active</span>
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            {stores.filter((s) => s.operatingStatus === 'Active').length} <span className="text-sm font-normal text-white/40">/ {stores.length} hubs</span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
            <span className="text-indigo-300 font-mono">{metrics.totalSqMeters.toLocaleString()} m²</span>
            <span>total warehousing footprint</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Active Highway Transfers</span>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Truck className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-300 mt-2 font-mono tracking-tight">
            {metrics.activeTransfersCount} In-Motion
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
            <span>Inter-state STT shipments en route</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Low Stock Warnings</span>
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-400 mt-2 font-mono tracking-tight">
            {metrics.lowStockAlertsCount} SKUs
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
            <span>Below store-specific minimum threshold</span>
          </div>
        </div>
      </div>

      {/* Active Inter-State Transfer Routes Carousel / Highlights */}
      {activeRouteTransfers.length > 0 && (
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Active Inter-State Highway Movements</h3>
                <p className="text-xs text-white/50">Real-time transit manifests moving renewable energy assets between states</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-white/70">
              {activeRouteTransfers.length} Active Corridors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {activeRouteTransfers.map((transfer) => {
              const isHazardous = transfer.containsHazardousMaterials;
              return (
                <div
                  key={transfer.id}
                  className="bg-white/5 hover:bg-white/[0.08] transition-all border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {transfer.id}
                      </span>
                      {isHazardous && (
                        <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Hazmat UN3480
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        transfer.status === 'In Transit'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                          : transfer.status === 'Approved'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : 'bg-white/10 border-white/20 text-white/70'
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </div>

                  {/* Route Visualizer */}
                  <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Origin Store</span>
                      <p className="text-xs font-semibold text-white">{transfer.originState}</p>
                      <p className="text-[10px] text-white/50 truncate max-w-[130px]">{transfer.originStoreName}</p>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      <span className="text-[9px] font-mono text-white/40 mt-1">{transfer.logisticsVendor.split(' ')[0]}</span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Destination Store</span>
                      <p className="text-xs font-semibold text-white">{transfer.destinationState}</p>
                      <p className="text-[10px] text-white/50 truncate max-w-[130px]">{transfer.destinationStoreName}</p>
                    </div>
                  </div>

                  {/* Manifest Meta */}
                  <div className="flex items-center justify-between text-xs text-white/60 border-t border-white/5 pt-2 font-mono">
                    <span>{transfer.totalQuantity} items ({formatCurrency(transfer.totalValuation)})</span>
                    <span className="text-white/40">Waybill: {transfer.waybillNumber || 'Pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stores, states, or managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Filter className="h-3.5 w-3.5 text-white/40" />
            <span>Region:</span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Regions (Nationwide)</option>
            <option value="South-West" className="bg-slate-900 text-white">South-West</option>
            <option value="North-Central" className="bg-slate-900 text-white">North-Central</option>
            <option value="North-West" className="bg-slate-900 text-white">North-West</option>
            <option value="South-South" className="bg-slate-900 text-white">South-South</option>
            <option value="South-East" className="bg-slate-900 text-white">South-East</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Operating Statuses</option>
            <option value="Active" className="bg-slate-900 text-white">Active Only</option>
            <option value="Maintenance" className="bg-slate-900 text-white">Maintenance Only</option>
          </select>
        </div>
      </div>

      {/* State Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => {
          const summary = storeStockSummaries[store.id] || {
            totalValue: 0,
            itemCount: 0,
            lowStockItems: [],
            outOfStockItems: [],
          };
          const hasLowStock = summary.lowStockItems.length > 0 || summary.outOfStockItems.length > 0;

          return (
            <div
              key={store.id}
              className="bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4 group relative"
            >
              {/* Store Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {store.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          store.operatingStatus === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {store.operatingStatus}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {store.name}
                    </h4>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60">
                    <Warehouse className="h-5 w-5" />
                  </div>
                </div>

                {/* State & Location info */}
                <div className="mt-3 space-y-1.5 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-white font-medium">{store.state}</span>
                    <span className="text-white/40">({store.region})</span>
                  </div>
                  <p className="text-[11px] text-white/50 line-clamp-1 pl-5">{store.exactAddress}</p>
                </div>

                {/* Store Manager */}
                <div className="mt-3 bg-white/5 rounded-xl p-2.5 border border-white/5 text-xs space-y-0.5">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Store In-Charge</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{store.storeManagerName}</span>
                    <span className="text-[11px] font-mono text-white/60">{store.storeManagerContact}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Inventory Highlights */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Total Stock Valuation</span>
                    <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {formatCurrency(summary.totalValue)}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Capacity & Units</span>
                    <p className="text-sm font-bold text-white mt-0.5 font-mono">
                      {summary.itemCount.toLocaleString()} <span className="text-xs text-white/40 font-normal">/ {store.capacitySqMeters} m²</span>
                    </p>
                  </div>
                </div>

                {/* Low Stock Warning Alert Pill */}
                {hasLowStock ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-rose-300">
                        {summary.outOfStockItems.length > 0
                          ? `${summary.outOfStockItems.length} Out of Stock, ${summary.lowStockItems.length} Low Stock`
                          : `${summary.lowStockItems.length} Low Stock Alerts`}
                      </span>
                      <p className="text-[11px] text-rose-200/60 mt-0.5">
                        Requires inter-store transfer replenishment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-300">Stock thresholds healthy across all SKUs</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {onInitiateTransferToStore && (
                  <button
                    type="button"
                    onClick={() => onInitiateTransferToStore(store.id)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/10"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Transfer Stock Here</span>
                  </button>
                )}
                {onSelectStore && (
                  <button
                    type="button"
                    onClick={() => onSelectStore(store.id)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-xl flex items-center gap-1 transition-colors"
                    title="View Detailed Store Ledger"
                  >
                    <span>View</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
