import { 
  Program, 
  Community, 
  SolarProject, 
  ExpenseCategory, 
  Expense, 
  AuditLog, 
  User, 
  UserRole, 
  StoreItem,
  SolarPanelCapacity,
  SolarPanelProduct,
  StockMovementLog
} from '../types';

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Solar Panels' },
  { id: 'cat-2', name: 'Inverters' },
  { id: 'cat-3', name: 'Batteries' },
  { id: 'cat-4', name: 'Mounting Structures' },
  { id: 'cat-5', name: 'Cables' },
  { id: 'cat-6', name: 'Electrical Accessories' },
  { id: 'cat-7', name: 'Labour' },
  { id: 'cat-8', name: 'Transportation' },
  { id: 'cat-9', name: 'Fuel' },
  { id: 'cat-10', name: 'Accommodation' },
  { id: 'cat-11', name: 'Feeding' },
  { id: 'cat-12', name: 'Equipment Hire' },
  { id: 'cat-13', name: 'Security' },
  { id: 'cat-14', name: 'Logistics' },
  { id: 'cat-15', name: 'Maintenance' },
  { id: 'cat-16', name: 'Office Expenses' },
  { id: 'cat-17', name: 'Miscellaneous' },
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    name: 'Northern Solar Electrification Programme',
    code: 'NSEP-2026',
    clientDonor: 'World Bank & Federal Ministry of Power',
    projectManager: 'Engr. Ibrahim Bello',
    budget: 150000000, // ₦150 Million
    startDate: '2026-01-10',
    endDate: '2026-12-20',
    status: 'Active',
    description: 'Providing clean, reliable off-grid electricity to remote communities in the northern region using solar mini-grids and public facilities lighting.',
  },
  {
    id: 'prog-2',
    name: 'Western Rural Microgrid Initiative',
    code: 'WRMI-2026',
    clientDonor: 'African Development Bank',
    projectManager: 'Dr. Funmi Adebayo',
    budget: 95000000, // ₦95 Million
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    status: 'Active',
    description: 'Deploying high-efficiency solar water pumps and borehole systems to agricultural farming hubs in western Nigeria.',
  },
];

export const INITIAL_COMMUNITIES: Community[] = [
  // Under Northern Solar (prog-1)
  {
    id: 'comm-1',
    programId: 'prog-1',
    name: 'Gwagwalada',
    state: 'FCT',
    lga: 'Gwagwalada',
    gpsCoordinates: '8.9431° N, 7.0811° E',
    description: 'Agricultural hub with high solar irradiance, serving 1,200 households and primary healthcare centres.',
  },
  {
    id: 'comm-2',
    programId: 'prog-1',
    name: 'Kuje',
    state: 'FCT',
    lga: 'Kuje',
    gpsCoordinates: '8.8794° N, 7.2276° E',
    description: 'Expanding semi-urban settlement requiring grid support for small commercial enterprises and public boreholes.',
  },
  {
    id: 'comm-3',
    programId: 'prog-1',
    name: 'Bwari',
    state: 'FCT',
    lga: 'Bwari',
    gpsCoordinates: '9.2901° N, 7.3789° E',
    description: 'Northern boundary district needing clean solar installations for municipal clinics and street illumination.',
  },
  // Under Western Rural (prog-2)
  {
    id: 'comm-4',
    programId: 'prog-2',
    name: 'Idanre',
    state: 'Ondo',
    lga: 'Idanre',
    gpsCoordinates: '7.1065° N, 5.1051° E',
    description: 'Mountainous farming community with large cocoa farms requiring solar-powered irrigation.',
  },
];

export const INITIAL_PROJECTS: SolarProject[] = [
  // Gwagwalada (comm-1) projects
  {
    id: 'proj-1',
    communityId: 'comm-1',
    programId: 'prog-1',
    name: 'Solar Mini Grid Installation',
    projectType: 'Solar Mini Grid',
    budget: 65000000,
    startDate: '2026-02-15',
    completionDate: '2026-08-30',
    projectEngineer: 'Engr. David Okon',
    status: 'Active',
  },
  {
    id: 'proj-2',
    communityId: 'comm-1',
    programId: 'prog-1',
    name: 'Solar Borehole Installation',
    projectType: 'Solar Boreholes',
    budget: 15000000,
    startDate: '2026-02-10',
    completionDate: '2026-05-15',
    projectEngineer: 'Engr. Sarah Nnaji',
    status: 'Completed',
  },
  {
    id: 'proj-3',
    communityId: 'comm-1',
    programId: 'prog-1',
    name: 'Solar Street Lights',
    projectType: 'Solar Street Lights',
    budget: 10000000,
    startDate: '2026-03-01',
    completionDate: '2026-07-20',
    projectEngineer: 'Engr. Samuel Chinedu',
    status: 'Active',
  },
  // Kuje (comm-2) projects
  {
    id: 'proj-4',
    communityId: 'comm-2',
    programId: 'prog-1',
    name: 'Healthcare Centre Solar Power',
    projectType: 'Commercial Solar Installation',
    budget: 22000000,
    startDate: '2026-04-01',
    completionDate: '2026-09-15',
    projectEngineer: 'Engr. David Okon',
    status: 'Active',
  },
  // Idanre (comm-4) projects
  {
    id: 'proj-5',
    communityId: 'comm-4',
    programId: 'prog-2',
    name: 'Farm Irrigation Solar Pump',
    projectType: 'Solar Water Pump',
    budget: 35000000,
    startDate: '2026-03-10',
    completionDate: '2026-09-01',
    projectEngineer: 'Engr. Yusuf Aliyu',
    status: 'Active',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  // For Proj-1 (Gwagwalada Mini Grid)
  {
    id: 'exp-1',
    date: '2026-02-20',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-1', // Solar Panels
    description: 'Imported Tier-1 550W Monocrystalline PV Modules',
    vendor: 'Jinko Solar Middle East',
    invoiceNumber: 'INV-2026-0041',
    quantity: 120,
    unitCost: 185000, // ₦185,000 each
    totalCost: 22200000, // ₦22.2M
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN9982312019',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Premium high-efficiency modules delivered directly to Gwagwalada site warehouse.',
    createdBy: 'Finance Officer (John)',
    createdAt: '2026-02-21T09:30:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-2',
    date: '2026-02-25',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-3', // Batteries
    description: 'Lithium Iron Phosphate (LiFePO4) Battery Packs 10kWh',
    vendor: 'BYD Commercial Energy',
    invoiceNumber: 'INV-BYD-1109',
    quantity: 15,
    unitCost: 1200000, // ₦1.2M each
    totalCost: 18000000, // ₦18M
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN4482031022',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Essential storage components for overnight rural grid loading.',
    createdBy: 'Finance Officer (John)',
    createdAt: '2026-02-26T14:15:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-3',
    date: '2026-03-05',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-2', // Inverters
    description: 'Solis 50kW Three-Phase Hybrid Inverter Unit',
    vendor: 'Solis Power West Africa',
    invoiceNumber: 'INV-SOLIS-9922',
    quantity: 2,
    unitCost: 2800000,
    totalCost: 5600000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN8830129301',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Configured for dual active inputs and telemetry diagnostics.',
    createdBy: 'Field Engineer (David)',
    createdAt: '2026-03-06T11:00:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-4',
    date: '2026-03-15',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-7', // Labour
    description: 'Civil works foundation & mounting frame concrete casting staff',
    vendor: 'Gwagwalada Builders Cooperative',
    invoiceNumber: 'CSH-GW-092',
    quantity: 22,
    unitCost: 85000,
    totalCost: 1870000,
    paymentMethod: 'Cash',
    referenceNumber: 'REF-CSH-0210',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Local workforce hire supporting economic integration.',
    createdBy: 'Field Engineer (David)',
    createdAt: '2026-03-16T18:22:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-5',
    date: '2026-04-10',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-13', // Security
    description: 'Round-the-clock solar farm perimeter guarding services',
    vendor: 'Halogen Security Ltd',
    invoiceNumber: 'INV-HALO-8821',
    quantity: 3,
    unitCost: 450000,
    totalCost: 1350000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN552109849',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Covers security guards on site during critical component delivery phases.',
    createdBy: 'Field Engineer (David)',
    createdAt: '2026-04-12T10:05:00Z',
    status: 'Approved',
  },

  // For Proj-2 (Gwagwalada Borehole - Completed)
  {
    id: 'exp-6',
    date: '2026-02-12',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-2',
    categoryId: 'cat-12', // Equipment Hire
    description: 'Submersible deep borehole rotary drilling rig hire (5 days)',
    vendor: 'FCT Drillers Ventures',
    invoiceNumber: 'INV-DRILL-773',
    quantity: 1,
    unitCost: 3500000,
    totalCost: 3500000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN1120930193',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Completed deep exploration with high water flow yield output.',
    createdBy: 'Finance Officer (John)',
    createdAt: '2026-02-13T16:40:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-7',
    date: '2026-02-18',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-2',
    categoryId: 'cat-15', // Maintenance / Installation
    description: 'Grundfos Solar Submersible Pump and Controller Kit',
    vendor: 'Grundfos Pumps Nigeria Ltd',
    invoiceNumber: 'INV-GRUN-90192',
    quantity: 1,
    unitCost: 4800000,
    totalCost: 4800000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN304910291',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Primary pumping engine configured for automated tank sensing.',
    createdBy: 'Field Engineer (Sarah)',
    createdAt: '2026-02-19T08:50:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-8',
    date: '2026-02-28',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-2',
    categoryId: 'cat-4', // Mounting Structures
    description: '10,000 Litre elevated galvanized steel water tank stand construction',
    vendor: 'FCT Welders Guild',
    invoiceNumber: 'INV-WELD-302',
    quantity: 1,
    unitCost: 2900000,
    totalCost: 2900000,
    paymentMethod: 'Cheque',
    referenceNumber: 'CHQ-889021',
    approvedBy: 'Engr. Ibrahim Bello',
    notes: 'Structure verified to carry dual tanks total load safely.',
    createdBy: 'Field Engineer (Sarah)',
    createdAt: '2026-03-01T12:00:00Z',
    status: 'Approved',
  },

  // For Proj-5 (Idanre Cocoa Pump)
  {
    id: 'exp-9',
    date: '2026-03-12',
    programId: 'prog-2',
    communityId: 'comm-4',
    projectId: 'proj-5',
    categoryId: 'cat-1', // Solar Panels
    description: '350W Poly Solar Panels for Irrigation Pump Rig',
    vendor: 'Suntoch Solutions',
    invoiceNumber: 'INV-SUN-4412',
    quantity: 30,
    unitCost: 110000,
    totalCost: 3300000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN4492019302',
    approvedBy: 'Dr. Funmi Adebayo',
    notes: 'Delivered directly to cocoa cooperative farmland compound.',
    createdBy: 'Finance Officer (John)',
    createdAt: '2026-03-14T11:30:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-10',
    date: '2026-03-25',
    programId: 'prog-2',
    communityId: 'comm-4',
    projectId: 'proj-5',
    categoryId: 'cat-8', // Transportation
    description: 'Flatbed delivery logistics for drilling components from Lagos',
    vendor: 'Lagos-West Haulers Group',
    invoiceNumber: 'INV-HAUL-901',
    quantity: 1,
    unitCost: 1500000,
    totalCost: 1500000,
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN8892102941',
    approvedBy: 'Dr. Funmi Adebayo',
    notes: 'Delayed by rain on rural mud access roads, but successfully secured on-site.',
    createdBy: 'Field Engineer (Yusuf)',
    createdAt: '2026-03-26T15:45:00Z',
    status: 'Approved',
  },
  {
    id: 'exp-11',
    date: '2026-06-10',
    programId: 'prog-1',
    communityId: 'comm-1',
    projectId: 'proj-1',
    categoryId: 'cat-17', // Miscellaneous
    description: 'Specialized testing, site commissioning cables, & termination connectors',
    vendor: 'Abuja Electrics Hub',
    invoiceNumber: 'INV-AEH-1033',
    quantity: 4,
    unitCost: 200000,
    totalCost: 800000,
    paymentMethod: 'Mobile Money',
    referenceNumber: 'TXN-MM-88402910',
    createdBy: 'Field Engineer (David)',
    createdAt: '2026-06-11T09:12:00Z',
    status: 'Pending Approval',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    expenseId: 'exp-1',
    action: 'Created Expense',
    userId: 'user-fo-1',
    userName: 'Finance Officer (John)',
    userRole: 'Finance Officer',
    timestamp: '2026-02-21T09:30:00Z',
    details: 'Created an expense for Jinko Solar Panels (120 units at ₦185,000 each) under Gwagwalada Mini Grid.',
  },
  {
    id: 'audit-2',
    expenseId: 'exp-1',
    action: 'Approved Expense',
    userId: 'user-pm-1',
    userName: 'Engr. Ibrahim Bello',
    userRole: 'Project Manager',
    timestamp: '2026-02-22T10:15:00Z',
    details: 'Approved expense Jinko Solar Panels (₦22,200,000) - Checked invoice and physical delivery voucher.',
  },
  {
    id: 'audit-3',
    expenseId: 'exp-11',
    action: 'Submitted Expense',
    userId: 'user-fe-1',
    userName: 'Field Engineer (David)',
    userRole: 'Field Engineer',
    timestamp: '2026-06-11T09:12:00Z',
    details: 'Submitted expense for site commissioning cables (₦800,000) for Gwagwalada Mini Grid. Awaiting PM approval.',
  },
];

export const USERS: User[] = [
  { email: 'admin@solarcorp.com', name: 'Patricia Collins', role: 'Administrator' },
  { email: 'finance@solarcorp.com', name: 'John Doe', role: 'Finance Officer' },
  { email: 'manager@solarcorp.com', name: 'Ibrahim Bello', role: 'Project Manager' },
  { email: 'engineer@solarcorp.com', name: 'David Okon', role: 'Field Engineer' },
  { email: 'mgmt@solarcorp.com', name: 'Grace Johnson', role: 'Management' },
];

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'store-1',
    name: 'Jinko Solar Panels 320W Mono',
    categoryId: 'cat-1',
    quantity: 180,
    unitCost: 185000,
    lowStockThreshold: 50,
    lastRestockedDate: '2026-06-05',
    description: 'High-efficiency monocrystalline solar modules for community mini-grids.',
    manufacturer: 'Jinko Solar'
  },
  {
    id: 'store-2',
    name: 'Growatt SPF 5000ES Inverter',
    categoryId: 'cat-2',
    quantity: 14,
    unitCost: 450000,
    lowStockThreshold: 8,
    lastRestockedDate: '2026-05-18',
    description: 'Off-grid solar inverter with built-in MPPT charger controller.',
    manufacturer: 'Growatt'
  },
  {
    id: 'store-3',
    name: 'Felicity 10kWh LiFePO4 Lithium Battery',
    categoryId: 'cat-3',
    quantity: 42,
    unitCost: 1350000,
    lowStockThreshold: 15,
    lastRestockedDate: '2026-06-20',
    description: '48V lithium-iron-phosphate battery pack for solar energy storage systems.',
    manufacturer: 'Felicity Solar'
  },
  {
    id: 'store-4',
    name: 'Heavy Duty Zinc-Coated Ground Mounts',
    categoryId: 'cat-4',
    quantity: 6,
    unitCost: 250000,
    lowStockThreshold: 10,
    lastRestockedDate: '2026-04-12',
    description: 'Corrosion-resistant ground mounting rack holding up to 12 solar panels.',
    manufacturer: 'GalvaSteel'
  },
  {
    id: 'store-5',
    name: '6mm DC Single Core Cable (Red, 100m Roll)',
    categoryId: 'cat-5',
    quantity: 24,
    unitCost: 110000,
    lowStockThreshold: 5,
    lastRestockedDate: '2026-06-01',
    description: 'Double insulated high-voltage copper solar power cable.',
    manufacturer: 'Kabelmetal'
  },
  {
    id: 'store-6',
    name: 'Solar Borehole Submersible Water Pump 1.5HP',
    categoryId: 'cat-12',
    quantity: 3,
    unitCost: 550000,
    lowStockThreshold: 5,
    lastRestockedDate: '2026-05-10',
    description: 'DC powered submersible pump for solar water supply projects.',
    manufacturer: 'LORENTZ'
  }
];

export const DEFAULT_SOLAR_CAPACITIES: SolarPanelCapacity[] = [
  { id: 'cap-100w', equipmentType: 'Solar Panels', wattage: 100, label: '100W', description: 'Compact panel for small DC lighting & solar water kits' },
  { id: 'cap-150w', equipmentType: 'Solar Panels', wattage: 150, label: '150W', description: 'Standard residential DC lighting & street light module' },
  { id: 'cap-200w', equipmentType: 'Solar Panels', wattage: 200, label: '200W', description: 'Small mini-grid & remote health post panel' },
  { id: 'cap-250w', equipmentType: 'Solar Panels', wattage: 250, label: '250W', description: 'Medium capacity solar home system module' },
  { id: 'cap-300w', equipmentType: 'Solar Panels', wattage: 300, label: '300W', description: 'Commercial poly/mono module for solar boreholes' },
  { id: 'cap-350w', equipmentType: 'Solar Panels', wattage: 350, label: '350W', description: 'High-efficiency PERC panel for institutional micro-grids' },
  { id: 'cap-400w', equipmentType: 'Solar Panels', wattage: 400, label: '400W', description: 'High-output module for mini-grids & solar irrigation' },
  { id: 'cap-450w', equipmentType: 'Solar Panels', wattage: 450, label: '450W', description: 'Popular utility-grade mono PERC solar panel' },
  { id: 'cap-500w', equipmentType: 'Solar Panels', wattage: 500, label: '500W', description: 'Heavy-duty 144-half-cell solar power module' },
  { id: 'cap-550w', equipmentType: 'Solar Panels', wattage: 550, label: '550W', description: 'Flagship TOPCon / PERC tier-1 solar module' },
  { id: 'cap-600w', equipmentType: 'Solar Panels', wattage: 600, label: '600W', description: 'Ultra-high power bifacial module for mini-grid farms' },
  { id: 'cap-650w', equipmentType: 'Solar Panels', wattage: 650, label: '650W', description: 'Large format industrial utility-scale solar panel' },
  { id: 'cap-700w', equipmentType: 'Solar Panels', wattage: 700, label: '700W+', description: 'Next-gen 210mm wafer ultra-power solar module' },
];

export const INITIAL_SOLAR_PRODUCTS: SolarPanelProduct[] = [
  {
    id: 'sp-1',
    equipmentType: 'Solar Panels',
    name: 'Jinko Tiger Neo 550W N-Type TOPCon Mono',
    capacityId: 'cap-550w',
    capacityWattage: 550,
    capacityLabel: '550W',
    brand: 'Jinko Solar',
    modelNumber: 'JKM550N-72HL4-V',
    panelType: 'N-Type TOPCon',
    efficiency: '21.3%',
    voltage: '41.51V Vmp / 49.80V Voc',
    dimensions: '2278 x 1134 x 35 mm',
    warranty: '12 Yrs Workmanship / 30 Yrs Linear Power',
    description: 'Tier-1 ultra-high efficiency TOPCon module with superior low-light performance and minimal degradation.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    supplier: 'Wavetech Power Solutions Ltd',
    unitPrice: 220000,
    quantity: 100,
    minStockLevel: 20,
    totalValue: 22000000, // 220000 * 100
    status: 'In Stock',
    isArchived: false,
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-07-15T14:30:00Z',
  },
  {
    id: 'sp-2',
    equipmentType: 'Solar Panels',
    name: 'Canadian Solar HiKu6 450W Mono PERC',
    capacityId: 'cap-450w',
    capacityWattage: 450,
    capacityLabel: '450W',
    brand: 'Canadian Solar',
    modelNumber: 'CS6W-450MS',
    panelType: 'Monocrystalline',
    efficiency: '20.8%',
    voltage: '41.30V Vmp / 49.30V Voc',
    dimensions: '2108 x 1048 x 35 mm',
    warranty: '12 Yrs Product / 25 Yrs Performance',
    description: 'Reliable half-cut cell module engineered for high ambient temperature rural electrification projects.',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    supplier: 'Solarpower Direct West Africa',
    unitPrice: 180000,
    quantity: 30,
    minStockLevel: 15,
    totalValue: 5400000, // 180000 * 30
    status: 'In Stock',
    isArchived: false,
    createdAt: '2026-05-12T10:15:00Z',
    updatedAt: '2026-07-20T11:00:00Z',
  },
  {
    id: 'sp-3',
    equipmentType: 'Solar Panels',
    name: 'LONGi Hi-MO 6 Scientist 600W Monocrystalline',
    capacityId: 'cap-600w',
    capacityWattage: 600,
    capacityLabel: '600W',
    brand: 'LONGi Solar',
    modelNumber: 'LR5-72HPH-600M',
    panelType: 'Monocrystalline',
    efficiency: '22.1%',
    voltage: '45.20V Vmp / 53.80V Voc',
    dimensions: '2384 x 1134 x 35 mm',
    warranty: '15 Yrs Product / 25 Yrs Linear Output',
    description: 'High power density HPBC module tailored for commercial rooftop & solar mini-grid installations.',
    imageUrl: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=800&q=80',
    supplier: 'GreenEnergy Hub Lagos',
    unitPrice: 250000,
    quantity: 50,
    minStockLevel: 15,
    totalValue: 12500000, // 250000 * 50
    status: 'In Stock',
    isArchived: false,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-07-25T16:00:00Z',
  },
  {
    id: 'sp-4',
    equipmentType: 'Solar Panels',
    name: 'Trina Vertex S 300W Compact Module',
    capacityId: 'cap-300w',
    capacityWattage: 300,
    capacityLabel: '300W',
    brand: 'Trina Solar',
    modelNumber: 'TSM-300DE06',
    panelType: 'Polycrystalline',
    efficiency: '18.5%',
    voltage: '32.60V Vmp / 39.80V Voc',
    dimensions: '1650 x 992 x 35 mm',
    warranty: '10 Yrs Product / 25 Yrs Performance',
    description: 'Sturdy polycrystalline solar panel for solar boreholes and street lighting installations.',
    imageUrl: 'https://images.unsplash.com/photo-1592833159057-6514272330a6?auto=format&fit=crop&w=800&q=80',
    supplier: 'Solarpower Direct West Africa',
    unitPrice: 120000,
    quantity: 50,
    minStockLevel: 20,
    totalValue: 6000000, // 120000 * 50
    status: 'In Stock',
    isArchived: false,
    createdAt: '2026-06-10T12:00:00Z',
    updatedAt: '2026-07-28T09:30:00Z',
  },
  {
    id: 'sp-5',
    equipmentType: 'Solar Panels',
    name: 'Felicity Solar 350W Mono PERC Module',
    capacityId: 'cap-350w',
    capacityWattage: 350,
    capacityLabel: '350W',
    brand: 'Felicity Solar',
    modelNumber: 'FL-350M-60',
    panelType: 'PERC',
    efficiency: '19.8%',
    voltage: '36.80V Vmp / 44.20V Voc',
    dimensions: '1755 x 1038 x 35 mm',
    warranty: '10 Yrs Product / 25 Yrs Performance',
    description: 'Versatile PERC panel designed for residential solar systems and healthcare clinic backup power.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    supplier: 'Felicity Solar Depot Lagos',
    unitPrice: 140000,
    quantity: 12,
    minStockLevel: 20, // Quantity (12) <= minStockLevel (20) -> Low Stock
    totalValue: 1680000,
    status: 'Low Stock',
    isArchived: false,
    createdAt: '2026-06-15T14:20:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'sp-6',
    equipmentType: 'Solar Panels',
    name: 'Suntech Ultra V 650W Bifacial Module',
    capacityId: 'cap-650w',
    capacityWattage: 650,
    capacityLabel: '650W',
    brand: 'Suntech',
    modelNumber: 'STP650-A66/Vnh',
    panelType: 'Bifacial',
    efficiency: '22.3%',
    voltage: '46.10V Vmp / 55.20V Voc',
    dimensions: '2384 x 1303 x 35 mm',
    warranty: '12 Yrs Product / 30 Yrs Output',
    description: 'Dual-glass bifacial panel capturing ambient albedo gain from ground surfaces for up to +25% extra yield.',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    supplier: 'Suntech Energy Nigeria',
    unitPrice: 280000,
    quantity: 0,
    minStockLevel: 10,
    totalValue: 0,
    status: 'Out of Stock',
    isArchived: false,
    createdAt: '2026-06-18T11:00:00Z',
    updatedAt: '2026-08-02T15:45:00Z',
  },
  {
    id: 'sp-7',
    equipmentType: 'Solar Panels',
    name: 'Suntech 700W+ Ultra High Power Commercial',
    capacityId: 'cap-700w',
    capacityWattage: 720,
    capacityLabel: '700W+',
    brand: 'Suntech',
    modelNumber: 'STP720-A66/Xnh',
    panelType: 'Bifacial',
    efficiency: '22.8%',
    voltage: '48.20V Vmp / 57.10V Voc',
    dimensions: '2472 x 1303 x 35 mm',
    warranty: '15 Yrs Product / 30 Yrs Output',
    description: 'Next-generation 210mm wafer ultra-power solar panel built for utility scale solar power stations.',
    imageUrl: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=800&q=80',
    supplier: 'Megawatt Energy Partners',
    unitPrice: 320000,
    quantity: 20,
    minStockLevel: 10,
    totalValue: 6400000,
    status: 'In Stock',
    isArchived: false,
    createdAt: '2026-06-25T09:30:00Z',
    updatedAt: '2026-08-05T08:15:00Z',
  }
];

export const INITIAL_STOCK_LOGS: StockMovementLog[] = [
  {
    id: 'log-1',
    productId: 'sp-1',
    productName: 'Jinko Tiger Neo 550W N-Type TOPCon Mono',
    capacityLabel: '550W',
    changeType: 'Initial Intake',
    quantityChange: 100,
    previousQuantity: 0,
    newQuantity: 100,
    unitPrice: 220000,
    totalMovementValue: 22000000,
    performerName: 'Amina Abubakar',
    performerRole: 'Administrator',
    timestamp: '2026-05-10T09:00:00Z',
    notes: 'Initial warehouse receipt from Wavetech shipment invoice #WV-8891'
  },
  {
    id: 'log-2',
    productId: 'sp-2',
    productName: 'Canadian Solar HiKu6 450W Mono PERC',
    capacityLabel: '450W',
    changeType: 'Dispatch to Site',
    quantityChange: -20,
    previousQuantity: 50,
    newQuantity: 30,
    unitPrice: 180000,
    totalMovementValue: 3600000,
    performerName: 'David Okon',
    performerRole: 'Field Engineer',
    timestamp: '2026-07-20T11:00:00Z',
    notes: 'Dispatched for Offa Solar Mini Grid expansion phase 2'
  },
  {
    id: 'log-3',
    productId: 'sp-5',
    productName: 'Felicity Solar 350W Mono PERC Module',
    capacityLabel: '350W',
    changeType: 'Remove Stock',
    quantityChange: -8,
    previousQuantity: 20,
    newQuantity: 12,
    unitPrice: 140000,
    totalMovementValue: 1120000,
    performerName: 'Ibrahim Bello',
    performerRole: 'Project Manager',
    timestamp: '2026-08-01T10:00:00Z',
    notes: 'Allocated for Gwarinpa Health Clinic solar power upgrade'
  }
];

const LOCAL_STORAGE_KEY_PREFIX = 'solar_tracker_';

export function getStoredData<T>(key: string, defaultValue: T): T {
  const fullKey = LOCAL_STORAGE_KEY_PREFIX + key;
  const stored = localStorage.getItem(fullKey);
  if (!stored) {
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error('Failed to parse stored data for ' + key, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  const fullKey = LOCAL_STORAGE_KEY_PREFIX + key;
  localStorage.setItem(fullKey, JSON.stringify(value));
}

export function initializeStorageIfNeeded(): void {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'programs')) {
    setStoredData('programs', INITIAL_PROGRAMS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'communities')) {
    setStoredData('communities', INITIAL_COMMUNITIES);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'projects')) {
    setStoredData('projects', INITIAL_PROJECTS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'categories')) {
    setStoredData('categories', DEFAULT_CATEGORIES);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'expenses')) {
    setStoredData('expenses', INITIAL_EXPENSES);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'store_items')) {
    setStoredData('store_items', INITIAL_STORE_ITEMS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'audit_logs')) {
    setStoredData('audit_logs', INITIAL_AUDIT_LOGS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'current_user')) {
    setStoredData('current_user', USERS[0]); // Default to Administrator
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'solar_capacities')) {
    setStoredData('solar_capacities', DEFAULT_SOLAR_CAPACITIES);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'solar_products')) {
    setStoredData('solar_products', INITIAL_SOLAR_PRODUCTS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'stock_logs')) {
    setStoredData('stock_logs', INITIAL_STOCK_LOGS);
  }
}

