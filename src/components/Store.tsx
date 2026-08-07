import React, { useState, useMemo } from 'react';
import { StoreItem, SolarProject, Program, Community, ExpenseCategory, UserRole } from '../types';
import { 
  Plus, 
  Warehouse, 
  Package, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  X, 
  Search, 
  ChevronRight, 
  Info, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Layers,
  ShoppingBag
} from 'lucide-react';

interface StoreProps {
  storeItems: StoreItem[];
  categories: ExpenseCategory[];
  projects: SolarProject[];
  programs: Program[];
  communities: Community[];
  currentUserRole: UserRole;
  currentUserName: string;
  onAddStoreItem: (newItem: Omit<StoreItem, 'id' | 'lastRestockedDate'>) => void;
  onRestockStoreItem: (itemId: string, restockQty: number, createExpense: boolean, programId?: string, communityId?: string, projectId?: string) => void;
  onDispatchStoreItem: (itemId: string, programId: string, communityId: string, projectId: string, quantity: number, dispatchedBy: string, notes?: string) => void;
}

export default function Store({
  storeItems,
  categories,
  projects,
  programs,
  communities,
  currentUserRole,
  currentUserName,
  onAddStoreItem,
  onRestockStoreItem,
  onDispatchStoreItem,
}: StoreProps) {
  // UI Control states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null); // item ID
  const [showDispatchModal, setShowDispatchModal] = useState<string | null>(null); // item ID

  // Add Item Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategoryId, setNewItemCategoryId] = useState(categories[0]?.id || '');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnitCost, setNewItemUnitCost] = useState(1000);
  const [newItemThreshold, setNewItemThreshold] = useState(10);
  const [newItemManufacturer, setNewItemManufacturer] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // Restock Form states
  const [restockQty, setRestockQty] = useState(1);
  const [restockCreateExpense, setRestockCreateExpense] = useState(false);
  const [restockProjId, setRestockProjId] = useState('');

  // Dispatch Form states
  const [dispatchQty, setDispatchQty] = useState(1);
  const [dispatchProjId, setDispatchProjId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Permissions check
  const isManagement = currentUserRole === 'Management';
  const isFieldEngineer = currentUserRole === 'Field Engineer';
  const canManageStore = currentUserRole === 'Administrator' || currentUserRole === 'Finance Officer' || currentUserRole === 'Project Manager';
  const canDispatch = currentUserRole === 'Administrator' || currentUserRole === 'Finance Officer' || currentUserRole === 'Project Manager' || currentUserRole === 'Field Engineer';

  // Computed metrics
  const metrics = useMemo(() => {
    let totalValue = 0;
    let totalUnits = 0;
    let lowStockCount = 0;

    storeItems.forEach(item => {
      totalValue += item.quantity * item.unitCost;
      totalUnits += item.quantity;
      if (item.quantity <= item.lowStockThreshold) {
        lowStockCount++;
      }
    });

    return {
      totalValue,
      totalUnits,
      lowStockCount,
      totalItems: storeItems.length
    };
  }, [storeItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return storeItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategoryFilter === 'all' || item.categoryId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [storeItems, searchTerm, selectedCategoryFilter]);

  // Currency format helper
  const formatCurrency = (val: number) => {
    return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Handle Form Submissions
  const handleCreateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCategoryId) {
      alert('Please fill out all required fields.');
      return;
    }

    onAddStoreItem({
      name: newItemName.trim(),
      categoryId: newItemCategoryId,
      quantity: Number(newItemQuantity),
      unitCost: Number(newItemUnitCost),
      lowStockThreshold: Number(newItemThreshold),
      manufacturer: newItemManufacturer.trim() || 'Generic',
      description: newItemDescription.trim(),
    });

    // Reset Form
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnitCost(1000);
    setNewItemThreshold(10);
    setNewItemManufacturer('');
    setNewItemDescription('');
    setShowAddModal(false);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal) return;
    if (restockQty <= 0) {
      alert('Please enter a valid restocking quantity.');
      return;
    }

    let pId = '';
    let cId = '';
    let prId = '';

    if (restockCreateExpense) {
      if (!restockProjId) {
        alert('Please select a project to bill this restock procurement to.');
        return;
      }
      const proj = projects.find(p => p.id === restockProjId);
      if (proj) {
        prId = proj.id;
        cId = proj.communityId;
        pId = proj.programId;
      }
    }

    onRestockStoreItem(
      showRestockModal,
      Number(restockQty),
      restockCreateExpense,
      pId,
      cId,
      prId
    );

    // Reset Form
    setRestockQty(1);
    setRestockCreateExpense(false);
    setRestockProjId('');
    setShowRestockModal(null);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDispatchModal) return;
    const item = storeItems.find(i => i.id === showDispatchModal);
    if (!item) return;

    if (dispatchQty <= 0 || dispatchQty > item.quantity) {
      alert(`Invalid quantity. You can dispatch up to ${item.quantity} units.`);
      return;
    }

    if (!dispatchProjId) {
      alert('Please select a destination solar project for dispatch.');
      return;
    }

    const proj = projects.find(p => p.id === dispatchProjId);
    if (!proj) {
      alert('Selected project does not exist.');
      return;
    }

    onDispatchStoreItem(
      item.id,
      proj.programId,
      proj.communityId,
      proj.id,
      Number(dispatchQty),
      currentUserName,
      dispatchNotes.trim()
    );

    // Reset Form
    setDispatchQty(1);
    setDispatchProjId('');
    setDispatchNotes('');
    setShowDispatchModal(null);
  };

  // Helper to fetch category name
  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Materials';
  };

  // Helper to construct fully qualified project names
  const getProjectFullName = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return '';
    const comm = communities.find(c => c.id === proj.communityId);
    return `${proj.name} (${comm ? comm.name : 'Unknown Community'})`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-fade-in" id="store-portal-root">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-emerald-400 shrink-0" />
            Central Hardware Store & Inventory
          </h2>
          <p className="text-xs font-mono text-white/50">
            Secure tracking of hardware stock pools, low stock alert rules, and direct field dispatch ledgers.
          </p>
        </div>

        {canManageStore && (
          <button
            onClick={() => {
              if (categories.length > 0) {
                setNewItemCategoryId(categories[0].id);
              }
              setShowAddModal(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition duration-150 cursor-pointer self-start md:self-auto"
            id="register-new-item-btn"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Register Store Item
          </button>
        )}
      </div>

      {/* Overview Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="store-metrics-grid">
        {/* Metric: Total Stock Value */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">Stock Assets Value</span>
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{formatCurrency(metrics.totalValue)}</h3>
            <p className="text-[10px] text-emerald-400 font-medium mt-1">Capitalized in Warehouse</p>
          </div>
        </div>

        {/* Metric: Total Stock Units */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">Total Stored Units</span>
            <div className="bg-sky-500/10 text-sky-400 p-2 rounded-xl border border-sky-500/20">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{metrics.totalUnits.toLocaleString()}</h3>
            <p className="text-[10px] text-white/40 mt-1">Total physical items registered</p>
          </div>
        </div>

        {/* Metric: Low Stock Warnings */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <div className={`p-2 rounded-xl border ${metrics.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold tracking-tight leading-none ${metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {metrics.lowStockCount}
            </h3>
            <p className="text-[10px] text-white/40 mt-1">Items at or below safe levels</p>
          </div>
        </div>

        {/* Metric: Total Categories */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">Unique Hardware Lines</span>
            <div className="bg-purple-500/10 text-purple-400 p-2 rounded-xl border border-purple-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{metrics.totalItems}</h3>
            <p className="text-[10px] text-white/40 mt-1">Item listings active</p>
          </div>
        </div>
      </div>

      {/* Control Filters & Directory search */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between" id="store-controls-container">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items, manufacturers..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all' 
                ? 'bg-white/10 text-white border border-white/15' 
                : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            All Categories
          </button>
          {categories
            .filter(cat => storeItems.some(i => i.categoryId === cat.id)) // Only show categories with actual store items
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategoryFilter === cat.id 
                    ? 'bg-white/10 text-white border border-white/15' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))
          }
        </div>
      </div>

      {/* Grid of Inventory Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-12 text-center" id="empty-store-indicator">
          <Warehouse className="mx-auto h-12 w-12 text-white/20 mb-3" />
          <h3 className="text-sm font-bold text-white">No items found</h3>
          <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
            Try adjusting your search filters or register a brand-new solar hardware product above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="store-items-grid">
          {filteredItems.map((item) => {
            const isLowStock = item.quantity <= item.lowStockThreshold;
            const categoryName = getCategoryName(item.categoryId);
            const totalValue = item.quantity * item.unitCost;

            return (
              <div 
                key={item.id} 
                className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all hover:border-white/20 duration-150 relative overflow-hidden ${
                  isLowStock ? 'border-amber-500/20 ring-1 ring-amber-500/10' : 'border-white/10'
                }`}
              >
                {/* Status Badges */}
                {isLowStock && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-bold font-mono px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                    Low Stock Alert
                  </div>
                )}

                {/* Card Top */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {categoryName}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight mt-2 leading-tight pr-12">{item.name}</h3>
                    <p className="text-[10px] font-mono text-white/40 mt-0.5">Mfr: <span className="text-white/60 font-semibold">{item.manufacturer}</span></p>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed truncate-3-lines">
                    {item.description || 'No descriptive specifications registered for this hardware line.'}
                  </p>

                  {/* Stock Progress Indicators */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-white/40">In Stock Balance:</span>
                      <span className={`font-bold ${isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.quantity} units {isLowStock && `(Min threshold: ${item.lowStockThreshold})`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isLowStock ? 'bg-amber-500' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 2.5)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="border-t border-white/5 mt-5 pt-4 space-y-4">
                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Unit Valuation</span>
                      <span className="text-xs font-bold text-white">{formatCurrency(item.unitCost)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Total Asset Value</span>
                      <span className="text-xs font-bold text-white">{formatCurrency(totalValue)}</span>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex gap-2">
                    {canDispatch && (
                      <button
                        onClick={() => {
                          setDispatchQty(1);
                          setDispatchNotes('');
                          if (projects.length > 0) {
                            setDispatchProjId(projects[0].id);
                          }
                          setShowDispatchModal(item.id);
                        }}
                        disabled={item.quantity <= 0}
                        className={`w-1/2 font-bold text-[10px] py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                          item.quantity <= 0 
                            ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                        }`}
                        title={item.quantity <= 0 ? 'No stock available to dispatch' : 'Dispatch material to project'}
                      >
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        Dispatch to Site
                      </button>
                    )}
                    {canManageStore && (
                      <button
                        onClick={() => {
                          setRestockQty(1);
                          setRestockCreateExpense(false);
                          if (projects.length > 0) {
                            setRestockProjId(projects[0].id);
                          }
                          setShowRestockModal(item.id);
                        }}
                        className="w-1/2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-bold text-[10px] py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="h-3 w-3 shrink-0 text-emerald-400" />
                        Restock Asset
                      </button>
                    )}
                  </div>

                  {/* Restocked Footnote */}
                  <div className="flex items-center gap-1 text-[9px] text-white/30 font-mono">
                    <Calendar className="h-3 w-3 shrink-0" />
                    Last Restocked: {item.lastRestockedDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: REGISTER NEW ITEM ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-fade-in my-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
                  <Warehouse className="h-4 w-4" />
                </div>
                <h3 className="text-md font-bold text-white">Register Solar Hardware Asset</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItemSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Hardware Line Name *</label>
                  <input
                    required
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Felicity 15kWh Lithium Battery"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Manufacturer / Brand</label>
                  <input
                    type="text"
                    value={newItemManufacturer}
                    onChange={(e) => setNewItemManufacturer(e.target.value)}
                    placeholder="e.g. Felicity Solar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Asset Category *</label>
                  <select
                    value={newItemCategoryId}
                    onChange={(e) => setNewItemCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Safe Warning Threshold (Low Qty) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Initial In-Store Quantity *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Unit Cost (₦) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase">Material Description</label>
                <textarea
                  rows={2}
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Technical specifications, serial numbers range, compatibility specifications..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Save to Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESTOCK QUANTITY ================= */}
      {showRestockModal && (() => {
        const item = storeItems.find(i => i.id === showRestockModal);
        if (!item) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <h3 className="text-md font-bold text-white">Procure Restock Delivery</h3>
                </div>
                <button 
                  onClick={() => setShowRestockModal(null)}
                  className="text-white/40 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold leading-none">Target Hardware</p>
                <h4 className="text-sm font-bold text-white leading-normal">{item.name}</h4>
                <div className="flex gap-4 text-[10px] font-mono text-white/40 pt-1">
                  <span>Current stock: <strong className="text-white">{item.quantity}</strong></span>
                  <span>Price per unit: <strong className="text-white">{formatCurrency(item.unitCost)}</strong></span>
                </div>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Restock Intake Quantity *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restockCreateExpense}
                      onChange={(e) => setRestockCreateExpense(e.target.checked)}
                      className="h-4 w-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Procure directly through regional project budget?</span>
                      <span className="text-[9px] text-white/40 leading-none">Checking this registers a real expense against the project.</span>
                    </div>
                  </label>

                  {restockCreateExpense && (
                    <div className="space-y-1 pt-1.5 border-t border-white/5 animate-fade-in">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase">Bill Project Budget *</label>
                      <select
                        required
                        value={restockProjId}
                        onChange={(e) => setRestockProjId(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-[11px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                      >
                        <option value="">-- Select Target Project to Charge --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>
                            {getProjectFullName(p.id)} [Val: {formatCurrency(restockQty * item.unitCost)}]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Estimate cost info */}
                <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                  <span className="text-[10px] font-mono text-white/50 uppercase">Total Intake Value:</span>
                  <span className="text-sm font-bold text-emerald-400 font-sans">{formatCurrency(restockQty * item.unitCost)}</span>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(null)}
                    className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    Complete Restock Delivery
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: DISPATCH TO PROJECT ================= */}
      {showDispatchModal && (() => {
        const item = storeItems.find(i => i.id === showDispatchModal);
        if (!item) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <h3 className="text-md font-bold text-white">Dispatch Store Materials</h3>
                </div>
                <button 
                  onClick={() => setShowDispatchModal(null)}
                  className="text-white/40 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold leading-none">Drawing Materials</p>
                <h4 className="text-sm font-bold text-white leading-normal">{item.name}</h4>
                <div className="flex gap-4 text-[10px] font-mono text-white/40 pt-1">
                  <span>Available stock: <strong className="text-emerald-400">{item.quantity} units</strong></span>
                  <span>Book unit cost: <strong className="text-white">{formatCurrency(item.unitCost)}</strong></span>
                </div>
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Units to Dispatch *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={dispatchQty}
                      onChange={(e) => setDispatchQty(Math.min(item.quantity, Math.max(1, Number(e.target.value))))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Dispatched By</label>
                    <input
                      disabled
                      type="text"
                      value={`${currentUserName} (${currentUserRole})`}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white/40 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Destination Solar Project *</label>
                  <select
                    required
                    value={dispatchProjId}
                    onChange={(e) => setDispatchProjId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-[11px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  >
                    <option value="">-- Select Destination --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {getProjectFullName(p.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase">Voucher Delivery / Handover Notes</label>
                  <textarea
                    rows={2}
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="e.g. Delivered to site lead Engr. Okon. For sub-grid panel strings assembly."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium resize-none"
                  />
                </div>

                {/* Estimate cost info */}
                <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-white/50 uppercase block">Voucher Ledger Value:</span>
                    <span className="text-[9px] text-white/40 leading-none">This amount is automatically debited from target project budget.</span>
                  </div>
                  <span className="text-md font-bold text-emerald-400 font-sans shrink-0">{formatCurrency(dispatchQty * item.unitCost)}</span>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(null)}
                    className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    Confirm Dispatch Voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
