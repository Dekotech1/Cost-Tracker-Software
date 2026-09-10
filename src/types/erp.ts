// ==============================================================================
// ENTERPRISE RESOURCE PLANNING (ERP) - RENEWABLE ENERGY INFRASTRUCTURE
// COMPREHENSIVE DATA MODEL DEFINITIONS (PARTS 1 - 28)
// ==============================================================================

// ------------------------------------------------------------------------------
// PART 1: ORGANIZATIONAL HIERARCHY
// ------------------------------------------------------------------------------

export interface Company {
  id: string;
  name: string;
  code: string;
  country: string;
  headquarters: string;
  currency: string;
  taxId?: string;
  active: boolean;
}

export type ProgramStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';

export interface EnterpriseProgram {
  id: string;
  companyId: string;
  name: string;
  code: string;
  clientDonor: string;
  leadManagerId: string;
  leadManagerName: string;
  approvedBudget: number;
  committedBudget: number;
  actualSpend: number;
  startDate: string;
  targetEndDate: string;
  status: ProgramStatus;
  description: string;
  targetStates: string[];
  totalCommunitiesCount: number;
}

export type DeploymentStatus = 'Planning' | 'Surveyed' | 'In Procurement' | 'In Deployment' | 'Commissioned' | 'Operational' | 'Maintenance Required';

export interface EnterpriseCommunity {
  id: string;
  programId: string;
  programName: string;
  name: string;
  code: string;
  state: string;
  lga: string;
  address: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  siteManagerId: string;
  siteManagerName: string;
  deploymentStatus: DeploymentStatus;
  beneficiariesCount: number;
  householdsCount: number;
  commercialEntitiesCount: number;
  projectStartDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  operationalStatus: 'Online' | 'Partial Operation' | 'Offline' | 'Decommissioned';
  miniGridCapacityKwp?: number;
  storageCapacityKwh?: number;
  assignedStoreId?: string;
}

export interface DeploymentSite {
  id: string;
  communityId: string;
  name: string;
  siteType: 'Mini Grid Central Station' | 'Distribution Node' | 'Solar Borehole' | 'Health Center' | 'School' | 'Street Light Sector' | 'Agricultural Hub';
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  installedCapacityKwp: number;
  batteryCapacityKwh: number;
  commissionedDate?: string;
  status: 'Surveyed' | 'Construction' | 'Testing' | 'Operational' | 'Faulty';
}

// ------------------------------------------------------------------------------
// PART 2: LOCATION & STORE HIERARCHY (3-TIER)
// ------------------------------------------------------------------------------

export type StoreLevel = 'Level 1 Central Warehouse' | 'Level 2 Regional Hub' | 'Level 3 Community Site';

export interface EnterpriseStore {
  id: string;
  code: string;
  name: string;
  level: StoreLevel;
  parentStoreId?: string;
  region: string;
  state: string;
  city: string;
  address: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  managerId: string;
  managerName: string;
  contactPhone: string;
  contactEmail: string;
  capacitySqMeters: number;
  storageSecurityGrade: 'High Security' | 'Standard' | 'Field Secured';
  associatedProgramIds: string[];
  isActive: boolean;
}

// ------------------------------------------------------------------------------
// PART 3: USER ROLES & RBAC
// ------------------------------------------------------------------------------

export type EnterpriseRole =
  | 'SUPER ADMIN'
  | 'ERP ADMIN'
  | 'PROCUREMENT MANAGER'
  | 'PROCUREMENT OFFICER'
  | 'FINANCE MANAGER'
  | 'STORE MANAGER'
  | 'STORE OFFICER'
  | 'PROGRAM MANAGER'
  | 'SITE MANAGER'
  | 'FIELD OFFICER'
  | 'AUDITOR';

export interface UserScope {
  companyId?: string;
  programmeIds?: string[];
  regions?: string[];
  storeIds?: string[];
  communityIds?: string[];
}

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EnterpriseRole;
  department: 'Executive' | 'Operations' | 'Procurement' | 'Finance' | 'Supply Chain' | 'Engineering' | 'Compliance';
  scope: UserScope;
  avatarUrl?: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  lastLoginAt?: string;
}

// ------------------------------------------------------------------------------
// PART 6: INVENTORY ITEM MASTER & 12 CATEGORIES
// ------------------------------------------------------------------------------

export type InventoryCategory =
  | 'SOLAR PANELS'
  | 'INVERTERS'
  | 'BATTERIES'
  | 'CHARGE CONTROLLERS'
  | 'CABLES'
  | 'MOUNTING STRUCTURES'
  | 'PROTECTION EQUIPMENT'
  | 'ELECTRICAL COMPONENTS'
  | 'TOOLS'
  | 'SPARE PARTS'
  | 'CONSUMABLES'
  | 'OTHER MATERIALS';

export type SolarCapacityTier =
  | '50W'
  | '100W'
  | '200W'
  | '250W'
  | '300W'
  | '400W'
  | '450W'
  | '500W'
  | '550W'
  | '600W+';

export interface InventoryItemMaster {
  id: string;
  sku: string;
  itemCode: string;
  name: string;
  category: InventoryCategory;
  subcategory: string;
  description: string;
  brand: string;
  model: string;
  manufacturer: string;
  unitOfMeasure: 'pcs' | 'meters' | 'rolls' | 'kg' | 'sets' | 'boxes';
  barcode: string;
  qrCode: string;
  requiresSerialTracking: boolean;
  requiresBatchTracking: boolean;
  warrantyPeriodMonths: number;
  reorderLevel: number;
  minimumStock: number;
  maximumStock: number;
  standardCost: number;
  active: boolean;
  solarCapacityTier?: SolarCapacityTier;
  wattageRating?: number;
  voltageRating?: string;
  efficiencyPercentage?: number;
  imageUrl?: string;
}

// ------------------------------------------------------------------------------
// PART 7: INVENTORY TRANSACTION ENGINE & STOCK STATES
// ------------------------------------------------------------------------------

export type StockState =
  | 'On Hand'
  | 'Reserved'
  | 'Available'
  | 'In Transit'
  | 'Deployed'
  | 'Damaged'
  | 'Quarantined';

export type InventoryTransactionType =
  | 'PURCHASE RECEIPT'
  | 'TRANSFER OUT'
  | 'TRANSFER IN'
  | 'DEPLOYMENT'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'DAMAGE'
  | 'LOSS'
  | 'DISPOSAL'
  | 'STOCK COUNT';

export interface InventoryStockTransaction {
  id: string;
  timestamp: string;
  transactionType: InventoryTransactionType;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unitCost: number;
  totalValue: number;
  sourceLocationId?: string;
  sourceLocationName?: string;
  destinationLocationId?: string;
  destinationLocationName?: string;
  beforeBalance: number;
  afterBalance: number;
  userId: string;
  userName: string;
  userRole: EnterpriseRole;
  referenceDocumentType: 'PR' | 'PO' | 'TRANSFER' | 'WAYBILL' | 'GRN' | 'DEPLOYMENT' | 'ADJUSTMENT_MEMO';
  referenceDocumentId: string;
  reason: string;
  batchNumber?: string;
  serialNumbers?: string[];
  digitalHash?: string;
}

export interface StoreStockBalance {
  id: string; // storeId_itemId
  storeId: string;
  storeName: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: InventoryCategory;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  inTransitQuantity: number;
  quarantinedQuantity: number;
  averageUnitCost: number;
  totalValuation: number;
  lastCountDate?: string;
}

// ------------------------------------------------------------------------------
// PART 4 & 5: PROCUREMENT & SMART PROCUREMENT ENGINE
// ------------------------------------------------------------------------------

export type RequisitionPriority = 'Standard' | 'Urgent' | 'Emergency Field Requirement';
export type RequisitionStatus =
  | 'Draft'
  | 'Pending Store Review'
  | 'Pending Procurement Review'
  | 'Pending Finance Review'
  | 'Approved'
  | 'PO Generated'
  | 'Rejected'
  | 'Cancelled';

export interface PurchaseRequisitionItem {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: InventoryCategory;
  quantityRequested: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  specificationNotes: string;
  internalStockAvailableNear?: boolean;
  nearestStoreRecommendation?: {
    storeId: string;
    storeName: string;
    distanceKm: number;
    availableToTransfer: number;
  };
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  programId: string;
  programName: string;
  communityId?: string;
  communityName?: string;
  targetStoreId: string;
  targetStoreName: string;
  requestingDepartment: string;
  requestingUserId: string;
  requestingUserName: string;
  requiredDate: string;
  priority: RequisitionPriority;
  budgetCode: string;
  items: PurchaseRequisitionItem[];
  estimatedTotalCost: number;
  justification: string;
  status: RequisitionStatus;
  currentApprovalLevel?: string;
  createdDate: string;
  approvalHistory: {
    timestamp: string;
    approverId: string;
    approverName: string;
    approverRole: EnterpriseRole;
    action: 'Approved' | 'Rejected' | 'Commented';
    comments: string;
  }[];
}

export type POStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent to Vendor'
  | 'Partially Received'
  | 'Fully Received'
  | 'Closed'
  | 'Cancelled';

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: InventoryCategory;
  quantityOrdered: number;
  quantityReceived: number;
  quantityOutstanding: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prNumber?: string;
  vendorId: string;
  vendorName: string;
  vendorTaxId?: string;
  programId: string;
  programName: string;
  communityId?: string;
  communityName?: string;
  receivingStoreId: string;
  receivingStoreName: string;
  currency: 'NGN' | 'USD';
  poDate: string;
  expectedDeliveryDate: string;
  paymentTerms: 'Net 30' | 'Net 15' | '50% Advance / 50% on GRN' | 'Full on Delivery';
  deliveryTerms: 'DDP Site Warehouse' | 'Ex-Works Depot' | 'FOB Port';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: POStatus;
  budgetCheckPassed: boolean;
  interStoreCheckOverridden: boolean;
  interStoreOverrideJustification?: string;
  items: PurchaseOrderItem[];
  approvalWorkflow: {
    level: string;
    approved: boolean;
    approverName?: string;
    timestamp?: string;
  }[];
}

// ------------------------------------------------------------------------------
// PART 8 & 9: INTER-STORE TRANSFERS & DIGITAL WAYBILL
// ------------------------------------------------------------------------------

export type TransferWorkflowStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Picking'
  | 'Ready for Dispatch'
  | 'Dispatched'
  | 'In Transit'
  | 'Partially Received'
  | 'Delivered'
  | 'Completed'
  | 'Disputed'
  | 'Cancelled';

export interface InterStoreTransferItem {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  quantityRequested: number;
  quantityPicked: number;
  quantityDispatched: number;
  quantityReceived: number;
  unitCost: number;
  serialNumbers?: string[];
}

export interface InterStoreTransferOrder {
  id: string;
  transferNumber: string;
  sourceStoreId: string;
  sourceStoreName: string;
  destinationStoreId: string;
  destinationStoreName: string;
  programId: string;
  programName: string;
  communityId?: string;
  communityName?: string;
  requestedByUserId: string;
  requestedByUserName: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  dispatchDate?: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  carrierCompany: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  items: InterStoreTransferItem[];
  waybillNumber?: string;
  status: TransferWorkflowStatus;
  statusNotes?: string;
  disputeNotes?: string;
}

export interface DigitalWaybill {
  id: string;
  waybillNumber: string;
  transferNumber: string;
  poNumber?: string;
  sourceStoreId: string;
  sourceStoreName: string;
  destinationStoreId: string;
  destinationStoreName: string;
  carrierCompany: string;
  driverName: string;
  driverLicenseNumber: string;
  vehicleRegistration: string;
  itemsSummary: {
    itemName: string;
    sku: string;
    quantity: number;
  }[];
  dispatchTimestamp: string;
  dispatchGpsCoordinates: {
    lat: number;
    lng: number;
  };
  deliveryTimestamp?: string;
  deliveryGpsCoordinates?: {
    lat: number;
    lng: number;
  };
  driverSignatureName: string;
  storeOfficerSignatureName: string;
  receivingOfficerSignatureName?: string;
  verificationHash: string;
  status: 'Generated' | 'En Route' | 'Delivered' | 'Verified';
}

// ------------------------------------------------------------------------------
// PART 10: RECEIVING, GRN & DISCREPANCIES
// ------------------------------------------------------------------------------

export interface GoodsReceiptNoteItem {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  acceptedQuantity: number;
  quarantinedQuantity: number;
  unitCost: number;
  acceptedTotalValue: number;
  serialNumbers?: string[];
  conditionNotes?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poNumber?: string;
  transferNumber?: string;
  waybillNumber: string;
  receivingStoreId: string;
  receivingStoreName: string;
  receivingOfficerId: string;
  receivingOfficerName: string;
  receivedDate: string;
  vendorOrSenderName: string;
  overallCondition: 'Excellent' | 'Minor Discrepancy' | 'Severe Damage' | 'Rejected';
  receiptType: 'Full Receipt' | 'Partial Receipt' | 'Rejected Receipt' | 'Discrepancy';
  items: GoodsReceiptNoteItem[];
  hasDiscrepancies: boolean;
  quarantineRequired: boolean;
  quarantineLocation?: string;
  remarks: string;
  verificationHash: string;
}

export interface DiscrepancyRecord {
  id: string;
  grnId: string;
  grnNumber: string;
  poNumber?: string;
  waybillNumber: string;
  storeId: string;
  storeName: string;
  reportedDate: string;
  reportedBy: string;
  itemId: string;
  itemName: string;
  expectedQty: number;
  receivedQty: number;
  discrepancyType: 'Shortage' | 'Overage' | 'Transit Damage' | 'Incorrect Item Spec';
  severity: 'Low' | 'Medium' | 'Critical';
  status: 'Open' | 'Under Investigation' | 'Credit Note Requested' | 'Replacement Dispatched' | 'Resolved';
  resolutionNotes?: string;
}

// ------------------------------------------------------------------------------
// PART 11 & 12: COMMUNITY DEPLOYMENT & SERIALIZED ASSET REGISTER
// ------------------------------------------------------------------------------

export type AssetLifecycleStatus =
  | 'Purchased'
  | 'Received'
  | 'In Store'
  | 'Transferred'
  | 'Deployed'
  | 'Installed'
  | 'Operational'
  | 'Under Maintenance'
  | 'Damaged'
  | 'Retired'
  | 'Disposed';

export interface SerializedAssetRecord {
  id: string;
  assetTag: string;
  serialNumber: string;
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  brand: string;
  model: string;
  capacityRating: string;
  purchaseDate: string;
  purchaseCost: number;
  programId: string;
  programName: string;
  communityId?: string;
  communityName?: string;
  deploymentSiteId?: string;
  deploymentSiteName?: string;
  currentStoreId?: string;
  currentStoreName?: string;
  installationDate?: string;
  warrantyExpiryDate: string;
  condition: 'Brand New' | 'Good' | 'Fair' | 'Faulty';
  operationalStatus: AssetLifecycleStatus;
  currentCustodian: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CommunityDeploymentRecord {
  id: string;
  deploymentNumber: string;
  programId: string;
  programName: string;
  communityId: string;
  communityName: string;
  siteId: string;
  siteName: string;
  sourceStoreId: string;
  sourceStoreName: string;
  technicianName: string;
  technicianPhone: string;
  deploymentDate: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  installationStatus: 'In Progress' | 'Installed' | 'Commissioned' | 'Passed QA';
  materials: {
    itemId: string;
    itemName: string;
    quantity: number;
    serialNumbers?: string[];
  }[];
  proofOfDeploymentPhotos: string[];
  remarks: string;
  digitalSignatureHash: string;
}

// ------------------------------------------------------------------------------
// PART 13 & 14: THREE-WAY MATCHING & FINANCIAL CONTROL
// ------------------------------------------------------------------------------

export type ThreeWayMatchStatus = 'MATCHED' | 'PARTIALLY MATCHED' | 'EXCEPTION';

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  grnNumber: string;
  programId: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'Unpaid' | 'Pending Approval' | 'Approved for Payment' | 'Paid' | 'Blocked on Exception';
  matchingStatus: ThreeWayMatchStatus;
  mismatchDetails?: string[];
}

export interface ThreeWayMatchResult {
  id: string;
  poNumber: string;
  grnNumber: string;
  invoiceNumber: string;
  status: ThreeWayMatchStatus;
  timestamp: string;
  checkedBy: string;
  poQuantityTotal: number;
  grnQuantityTotal: number;
  invoiceQuantityTotal: number;
  poPriceTotal: number;
  invoicePriceTotal: number;
  quantityMatch: boolean;
  priceMatch: boolean;
  itemMatch: boolean;
  supplierMatch: boolean;
  discrepancyMessage?: string;
  paymentBlocked: boolean;
  exceptionApprovalAuthorized?: boolean;
  exceptionApprovedBy?: string;
}

export interface ProgramBudgetFinancials {
  programId: string;
  programName: string;
  approvedBudget: number;
  requisitionedAmount: number;
  committedAmount: number; // approved POs
  receivedExpensedAmount: number; // GRNed
  paidAmount: number;
  availableBudget: number; // approvedBudget - committedAmount
  budgetUtilizationPct: number; // (actual / approved) * 100
}

// ------------------------------------------------------------------------------
// PART 15: OFFLINE-FIRST MOBILE TRANSACTION QUEUE
// ------------------------------------------------------------------------------

export type OfflineSyncStatus = 'Synced' | 'Pending Sync' | 'Failed' | 'Conflict';

export interface OfflineTransactionQueueItem {
  id: string;
  clientGeneratedUuid: string;
  operationType: 'SCAN_ASSET' | 'RECORD_RECEIPT' | 'DEPLOY_MATERIAL' | 'CAPTURE_GPS' | 'DISPATCH_WAYBILL';
  payload: any;
  createdOfflineAt: string;
  syncedAt?: string;
  syncStatus: OfflineSyncStatus;
  conflictResolutionNotes?: string;
  retryAttempts: number;
}

// ------------------------------------------------------------------------------
// PART 19 & 20: AUDIT LOG & NOTIFICATION ENGINE
// ------------------------------------------------------------------------------

export interface EnterpriseAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: EnterpriseRole;
  ipAddress: string;
  entityType:
    | 'Program'
    | 'Community'
    | 'Store'
    | 'Requisition'
    | 'PurchaseOrder'
    | 'Transfer'
    | 'Waybill'
    | 'GRN'
    | 'Asset'
    | 'Invoice'
    | 'Payment'
    | 'StockBalance';
  recordId: string;
  action: string;
  previousStateSummary?: string;
  newStateSummary: string;
  reason?: string;
  immutableHash: string;
}

export type NotificationSeverity = 'Info' | 'Warning' | 'Critical';

export interface EnterpriseNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  category: 'Approval Required' | 'Low Stock' | 'Transfer Pending' | 'Discrepancy' | 'Invoice Mismatch' | 'Budget Alert';
  severity: NotificationSeverity;
  targetRoles: EnterpriseRole[];
  linkTab?: string;
  read: boolean;
}
