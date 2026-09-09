// ================= NATIONWIDE LOGISTICS & CMS MASTER DATA TYPES =================

export type StoreOperatingStatus = 'Active' | 'Closed' | 'Maintenance';

export type ProductCategory = 
  | 'Solar Panels'
  | 'Inverters'
  | 'Energy Storage/Batteries'
  | 'BOS/Cabling'
  | 'Mounting Hardware'
  | 'Charge Controllers';

export type StandardUOM = 'Units' | 'Meters' | 'Sets' | 'Rolls' | 'Boxes';

export type HazardClass = 'UN3480 Class 9 (Lithium Ion Batteries)' | 'Non-Hazardous' | 'Class 8 Corrosive (Lead-Acid)';

export interface StoreWarehouse {
  id: string; // Store ID e.g. "STORE-LOS-01"
  name: string; // e.g. "Lagos Central Distribution Hub"
  state: string; // e.g. "Lagos State"
  region: 'South-West' | 'North-Central' | 'North-West' | 'South-South' | 'South-East' | 'North-East';
  exactAddress: string;
  storeManagerName: string;
  storeManagerContact: string;
  storeManagerEmail: string;
  capacitySqMeters: number; // Storage capacity in sq. meters
  operatingStatus: StoreOperatingStatus;
  currentStockValuation?: number;
}

export interface TechnicalSpecifications {
  wattage?: number; // e.g. 550W
  voltage?: string; // e.g. "48V / 400V Three Phase"
  capacityKwh?: number; // e.g. 15.36 kWh
  chemistry?: string; // e.g. "LiFePO4 (Lithium Iron Phosphate)"
  efficiency?: string; // e.g. "98.2%"
  cycleLife?: string; // e.g. "6,000 Cycles @ 80% DoD"
  dimensions?: string;
  weightKg?: number;
  ipRating?: string; // e.g. "IP65"
  hazardClass: HazardClass;
}

export interface RenewableProduct {
  id: string;
  sku: string; // e.g. "INV-DYE-12K-3P"
  name: string; // e.g. "Deye 12kW High-Voltage Hybrid Inverter"
  category: ProductCategory;
  brand: string; // e.g. "Deye", "BYD", "Jinko", "Victron"
  modelNumber: string;
  specs: TechnicalSpecifications;
  datasheetUrl: string; // PDF link
  imageUrl: string; // High-res image
  uom: StandardUOM;
  unitCost: number; // ₦ unit cost
  requiresSerialization: boolean; // True for high-value items (Inverters, Battery Banks)
  
  // State-specific minimum threshold / reorder levels: StoreID -> Min Quantity
  minThresholdPerStore: Record<string, number>;
  initialStockPerStore: Record<string, number>;
}

export interface TransferPolicy {
  id: string;
  title: string;
  category: 'Hazardous Materials' | 'Inter-State Transport' | 'Cold Chain / Moisture' | 'Security & Escort';
  summary: string;
  guidelines: string[];
  mandatoryChecklist: string[];
  appliesToCategories: ProductCategory[];
}

export interface SupplierContact {
  id: string;
  companyName: string;
  category: string;
  regionalOffice: string;
  contactPerson: string;
  email: string;
  phone: string;
  slaTerms: string;
  tier: 'Tier 1 OEM' | 'Authorized National Distributor' | 'Logistics Partner';
}

// ================= LOGISTICS & TRANSFER TRANSACTION TYPES =================

export type TransferStatus = 
  | 'Draft' 
  | 'Requested' 
  | 'Approved' 
  | 'In Transit' 
  | 'Received' 
  | 'Reconciled/Variance Checked';

export interface TransferItem {
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  uom: StandardUOM;
  quantityRequested: number;
  quantityDispatched?: number;
  quantityReceived?: number;
  unitCost: number;
  hazardClass: HazardClass;
  requiresSerialization: boolean;
  serialNumbers: string[]; // Assigned or scanned serial numbers
  discrepancyNote?: string;
}

export interface InterStoreTransfer {
  id: string; // STT Number e.g. "STT-2026-0891"
  originStoreId: string;
  originStoreName: string;
  originState: string;
  destinationStoreId: string;
  destinationStoreName: string;
  destinationState: string;
  requestDate: string;
  dispatchDate?: string;
  estimatedArrivalDate?: string;
  actualArrivalDate?: string;
  logisticsVendor: string; // e.g. "GIG Logistics Heavy Freight", "DHL Supply Chain"
  waybillNumber?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleRegistration?: string;
  status: TransferStatus;
  items: TransferItem[];
  totalQuantity: number;
  totalValuation: number;
  containsHazardousMaterials: boolean;
  hazardClassDisclaimerAccepted: boolean;
  approvalNotes?: string;
  approvedBy?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  varianceNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedAsset {
  serialNumber: string;
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  brand: string;
  currentStoreId: string;
  currentStoreName: string;
  status: 'In Warehouse' | 'In Transit' | 'Allocated to Site' | 'Installed' | 'Defective / RMA';
  currentTransferId?: string;
  productionDate?: string;
  warrantyExpiry?: string;
  history: {
    timestamp: string;
    action: string;
    location: string;
    details: string;
    performer: string;
  }[];
}

export interface StockTransaction {
  id: string;
  storeId: string;
  productId: string;
  type: 'Initial CMS Stock' | 'Inward Transfer' | 'Purchase Inward' | 'Outward Transfer' | 'Site Dispatch' | 'Variance Adjustment';
  quantityChange: number; // positive or negative
  referenceDocId: string; // e.g. STT ID, Purchase Order, Site Job ID
  timestamp: string;
  performer: string;
  notes?: string;
}

export interface DynamicStockBalance {
  storeId: string;
  storeName: string;
  state: string;
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  initialCmsStock: number;
  inwardTransfers: number;
  purchases: number;
  outwardTransfers: number;
  siteDispatch: number;
  varianceAdjustment: number;
  currentStock: number; // Calculated = initial + inward + purchases - outward - siteDispatch + variance
  minThreshold: number;
  reorderRequired: boolean;
  totalValuation: number;
}
