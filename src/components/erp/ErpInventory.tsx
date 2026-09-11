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
  Trash2,
  Edit3,
  X,
  Boxes,
  Cpu,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  LayoutGrid,
  List,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import {
  EnterpriseUser,
  InventoryItemMaster,
  StoreStockBalance,
  InventoryStockTransaction,
  EnterpriseStore,
  InventoryCategory,
  SolarCapacityTier,
  InventoryTransactionType,
} from '../../types/erp';

interface ErpInventoryProps {
  currentUser: EnterpriseUser;
  onOpenCreateItemModal?: () => void;
  onOpenStockMovementModal?: () => void;
}

export default function ErpInventory({
  currentUser,
  onOpenCreateItemModal,
  onOpenStockMovementModal,
}: ErpInventoryProps) {
  const [activeTab, setActiveTab] = useState<'balances' | 'catalogue' | 'ledger'>('balances');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [solarTierFilter, setSolarTierFilter] = useState('ALL');
  const [catalogueViewMode, setCatalogueViewMode] = useState<'grid' | 'table'>('grid');

  // Live state connected to erpStorageService
  const [items, setItems] = useState<InventoryItemMaster[]>(() => erpService.getItems());
  const [balances, setBalances] = useState<StoreStockBalance[]>(() => erpService.getStockBalances());
  const [transactions, setTransactions] = useState<InventoryStockTransaction[]>(() =>
    erpService.getStockTransactions()
  );
  const [stores, setStores] = useState<EnterpriseStore[]>(() => erpService.getStores());

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshData = () => {
    setItems([...erpService.getItems()]);
    setBalances([...erpService.getStockBalances()]);
    setTransactions([...erpService.getStockTransactions()]);
    setStores([...erpService.getStores()]);
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItemMaster | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItemMaster | null>(null);
  const [movementItem, setMovementItem] = useState<InventoryItemMaster | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Form State for Add Item (starts clean and clear)
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('SOLAR PANELS');
  const [newItemSubcategory, setNewItemSubcategory] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemModel, setNewItemModel] = useState('');
  const [newItemUom, setNewItemUom] = useState<'pcs' | 'meters' | 'rolls' | 'kg' | 'sets' | 'boxes'>('pcs');
  const [newItemCost, setNewItemCost] = useState<number | ''>('');
  const [newItemRequiresSerial, setNewItemRequiresSerial] = useState(false);
  const [newItemRequiresBatch, setNewItemRequiresBatch] = useState(false);
  const [newItemWarrantyMonths, setNewItemWarrantyMonths] = useState<number | ''>(24);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState<number | ''>(20);
  const [newItemMinStock, setNewItemMinStock] = useState<number | ''>(10);
  const [newItemMaxStock, setNewItemMaxStock] = useState<number | ''>(500);
  const [newItemSolarTier, setNewItemSolarTier] = useState<SolarCapacityTier>('550W');
  const [newItemWattage, setNewItemWattage] = useState<number | ''>(550);
  const [newItemVoltage, setNewItemVoltage] = useState('');
  const [newItemEfficiency, setNewItemEfficiency] = useState<number | ''>(21.4);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newAllocateInitialStock, setNewAllocateInitialStock] = useState(false);
  const [newInitialStoreId, setNewInitialStoreId] = useState(stores[0]?.id || '');
  const [newInitialQty, setNewInitialQty] = useState<number | ''>('');

  // Clears all form fields to ensure space is pristine once closed or saved
  const resetAddForm = () => {
    setNewItemName('');
    setNewItemSku('');
    setNewItemCategory('SOLAR PANELS');
    setNewItemSubcategory('');
    setNewItemBrand('');
    setNewItemModel('');
    setNewItemUom('pcs');
    setNewItemCost('');
    setNewItemRequiresSerial(false);
    setNewItemRequiresBatch(false);
    setNewItemWarrantyMonths(24);
    setNewItemReorderLevel(20);
    setNewItemMinStock(10);
    setNewItemMaxStock(500);
    setNewItemSolarTier('550W');
    setNewItemWattage(550);
    setNewItemVoltage('');
    setNewItemEfficiency(21.4);
    setNewItemDesc('');
    setNewAllocateInitialStock(false);
    setNewInitialStoreId(stores[0]?.id || '');
    setNewInitialQty('');
  };

  const handleCloseAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(false);
  };

  // Form State for Quick Stock Movement
  const [movStoreId, setMovStoreId] = useState(stores[0]?.id || '');
  const [movType, setMovType] = useState<InventoryTransactionType>('PURCHASE RECEIPT');
  const [movQty, setMovQty] = useState(50);
  const [movReason, setMovReason] = useState('Stock receipt & intake');

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

  // Calculate total on hand for any item
  const getItemOnHand = (itemId: string) => {
    return balances
      .filter((b) => b.itemId === itemId)
      .reduce((sum, b) => sum + b.onHandQuantity, 0);
  };

  // Handle Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const sku =
      newItemSku.trim().toUpperCase() ||
      `ITM-${newItemCategory.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem: InventoryItemMaster = {
      id: `item-${Date.now()}`,
      sku,
      itemCode: `COD-${sku}`,
      name: newItemName.trim(),
      category: newItemCategory,
      subcategory: newItemSubcategory || 'Equipment',
      description: newItemDesc || `${newItemName} for renewable micro-grid systems`,
      brand: newItemBrand || 'Tier-1 Certified',
      model: newItemModel || sku,
      manufacturer: newItemBrand || 'Certified OEM',
      unitOfMeasure: newItemUom,
      barcode: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      qrCode: `QR-${sku}`,
      requiresSerialTracking: newItemRequiresSerial,
      requiresBatchTracking: newItemRequiresBatch,
      warrantyPeriodMonths: Number(newItemWarrantyMonths) || 12,
      reorderLevel: Number(newItemReorderLevel) || 50,
      minimumStock: Number(newItemMinStock) || 20,
      maximumStock: Number(newItemMaxStock) || 1000,
      standardCost: Number(newItemCost) || 0,
      active: true,
      solarCapacityTier: newItemCategory === 'SOLAR PANELS' ? newItemSolarTier : undefined,
      wattageRating: newItemCategory === 'SOLAR PANELS' && newItemWattage !== '' ? Number(newItemWattage) : undefined,
      voltageRating: newItemCategory === 'SOLAR PANELS' && newItemVoltage ? newItemVoltage : undefined,
      efficiencyPercentage: newItemCategory === 'SOLAR PANELS' && newItemEfficiency !== '' ? Number(newItemEfficiency) : undefined,
    };

    const initialStock =
      newAllocateInitialStock && Number(newInitialQty) > 0
        ? {
            storeId: newInitialStoreId || stores[0]?.id,
            quantity: Number(newInitialQty),
          }
        : undefined;

    erpService.saveItem(newItem, currentUser, initialStock);
    refreshData();
    resetAddForm();
    setIsAddModalOpen(false);
    showToast(`Item SKU "${newItem.sku}" saved and created successfully!`);
  };

  // Handle Edit Item Submit
  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    erpService.saveItem(itemToEdit, currentUser);
    refreshData();
    setItemToEdit(null);
    showToast(`Item SKU "${itemToEdit.sku}" updated successfully!`);
  };

  // Handle Delete Item
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const sku = itemToDelete.sku;
    erpService.deleteItem(itemToDelete.id, currentUser);
    refreshData();
    setItemToDelete(null);
    showToast(`Item SKU "${sku}" and its associated stock balances have been deleted.`);
  };

  // Handle Quick Stock Movement
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItem || movQty <= 0) return;

    const targetStore = stores.find((s) => s.id === movStoreId) || stores[0];
    if (!targetStore) return;

    const currentBal = balances.find(
      (b) => b.storeId === targetStore.id && b.itemId === movementItem.id
    );
    const beforeBal = currentBal ? currentBal.onHandQuantity : 0;

    const isReduction = ['DAMAGE', 'LOSS', 'DISPOSAL', 'TRANSFER OUT'].includes(movType);
    const delta = isReduction ? -Math.min(beforeBal, movQty) : movQty;
    const afterBal = Math.max(0, beforeBal + delta);

    erpService.updateStockBalance(targetStore.id, movementItem.id, delta, 0);
    erpService.recordStockTransaction({
      transactionType: movType,
      itemId: movementItem.id,
      itemSku: movementItem.sku,
      itemName: movementItem.name,
      category: movementItem.category,
      quantity: Math.abs(delta),
      unitCost: movementItem.standardCost,
      totalValue: Math.abs(delta) * movementItem.standardCost,
      destinationLocationId: targetStore.id,
      destinationLocationName: targetStore.name,
      beforeBalance: beforeBal,
      afterBalance: afterBal,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      referenceDocumentType: 'ADJUSTMENT_MEMO',
      referenceDocumentId: `ADJ-${Date.now().toString().slice(-6)}`,
      reason: movReason || 'Manual inventory movement record',
    });

    refreshData();
    setIsMovementModalOpen(false);
    setMovementItem(null);
    showToast(
      `Stock movement recorded: ${movType} for ${movementItem.sku} (${delta > 0 ? '+' : ''}${delta})`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:bg-emerald-700 p-0.5 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
            id="inventory-record-movement-btn"
            onClick={() => {
              if (onOpenStockMovementModal) {
                onOpenStockMovementModal();
              } else {
                setMovementItem(items[0] || null);
                setIsMovementModalOpen(true);
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-emerald-400" />
            <span>Record Movement</span>
          </button>
          <button
            id="inventory-create-new-item-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Item Master SKU</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          id="tab-inventory-balances"
          onClick={() => setActiveTab('balances')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'balances'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="h-3.5 w-3.5" />
          <span>Store Stock Balances ({balances.length})</span>
        </button>
        <button
          id="tab-inventory-catalogue"
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'catalogue'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Master Item Catalogue ({items.length})</span>
        </button>
        <button
          id="tab-inventory-ledger"
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Movement Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="inventory-search-input"
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
            id="inventory-category-filter"
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
              id="inventory-store-filter"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stores &amp; Depots</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.level.split(' ')[0]})
                </option>
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

          {/* View Mode Toggle for Catalogue */}
          {activeTab === 'catalogue' && (
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setCatalogueViewMode('grid')}
                className={`p-1.5 rounded ${
                  catalogueViewMode === 'grid'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                } cursor-pointer`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCatalogueViewMode('table')}
                className={`p-1.5 rounded ${
                  catalogueViewMode === 'table'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                } cursor-pointer`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
            title="Refresh Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
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
                  <th className="py-3 px-3.5 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBalances.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                      No stock balances found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBalances.map((bal) => {
                    const itemMatch = items.find((i) => i.id === bal.itemId);
                    return (
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
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => {
                              if (itemMatch) {
                                setMovementItem(itemMatch);
                                setMovStoreId(bal.storeId);
                                setIsMovementModalOpen(true);
                              }
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition cursor-pointer font-medium"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ITEM MASTER CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredItems.length} of {items.length} master items
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item to Catalogue</span>
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No items found</h3>
              <p className="text-xs text-slate-400 mb-4">
                No items match your search or category filter. You can add a new item to the master catalogue.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create Item Master SKU</span>
              </button>
            </div>
          ) : catalogueViewMode === 'grid' ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const onHand = getItemOnHand(item.id);
                const isLowStock = onHand <= item.reorderLevel;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg space-y-3 relative flex flex-col justify-between group transition"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          {item.sku}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-2 leading-snug">{item.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    {/* Stock & Specs Overview */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Total On Hand:</span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            onHand === 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {onHand.toLocaleString()} {item.unitOfMeasure}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>Standard Cost:</span>
                        <span className="font-mono font-bold text-white">
                          ₦{item.standardCost.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>OEM / Brand:</span>
                        <span className="text-emerald-300 font-medium">{item.brand || 'Generic'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>Serial Tracking:</span>
                        <span
                          className={
                            item.requiresSerialTracking
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-500'
                          }
                        >
                          {item.requiresSerialTracking ? 'Mandatory' : 'Batch Only'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setMovementItem(item);
                          setIsMovementModalOpen(true);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowUpDown className="h-3 w-3 text-emerald-400" />
                        <span>Move / Adjust</span>
                      </button>

                      <button
                        onClick={() => setItemToEdit({ ...item })}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
                        title="Edit Item Master"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/20 transition cursor-pointer"
                        title="Delete Item Master"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3.5">SKU</th>
                      <th className="py-3 px-3.5">Item Name &amp; Description</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Brand / Model</th>
                      <th className="py-3 px-3.5 text-right">Standard Cost</th>
                      <th className="py-3 px-3.5 text-right">Total On Hand</th>
                      <th className="py-3 px-3.5 text-right">Reorder Level</th>
                      <th className="py-3 px-3.5 text-center">Tracking</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map((item) => {
                      const onHand = getItemOnHand(item.id);
                      const isLowStock = onHand <= item.reorderLevel;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-emerald-400">
                            {item.sku}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-slate-400 text-[11px] truncate max-w-xs">
                              {item.description}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="text-white">{item.brand || 'Generic'}</div>
                            <div className="text-slate-500 font-mono text-[10px]">{item.model}</div>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                            ₦{item.standardCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                onHand === 0
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : isLowStock
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {onHand.toLocaleString()} {item.unitOfMeasure}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-slate-400">
                            {item.reorderLevel.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded ${
                                item.requiresSerialTracking
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.requiresSerialTracking ? 'Serial' : 'Batch'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setMovementItem(item);
                                  setIsMovementModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                                title="Record Movement"
                              >
                                <ArrowUpDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToEdit({ ...item })}
                                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToDelete(item)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* ==================================================================== */}
      {/* MODAL 1: ADD NEW ITEM MASTER SKU */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseAddModal();
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Add New Item Master SKU</span>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddItemSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Item Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Canadian Solar 550W HiKu6"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    SKU Code <span className="text-slate-500 text-[10px]">(Leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SP-CAN-550W"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                  >
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
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Mono Half-Cell, LiFePO4, Hybrid"
                    value={newItemSubcategory}
                    onChange={(e) => setNewItemSubcategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand / OEM</label>
                  <input
                    type="text"
                    placeholder="e.g. Canadian Solar, Growatt"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. CS6W-550MS"
                    value={newItemModel}
                    onChange={(e) => setNewItemModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit of Measure</label>
                  <select
                    value={newItemUom}
                    onChange={(e) => setNewItemUom(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="meters">Meters</option>
                    <option value="rolls">Rolls</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="sets">Sets</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Cost (₦)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 115000"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="20"
                    value={newItemReorderLevel}
                    onChange={(e) => setNewItemReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="24"
                    value={newItemWarrantyMonths}
                    onChange={(e) => setNewItemWarrantyMonths(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Solar specific properties */}
              {newItemCategory === 'SOLAR PANELS' && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-3">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Solar Technical Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1">Capacity Tier</label>
                      <select
                        value={newItemSolarTier}
                        onChange={(e) => setNewItemSolarTier(e.target.value as SolarCapacityTier)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                      >
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
                    </div>
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1">Wattage (W)</label>
                      <input
                        type="number"
                        placeholder="550"
                        value={newItemWattage}
                        onChange={(e) => setNewItemWattage(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1">Voltage Rating</label>
                      <input
                        type="text"
                        placeholder="e.g. 41.5V Vmp"
                        value={newItemVoltage}
                        onChange={(e) => setNewItemVoltage(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1">Efficiency (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        placeholder="21.4"
                        value={newItemEfficiency}
                        onChange={(e) => setNewItemEfficiency(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Serial & Batch Tracking Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemRequiresSerial}
                    onChange={(e) => setNewItemRequiresSerial(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-semibold block text-xs">Require Serial Number Tracking</span>
                    <span className="text-[10px] text-slate-400">Mandatory for assets like panels, batteries, inverters</span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemRequiresBatch}
                    onChange={(e) => setNewItemRequiresBatch(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-semibold block text-xs">Require Batch / Lot Tracking</span>
                    <span className="text-[10px] text-slate-400">Useful for cables, mounting hardware, consumables</span>
                  </div>
                </label>
              </div>

              {/* Initial Physical Stock Allocation Option */}
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={newAllocateInitialStock}
                    onChange={(e) => setNewAllocateInitialStock(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Allocate Initial Physical Stock On Hand</span>
                </label>
                {newAllocateInitialStock && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Target Storage Warehouse</label>
                      <select
                        value={newInitialStoreId}
                        onChange={(e) => setNewInitialStoreId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                      >
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Initial Quantity ({newItemUom})</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="e.g. 50"
                        value={newInitialQty}
                        onChange={(e) => setNewInitialQty(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Detailed specifications, installation guidelines, certification standards..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save & Close</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: EDIT EXISTING ITEM MASTER SKU */}
      {/* ==================================================================== */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Edit Item: {itemToEdit.sku}</span>
              </div>
              <button
                onClick={() => setItemToEdit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Edit Form Body */}
            <form onSubmit={handleEditItemSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={itemToEdit.name}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    readOnly
                    value={itemToEdit.sku}
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Cost (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={itemToEdit.standardCost}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, standardCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min={1}
                    value={itemToEdit.reorderLevel}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, reorderLevel: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    min={0}
                    value={itemToEdit.warrantyPeriodMonths}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, warrantyPeriodMonths: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand / OEM</label>
                  <input
                    type="text"
                    value={itemToEdit.brand}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    value={itemToEdit.model}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, model: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemToEdit.description}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={itemToEdit.requiresSerialTracking}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, requiresSerialTracking: e.target.checked })
                    }
                    className="rounded bg-slate-700 border-slate-600 text-emerald-500"
                  />
                  <span>Serial Tracking</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={itemToEdit.requiresBatchTracking}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, requiresBatchTracking: e.target.checked })
                    }
                    className="rounded bg-slate-700 border-slate-600 text-emerald-500"
                  />
                  <span>Batch Tracking</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span className="font-bold text-white text-sm">Delete Item Master SKU</span>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-400 text-sm">{itemToDelete.sku}</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                    {itemToDelete.category}
                  </span>
                </div>
                <div className="font-semibold text-white text-sm">{itemToDelete.name}</div>
                <div className="text-slate-400 text-[11px]">{itemToDelete.brand} • {itemToDelete.model}</div>
              </div>

              {/* Stock Warning */}
              {(() => {
                const totalStock = getItemOnHand(itemToDelete.id);
                if (totalStock > 0) {
                  return (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>Active Stock On Hand: {totalStock.toLocaleString()} {itemToDelete.unitOfMeasure}</span>
                      </div>
                      <p className="text-amber-200/80 text-[11px] leading-relaxed">
                        Warning: Deleting this item master will permanently wipe all warehouse stock balances and remove this SKU from the ERP inventory.
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px]">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Zero physical stock on hand. Safe to delete from master catalogue.</span>
                    </div>
                  );
                }
              })()}

              <p className="text-slate-400 text-[11px]">
                An immutable audit trail log will be permanently recorded for compliance and accounting integrity.
              </p>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: RECORD STOCK MOVEMENT / ADJUSTMENT */}
      {/* ==================================================================== */}
      {isMovementModalOpen && movementItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">
                  Record Stock Movement: {movementItem.sku}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMovementModalOpen(false);
                  setMovementItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleMovementSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="font-semibold text-white text-xs">{movementItem.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Category: {movementItem.category} • Cost: ₦{movementItem.standardCost.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Storage Warehouse / Depot</label>
                <select
                  value={movStoreId}
                  onChange={(e) => setMovStoreId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Movement Type</label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="PURCHASE RECEIPT">Purchase Receipt (+ Stock)</option>
                    <option value="TRANSFER IN">Transfer In (+ Stock)</option>
                    <option value="ADJUSTMENT">Stock Adjustment (+/- Stock)</option>
                    <option value="RETURN">Return from Field (+ Stock)</option>
                    <option value="DAMAGE">Damaged / Quarantine (- Stock)</option>
                    <option value="LOSS">Loss / Write-off (- Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quantity ({movementItem.unitOfMeasure})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={movQty}
                    onChange={(e) => setMovQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason &amp; Reference</label>
                <textarea
                  rows={2}
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                  placeholder="e.g. Scheduled quarterly audit count reconciliation..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMovementModalOpen(false);
                    setMovementItem(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  Record Stock Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
