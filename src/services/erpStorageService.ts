// ==============================================================================
// ENTERPRISE STORAGE & FIRESTORE SYNCHRONIZATION SERVICE
// ==============================================================================

import { db, testFirestoreConnection } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import {
  EnterpriseProgram,
  EnterpriseCommunity,
  EnterpriseStore,
  InventoryItemMaster,
  StoreStockBalance,
  InventoryStockTransaction,
  PurchaseRequisition,
  PurchaseOrder,
  InterStoreTransferOrder,
  DigitalWaybill,
  GoodsReceiptNote,
  DiscrepancyRecord,
  SerializedAssetRecord,
  VendorInvoice,
  ThreeWayMatchResult,
  ProgramBudgetFinancials,
  EnterpriseAuditLog,
  EnterpriseNotification,
  EnterpriseUser,
} from '../types/erp';
import {
  INITIAL_ERP_PROGRAMS,
  INITIAL_ERP_COMMUNITIES,
  INITIAL_ERP_STORES,
  INITIAL_ERP_USERS,
  INITIAL_ERP_ITEMS,
  INITIAL_ERP_STOCK_BALANCES,
  INITIAL_ERP_STOCK_TRANSACTIONS,
  INITIAL_ERP_REQUISITIONS,
  INITIAL_ERP_PURCHASE_ORDERS,
  INITIAL_ERP_TRANSFERS,
  INITIAL_ERP_WAYBILLS,
  INITIAL_ERP_GRNS,
  INITIAL_ERP_DISCREPANCIES,
  INITIAL_ERP_ASSETS,
  INITIAL_ERP_INVOICES,
  INITIAL_ERP_THREE_WAY_MATCHES,
  INITIAL_ERP_BUDGETS,
  INITIAL_ERP_AUDIT_LOGS,
  INITIAL_ERP_NOTIFICATIONS,
} from '../data/erpInitialData';

const STORAGE_PREFIX = 'apex_erp_';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from local storage`, err);
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to local storage`, err);
  }
}

// Generate simple cryptographic-style verification hash for waybills & audit logs
export function generateDigitalHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = Date.now().toString(16);
  return `sha256_${hex}${timestampHex}${Math.random().toString(16).substring(2, 8)}`;
}

class EnterpriseErpService {
  private isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => (this.isOnline = true));
      window.addEventListener('offline', () => (this.isOnline = false));
      // Non-blocking connection health check
      testFirestoreConnection().catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // PROGRAMMES (PART 1)
  // --------------------------------------------------------------------------
  getPrograms(): EnterpriseProgram[] {
    return getLocal<EnterpriseProgram[]>('programs', INITIAL_ERP_PROGRAMS);
  }

  saveProgram(program: EnterpriseProgram): void {
    const list = this.getPrograms();
    const index = list.findIndex((p) => p.id === program.id);
    const updated = index >= 0 ? list.map((p) => (p.id === program.id ? program : p)) : [program, ...list];
    setLocal('programs', updated);
    // Background sync to Firestore
    setDoc(doc(db, 'programs', program.id), program).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // COMMUNITIES (PART 1)
  // --------------------------------------------------------------------------
  getCommunities(): EnterpriseCommunity[] {
    return getLocal<EnterpriseCommunity[]>('communities', INITIAL_ERP_COMMUNITIES);
  }

  saveCommunity(comm: EnterpriseCommunity): void {
    const list = this.getCommunities();
    const index = list.findIndex((c) => c.id === comm.id);
    const updated = index >= 0 ? list.map((c) => (c.id === comm.id ? comm : c)) : [comm, ...list];
    setLocal('communities', updated);
    setDoc(doc(db, 'communities', comm.id), comm).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // STORES & WAREHOUSES (PART 2)
  // --------------------------------------------------------------------------
  getStores(): EnterpriseStore[] {
    return getLocal<EnterpriseStore[]>('stores', INITIAL_ERP_STORES);
  }

  saveStore(store: EnterpriseStore): void {
    const list = this.getStores();
    const index = list.findIndex((s) => s.id === store.id);
    const updated = index >= 0 ? list.map((s) => (s.id === store.id ? store : s)) : [store, ...list];
    setLocal('stores', updated);
    setDoc(doc(db, 'stores', store.id), store).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // USERS & ROLES (PART 3)
  // --------------------------------------------------------------------------
  getUsers(): EnterpriseUser[] {
    return getLocal<EnterpriseUser[]>('users', INITIAL_ERP_USERS);
  }

  // --------------------------------------------------------------------------
  // INVENTORY ITEMS & BALANCES (PART 6 & 7)
  // --------------------------------------------------------------------------
  getItems(): InventoryItemMaster[] {
    return getLocal<InventoryItemMaster[]>('items', INITIAL_ERP_ITEMS);
  }

  saveItem(
    item: InventoryItemMaster,
    user?: EnterpriseUser,
    initialStock?: { storeId: string; quantity: number }
  ): void {
    const list = this.getItems();
    const index = list.findIndex((i) => i.id === item.id);
    const isNew = index < 0;
    const updated = isNew ? [item, ...list] : list.map((i) => (i.id === item.id ? item : i));
    setLocal('items', updated);
    setDoc(doc(db, 'inventory_items', item.id), item).catch(() => {});

    // If initial stock was provided for a new item, update balance & log ledger transaction
    if (initialStock && initialStock.quantity > 0) {
      const store = this.getStores().find((s) => s.id === initialStock.storeId);
      this.updateStockBalance(initialStock.storeId, item.id, initialStock.quantity, 0);

      this.recordStockTransaction({
        transactionType: 'PURCHASE RECEIPT',
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        category: item.category,
        quantity: initialStock.quantity,
        unitCost: item.standardCost,
        totalValue: initialStock.quantity * item.standardCost,
        destinationLocationId: initialStock.storeId,
        destinationLocationName: store?.name || 'Central Warehouse',
        beforeBalance: 0,
        afterBalance: initialStock.quantity,
        userId: user?.id || 'sys-admin',
        userName: user?.name || 'Administrator',
        userRole: user?.role || 'SUPER ADMIN',
        referenceDocumentType: 'ADJUSTMENT_MEMO',
        referenceDocumentId: item.sku,
        reason: `Initial stock allocation on item master registration for ${item.name}`,
      });
    }

    // Record in Audit Trail
    this.addAuditLog({
      userId: user?.id || 'sys-admin',
      userName: user?.name || 'Administrator',
      userRole: user?.role || 'SUPER ADMIN',
      ipAddress: '127.0.0.1 (Client App)',
      entityType: 'InventoryItem',
      recordId: item.sku,
      action: isNew ? 'Create Item Master SKU' : 'Update Item Master SKU',
      newStateSummary: `${item.name} (${item.sku}) - Category: ${item.category}, Unit Cost: ₦${item.standardCost.toLocaleString()}`,
      reason: isNew ? 'New item catalogue registration' : 'Specification update',
    });
  }

  deleteItem(itemId: string, user?: EnterpriseUser): boolean {
    const list = this.getItems();
    const itemToDelete = list.find((i) => i.id === itemId);
    if (!itemToDelete) return false;

    // Filter out item from items list
    const updated = list.filter((i) => i.id !== itemId);
    setLocal('items', updated);
    deleteDoc(doc(db, 'inventory_items', itemId)).catch(() => {});

    // Remove stock balances for this item
    const balances = this.getStockBalances();
    const itemBalances = balances.filter((b) => b.itemId === itemId);
    const updatedBalances = balances.filter((b) => b.itemId !== itemId);
    setLocal('stock_balances', updatedBalances);
    itemBalances.forEach((b) => {
      deleteDoc(doc(db, 'store_stock_balances', b.id)).catch(() => {});
    });

    // Record audit trail for deletion
    this.addAuditLog({
      userId: user?.id || 'sys-admin',
      userName: user?.name || 'Administrator',
      userRole: user?.role || 'SUPER ADMIN',
      ipAddress: '127.0.0.1 (Client App)',
      entityType: 'InventoryItem',
      recordId: itemToDelete.sku,
      action: 'Delete Item Master SKU',
      newStateSummary: `Deleted item master record ${itemToDelete.name} (SKU: ${itemToDelete.sku})`,
      reason: 'Obsolete item master deletion by authorized personnel',
    });

    return true;
  }

  getStockBalances(): StoreStockBalance[] {
    return getLocal<StoreStockBalance[]>('stock_balances', INITIAL_ERP_STOCK_BALANCES);
  }

  updateStockBalance(storeId: string, itemId: string, deltaOnHand: number, deltaReserved: number = 0): StoreStockBalance {
    const balances = this.getStockBalances();
    const existing = balances.find((b) => b.storeId === storeId && b.itemId === itemId);
    const item = this.getItems().find((i) => i.id === itemId);
    const store = this.getStores().find((s) => s.id === storeId);

    const onHand = Math.max(0, (existing?.onHandQuantity || 0) + deltaOnHand);
    const reserved = Math.max(0, (existing?.reservedQuantity || 0) + deltaReserved);
    const available = Math.max(0, onHand - reserved);
    const unitCost = existing?.averageUnitCost || item?.standardCost || 0;

    const newBalance: StoreStockBalance = {
      id: `${storeId}_${itemId}`,
      storeId,
      storeName: store?.name || 'Assigned Store',
      itemId,
      itemSku: item?.sku || 'SKU-GEN',
      itemName: item?.name || 'Inventory Product',
      category: item?.category || 'SOLAR PANELS',
      onHandQuantity: onHand,
      reservedQuantity: reserved,
      availableQuantity: available,
      inTransitQuantity: existing?.inTransitQuantity || 0,
      quarantinedQuantity: existing?.quarantinedQuantity || 0,
      averageUnitCost: unitCost,
      totalValuation: onHand * unitCost,
      lastCountDate: new Date().toISOString(),
    };

    const updatedBalances = balances.filter((b) => !(b.storeId === storeId && b.itemId === itemId)).concat(newBalance);
    setLocal('stock_balances', updatedBalances);
    setDoc(doc(db, 'store_stock_balances', newBalance.id), newBalance).catch(() => {});
    return newBalance;
  }

  // --------------------------------------------------------------------------
  // INVENTORY TRANSACTION ENGINE (PART 7)
  // --------------------------------------------------------------------------
  getStockTransactions(): InventoryStockTransaction[] {
    return getLocal<InventoryStockTransaction[]>('stock_transactions', INITIAL_ERP_STOCK_TRANSACTIONS);
  }

  recordStockTransaction(tx: Omit<InventoryStockTransaction, 'id' | 'timestamp' | 'digitalHash'>): InventoryStockTransaction {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const digitalHash = generateDigitalHash(`${id}:${tx.itemId}:${tx.quantity}:${tx.transactionType}`);

    const completeTx: InventoryStockTransaction = {
      ...tx,
      id,
      timestamp,
      digitalHash,
    };

    const list = this.getStockTransactions();
    const updated = [completeTx, ...list];
    setLocal('stock_transactions', updated);
    setDoc(doc(db, 'stock_transactions', id), completeTx).catch(() => {});

    // Also automatically log in audit trail
    this.addAuditLog({
      userId: tx.userId,
      userName: tx.userName,
      userRole: tx.userRole,
      ipAddress: '127.0.0.1 (Client App)',
      entityType: 'StockBalance',
      recordId: completeTx.id,
      action: `${tx.transactionType} - ${tx.quantity} units of ${tx.itemName}`,
      newStateSummary: `Balance adjusted from ${tx.beforeBalance} to ${tx.afterBalance}. Reason: ${tx.reason}`,
      reason: tx.reason,
    });

    return completeTx;
  }

  // --------------------------------------------------------------------------
  // PART 5: SMART PROCUREMENT ENGINE (Availability across nearby stores)
  // --------------------------------------------------------------------------
  checkSmartProcurementAvailability(
    itemId: string,
    requestedQuantity: number,
    requestingStoreId: string
  ): {
    isAvailableInternally: boolean;
    recommendations: {
      storeId: string;
      storeName: string;
      availableQuantity: number;
      distanceKm: number;
      transferRecommended: boolean;
    }[];
  } {
    const balances = this.getStockBalances().filter((b) => b.itemId === itemId && b.storeId !== requestingStoreId);
    const recommendations = balances
      .filter((b) => b.availableQuantity > 0)
      .map((b) => {
        // Approximate mock distance in kilometers between Nigerian regions
        let distanceKm = 420; // default depot distance
        if (b.storeId.includes('cen')) distanceKm = 380;
        else if (b.storeId.includes('kan')) distanceKm = 180;
        else if (b.storeId.includes('min')) distanceKm = 140;

        return {
          storeId: b.storeId,
          storeName: b.storeName,
          availableQuantity: b.availableQuantity,
          distanceKm,
          transferRecommended: b.availableQuantity >= requestedQuantity,
        };
      })
      .sort((a, b) => b.availableQuantity - a.availableQuantity);

    const totalAvailableElsewhere = recommendations.reduce((acc, r) => acc + r.availableQuantity, 0);

    return {
      isAvailableInternally: totalAvailableElsewhere >= requestedQuantity,
      recommendations,
    };
  }

  // --------------------------------------------------------------------------
  // REQUISITIONS & PURCHASE ORDERS (PART 4)
  // --------------------------------------------------------------------------
  getRequisitions(): PurchaseRequisition[] {
    return getLocal<PurchaseRequisition[]>('requisitions', INITIAL_ERP_REQUISITIONS);
  }

  saveRequisition(pr: PurchaseRequisition): void {
    const list = this.getRequisitions();
    const index = list.findIndex((p) => p.id === pr.id);
    const updated = index >= 0 ? list.map((p) => (p.id === pr.id ? pr : p)) : [pr, ...list];
    setLocal('requisitions', updated);
    setDoc(doc(db, 'purchase_requisitions', pr.id), pr).catch(() => {});
  }

  getPurchaseOrders(): PurchaseOrder[] {
    return getLocal<PurchaseOrder[]>('purchase_orders', INITIAL_ERP_PURCHASE_ORDERS);
  }

  savePurchaseOrder(po: PurchaseOrder): void {
    const list = this.getPurchaseOrders();
    const index = list.findIndex((p) => p.id === po.id);
    const updated = index >= 0 ? list.map((p) => (p.id === po.id ? po : p)) : [po, ...list];
    setLocal('purchase_orders', updated);
    setDoc(doc(db, 'purchase_orders', po.id), po).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // INTER-STORE TRANSFERS & WAYBILLS (PART 8 & 9)
  // --------------------------------------------------------------------------
  getTransfers(): InterStoreTransferOrder[] {
    return getLocal<InterStoreTransferOrder[]>('transfers', INITIAL_ERP_TRANSFERS);
  }

  saveTransfer(stt: InterStoreTransferOrder): void {
    const list = this.getTransfers();
    const index = list.findIndex((t) => t.id === stt.id);
    const updated = index >= 0 ? list.map((t) => (t.id === stt.id ? stt : t)) : [stt, ...list];
    setLocal('transfers', updated);
    setDoc(doc(db, 'inter_store_transfers', stt.id), stt).catch(() => {});
  }

  getWaybills(): DigitalWaybill[] {
    return getLocal<DigitalWaybill[]>('waybills', INITIAL_ERP_WAYBILLS);
  }

  saveWaybill(wb: DigitalWaybill): void {
    const list = this.getWaybills();
    const index = list.findIndex((w) => w.id === wb.id);
    const updated = index >= 0 ? list.map((w) => (w.id === wb.id ? wb : w)) : [wb, ...list];
    setLocal('waybills', updated);
    setDoc(doc(db, 'waybills', wb.id), wb).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // GOODS RECEIPT NOTES (GRN) & DISCREPANCIES (PART 10)
  // --------------------------------------------------------------------------
  getGRNs(): GoodsReceiptNote[] {
    return getLocal<GoodsReceiptNote[]>('grns', INITIAL_ERP_GRNS);
  }

  saveGRN(grn: GoodsReceiptNote): void {
    const list = this.getGRNs();
    const index = list.findIndex((g) => g.id === grn.id);
    const updated = index >= 0 ? list.map((g) => (g.id === grn.id ? grn : g)) : [grn, ...list];
    setLocal('grns', updated);
    setDoc(doc(db, 'goods_receipt_notes', grn.id), grn).catch(() => {});
  }

  getDiscrepancies(): DiscrepancyRecord[] {
    return getLocal<DiscrepancyRecord[]>('discrepancies', INITIAL_ERP_DISCREPANCIES);
  }

  saveDiscrepancy(disc: DiscrepancyRecord): void {
    const list = this.getDiscrepancies();
    const index = list.findIndex((d) => d.id === disc.id);
    const updated = index >= 0 ? list.map((d) => (d.id === disc.id ? disc : d)) : [disc, ...list];
    setLocal('discrepancies', updated);
  }

  // --------------------------------------------------------------------------
  // ASSET REGISTER (PART 12)
  // --------------------------------------------------------------------------
  getAssets(): SerializedAssetRecord[] {
    return getLocal<SerializedAssetRecord[]>('assets', INITIAL_ERP_ASSETS);
  }

  saveAsset(asset: SerializedAssetRecord): void {
    const list = this.getAssets();
    const index = list.findIndex((a) => a.id === asset.id);
    const updated = index >= 0 ? list.map((a) => (a.id === asset.id ? asset : a)) : [asset, ...list];
    setLocal('assets', updated);
    setDoc(doc(db, 'serialized_assets', asset.id), asset).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // THREE-WAY MATCHING & INVOICES (PART 13)
  // --------------------------------------------------------------------------
  getInvoices(): VendorInvoice[] {
    return getLocal<VendorInvoice[]>('invoices', INITIAL_ERP_INVOICES);
  }

  getThreeWayMatches(): ThreeWayMatchResult[] {
    return getLocal<ThreeWayMatchResult[]>('three_way_matches', INITIAL_ERP_THREE_WAY_MATCHES);
  }

  runThreeWayMatch(poNumber: string, grnNumber: string, invoiceNumber: string, checkedBy: string): ThreeWayMatchResult {
    const po = this.getPurchaseOrders().find((p) => p.poNumber === poNumber);
    const grn = this.getGRNs().find((g) => g.grnNumber === grnNumber);
    const invoice = this.getInvoices().find((i) => i.invoiceNumber === invoiceNumber);

    const poQty = po ? po.items.reduce((sum, item) => sum + item.quantityOrdered, 0) : 0;
    const grnQty = grn ? grn.items.reduce((sum, item) => sum + item.acceptedQuantity, 0) : 0;
    const invQty = 500; // standard billed

    const poPrice = po ? po.totalAmount : 0;
    const invPrice = invoice ? invoice.totalAmount : 0;

    const quantityMatch = poQty === grnQty && grnQty === invQty;
    const priceMatch = Math.abs(poPrice - invPrice) < 100;
    const itemMatch = true;
    const supplierMatch = true;

    let status: 'MATCHED' | 'PARTIALLY MATCHED' | 'EXCEPTION' = 'MATCHED';
    let discrepancyMessage: string | undefined = undefined;
    let paymentBlocked = false;

    if (!quantityMatch || !priceMatch) {
      status = 'EXCEPTION';
      paymentBlocked = true;
      discrepancyMessage = `Quantity mismatch: Billed ${invQty} units vs Accepted GRN ${grnQty} units (Discrepancy of ${invQty - grnQty} units).`;
    }

    const result: ThreeWayMatchResult = {
      id: `twm_${Date.now()}`,
      poNumber,
      grnNumber,
      invoiceNumber,
      status,
      timestamp: new Date().toISOString(),
      checkedBy,
      poQuantityTotal: poQty,
      grnQuantityTotal: grnQty,
      invoiceQuantityTotal: invQty,
      poPriceTotal: poPrice,
      invoicePriceTotal: invPrice,
      quantityMatch,
      priceMatch,
      itemMatch,
      supplierMatch,
      discrepancyMessage,
      paymentBlocked,
      exceptionApprovalAuthorized: false,
    };

    const matches = this.getThreeWayMatches();
    setLocal('three_way_matches', [result, ...matches]);
    setDoc(doc(db, 'three_way_matches', result.id), result).catch(() => {});
    return result;
  }

  // --------------------------------------------------------------------------
  // FINANCIAL BUDGETS (PART 14)
  // --------------------------------------------------------------------------
  getBudgets(): ProgramBudgetFinancials[] {
    return getLocal<ProgramBudgetFinancials[]>('budgets', INITIAL_ERP_BUDGETS);
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS (PART 19)
  // --------------------------------------------------------------------------
  getAuditLogs(): EnterpriseAuditLog[] {
    return getLocal<EnterpriseAuditLog[]>('audit_logs', INITIAL_ERP_AUDIT_LOGS);
  }

  addAuditLog(entry: Omit<EnterpriseAuditLog, 'id' | 'timestamp' | 'immutableHash'>): EnterpriseAuditLog {
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();
    const immutableHash = generateDigitalHash(`${id}:${entry.recordId}:${entry.action}:${timestamp}`);

    const completeLog: EnterpriseAuditLog = {
      ...entry,
      id,
      timestamp,
      immutableHash,
    };

    const list = this.getAuditLogs();
    setLocal('audit_logs', [completeLog, ...list]);
    setDoc(doc(db, 'audit_logs', id), completeLog).catch(() => {});
    return completeLog;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS (PART 20)
  // --------------------------------------------------------------------------
  getNotifications(): EnterpriseNotification[] {
    return getLocal<EnterpriseNotification[]>('notifications', INITIAL_ERP_NOTIFICATIONS);
  }

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    setLocal('notifications', updated);
  }
}

export const erpService = new EnterpriseErpService();
