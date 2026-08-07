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

