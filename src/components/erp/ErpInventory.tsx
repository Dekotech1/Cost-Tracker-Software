import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  History,
  Building2,
  ArrowUpDown,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import { EnterpriseUser, InventoryItemMaster, StoreStockBalance, InventoryStockTransaction } from '../../types/erp';

interface ErpInventoryProps {
  currentUser: EnterpriseUser;
  onOpenCreateItemModal: () => void;
  onOpenStockMovementModal: () => void;
}

export default function ErpInventory({ currentUser, onOpenCreateItemModal, onOpenStockMovementModal }: ErpInventoryProps) {
  const [activeTab, setActiveTab] = useState<'balances' | 'catalogue' | 'ledger'>('balances');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [solarTierFilter, setSolarTierFilter] = useState('ALL');

  const items = erpService.getItems();
  const balances = erpService.getStockBalances();
  const transactions = erpService.getStockTransactions();
  const stores = erpService.getStores();

  // Filter balances
  const filteredBalances = balances.filter((b) => {
    const matchesSearch =
      b.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || b.category === categoryFilter;
    const matchesStore = storeFilter === 'ALL' || b.storeId === storeFilter;
    return matchesSearch && matchesCat && matchesStore;
  });

  // Filter items in catalogue
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSolarTier = solarTierFilter === 'ALL' || item.solarCapacityTier === solarTierFilter;
    return matchesSearch && matchesCat && matchesSolarTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Multi-Store Inventory System</h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              12 Material Categories
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock tracking across Level 1 Central, Level 2 Regional, and Level 3 Field site depots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStockMovementModal}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            Record Movement
          </button>
          <button
            onClick={onOpenCreateItemModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            + New Item Master SKU
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'balances'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Store Stock Balances ({balances.length})
        </button>
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'catalogue'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Master Item Catalogue ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Movement Ledger ({transactions.length})
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU, name, store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All 12 Categories</option>
            <option value="SOLAR PANELS">Solar Panels</option>
            <option value="INVERTERS">Inverters</option>
            <option value="BATTERIES">Batteries</option>
            <option value="CHARGE CONTROLLERS">Charge Controllers</option>
            <option value="CABLES">Cables</option>
            <option value="MOUNTING STRUCTURES">Mounting Structures</option>
            <option value="PROTECTION EQUIPMENT">Protection Equipment</option>
            <option value="ELECTRICAL COMPONENTS">Electrical Components</option>
            <option value="TOOLS">Tools</option>
            <option value="SPARE PARTS">Spare Parts</option>
            <option value="CONSUMABLES">Consumables</option>
            <option value="OTHER MATERIALS">Other Materials</option>
          </select>

          {/* Store Filter for Balances */}
          {activeTab === 'balances' && (
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stores &amp; Depots</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.level.split(' ')[0]})</option>
              ))}
            </select>
          )}

          {/* Solar Panel Wattage Tiers */}
          {categoryFilter === 'SOLAR PANELS' && activeTab === 'catalogue' && (
            <select
              value={solarTierFilter}
              onChange={(e) => setSolarTierFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-emerald-400 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL">All Solar Tiers</option>
              <option value="600W+">600W+</option>
              <option value="550W">550W</option>
              <option value="500W">500W</option>
              <option value="450W">450W</option>
              <option value="400W">400W</option>
              <option value="300W">300W</option>
              <option value="250W">250W</option>
              <option value="200W">200W</option>
              <option value="100W">100W</option>
              <option value="50W">50W</option>
            </select>
          )}
        </div>
      </div>

      {/* 1. STORE STOCK BALANCES TABLE */}
      {activeTab === 'balances' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Store / Location</th>
                  <th className="py-3 px-3.5">Item Name &amp; SKU</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5 text-right">On Hand</th>
                  <th className="py-3 px-3.5 text-right">Reserved</th>
                  <th className="py-3 px-3.5 text-right">Available</th>
                  <th className="py-3 px-3.5 text-right">In Transit</th>
                  <th className="py-3 px-3.5 text-right">Quarantined</th>
                  <th className="py-3 px-3.5 text-right">Valuation (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBalances.map((bal) => (
                  <tr key={bal.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3.5 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{bal.storeName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{bal.itemName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{bal.itemSku}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {bal.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                      {bal.onHandQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-400">
                      {bal.reservedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                      {bal.availableQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-indigo-400">
                      {bal.inTransitQuantity > 0 ? bal.inTransitQuantity.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-amber-400">
                      {bal.quarantinedQuantity > 0 ? bal.quarantinedQuantity.toLocaleString() : '0'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-200">
                      ₦{bal.totalValuation.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ITEM MASTER CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg space-y-3 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{item.sku}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1 leading-snug">{item.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Standard Cost:</span>
                  <span className="font-mono font-bold text-white">₦{item.standardCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>OEM / Brand:</span>
                  <span className="text-emerald-300 font-medium">{item.brand || 'Generic'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Serial Tracking:</span>
                  <span className={item.requiresSerialTracking ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                    {item.requiresSerialTracking ? 'Mandatory' : 'Batch Only'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. AUDITED STOCK TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">Transaction Type</th>
                  <th className="py-3 px-3.5">Item &amp; SKU</th>
                  <th className="py-3 px-3.5 text-right">Quantity</th>
                  <th className="py-3 px-3.5 text-right">Balance Change</th>
                  <th className="py-3 px-3.5">Officer / Role</th>
                  <th className="py-3 px-3.5">Reference Doc</th>
                  <th className="py-3 px-3.5">Audit Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition font-sans">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          tx.transactionType === 'PURCHASE RECEIPT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : tx.transactionType === 'TRANSFER OUT'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{tx.itemName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{tx.itemSku}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                      {tx.beforeBalance} ➔ <span className="text-emerald-400 font-bold">{tx.afterBalance}</span>
                    </td>
                    <td className="py-3 px-3.5 text-[11px]">
                      <div className="text-white font-medium">{tx.userName}</div>
                      <div className="text-slate-500 text-[10px]">{tx.userRole}</div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-300">
                      {tx.referenceDocumentType}: {tx.referenceDocumentId || 'N/A'}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      {tx.digitalHash || 'verified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
