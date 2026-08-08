import React, { useState, useMemo } from 'react';
import { 
  SolarPanelProduct, 
  SolarPanelCapacity, 
  StockMovementLog, 
  EquipmentType, 
  PanelType, 
  AvailabilityStatus, 
  UserRole 
} from '../types';
import { 
  Sun, 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  SlidersHorizontal, 
  Copy, 
  Edit3, 
  Trash2, 
  Archive, 
  RotateCcw, 
  History, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  X, 
  Info, 
  Zap, 
  ShieldCheck, 
  Upload, 
  Image as ImageIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Grid, 
  List,
  Sparkles,
  Settings
} from 'lucide-react';

interface SolarPanelCMSProps {
  products: SolarPanelProduct[];
  capacities: SolarPanelCapacity[];
  stockLogs: StockMovementLog[];
  currentUserRole: UserRole;
  currentUserName: string;
  onAddProduct: (newProduct: Omit<SolarPanelProduct, 'id' | 'createdAt' | 'updatedAt' | 'totalValue'>) => void;
  onUpdateProduct: (product: SolarPanelProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onArchiveProduct: (productId: string) => void;
  onRestoreProduct: (productId: string) => void;
  onAdjustStock: (
    productId: string, 
    changeType: 'Add Stock' | 'Remove Stock' | 'Adjust Stock', 
    qtyChangeOrAbsolute: number, 
    notes: string
  ) => void;
  onAddCapacity: (capacity: Omit<SolarPanelCapacity, 'id'>) => void;
  onUpdateCapacity: (capacity: SolarPanelCapacity) => void;
  onDeleteCapacity: (capacityId: string) => void;
}

const PANEL_TYPES: PanelType[] = [
  'Monocrystalline',
  'Polycrystalline',
  'Bifacial',
  'Thin-Film',
  'PERC',
  'N-Type TOPCon',
  'HJT',
];

const PRESET_SOLAR_IMAGES = [
  { label: 'Blue Monocrystalline Panel', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Solar Farm Array', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80' },
  { label: 'Rooftop Solar Modules', url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern High Efficiency Cell', url: 'https://images.unsplash.com/photo-1592833159057-6514272330a6?auto=format&fit=crop&w=800&q=80' },
];

export default function SolarPanelCMS({
  products,
  capacities,
  stockLogs,
  currentUserRole,
  currentUserName,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onArchiveProduct,
  onRestoreProduct,
  onAdjustStock,
  onAddCapacity,
  onUpdateCapacity,
  onDeleteCapacity,
}: SolarPanelCMSProps) {
  // Navigation & Category states
  const [activeEquipment, setActiveEquipment] = useState<EquipmentType>('Solar Panels');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [panelTypeFilter, setPanelTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Modals state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<SolarPanelProduct | null>(null);

  const [showCapacityManager, setShowCapacityManager] = useState<boolean>(false);
  const [editingCapacity, setEditingCapacity] = useState<SolarPanelCapacity | null>(null);
  const [newCapWattage, setNewCapWattage] = useState<number>(450);
  const [newCapLabel, setNewCapLabel] = useState<string>('450W');
  const [newCapDesc, setNewCapDesc] = useState<string>('');

  const [showStockModal, setShowStockModal] = useState<SolarPanelProduct | null>(null);
  const [stockActionType, setStockActionType] = useState<'Add Stock' | 'Remove Stock' | 'Adjust Stock'>('Add Stock');
  const [stockInputQty, setStockInputQty] = useState<number>(10);
  const [stockNotes, setStockNotes] = useState<string>('');

  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [selectedProductLogsId, setSelectedProductLogsId] = useState<string | null>(null);

  // Product Form Fields
  const [formName, setFormName] = useState('');
  const [formCapacityId, setFormCapacityId] = useState('');
  const [formBrand, setFormBrand] = useState('Jinko Solar');
  const [formModel, setFormModel] = useState('');
  const [formPanelType, setFormPanelType] = useState<PanelType>('Monocrystalline');
  const [formEfficiency, setFormEfficiency] = useState('21.3%');
  const [formVoltage, setFormVoltage] = useState('41.5V Vmp / 49.8V Voc');
  const [formDimensions, setFormDimensions] = useState('2278 x 1134 x 35 mm');
  const [formWarranty, setFormWarranty] = useState('12 Yrs Product / 25 Yrs Performance');
  const [formDescription, setFormDescription] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(180000);
  const [formQuantity, setFormQuantity] = useState<number>(20);
  const [formMinStockLevel, setFormMinStockLevel] = useState<number>(10);
  const [formImageUrl, setFormImageUrl] = useState(PRESET_SOLAR_IMAGES[0].url);

  // Calculate live total value for form (Unit Price × Quantity)
  const formCalculatedTotal = useMemo(() => {
    return (formUnitPrice || 0) * (formQuantity || 0);
  }, [formUnitPrice, formQuantity]);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Open Product Modal (Add or Edit)
  const handleOpenProductModal = (productToEdit?: SolarPanelProduct) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setFormName(productToEdit.name);
      setFormCapacityId(productToEdit.capacityId);
      setFormBrand(productToEdit.brand);
      setFormModel(productToEdit.modelNumber);
      setFormPanelType(productToEdit.panelType);
      setFormEfficiency(productToEdit.efficiency);
      setFormVoltage(productToEdit.voltage);
      setFormDimensions(productToEdit.dimensions);
      setFormWarranty(productToEdit.warranty);
      setFormDescription(productToEdit.description);
      setFormSupplier(productToEdit.supplier);
      setFormUnitPrice(productToEdit.unitPrice);
      setFormQuantity(productToEdit.quantity);
      setFormMinStockLevel(productToEdit.minStockLevel);
      setFormImageUrl(productToEdit.imageUrl || PRESET_SOLAR_IMAGES[0].url);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormCapacityId(capacities[0]?.id || 'cap-550w');
      setFormBrand('Jinko Solar');
      setFormModel('');
      setFormPanelType('Monocrystalline');
      setFormEfficiency('21.5%');
      setFormVoltage('41.5V Vmp / 49.8V Voc');
      setFormDimensions('2278 x 1134 x 35 mm');
      setFormWarranty('12 Yrs Product / 25 Yrs Performance');
      setFormDescription('');
      setFormSupplier('Wavetech Power Solutions Ltd');
      setFormUnitPrice(200000);
      setFormQuantity(25);
      setFormMinStockLevel(10);
      setFormImageUrl(PRESET_SOLAR_IMAGES[0].url);
    }
    setShowProductModal(true);
  };

  // Submit Product Form
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCapacityId) {
      alert('Please fill out Product Name and Capacity.');
      return;
    }

    const selectedCap = capacities.find(c => c.id === formCapacityId) || capacities[0];
    const status: AvailabilityStatus = formQuantity <= 0 
      ? 'Out of Stock' 
      : formQuantity <= formMinStockLevel 
      ? 'Low Stock' 
      : 'In Stock';

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        equipmentType: activeEquipment,
        name: formName.trim(),
        capacityId: formCapacityId,
        capacityWattage: selectedCap ? selectedCap.wattage : 550,
        capacityLabel: selectedCap ? selectedCap.label : '550W',
        brand: formBrand,
        modelNumber: formModel,
        panelType: formPanelType,
        efficiency: formEfficiency,
        voltage: formVoltage,
        dimensions: formDimensions,
        warranty: formWarranty,
        description: formDescription,
        supplier: formSupplier,
        unitPrice: formUnitPrice,
        quantity: formQuantity,
        minStockLevel: formMinStockLevel,
        totalValue: formUnitPrice * formQuantity,
        status: status,
        imageUrl: formImageUrl,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddProduct({
        equipmentType: activeEquipment,
        name: formName.trim(),
        capacityId: formCapacityId,
        capacityWattage: selectedCap ? selectedCap.wattage : 550,
        capacityLabel: selectedCap ? selectedCap.label : '550W',
        brand: formBrand,
        modelNumber: formModel,
        panelType: formPanelType,
        efficiency: formEfficiency,
        voltage: formVoltage,
        dimensions: formDimensions,
        warranty: formWarranty,
        description: formDescription,
        supplier: formSupplier,
        unitPrice: formUnitPrice,
        quantity: formQuantity,
        minStockLevel: formMinStockLevel,
        status: status,
        isArchived: false,
        imageUrl: formImageUrl,
      });
    }

    setShowProductModal(false);
  };

  // List of unique Brands & Suppliers for Filter dropdowns
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.brand && set.add(p.brand));
    return Array.from(set);
  }, [products]);

  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.supplier && set.add(p.supplier));
    return Array.from(set);
  }, [products]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Equipment category filter
      if (p.equipmentType !== activeEquipment) return false;

      // Archived filter
      if (!showArchived && p.isArchived) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesModel = p.modelNumber.toLowerCase().includes(term);
        const matchesBrand = p.brand.toLowerCase().includes(term);
        const matchesSupplier = p.supplier.toLowerCase().includes(term);
        const matchesDesc = p.description.toLowerCase().includes(term);
        if (!matchesName && !matchesModel && !matchesBrand && !matchesSupplier && !matchesDesc) {
          return false;
        }
      }

      // Capacity filter
      if (capacityFilter !== 'all' && p.capacityId !== capacityFilter) return false;

      // Brand filter
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;

      // Panel Type filter
      if (panelTypeFilter !== 'all' && p.panelType !== panelTypeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Supplier filter
      if (supplierFilter !== 'all' && p.supplier !== supplierFilter) return false;

      return true;
    });
  }, [
    products, 
    activeEquipment, 
    showArchived, 
    searchTerm, 
    capacityFilter, 
    brandFilter, 
    panelTypeFilter, 
    statusFilter, 
    supplierFilter
  ]);

  // Overall Inventory Metrics & Capacity Breakdown
  const metrics = useMemo(() => {
    const activeProds = products.filter(p => p.equipmentType === activeEquipment && !p.isArchived);
    
    let totalTypes = activeProds.length;
    let totalPhysicalPanels = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const capacityMap: Record<string, { label: string; count: number; totalValue: number }> = {};

    // Initialize all capacity slots so even 0 count capacities render
    capacities.forEach(c => {
      capacityMap[c.label] = { label: c.label, count: 0, totalValue: 0 };
    });

    activeProds.forEach(p => {
      totalPhysicalPanels += p.quantity;
      totalInventoryValue += p.totalValue;

      if (p.quantity <= 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minStockLevel) {
        lowStockCount++;
      }

      const capLabel = p.capacityLabel || 'Custom';
      if (!capacityMap[capLabel]) {
        capacityMap[capLabel] = { label: capLabel, count: 0, totalValue: 0 };
      }
      capacityMap[capLabel].count += p.quantity;
      capacityMap[capLabel].totalValue += p.totalValue;
    });

    return {
      totalTypes,
      totalPhysicalPanels,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      capacityBreakdown: Object.values(capacityMap)
    };
  }, [products, capacities, activeEquipment]);

  // Stock Adjustment Submit
  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStockModal) return;

    if (!stockNotes.trim()) {
      alert('Please enter notes or reason for this stock movement.');
      return;
    }

    onAdjustStock(showStockModal.id, stockActionType, stockInputQty, stockNotes.trim());
    setShowStockModal(null);
    setStockNotes('');
  };

  // Add Capacity Submit
  const handleAddCapacitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapWattage || !newCapLabel.trim()) {
      alert('Wattage and Label are required.');
      return;
    }

    if (editingCapacity) {
      onUpdateCapacity({
        ...editingCapacity,
        wattage: Number(newCapWattage),
        label: newCapLabel.trim(),
        description: newCapDesc.trim(),
      });
      setEditingCapacity(null);
    } else {
      onAddCapacity({
        equipmentType: activeEquipment,
        wattage: Number(newCapWattage),
        label: newCapLabel.trim(),
        description: newCapDesc.trim(),
        isCustom: true,
      });
    }

    setNewCapWattage(450);
    setNewCapLabel('450W');
    setNewCapDesc('');
  };

  const isReadonlyUser = currentUserRole === 'Management' || currentUserRole === 'Field Engineer';

  return (
    <div className="space-y-6">
      {/* CMS Header & Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl">
                <Sun className="h-6 w-6 animate-pulse" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Solar Panel Product & Inventory Management</h2>
                <p className="text-xs text-white/60">Configure capacities, catalog panel products, manage stock levels, and track automated inventory values</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCapacityManager(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Settings className="h-4 w-4 text-amber-400" />
              Manage Capacities
            </button>

            <button
              onClick={() => setShowLogsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <History className="h-4 w-4 text-emerald-400" />
              Stock Movement History
            </button>

            {!isReadonlyUser && (
              <button
                onClick={() => handleOpenProductModal()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Solar Panel
              </button>
            )}
          </div>
        </div>

        {/* Scalable Equipment Type Switcher (Requirement #10) */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider mr-2 shrink-0">Category:</span>
            {[
              'Solar Panels',
              'Inverters',
              'Batteries',
              'Charge Controllers',
              'Mounting Systems',
              'Cables',
              'Solar Accessories',
            ].map((type) => {
              const isActive = activeEquipment === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setActiveEquipment(type as EquipmentType);
                    setCapacityFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD SUMMARY KPI WIDGETS (Requirement #9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Panel Models</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{metrics.totalTypes}</p>
            <p className="text-[10px] text-white/40 mt-1">Configured Product Models</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Physical Stock</span>
            <Package className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{metrics.totalPhysicalPanels.toLocaleString()}</p>
            <p className="text-[10px] text-white/40 mt-1">Total Panels in Warehouse</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Total Inventory Value</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(metrics.totalInventoryValue)}</p>
            <p className="text-[10px] text-white/40 mt-1">Sum of Unit Price × Quantity</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-amber-400">{metrics.lowStockCount}</p>
              <span className="text-xs text-white/50">products</span>
            </div>
            <p className="text-[10px] text-amber-400/70 mt-1">At or below threshold</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Out of Stock</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-rose-400">{metrics.outOfStockCount}</p>
              <span className="text-xs text-white/50">products</span>
            </div>
            <p className="text-[10px] text-rose-400/70 mt-1">Requires immediate order</p>
          </div>
        </div>
      </div>

      {/* CAPACITY BREAKDOWN BAR (Requirement #1 & #9) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Inventory Breakdown by Panel Capacity (Wattage)</h3>
          </div>
          <span className="text-[10px] font-mono text-white/40">{capacities.length} Registered Capacities</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {metrics.capacityBreakdown.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                const matchedCap = capacities.find(c => c.label === item.label);
                if (matchedCap) {
                  setCapacityFilter(capacityFilter === matchedCap.id ? 'all' : matchedCap.id);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer ${
                item.count > 0 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/15' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              <span className="font-bold text-amber-400">{item.label}:</span>
              <span className="font-mono text-white font-semibold">{item.count} panels</span>
              {item.totalValue > 0 && (
                <span className="text-[10px] text-emerald-400 font-mono">({formatCurrency(item.totalValue)})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH AND FILTERING TOOLBAR (Requirement #6) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Product Name, Model, Brand, Supplier, Specifications..."
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Capacity Filter */}
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Capacities</option>
              {capacities.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.label} ({c.wattage}W)</option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Brands</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b} className="bg-slate-900">{b}</option>
              ))}
            </select>

            {/* Panel Type Filter */}
            <select
              value={panelTypeFilter}
              onChange={(e) => setPanelTypeFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Tech Types</option>
              {PANEL_TYPES.map(t => (
                <option key={t} value={t} className="bg-slate-900">{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/20 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Availability</option>
              <option value="In Stock" className="bg-slate-900">In Stock</option>
              <option value="Low Stock" className="bg-slate-900">Low Stock</option>
              <option value="Out of Stock" className="bg-slate-900">Out of Stock</option>
            </select>

            {/* Archived toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition cursor-pointer ${
                showArchived 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-black/20 text-white/50 border-white/10 hover:text-white'
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              Archived ({products.filter(p => p.isArchived).length})
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS DIRECTORY & INVENTORY TABLE (Requirement #4) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Package className="h-12 w-12 text-white/20 mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-semibold text-white">No solar panel products found</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
            Try adjusting your capacity filter or search term, or click "Add Solar Panel" to register a new product.
          </p>
          {!isReadonlyUser && (
            <button
              onClick={() => handleOpenProductModal()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add First Solar Panel
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Product & Model</th>
                  <th className="px-4 py-3.5">Capacity</th>
                  <th className="px-4 py-3.5">Brand / Tech</th>
                  <th className="px-4 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-center">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Total Value</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {filteredProducts.map((p) => {
                  const isLow = p.quantity <= p.minStockLevel && p.quantity > 0;
                  const isOut = p.quantity <= 0;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-white/5 transition-colors ${
                        p.isArchived ? 'opacity-50 bg-black/20' : ''
                      }`}
                    >
                      {/* Product & Model */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.imageUrl || PRESET_SOLAR_IMAGES[0].url} 
                            alt={p.name}
                            className="h-10 w-10 object-cover rounded-lg border border-white/10 shrink-0 bg-slate-800"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', PRESET_SOLAR_IMAGES[0].url);
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{p.name}</span>
                              {p.isArchived && (
                                <span className="bg-slate-700 text-white/70 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Archived</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5 font-mono">
                              <span>Model: {p.modelNumber || 'N/A'}</span>
                              <span>•</span>
                              <span>Supplier: {p.supplier}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold font-mono text-xs">
                          <Zap className="h-3 w-3 text-amber-400" />
                          {p.capacityLabel}
                        </span>
                      </td>

                      {/* Brand & Panel Tech */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-white">{p.brand}</p>
                          <p className="text-[10px] text-white/50">{p.panelType} • {p.efficiency}</p>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-right font-mono font-medium text-white">
                        {formatCurrency(p.unitPrice)}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className={`font-mono font-bold text-sm ${
                            isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {p.quantity}
                          </span>
                          <span className="text-[10px] text-white/40">units</span>
                        </div>
                      </td>

                      {/* Total Value (Auto-calculated Unit Price × Quantity) */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(p.totalValue)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {p.isArchived ? (
                          <span className="inline-flex items-center gap-1 bg-slate-800 text-white/60 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Archived
                          </span>
                        ) : isOut ? (
                          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <XCircle className="h-3 w-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stock Action */}
                          {!isReadonlyUser && !p.isArchived && (
                            <button
                              onClick={() => {
                                setShowStockModal(p);
                                setStockActionType('Add Stock');
                                setStockInputQty(10);
                                setStockNotes('');
                              }}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition cursor-pointer"
                              title="Add/Remove/Adjust Stock"
                            >
                              Stock Log
                            </button>
                          )}

                          {!isReadonlyUser && (
                            <>
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => onDuplicateProduct(p.id)}
                                className="p-1.5 text-white/60 hover:text-amber-300 hover:bg-white/10 rounded-lg transition cursor-pointer"
                                title="Duplicate Product"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {p.isArchived ? (
                                <button
                                  onClick={() => onRestoreProduct(p.id)}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                                  title="Restore Product"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onArchiveProduct(p.id)}
                                  className="p-1.5 text-white/60 hover:text-amber-400 hover:bg-white/10 rounded-lg transition cursor-pointer"
                                  title="Archive Product"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Inventory Sum */}
          <div className="bg-black/40 border-t border-white/10 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-white/60 font-mono text-[11px]">
              Showing {filteredProducts.length} of {products.length} Products
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white/60">Total Value of Displayed Items:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                {formatCurrency(filteredProducts.reduce((sum, p) => sum + p.totalValue, 0))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.quantity <= p.minStockLevel && p.quantity > 0;
            const isOut = p.quantity <= 0;

            return (
              <div 
                key={p.id} 
                className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition flex flex-col ${
                  p.isArchived ? 'opacity-60 bg-black/20' : ''
                }`}
              >
                {/* Card Header & Image */}
                <div className="relative h-40 bg-slate-900 border-b border-white/10 overflow-hidden">
                  <img 
                    src={p.imageUrl || PRESET_SOLAR_IMAGES[0].url} 
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', PRESET_SOLAR_IMAGES[0].url);
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                      {p.capacityLabel}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {isOut ? (
                      <span className="bg-rose-900/80 backdrop-blur-md text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="bg-amber-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Low Stock
                      </span>
                    ) : (
                      <span className="bg-emerald-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5">{p.brand} • {p.panelType} • {p.modelNumber}</p>

                    <p className="text-xs text-white/70 mt-2 line-clamp-2">{p.description || 'No description provided.'}</p>
                  </div>

                  {/* Commercial Metrics Box */}
                  <div className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Unit Price:</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(p.unitPrice)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Quantity:</span>
                      <span className="font-mono font-bold text-amber-300">{p.quantity} units</span>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/70 font-semibold">Total Value:</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">{formatCurrency(p.totalValue)}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {!isReadonlyUser && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setShowStockModal(p);
                          setStockActionType('Add Stock');
                          setStockInputQty(10);
                          setStockNotes('');
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Stock Action
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateProduct(p.id)}
                          className="p-1.5 text-white/60 hover:text-amber-300 hover:bg-white/10 rounded-lg cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: ADD / EDIT SOLAR PANEL PRODUCT ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {editingProduct ? 'Edit Solar Panel Product' : 'Add New Solar Panel Product'}
                </h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
              {/* SECTION 1: Solar Panel Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <Package className="h-4 w-4" /> 1. Solar Panel Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Jinko Tiger Neo 550W TOPCon Mono"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-white/70">Capacity / Wattage *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductModal(false);
                          setShowCapacityManager(true);
                        }}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        + Manage Capacities
                      </button>
                    </div>
                    <select
                      required
                      value={formCapacityId}
                      onChange={(e) => setFormCapacityId(e.target.value)}
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {capacities.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.label} ({c.wattage}W) {c.description ? `- ${c.description}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. Jinko Solar, Canadian Solar, LONGi"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Model Number</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. JKM550N-72HL4-V"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Panel Tech Type</label>
                    <select
                      value={formPanelType}
                      onChange={(e) => setFormPanelType(e.target.value as PanelType)}
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {PANEL_TYPES.map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Supplier / Vendor</label>
                    <input
                      type="text"
                      value={formSupplier}
                      onChange={(e) => setFormSupplier(e.target.value)}
                      placeholder="e.g. Wavetech Power Ltd"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of solar panel efficiency, cell technology, application domain..."
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* SECTION 2: Technical Specifications */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <Zap className="h-4 w-4" /> 2. Technical Specifications
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Module Efficiency</label>
                    <input
                      type="text"
                      value={formEfficiency}
                      onChange={(e) => setFormEfficiency(e.target.value)}
                      placeholder="e.g. 21.3%"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Voltage (Vmp / Voc)</label>
                    <input
                      type="text"
                      value={formVoltage}
                      onChange={(e) => setFormVoltage(e.target.value)}
                      placeholder="e.g. 41.5V Vmp / 49.8V Voc"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      placeholder="e.g. 2278 x 1134 x 35 mm"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Warranty</label>
                    <input
                      type="text"
                      value={formWarranty}
                      onChange={(e) => setFormWarranty(e.target.value)}
                      placeholder="e.g. 12 Yrs / 25 Yrs Output"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Commercial & Automatic Calculation (Requirement #3) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <DollarSign className="h-4 w-4" /> 3. Commercial, Stock & Automatic Total Calculation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Unit Price (₦) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Quantity in Stock *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Min Stock Threshold</label>
                    <input
                      type="number"
                      min={1}
                      value={formMinStockLevel}
                      onChange={(e) => setFormMinStockLevel(Number(e.target.value))}
                      placeholder="Low stock alert level"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* AUTOMATIC TOTAL VALUE (READ-ONLY) */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                    <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      Total Value (Read-Only)
                    </label>
                    <p className="text-sm font-mono font-extrabold text-emerald-300">
                      {formatCurrency(formCalculatedTotal)}
                    </p>
                    <p className="text-[9px] text-emerald-400/60 font-mono mt-0.5">
                      Formula: Unit Price × Quantity
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Product Image Selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <ImageIcon className="h-4 w-4" /> 4. Product Image
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_SOLAR_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        formImageUrl === preset.url ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] text-white truncate text-center">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="block text-[11px] font-medium text-white/60 mb-1">Custom Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:from-amber-400 hover:to-emerald-400 shadow-lg cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CAPACITY MANAGER (Requirement #1) ================= */}
      {showCapacityManager && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Solar Panel Capacity Management</h3>
              </div>
              <button
                onClick={() => {
                  setShowCapacityManager(false);
                  setEditingCapacity(null);
                }}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form to Add / Edit Capacity */}
              <form onSubmit={handleAddCapacitySubmit} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingCapacity ? 'Edit Capacity Category' : 'Create Custom Capacity Value'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Wattage (W) *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={newCapWattage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewCapWattage(val);
                        setNewCapLabel(`${val}W`);
                      }}
                      placeholder="e.g. 450"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Display Label *</label>
                    <input
                      type="text"
                      required
                      value={newCapLabel}
                      onChange={(e) => setNewCapLabel(e.target.value)}
                      placeholder="e.g. 450W"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Description</label>
                    <input
                      type="text"
                      value={newCapDesc}
                      onChange={(e) => setNewCapDesc(e.target.value)}
                      placeholder="Optional notes"
                      className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  {editingCapacity && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCapacity(null);
                        setNewCapWattage(450);
                        setNewCapLabel('450W');
                        setNewCapDesc('');
                      }}
                      className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {editingCapacity ? 'Update Capacity' : 'Add Capacity'}
                  </button>
                </div>
              </form>

              {/* List of Configured Capacities */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Configured Capacities ({capacities.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {capacities.map((c) => {
                    const productCount = products.filter(p => p.capacityId === c.id).length;

                    return (
                      <div key={c.id} className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300 text-xs font-mono">{c.label}</span>
                            <span className="text-[10px] text-white/40 font-mono">({c.wattage}W)</span>
                          </div>
                          <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1">{c.description || `${productCount} products registered`}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCapacity(c);
                              setNewCapWattage(c.wattage);
                              setNewCapLabel(c.label);
                              setNewCapDesc(c.description || '');
                            }}
                            className="p-1 text-white/60 hover:text-white"
                            title="Edit Capacity"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (productCount > 0) {
                                alert(`Cannot delete capacity "${c.label}" because ${productCount} solar panel products are using it.`);
                                return;
                              }
                              if (confirm(`Delete capacity "${c.label}"?`)) {
                                onDeleteCapacity(c.id);
                              }
                            }}
                            className="p-1 text-white/40 hover:text-rose-400"
                            title="Delete Capacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: STOCK MANAGEMENT & ADJUSTMENT (Requirement #5) ================= */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Record Stock Movement</h3>
                  <p className="text-[10px] text-white/60">{showStockModal.name} ({showStockModal.capacityLabel})</p>
                </div>
              </div>
              <button
                onClick={() => setShowStockModal(null)}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStockActionSubmit} className="p-6 space-y-4">
              {/* Action Type Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                {(['Add Stock', 'Remove Stock', 'Adjust Stock'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStockActionType(type)}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      stockActionType === type 
                        ? 'bg-amber-500 text-slate-950 shadow-sm' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  {stockActionType === 'Adjust Stock' ? 'New Exact Quantity in Stock' : 'Quantity Count'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stockInputQty}
                  onChange={(e) => setStockInputQty(Number(e.target.value))}
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Movement Reason / Notes */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Notes / Reason for Movement *</label>
                <textarea
                  required
                  rows={2}
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="e.g. Received shipment from supplier invoice #8890, Dispatched to solar borehole project..."
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Stock Preview Math Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/60">Current Quantity:</span>
                  <span className="text-white font-bold">{showStockModal.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Updated Quantity:</span>
                  <span className="text-amber-300 font-bold">
                    {stockActionType === 'Add Stock' 
                      ? showStockModal.quantity + stockInputQty 
                      : stockActionType === 'Remove Stock' 
                      ? Math.max(0, showStockModal.quantity - stockInputQty) 
                      : stockInputQty} units
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-white/60">Updated Total Value:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(
                      (stockActionType === 'Add Stock' 
                        ? showStockModal.quantity + stockInputQty 
                        : stockActionType === 'Remove Stock' 
                        ? Math.max(0, showStockModal.quantity - stockInputQty) 
                        : stockInputQty) * showStockModal.unitPrice
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(null)}
                  className="px-4 py-2 bg-white/5 text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: STOCK MOVEMENT HISTORY LOGS (Requirement #5) ================= */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Stock Movement Audit Trail</h3>
                  <p className="text-[10px] text-white/60">Full movement history log for solar panel inventory</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-white/60 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Date & Time</th>
                      <th className="px-3 py-2.5">Product</th>
                      <th className="px-3 py-2.5">Movement Type</th>
                      <th className="px-3 py-2.5 text-center">Qty Change</th>
                      <th className="px-3 py-2.5 text-center">New Stock</th>
                      <th className="px-3 py-2.5">Performer</th>
                      <th className="px-3 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {stockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="px-3 py-2.5 text-white/60 text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-white font-sans font-medium">
                          {log.productName} ({log.capacityLabel})
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.changeType.includes('Add') || log.changeType.includes('Intake')
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {log.changeType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                        </td>
                        <td className="px-3 py-2.5 text-center text-amber-300">
                          {log.newQuantity}
                        </td>
                        <td className="px-3 py-2.5 text-white/80 font-sans">
                          {log.performerName} ({log.performerRole})
                        </td>
                        <td className="px-3 py-2.5 text-white/60 font-sans text-[11px]">
                          {log.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
