export type ProgramStatus = 'Active' | 'Completed' | 'Archived';

export interface Program {
  id: string;
  name: string;
  code: string;
  clientDonor: string;
  projectManager: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: ProgramStatus;
  description: string;
}

export interface Community {
  id: string;
  programId: string; // Parent program ID
  name: string;
  state: string;
  lga: string;
  gpsCoordinates?: string;
  description: string;
}

export type ProjectType =
  | 'Solar Mini Grid'
  | 'Solar Home Systems'
  | 'Solar Boreholes'
  | 'Solar Street Lights'
  | 'Commercial Solar Installation'
  | 'Residential Solar Installation'
  | 'Solar Water Pump'
  | 'Solar Farm';

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';

export interface SolarProject {
  id: string;
  communityId: string; // Parent community ID
  programId: string; // Redundant but helpful parent program ID
  name: string;
  projectType: ProjectType;
  budget: number;
  startDate: string;
  completionDate: string;
  projectEngineer: string;
  status: ProjectStatus;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isCustom?: boolean;
}

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Cheque' | 'Mobile Money' | 'Card';

export type ExpenseStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Simulated file data url
}

export interface Expense {
  id: string;
  date: string;
  programId: string;
  communityId: string;
  projectId: string;
  categoryId: string; // Reference to ExpenseCategory
  description: string;
  vendor: string;
  invoiceNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number; // Computed: quantity * unitCost
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  receiptFile?: FileAttachment;
  approvedBy?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  status: ExpenseStatus;
}

export type UserRole = 'Administrator' | 'Finance Officer' | 'Project Manager' | 'Field Engineer' | 'Management';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface AuditLog {
  id: string;
  expenseId?: string;
  action: string; // e.g. 'Created Expense', 'Edited Program', 'Approved Expense'
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  details: string;
}

export interface StoreItem {
  id: string;
  name: string;
  categoryId: string; // Reference to ExpenseCategory
  quantity: number; // In stock
  unitCost: number; // Cost per unit in Naira (₦)
  lowStockThreshold: number; // Warn when quantity is less than or equal to this
  lastRestockedDate: string;
  description: string;
  manufacturer: string;
}

// ================= SOLAR PANEL & EQUIPMENT CMS TYPES =================

export type EquipmentType = 
  | 'Solar Panels' 
  | 'Inverters' 
  | 'Batteries' 
  | 'Charge Controllers' 
  | 'Mounting Systems' 
  | 'Cables' 
  | 'Solar Accessories';

export type PanelType = 
  | 'Monocrystalline' 
  | 'Polycrystalline' 
  | 'Bifacial' 
  | 'Thin-Film' 
  | 'PERC' 
  | 'N-Type TOPCon' 
  | 'HJT';

export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Archived';

export interface SolarPanelCapacity {
  id: string;
  equipmentType: EquipmentType;
  wattage: number; // e.g. 550 for 550W
  label: string; // e.g. "550W"
  description?: string;
  isCustom?: boolean;
}

export interface SolarPanelProduct {
  id: string;
  equipmentType: EquipmentType;
  name: string; // e.g., "Jinko 550W Monocrystalline Panel"
  capacityId: string; // Ref to SolarPanelCapacity
  capacityWattage: number; // e.g. 550
  capacityLabel: string; // e.g. "550W"
  brand: string; // e.g., "Jinko Solar", "Canadian Solar", "LONGi", "Trina"
  modelNumber: string; // e.g., "JKM550N-72HL4-V"
  panelType: PanelType;
  efficiency: string; // e.g., "21.3%"
  voltage: string; // e.g., "41.51V Vmp / 49.80V Voc"
  dimensions: string; // e.g., "2278 x 1134 x 35 mm"
  warranty: string; // e.g., "12 Yrs Product / 25 Yrs Output"
  description: string;
  imageUrl: string;
  supplier: string; // e.g., "Wavetech Power Direct"
  unitPrice: number; // ₦
  quantity: number; // Current physical stock
  minStockLevel: number; // Low stock warning threshold
  totalValue: number; // Computed: unitPrice * quantity
  status: AvailabilityStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'Add Stock' | 'Remove Stock' | 'Adjust Stock' | 'Dispatch to Site' | 'Initial Intake';

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  capacityLabel: string;
  changeType: StockMovementType;
  quantityChange: number; // e.g. +50 or -10
  previousQuantity: number;
  newQuantity: number;
  unitPrice: number;
  totalMovementValue: number;
  performerName: string;
  performerRole: UserRole;
  timestamp: string;
  notes: string;
  projectId?: string;
}

