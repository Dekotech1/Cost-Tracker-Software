import React, { useState, useMemo } from 'react';
import {
  SerializedAsset,
  StoreWarehouse,
  RenewableProduct,
} from '../../types/logistics';
import {
  Barcode,
  Search,
  Filter,
  ShieldCheck,
  Truck,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  History,
  ExternalLink,
  Plus,
  Zap,
  Tag,
  Clock,
  X,
  QrCode,
} from 'lucide-react';

interface SerializedAssetTrackerProps {
  assets: SerializedAsset[];
  stores: StoreWarehouse[];
  products: RenewableProduct[];
  onAddAsset?: (asset: SerializedAsset) => void;
}

export default function SerializedAssetTracker({
  assets,
  stores,
  products,
  onAddAsset,
}: SerializedAssetTrackerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<SerializedAsset | null>(null);

  // Quick Asset Registration Modal
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [newSerial, setNewSerial] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find((p) => p.requiresSerialization)?.id || products[0]?.id || ''
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || '');
  const [productionDate, setProductionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Barcode Scanner Simulator
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSerial = a.serialNumber.toLowerCase().includes(q);
        const matchProduct = a.productName.toLowerCase().includes(q);
        const matchStore = a.currentStoreName.toLowerCase().includes(q);
        const matchSku = a.sku.toLowerCase().includes(q);
        if (!matchSerial && !matchProduct && !matchStore && !matchSku) return false;
      }
      return true;
    });
  }, [assets, statusFilter, categoryFilter, searchQuery]);

  const handleRegisterNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    const store = stores.find((s) => s.id === selectedStoreId);
    if (!product || !store || !newSerial) return;

    const created: SerializedAsset = {
      serialNumber: newSerial.trim().toUpperCase(),
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      category: product.category,
      brand: product.brand,
      currentStoreId: store.id,
      currentStoreName: store.name,
      status: 'In Warehouse',
      productionDate,
      warrantyExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Initial Serialized Intake',
          location: store.name,
          details: `Registered into inventory dock at ${store.name}`,
          performer: 'Store Logistics Clerk',
        },
      ],
    };

    if (onAddAsset) {
      onAddAsset(created);
    }
    setIsRegistering(false);
    setNewSerial('');
  };

  const handleSimulateScan = (serial: string) => {
    setSearchQuery(serial);
    setScannedFeedback(`Simulated Scan Match: ${serial}`);
    setTimeout(() => {
      setScannedFeedback(null);
      setIsScannerOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Barcode className="h-5 w-5 text-indigo-400" />
            Serialized Asset Tracking & Provenance
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Unit-level serialization for high-value hybrid inverters, battery storage banks, and charge controllers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span>Barcode / QR Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>Register Serial Unit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-white/50">Total Tracked Assets</span>
          <p className="text-xl font-bold text-white font-mono mt-0.5">{assets.length} Units</p>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-white/50">In Regional Warehouses</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {assets.filter((a) => a.status === 'In Warehouse').length} Units
          </p>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-white/50">In Transit on STT</span>
          <p className="text-xl font-bold text-amber-300 font-mono mt-0.5">
            {assets.filter((a) => a.status === 'In Transit').length} Units
          </p>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-white/50">High-Value Categories</span>
          <p className="text-xl font-bold text-indigo-300 font-mono mt-0.5">Inverters & LiFePO4</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search serial number, SKU, or store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Statuses</option>
            <option value="In Warehouse" className="bg-slate-900 text-white">In Warehouse</option>
            <option value="In Transit" className="bg-slate-900 text-white">In Transit</option>
            <option value="Allocated to Site" className="bg-slate-900 text-white">Allocated to Site</option>
            <option value="Installed" className="bg-slate-900 text-white">Installed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="All" className="bg-slate-900 text-white">All Categories</option>
            <option value="Inverters" className="bg-slate-900 text-white">Inverters</option>
            <option value="Energy Storage/Batteries" className="bg-slate-900 text-white">Energy Storage/Batteries</option>
            <option value="Charge Controllers" className="bg-slate-900 text-white">Charge Controllers</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.serialNumber}
            onClick={() => setSelectedAsset(asset)}
            className="bg-slate-900/90 border border-white/10 hover:border-indigo-400/50 cursor-pointer transition-all rounded-2xl p-4 shadow-lg space-y-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                  <Barcode className="h-3.5 w-3.5" />
                  {asset.serialNumber}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1 group-hover:text-indigo-200 transition-colors">
                  {asset.productName}
                </h4>
                <p className="text-[11px] text-white/50 font-mono">{asset.sku} • {asset.brand}</p>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                  asset.status === 'In Warehouse'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : asset.status === 'In Transit'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse'
                    : 'bg-white/10 text-white/70 border-white/20'
                }`}
              >
                {asset.status}
              </span>
            </div>

            <div className="bg-black/20 rounded-xl p-2.5 border border-white/5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span className="text-[10px] font-mono text-white/40 uppercase">Current Location:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">{asset.currentStoreName}</span>
              </div>
              {asset.currentTransferId && (
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                  <span>En-Route Manifest:</span>
                  <span>{asset.currentTransferId}</span>
                </div>
              )}
              {asset.warrantyExpiry && (
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>Warranty To:</span>
                  <span>{asset.warrantyExpiry}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5 font-mono">
              <span>{asset.history.length} Chain-of-Custody Event(s)</span>
              <span className="text-indigo-400 group-hover:underline">View History &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {/* ASSET PROVENANCE DETAIL MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
                  Asset Provenance & Tracking Record
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">{selectedAsset.serialNumber}</h3>
                <p className="text-xs text-white/60">{selectedAsset.productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-xl p-3 border border-white/10 text-xs font-mono">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">SKU</span>
                <span className="text-white font-bold">{selectedAsset.sku}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Current Location</span>
                <span className="text-amber-300 font-bold">{selectedAsset.currentStoreName}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Status</span>
                <span className="text-emerald-400 font-bold">{selectedAsset.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Warranty Expiration</span>
                <span className="text-white">{selectedAsset.warrantyExpiry || '5-Year Standard'}</span>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                Chain of Custody Movement History:
              </span>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {selectedAsset.history.map((event, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-indigo-300">{event.action}</span>
                      <span className="text-[10px] text-white/40">{new Date(event.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/80 text-[11px]">{event.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-white/40 font-mono pt-1">
                      <span>Location: {event.location}</span>
                      <span>Handler: {event.performer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE SCANNER SIMULATOR MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Barcode & Optical QR Scanner</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scanner Visualizer viewfinder */}
            <div className="relative h-44 bg-black rounded-xl border border-indigo-500/30 overflow-hidden flex flex-col items-center justify-center text-center p-4">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-pulse"></div>
              <Barcode className="h-12 w-12 text-indigo-400/40" />
              <p className="text-xs text-white/60 mt-2 font-mono">Align warehouse camera with asset barcode tag</p>
              {scannedFeedback && (
                <div className="absolute inset-0 bg-indigo-600/90 flex items-center justify-center text-white font-mono font-bold text-xs">
                  {scannedFeedback}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-white/50 uppercase block">
                Quick Test Scan Presets (Click to simulate scan):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {assets.slice(0, 4).map((a) => (
                  <button
                    key={a.serialNumber}
                    type="button"
                    onClick={() => handleSimulateScan(a.serialNumber)}
                    className="p-2 bg-white/5 hover:bg-indigo-500/20 text-left border border-white/10 rounded-lg text-[11px] font-mono text-indigo-300 truncate"
                  >
                    {a.serialNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ASSET REGISTRATION MODAL */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRegisterNewAsset}
            className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white">Register Serialized Asset</h4>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Serial Number / Asset Tag</label>
              <input
                type="text"
                required
                placeholder="e.g. SN-DYE-2026-0099"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-400 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Hardware Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {products
                  .filter((p) => p.requiresSerialization)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Receiving Warehouse</label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Production Date</label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors"
              >
                Register Unit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
