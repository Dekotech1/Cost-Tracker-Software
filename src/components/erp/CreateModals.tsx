import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowRightLeft,
  Truck,
  Layers,
  ShieldCheck,
  Landmark,
  Users2,
  Package,
  AlertTriangle,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { erpService } from '../../services/erpStorageService';
import {
  EnterpriseUser,
  PurchaseRequisition,
  InterStoreTransferOrder,
  DigitalWaybill,
  GoodsReceiptNote,
  SerializedAssetRecord,
  EnterpriseProgram,
  EnterpriseCommunity,
  EnterpriseStore,
} from '../../types/erp';

interface CreateModalsProps {
  modalType: string | null;
  onClose: () => void;
  currentUser: EnterpriseUser;
  transferDataFromPR?: PurchaseRequisition | null;
}

export default function CreateModals({
  modalType,
  onClose,
  currentUser,
  transferDataFromPR,
}: CreateModalsProps) {
  const stores = erpService.getStores();
  const programs = erpService.getPrograms();
  const communities = erpService.getCommunities();
  const items = erpService.getItems();

  // 1. REQUISITION FORM STATE
  const [prProgramId, setPrProgramId] = useState(programs[0]?.id || '');
  const [prCommunityId, setPrCommunityId] = useState(communities[0]?.id || '');
  const [prPriority, setPrPriority] = useState<'Standard' | 'Urgent' | 'Critical'>('Standard');
  const [prSelectedItemId, setPrSelectedItemId] = useState(items[0]?.id || '');
  const [prQuantity, setPrQuantity] = useState(50);

  // 2. TRANSFER FORM STATE
  const [sttSourceStore, setSttSourceStore] = useState(stores[0]?.id || '');
  const [sttDestStore, setSttDestStore] = useState(stores[1]?.id || '');
  const [sttDriverName, setSttDriverName] = useState('Babatunde Alabi');
  const [sttVehicleReg, setSttVehicleReg] = useState('KJA-892-XD (15-Ton Truck)');
  const [sttCarrier, setSttCarrier] = useState('Apex Haulage Logistics Ltd');
  const [sttDriverPhone, setSttDriverPhone] = useState('+234 802 334 8812');
  const [sttDriverLicense, setSttDriverLicense] = useState('DL-LAG-2023-8891');

  // 3. WAYBILL FORM STATE
  const [wbSourceStore, setWbSourceStore] = useState(stores[0]?.id || '');
  const [wbDestStore, setWbDestStore] = useState(stores[1]?.id || '');
  const [wbDriverName, setWbDriverName] = useState('Suleiman Danjuma');
  const [wbVehicleReg, setWbVehicleReg] = useState('ABJ-443-KN (Flatbed Truck)');
  const [wbCarrier, setWbCarrier] = useState('Trans-Sahara Haulage');

  // 4. GRN FORM STATE
  const [grnStoreId, setGrnStoreId] = useState(stores[1]?.id || '');
  const [grnPoNumber, setGrnPoNumber] = useState('PO-2025-0044');
  const [grnAcceptedQty, setGrnAcceptedQty] = useState(195);
  const [grnDamagedQty, setGrnDamagedQty] = useState(5);
  const [grnConditionNotes, setGrnConditionNotes] = useState('5 panels micro-cracked in transit; moved to Bay Q-01');

  // 5. ASSET REGISTER STATE
  const [assetTag, setAssetTag] = useState(`AST-SOL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [assetSerial, setAssetSerial] = useState(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [assetItemId, setAssetItemId] = useState(items[0]?.id || '');
  const [assetCommunityId, setAssetCommunityId] = useState(communities[0]?.id || '');
  const [assetCapacity, setAssetCapacity] = useState('550W Tier-1 Monocrystalline');

  // 6. PROGRAMME STATE
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progDonor, setProgDonor] = useState('World Bank / REA');
  const [progBudget, setProgBudget] = useState(250000000);

  // 7. COMMUNITY STATE
  const [commName, setCommName] = useState('');
  const [commCode, setCommCode] = useState('');
  const [commState, setCommState] = useState('Niger');
  const [commLga, setCommLga] = useState('Mokwa');
  const [commKwp, setCommKwp] = useState(120);
  const [commKwh, setCommKwh] = useState(380);

  if (!modalType) return null;

  // HANDLERS
  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    const selItem = items.find((i) => i.id === prSelectedItemId);
    const selProg = programs.find((p) => p.id === prProgramId);
    const selComm = communities.find((c) => c.id === prCommunityId);
    if (!selItem || !selProg || !selComm) return;

    const prNum = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const estTotal = prQuantity * selItem.standardCost;

    const newPr: PurchaseRequisition = {
      id: `pr-${Date.now()}`,
      prNumber: prNum,
      programId: selProg.id,
      programName: selProg.name,
      communityId: selComm.id,
      communityName: selComm.name,
      targetStoreId: stores[0]?.id || 'str-lag-central-01',
      targetStoreName: stores[0]?.name || 'Apex National Central Depot',
      requestingDepartment: 'Site Engineering',
      requestingUserId: currentUser.id,
      requestingUserName: currentUser.name,
      requiredDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      priority: prPriority,
      budgetCode: 'CAPEX-SOL-2025',
      createdDate: new Date().toISOString(),
      estimatedTotalCost: estTotal,
      justification: 'Off-grid community installation expansion',
      status: 'Pending Store Review',
      currentApprovalLevel: 'Store Review',
      items: [
        {
          id: `pri-${Date.now()}`,
          itemId: selItem.id,
          itemName: selItem.name,
          itemSku: selItem.sku,
          category: selItem.category,
          quantityRequested: prQuantity,
          estimatedUnitCost: selItem.standardCost,
          estimatedTotalCost: estTotal,
          specificationNotes: 'Tier-1 High-Efficiency Module',
          internalStockAvailableNear: true,
          nearestStoreRecommendation: {
            storeId: stores[0]?.id || 'str-lag-central-01',
            storeName: stores[0]?.name || 'Apex National Central Depot',
            distanceKm: 180,
            availableToTransfer: 700,
          },
        },
      ],
      approvalHistory: [],
    };

    erpService.saveRequisition(newPr);
    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'Requisition',
      recordId: prNum,
      action: 'PR Submission',
      newStateSummary: `Submitted by ${currentUser.name} for ₦${estTotal.toLocaleString()}`,
    });

    onClose();
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const srcStore = stores.find((s) => s.id === sttSourceStore);
    const destStore = stores.find((s) => s.id === sttDestStore);
    if (!srcStore || !destStore) return;

    const transferNum = `STT-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const waybillNum = `WB-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTransfer: InterStoreTransferOrder = {
      id: `stt-${Date.now()}`,
      transferNumber: transferNum,
      status: 'In Transit',
      sourceStoreId: srcStore.id,
      sourceStoreName: srcStore.name,
      destinationStoreId: destStore.id,
      destinationStoreName: destStore.name,
      programId: programs[0]?.id || 'prog-01',
      programName: programs[0]?.name || 'Nigeria Electrification Project (NEP)',
      requestedByUserId: currentUser.id,
      requestedByUserName: currentUser.name,
      dispatchDate: new Date().toISOString(),
      expectedArrivalDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      carrierCompany: sttCarrier,
      driverName: sttDriverName,
      driverPhone: sttDriverPhone,
      vehicleRegistration: sttVehicleReg,
      waybillNumber: waybillNum,
      items: [
        {
          id: `stti-${Date.now()}`,
          itemId: items[0]?.id || 'item-1',
          itemName: items[0]?.name || 'Jinko Solar 550W Module',
          itemSku: items[0]?.sku || 'PV-550W-JKM',
          quantityRequested: 200,
          quantityPicked: 200,
          quantityDispatched: 200,
          quantityReceived: 0,
          unitCost: items[0]?.standardCost || 115000,
          serialNumbers: ['SN-JKM-9001', 'SN-JKM-9002', 'SN-JKM-9003'],
        },
      ],
    };

    erpService.saveTransfer(newTransfer);

    // Also issue digital waybill
    const newWb: DigitalWaybill = {
      id: `wb-${Date.now()}`,
      waybillNumber: waybillNum,
      transferNumber: transferNum,
      status: 'En Route',
      sourceStoreId: srcStore.id,
      sourceStoreName: srcStore.name,
      destinationStoreId: destStore.id,
      destinationStoreName: destStore.name,
      dispatchTimestamp: new Date().toISOString(),
      dispatchGpsCoordinates: srcStore.gpsCoordinates,
      driverName: sttDriverName,
      driverLicenseNumber: sttDriverLicense,
      vehicleRegistration: sttVehicleReg,
      carrierCompany: sttCarrier,
      storeOfficerSignatureName: currentUser.name,
      driverSignatureName: sttDriverName,
      verificationHash: `sha256_${Math.random().toString(36).substring(2)}${Date.now()}`,
      itemsSummary: [
        {
          itemName: items[0]?.name || 'Jinko Solar 550W Module',
          sku: items[0]?.sku || 'PV-550W-JKM',
          quantity: 200,
        },
      ],
    };

    erpService.saveWaybill(newWb);

    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'Transfer',
      recordId: transferNum,
      action: 'Transfer Dispatch & Waybill Issue',
      newStateSummary: `Dispatched from ${srcStore.name} to ${destStore.name}`,
    });

    onClose();
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const destStore = stores.find((s) => s.id === grnStoreId);
    if (!destStore) return;

    const grnNum = `GRN-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const hasDiscrepancy = grnDamagedQty > 0;

    const newGrn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: grnNum,
      receivingStoreId: destStore.id,
      receivingStoreName: destStore.name,
      receivedDate: new Date().toISOString(),
      receivingOfficerId: currentUser.id,
      receivingOfficerName: currentUser.name,
      poNumber: grnPoNumber,
      waybillNumber: 'WB-2025-0012',
      vendorOrSenderName: 'Apex Central Depot Logistics Fleet',
      overallCondition: hasDiscrepancy ? 'Minor Discrepancy' : 'Excellent',
      receiptType: hasDiscrepancy ? 'Discrepancy' : 'Full Receipt',
      hasDiscrepancies: hasDiscrepancy,
      quarantineRequired: hasDiscrepancy,
      quarantineLocation: hasDiscrepancy ? `${destStore.code}-Quarantine-Bay-Q01` : undefined,
      remarks: grnConditionNotes,
      verificationHash: `sha256_${Math.random().toString(36).substring(2)}`,
      items: [
        {
          id: `grni-${Date.now()}`,
          itemId: items[0]?.id || 'item-1',
          itemName: items[0]?.name || 'Jinko Solar 550W Module',
          itemSku: items[0]?.sku || 'PV-550W-JKM',
          expectedQuantity: grnAcceptedQty + grnDamagedQty,
          receivedQuantity: grnAcceptedQty + grnDamagedQty,
          acceptedQuantity: grnAcceptedQty,
          damagedQuantity: grnDamagedQty,
          missingQuantity: 0,
          quarantinedQuantity: grnDamagedQty,
          unitCost: 115000,
          acceptedTotalValue: grnAcceptedQty * 115000,
          conditionNotes: grnConditionNotes,
        },
      ],
    };

    erpService.saveGRN(newGrn);

    // Record stock movement for accepted units
    erpService.recordStockTransaction({
      transactionType: 'PURCHASE RECEIPT',
      itemId: items[0]?.id || 'item-1',
      itemName: items[0]?.name || 'Jinko Solar 550W Module',
      itemSku: items[0]?.sku || 'PV-550W-JKM',
      category: 'SOLAR PANELS',
      quantity: grnAcceptedQty,
      unitCost: 115000,
      totalValue: grnAcceptedQty * 115000,
      destinationLocationId: destStore.id,
      destinationLocationName: destStore.name,
      beforeBalance: 200,
      afterBalance: 200 + grnAcceptedQty,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      referenceDocumentType: 'GRN',
      referenceDocumentId: grnNum,
      reason: `Physical receipt inspection for ${grnNum}`,
    });

    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'GRN',
      recordId: grnNum,
      action: 'Goods Receipt Inspection',
      newStateSummary: `Accepted: ${grnAcceptedQty}, Quarantined: ${grnDamagedQty}`,
    });

    onClose();
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const selItem = items.find((i) => i.id === assetItemId);
    const selComm = communities.find((c) => c.id === assetCommunityId);
    if (!selItem || !selComm) return;

    const newAsset: SerializedAssetRecord = {
      id: `asset-${Date.now()}`,
      assetTag: assetTag,
      serialNumber: assetSerial,
      itemId: selItem.id,
      itemName: selItem.name,
      category: selItem.category,
      brand: selItem.brand || 'Tier-1 Solar',
      model: selItem.sku,
      capacityRating: assetCapacity,
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseCost: selItem.standardCost,
      programId: programs[0]?.id || 'prog-01',
      programName: programs[0]?.name || 'National Electrification Initiative',
      communityId: selComm.id,
      communityName: selComm.name,
      deploymentSiteName: `${selComm.name} Mini-Grid Station Array`,
      installationDate: new Date().toISOString().slice(0, 10),
      condition: 'Brand New',
      operationalStatus: 'Operational',
      warrantyExpiryDate: '2035-08-15',
      nextMaintenanceDate: '2026-02-15',
      currentCustodian: currentUser.name,
    };

    erpService.saveAsset(newAsset);
    erpService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '127.0.0.1',
      entityType: 'Asset',
      recordId: assetTag,
      action: 'Asset Registered',
      newStateSummary: `Assigned to ${selComm.name} (${assetCapacity})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">
              {modalType === 'requisition' && 'Create Purchase Requisition (PR)'}
              {modalType === 'transfer' && 'Issue Inter-Store Transfer Order (STT)'}
              {modalType === 'grn' && 'Log Goods Receipt Note (GRN)'}
              {modalType === 'asset' && 'Register Serialized Solar Asset'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. REQUISITION MODAL */}
          {modalType === 'requisition' && (
            <form onSubmit={handleCreatePR} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Programme</label>
                <select
                  value={prProgramId}
                  onChange={(e) => setPrProgramId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Community Site</label>
                <select
                  value={prCommunityId}
                  onChange={(e) => setPrCommunityId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.state} State ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material SKU</label>
                  <select
                    value={prSelectedItemId}
                    onChange={(e) => setPrSelectedItemId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Requested</label>
                  <input
                    type="number"
                    min={1}
                    value={prQuantity}
                    onChange={(e) => setPrQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requisition Priority</label>
                <select
                  value={prPriority}
                  onChange={(e) => setPrPriority(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Standard">Standard (7-14 Days)</option>
                  <option value="Urgent">Urgent (3-5 Days)</option>
                  <option value="Critical">Critical Breakdown (&lt;48 Hours)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          )}

          {/* 2. TRANSFER MODAL */}
          {modalType === 'transfer' && (
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Origin Source Depot</label>
                  <select
                    value={sttSourceStore}
                    onChange={(e) => setSttSourceStore(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination Depot / Site</label>
                  <select
                    value={sttDestStore}
                    onChange={(e) => setSttDestStore(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Carrier Haulage Company</label>
                  <input
                    type="text"
                    value={sttCarrier}
                    onChange={(e) => setSttCarrier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Registration</label>
                  <input
                    type="text"
                    value={sttVehicleReg}
                    onChange={(e) => setSttVehicleReg(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    value={sttDriverName}
                    onChange={(e) => setSttDriverName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={sttDriverPhone}
                    onChange={(e) => setSttDriverPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Dispatch Transfer &amp; Waybill
                </button>
              </div>
            </form>
          )}

          {/* 3. GRN MODAL */}
          {modalType === 'grn' && (
            <form onSubmit={handleCreateGRN} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Receiving Depot Store</label>
                <select
                  value={grnStoreId}
                  onChange={(e) => setGrnStoreId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Accepted</label>
                  <input
                    type="number"
                    value={grnAcceptedQty}
                    onChange={(e) => setGrnAcceptedQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Damaged (Quarantine)</label>
                  <input
                    type="number"
                    value={grnDamagedQty}
                    onChange={(e) => setGrnDamagedQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inspection &amp; Quarantine Notes</label>
                <textarea
                  rows={3}
                  value={grnConditionNotes}
                  onChange={(e) => setGrnConditionNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Confirm Physical Receipt (GRN)
                </button>
              </div>
            </form>
          )}

          {/* 4. ASSET MODAL */}
          {modalType === 'asset' && (
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Asset Tag ID</label>
                  <input
                    type="text"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Manufacturer Serial Number</label>
                  <input
                    type="text"
                    value={assetSerial}
                    onChange={(e) => setAssetSerial(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Equipment Model</label>
                <select
                  value={assetItemId}
                  onChange={(e) => setAssetItemId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deployed Community Site</label>
                <select
                  value={assetCommunityId}
                  onChange={(e) => setAssetCommunityId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.state} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Register Asset Tag
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
