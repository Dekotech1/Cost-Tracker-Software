import React, { useState, useMemo } from 'react';
import {
  StoreWarehouse,
  RenewableProduct,
  InterStoreTransfer,
  TransferItem,
  TransferStatus,
  DynamicStockBalance,
  SerializedAsset,
} from '../../types/logistics';
import {
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  User,
  Barcode,
  Clock,
  Filter,
  Search,
  FileText,
  Trash2,
  Check,
  X,
  Zap,
  ChevronRight,
  ChevronLeft,
  Warehouse,
  Info,
} from 'lucide-react';

interface InterStoreTransferModuleProps {
  transfers: InterStoreTransfer[];
  stores: StoreWarehouse[];
  products: RenewableProduct[];
  stockBalances: DynamicStockBalance[];
  serializedAssets: SerializedAsset[];
  currentUserRole?: string;
  currentUserName?: string;
  onCreateTransfer: (transfer: Omit<InterStoreTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTransferStatus: (
    transferId: string,
    newStatus: TransferStatus,
    metadata?: {
      waybillNumber?: string;
      driverName?: string;
      driverPhone?: string;
      vehicleRegistration?: string;
      approvalNotes?: string;
      receivedNotes?: string;
      varianceNotes?: string;
    }
  ) => void;
  preselectedDestinationStoreId?: string | null;
}

export default function InterStoreTransferModule({
  transfers,
  stores,
  products,
  stockBalances,
  serializedAssets,
  currentUserRole = 'Administrator',
  currentUserName = 'System User',
  onCreateTransfer,
  onUpdateTransferStatus,
  preselectedDestinationStoreId,
}: InterStoreTransferModuleProps) {
  const [isCreatingTransfer, setIsCreatingTransfer] = useState<boolean>(!!preselectedDestinationStoreId);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTransferDetail, setSelectedTransferDetail] = useState<InterStoreTransfer | null>(null);

  // Status update modal state
  const [updatingTransfer, setUpdatingTransfer] = useState<{
    transfer: InterStoreTransfer;
    targetStatus: TransferStatus;
  } | null>(null);
  const [waybillInput, setWaybillInput] = useState<string>('');
  const [driverNameInput, setDriverNameInput] = useState<string>('');
  const [driverPhoneInput, setDriverPhoneInput] = useState<string>('');
  const [vehicleRegInput, setVehicleRegInput] = useState<string>('');
  const [actionNoteInput, setActionNoteInput] = useState<string>('');

  // Step 1 Form State
  const [originStoreId, setOriginStoreId] = useState<string>(stores[0]?.id || '');
  const [destinationStoreId, setDestinationStoreId] = useState<string>(
    preselectedDestinationStoreId || stores[1]?.id || ''
  );
  const [requestDate, setRequestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState<string>(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [logisticsVendor, setLogisticsVendor] = useState<string>('GIG Logistics Heavy Haulage');
  const [notes, setNotes] = useState<string>('');

  // Step 2 Form State (Items to transfer)
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Step 4 Form State (Compliance)
  const [hazardDisclaimerAccepted, setHazardDisclaimerAccepted] = useState<boolean>(false);
  const [transportChecklistAccepted, setTransportChecklistAccepted] = useState<boolean>(false);

  // Available stock helper for origin store
  const getOriginStock = (prodId: string) => {
    const bal = stockBalances.find((b) => b.storeId === originStoreId && b.productId === prodId);
    return bal ? bal.currentStock : 0;
  };

  const containsHazardous = useMemo(() => {
    return transferItems.some((item) => item.hazardClass !== 'Non-Hazardous');
  }, [transferItems]);

  const totalTransferValuation = useMemo(() => {
    return transferItems.reduce((acc, item) => acc + item.unitCost * item.quantityRequested, 0);
  }, [transferItems]);

  const totalTransferUnits = useMemo(() => {
    return transferItems.reduce((acc, item) => acc + item.quantityRequested, 0);
  }, [transferItems]);

  // Handle adding an item to the current transfer
  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const available = getOriginStock(prod.id);
    if (itemQuantity <= 0) return;
    if (itemQuantity > available) {
      alert(`Cannot transfer ${itemQuantity} units. Only ${available} available at origin store.`);
      return;
    }

    // Check if already in list
    const existingIndex = transferItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...transferItems];
      const newQty = updated[existingIndex].quantityRequested + itemQuantity;
      if (newQty > available) {
        alert(`Total quantity exceeds available stock (${available}) at origin store.`);
        return;
      }
      updated[existingIndex].quantityRequested = newQty;
      setTransferItems(updated);
    } else {
      const newItem: TransferItem = {
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        category: prod.category,
        uom: prod.uom,
        quantityRequested: itemQuantity,
        unitCost: prod.unitCost,
        hazardClass: prod.specs.hazardClass,
        requiresSerialization: prod.requiresSerialization,
        serialNumbers: [],
      };
      setTransferItems([...transferItems, newItem]);
    }

    setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(transferItems.filter((_, idx) => idx !== index));
  };

  // Generate / Assign Mock Serial Numbers for demonstration
  const handleAutoAssignSerials = (index: number) => {
    const item = transferItems[index];
    const prefix = item.category === 'Inverters' ? 'SN-INV' : 'SN-BAT';
    const genSerials: string[] = [];
    for (let i = 1; i <= item.quantityRequested; i++) {
      genSerials.push(`${prefix}-${item.sku.slice(0, 7)}-${1000 + i + Math.floor(Math.random() * 8000)}`);
    }
    const updated = [...transferItems];
    updated[index].serialNumbers = genSerials;
    setTransferItems(updated);
  };

  const handleManualSerialChange = (itemIndex: number, serialIndex: number, val: string) => {
    const updated = [...transferItems];
    const serials = [...updated[itemIndex].serialNumbers];
    serials[serialIndex] = val;
    updated[itemIndex].serialNumbers = serials;
    setTransferItems(updated);
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setTransferItems([]);
    setNotes('');
    setHazardDisclaimerAccepted(false);
    setTransportChecklistAccepted(false);
    setIsCreatingTransfer(false);
  };

  const handleSubmitNewTransfer = () => {
    if (transferItems.length === 0) {
      alert('Please add at least one item to transfer.');
      return;
    }
    if (originStoreId === destinationStoreId) {
      alert('Origin and Destination store cannot be identical.');
      return;
    }

    // Verify serial numbers for serialized items
    for (const item of transferItems) {
      if (item.requiresSerialization && item.serialNumbers.length < item.quantityRequested) {
        alert(`Item "${item.productName}" requires ${item.quantityRequested} serial numbers. Please scan or enter them.`);
        setCurrentStep(3);
        return;
      }
    }

    const originStore = stores.find((s) => s.id === originStoreId);
    const destStore = stores.find((s) => s.id === destinationStoreId);

    onCreateTransfer({
      originStoreId,
      originStoreName: originStore?.name || originStoreId,
      originState: originStore?.state || 'Origin State',
      destinationStoreId,
      destinationStoreName: destStore?.name || destinationStoreId,
      destinationState: destStore?.state || 'Destination State',
      requestDate: new Date(requestDate).toISOString(),
      estimatedArrivalDate: new Date(estimatedArrivalDate).toISOString(),
      logisticsVendor,
      status: 'Requested',
      items: transferItems,
      totalQuantity: totalTransferUnits,
      totalValuation: totalTransferValuation,
      containsHazardousMaterials: containsHazardous,
      hazardClassDisclaimerAccepted: hazardDisclaimerAccepted,
      approvalNotes: notes,
    });

    handleResetWizard();
  };

  // Open status modal
  const handleOpenStatusModal = (transfer: InterStoreTransfer, targetStatus: TransferStatus) => {
    setUpdatingTransfer({ transfer, targetStatus });
    setWaybillInput(transfer.waybillNumber || `WB-${Math.floor(100000 + Math.random() * 900000)}`);
    setDriverNameInput(transfer.driverName || '');
    setDriverPhoneInput(transfer.driverPhone || '');
    setVehicleRegInput(transfer.vehicleRegistration || '');
    setActionNoteInput('');
  };

  const handleConfirmStatusUpdate = () => {
    if (!updatingTransfer) return;
    const { transfer, targetStatus } = updatingTransfer;

    onUpdateTransferStatus(transfer.id, targetStatus, {
      waybillNumber: waybillInput,
      driverName: driverNameInput,
      driverPhone: driverPhoneInput,
      vehicleRegistration: vehicleRegInput,
      approvalNotes: targetStatus === 'Approved' ? actionNoteInput : undefined,
      receivedNotes: targetStatus === 'Received' ? actionNoteInput : undefined,
      varianceNotes: targetStatus === 'Reconciled/Variance Checked' ? actionNoteInput : undefined,
    });

    setUpdatingTransfer(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (selectedStatusFilter !== 'All' && t.status !== selectedStatusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchOrigin = t.originStoreName.toLowerCase().includes(q);
        const matchDest = t.destinationStoreName.toLowerCase().includes(q);
        const matchWb = (t.waybillNumber || '').toLowerCase().includes(q);
        if (!matchId && !matchOrigin && !matchDest && !matchWb) return false;
      }
      return true;
    });
  }, [transfers, selectedStatusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-400" />
            Inter-Store Material Transfers (STT)
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Nationwide multi-warehouse transit engine with hazardous UN3480 protocols and serialized asset verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreatingTransfer(true);
            setCurrentStep(1);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Initiate New Transfer Request</span>
        </button>
      </div>

      {/* MULTI-STEP TRANSFER CREATION MODAL / WIZARD */}
      {isCreatingTransfer && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6 relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                Store Transfer Ticket (STT) Initiation Wizard
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Inter-State Hardware Movement Request</h3>
            </div>
            <button
              type="button"
              onClick={handleResetWizard}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, label: '1. Route & Logistics' },
              { step: 2, label: '2. Select Items' },
              { step: 3, label: '3. Serial Numbers' },
              { step: 4, label: '4. Hazmat & Review' },
            ].map((s) => (
              <div
                key={s.step}
                className={`py-2 px-3 rounded-xl border text-xs font-mono text-center transition-all ${
                  currentStep === s.step
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : currentStep > s.step
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/5 border-white/5 text-white/30'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {/* STEP 1: ROUTE & LOGISTICS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Warehouse className="h-4 w-4 text-amber-400" /> Origin Store (Dispatch Warehouse)
                  </label>
                  <select
                    value={originStoreId}
                    onChange={(e) => setOriginStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.state}) - Manager: {s.storeManagerName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-white/50">Stock will be debited from this store upon dispatch.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Warehouse className="h-4 w-4 text-emerald-400" /> Requesting Store (Destination Warehouse)
                  </label>
                  <select
                    value={destinationStoreId}
                    onChange={(e) => setDestinationStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.id === originStoreId}>
                        {s.name} ({s.state}) {s.id === originStoreId ? '(Same as Origin)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-white/50">Stock will be credited to this store upon inward receipt.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">Planned Dispatch Date</label>
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">Estimated Arrival Date</label>
                  <input
                    type="date"
                    value={estimatedArrivalDate}
                    onChange={(e) => setEstimatedArrivalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">Transport Logistics Vendor</label>
                  <select
                    value={logisticsVendor}
                    onChange={(e) => setLogisticsVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="GIG Logistics Heavy Haulage">GIG Logistics Heavy Haulage</option>
                    <option value="DHL Supply Chain Nigeria">DHL Supply Chain Nigeria</option>
                    <option value="Kobo360 Energy Logistics">Kobo360 Energy Logistics</option>
                    <option value="Red Star Express Freight">Red Star Express Freight</option>
                    <option value="Internal Company Flatbed Fleet">Internal Company Flatbed Fleet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Purpose / Requisition Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replenishing regional inventory for North-Central mini-grid installations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (originStoreId === destinationStoreId) {
                      alert('Origin and Destination store cannot be the same warehouse.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Select Items</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ITEM SELECTION WITH REAL-TIME BALANCE CHECK */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Add Renewable Energy Hardware from Origin Store
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-xs text-white/70">Select Hardware Product / SKU</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {products.map((p) => {
                        const avail = getOriginStock(p.id);
                        return (
                          <option key={p.id} value={p.id}>
                            [{p.category}] {p.name} - Available: {avail} {p.uom}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-white/70">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Selected Product Specs Preview */}
                {(() => {
                  const p = products.find((x) => x.id === selectedProductId);
                  if (!p) return null;
                  const available = getOriginStock(p.id);
                  return (
                    <div className="bg-black/30 rounded-lg p-3 text-xs border border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300 font-bold">{p.sku}</span>
                        <span className="text-white/40">|</span>
                        <span className="text-white">{p.brand}</span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/70">Unit Cost: {formatCurrency(p.unitCost)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                            available > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          Available at Origin: {available} {p.uom}
                        </span>
                        {p.requiresSerialization && (
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                            <Barcode className="h-3 w-3" /> Serialized Asset
                          </span>
                        )}
                        {p.specs.hazardClass !== 'Non-Hazardous' && (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                            <Zap className="h-3 w-3" /> Hazmat
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Added Items List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white/70 block">
                  Items to Transfer ({transferItems.length} SKUs, {totalTransferUnits} Units)
                </span>

                {transferItems.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-white/40 text-xs">
                    No hardware added yet. Select a product above and click &quot;Add Item&quot;.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transferItems.map((item, idx) => (
                      <div
                        key={item.productId}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-400 font-bold">{item.sku}</span>
                            <span className="text-white font-medium">{item.productName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/50">
                            <span>Category: {item.category}</span>
                            <span>•</span>
                            <span>Unit Cost: {formatCurrency(item.unitCost)}</span>
                            {item.requiresSerialization && (
                              <span className="text-indigo-400 font-mono">[Requires Serial Entry]</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right font-mono">
                            <span className="font-bold text-white text-sm">
                              {item.quantityRequested} {item.uom}
                            </span>
                            <p className="text-[11px] text-emerald-400">
                              {formatCurrency(item.unitCost * item.quantityRequested)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10 text-xs font-mono">
                      <span className="text-white/70">Total Transfer Requisition Valuation:</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        {formatCurrency(totalTransferValuation)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Route</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (transferItems.length === 0) {
                      alert('Please add at least one item.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Serial Numbers</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SERIAL NUMBER ASSIGNMENT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2 text-xs">
                <Barcode className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-indigo-300">Serialized Asset Verification</h5>
                  <p className="text-indigo-200/70 text-[11px] mt-0.5">
                    High-value equipment (Hybrid Inverters, LiFePO4 Energy Banks) requires individual barcode/serial
                    number scanning for warranty tracking and chain-of-custody transfer.
                  </p>
                </div>
              </div>

              {transferItems.filter((i) => i.requiresSerialization).length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10 text-white/60 text-xs">
                  None of the currently selected items require serialized tracking (e.g. bulk solar cables or mounting
                  hardware). You can proceed to the final review step.
                </div>
              ) : (
                <div className="space-y-4">
                  {transferItems.map((item, itemIdx) => {
                    if (!item.requiresSerialization) return null;
                    const assignedCount = item.serialNumbers.length;
                    const isComplete = assignedCount >= item.quantityRequested;

                    return (
                      <div
                        key={item.productId}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-400">{item.sku}</span>
                            <h5 className="text-xs font-bold text-white">{item.productName}</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isComplete
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              }`}
                            >
                              {assignedCount} / {item.quantityRequested} Serials
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAutoAssignSerials(itemIdx)}
                              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Barcode className="h-3.5 w-3.5" />
                              <span>Simulate Barcode Scan</span>
                            </button>
                          </div>
                        </div>

                        {/* Individual Serial Input fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {Array.from({ length: item.quantityRequested }).map((_, sIdx) => (
                            <div key={sIdx} className="space-y-1">
                              <label className="text-[10px] font-mono text-white/50">
                                Unit #{sIdx + 1} Serial No.
                              </label>
                              <input
                                type="text"
                                placeholder={`Scan or enter serial #${sIdx + 1}`}
                                value={item.serialNumbers[sIdx] || ''}
                                onChange={(e) => handleManualSerialChange(itemIdx, sIdx, e.target.value)}
                                className="w-full bg-slate-950 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-indigo-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Hazmat & Review</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: HAZMAT PROTOCOLS, COMPLIANCE & SUBMIT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Hazmat Warning Card if containing Lithium batteries */}
              {containsHazardous ? (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-rose-400 animate-pulse" />
                    <h5 className="font-bold text-rose-300 text-xs uppercase tracking-wider">
                      UN3480 Class 9 Hazardous Materials Protocol Required
                    </h5>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed">
                    This transfer shipment contains Lithium-ion / LiFePO4 Energy Storage Batteries. Under Federal
                    Dangerous Goods Road Regulations, driver must be certified, SoC must not exceed 30%, and vehicles
                    must display Class 9 hazardous diamond placards.
                  </p>

                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hazardDisclaimerAccepted}
                      onChange={(e) => setHazardDisclaimerAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs text-white font-medium">
                      I confirm that all battery units are packaged in UN-certified crates, discharged to ≤30% SoC, and
                      vehicle driver holds Dangerous Goods certification.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Standard non-hazardous renewable equipment manifest. No special hazmat road clearance required.</span>
                </div>
              )}

              {/* Inter-State Transport Checklist */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Inter-State Highway Dispatch Checklist
                </h5>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={transportChecklistAccepted}
                    onChange={(e) => setTransportChecklistAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-white/80">
                    Carrier Goods-in-Transit (GIT) insurance confirmed active; quadruplicate waybill documents prepared for
                    Origin Store, Carrier Driver, Destination Store, and Regional Financial Audit.
                  </span>
                </label>
              </div>

              {/* Summary Overview */}
              <div className="bg-slate-950 rounded-xl p-4 border border-white/10 space-y-3 text-xs">
                <h5 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Transfer Summary</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Origin Store</span>
                    <span className="font-semibold text-white">{stores.find((s) => s.id === originStoreId)?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Destination Store</span>
                    <span className="font-semibold text-white">{stores.find((s) => s.id === destinationStoreId)?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Total Units</span>
                    <span className="font-bold text-white font-mono">{totalTransferUnits} Hardware Units</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Total Valuation</span>
                    <span className="font-extrabold text-emerald-400 font-mono">
                      {formatCurrency(totalTransferValuation)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Serials</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNewTransfer}
                  disabled={containsHazardous && !hazardDisclaimerAccepted}
                  className={`font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all ${
                    containsHazardous && !hazardDisclaimerAccepted
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span>Submit Inter-Store Transfer Request</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FILTER & SEARCH BAR FOR TRANSFERS LIST */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search STT #, stores, or waybill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-white/60">Lifecycle Filter:</span>
          {[
            'All',
            'Requested',
            'Approved',
            'In Transit',
            'Received',
            'Reconciled/Variance Checked',
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSFERS TABLE & LIFECYCLE CARDS */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 text-center text-white/40 text-xs">
            No transfer requests match your filter.
          </div>
        ) : (
          filteredTransfers.map((transfer) => {
            const isHazardous = transfer.containsHazardousMaterials;
            return (
              <div
                key={transfer.id}
                className="bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-5 shadow-xl space-y-4"
              >
                {/* Top Row: STT Info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{transfer.id}</span>
                        {isHazardous && (
                          <span className="text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <Zap className="h-3 w-3" /> UN3480 Hazmat
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-white/40">
                          Requested: {new Date(transfer.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 font-mono">
                        Carrier: {transfer.logisticsVendor} • Waybill: {transfer.waybillNumber || 'Awaiting Dispatch'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        transfer.status === 'In Transit'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                          : transfer.status === 'Approved'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : transfer.status === 'Received'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : transfer.status === 'Reconciled/Variance Checked'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                          : 'bg-white/10 border-white/20 text-white/70'
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </div>
                </div>

                {/* Route Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/20 rounded-xl p-3 border border-white/5 items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Dispatching Warehouse (Origin)</span>
                    <p className="text-xs font-bold text-white">{transfer.originStoreName}</p>
                    <p className="text-[11px] text-white/50">{transfer.originState}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center px-2 py-1">
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="h-0.5 w-8 bg-amber-400/40"></span>
                      <Truck className="h-4 w-4" />
                      <span className="h-0.5 w-8 bg-amber-400/40"></span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 mt-1">
                      {transfer.dispatchDate
                        ? `Dispatched: ${new Date(transfer.dispatchDate).toLocaleDateString()}`
                        : 'Awaiting loading'}
                    </span>
                  </div>

                  <div className="space-y-0.5 md:text-right">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Destination Warehouse</span>
                    <p className="text-xs font-bold text-white">{transfer.destinationStoreName}</p>
                    <p className="text-[11px] text-white/50">{transfer.destinationState}</p>
                  </div>
                </div>

                {/* Item List Summary */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
                    Manifest Items ({transfer.totalQuantity} items • {formatCurrency(transfer.totalValuation)}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {transfer.items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono text-amber-300 font-bold">{item.sku}</span>
                          <p className="text-white truncate max-w-[220px]">{item.productName}</p>
                          {item.serialNumbers.length > 0 && (
                            <span className="text-[10px] font-mono text-indigo-300">
                              {item.serialNumbers.length} Serial(s) Assigned
                            </span>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-white">
                            {item.quantityRequested} {item.uom}
                          </span>
                          <p className="text-[10px] text-white/40">{formatCurrency(item.unitCost * item.quantityRequested)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifecycle Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                    {transfer.approvedBy && <span>Approved by: {transfer.approvedBy}</span>}
                    {transfer.receivedBy && <span>• Received by: {transfer.receivedBy}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {transfer.status === 'Requested' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(transfer, 'Approved')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve Transfer</span>
                      </button>
                    )}

                    {transfer.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(transfer, 'In Transit')}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors shadow-md shadow-amber-500/10"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Dispatch & Issue Waybill</span>
                      </button>
                    )}

                    {transfer.status === 'In Transit' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(transfer, 'Received')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Receive at Destination Dock</span>
                      </button>
                    )}

                    {transfer.status === 'Received' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(transfer, 'Reconciled/Variance Checked')}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Reconcile & Audit Variance</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LIFECYCLE MODAL (DISPATCH, RECEIVE, RECONCILE) */}
      {updatingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                  Transfer Lifecycle Action
                </span>
                <h4 className="text-base font-bold text-white">
                  Advance STT #{updatingTransfer.transfer.id} to &quot;{updatingTransfer.targetStatus}&quot;
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingTransfer(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {updatingTransfer.targetStatus === 'In Transit' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white">Waybill / Tracking Number</label>
                  <input
                    type="text"
                    value={waybillInput}
                    onChange={(e) => setWaybillInput(e.target.value)}
                    placeholder="e.g. GIG-STT-992144-KN"
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70">Assigned Driver Name</label>
                    <input
                      type="text"
                      value={driverNameInput}
                      onChange={(e) => setDriverNameInput(e.target.value)}
                      placeholder="e.g. Haruna Ibrahim"
                      className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/70">Driver Phone</label>
                    <input
                      type="text"
                      value={driverPhoneInput}
                      onChange={(e) => setDriverPhoneInput(e.target.value)}
                      placeholder="e.g. +234 802 333 9988"
                      className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">Vehicle Registration / Trailer Plate</label>
                  <input
                    type="text"
                    value={vehicleRegInput}
                    onChange={(e) => setVehicleRegInput(e.target.value)}
                    placeholder="e.g. KJA-829-XA (Mack 30-Ton)"
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-white/70">Operational Notes / Comments</label>
              <textarea
                rows={2}
                value={actionNoteInput}
                onChange={(e) => setActionNoteInput(e.target.value)}
                placeholder="Add verification notes, seal numbers, or inspection notes..."
                className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUpdatingTransfer(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl transition-colors shadow-md shadow-amber-500/20"
              >
                Confirm Update to &quot;{updatingTransfer.targetStatus}&quot;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
