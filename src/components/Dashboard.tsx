import React, { useMemo, useState } from 'react';
import { Program, Community, SolarProject, Expense, ExpenseCategory, SolarPanelProduct, SolarPanelCapacity } from '../types';
import { RenewableProduct, DynamicStockBalance } from '../types/logistics';
import {
  TrendingUp,
  Landmark,
  MapPin,
  Flame,
  Activity,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Receipt,
  AlertOctagon,
  Sun,
  Zap,
  Package,
  Warehouse,
  Cpu,
  Building2,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Boxes,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardProps {
  programs: Program[];
  communities: Community[];
  projects: SolarProject[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  solarProducts?: SolarPanelProduct[];
  solarCapacities?: SolarPanelCapacity[];
  logisticsProducts?: RenewableProduct[];
  stockBalances?: DynamicStockBalance[];
}

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
];

export default function Dashboard({
  programs,
  communities,
  projects,
  expenses,
  categories,
  solarProducts = [],
  solarCapacities = [],
  logisticsProducts = [],
  stockBalances = [],
}: DashboardProps) {
  // 1. Core KPIs
  const kpis = useMemo(() => {
    const totalProg = programs.filter(p => p.status !== 'Archived').length;
    const totalComm = communities.length;
    const totalProj = projects.length;
    const activeProj = projects.filter((p) => p.status === 'Active').length;
    const completedProj = projects.filter((p) => p.status === 'Completed').length;

    // Total Budget (sum of active programmes)
    const totalBudget = programs
      .filter((p) => p.status !== 'Archived')
      .reduce((sum, p) => sum + p.budget, 0);

    // Total Cost (Approved Expenses)
    const approvedExpenses = expenses.filter((e) => e.status === 'Approved');
    const totalCost = approvedExpenses.reduce((sum, e) => sum + e.totalCost, 0);

    const remainingBudget = totalBudget - totalCost;
    const utilizationPct = totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;

    return {
      totalProg,
      totalComm,
      totalProj,
      activeProj,
      completedProj,
      totalBudget,
      totalCost,
      remainingBudget,
      utilizationPct,
    };
  }, [programs, communities, projects, expenses]);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 2. Budget Warnings
  const budgetWarnings = useMemo(() => {
    const warnings: { type: 'programme' | 'project'; name: string; pct: number; budget: number; spent: number }[] = [];

    // Check Programmes
    programs.forEach((prog) => {
      const spent = expenses
        .filter((e) => e.programId === prog.id && e.status === 'Approved')
        .reduce((sum, e) => sum + e.totalCost, 0);
      const pct = prog.budget > 0 ? (spent / prog.budget) * 100 : 0;

      if (pct >= 80) {
        warnings.push({
          type: 'programme',
          name: prog.name,
          pct,
          budget: prog.budget,
          spent,
        });
      }
    });

    // Check Projects
    projects.forEach((proj) => {
      const spent = expenses
        .filter((e) => e.projectId === proj.id && e.status === 'Approved')
        .reduce((sum, e) => sum + e.totalCost, 0);
      const pct = proj.budget > 0 ? (spent / proj.budget) * 100 : 0;

      if (pct >= 80) {
        warnings.push({
          type: 'project',
          name: proj.name,
          pct,
          budget: proj.budget,
          spent,
        });
      }
    });

    return warnings.sort((a, b) => b.pct - a.pct);
  }, [programs, projects, expenses]);

  // 3. Spending by Month (Chart Data)
  const monthlySpendingData = useMemo(() => {
    const monthlyMap: { [key: string]: number } = {};
    const approvedExpenses = expenses.filter((e) => e.status === 'Approved');

    // Sort by date
    const sorted = [...approvedExpenses].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((e) => {
      if (!e.date) return;
      const dateObj = new Date(e.date);
      const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + e.totalCost;
    });

    return Object.keys(monthlyMap).map((m) => ({
      month: m,
      Amount: monthlyMap[m],
    }));
  }, [expenses]);

  // 4. Budget vs Actual Cost by Programme (Chart Data)
  const budgetVsActualData = useMemo(() => {
    return programs
      .filter((p) => p.status !== 'Archived')
      .map((p) => {
        const spent = expenses
          .filter((e) => e.programId === p.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.totalCost, 0);
        return {
          name: p.code,
          fullName: p.name,
          Budget: p.budget,
          Actual: spent,
        };
      });
  }, [programs, expenses]);

  // 5. Spending by Programme (Chart Data)
  const spendingByProgData = useMemo(() => {
    return programs
      .filter((p) => p.status !== 'Archived')
      .map((p) => {
        const spent = expenses
          .filter((e) => e.programId === p.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.totalCost, 0);
        return {
          name: p.code,
          value: spent,
        };
      })
      .filter((item) => item.value > 0);
  }, [programs, expenses]);

  // 6. Spending by Category (Chart Data)
  const spendingByCategoryData = useMemo(() => {
    return categories
      .map((cat) => {
        const spent = expenses
          .filter((e) => e.categoryId === cat.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.totalCost, 0);
        return {
          name: cat.name,
          value: spent,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, expenses]);

  // 7. Spending by Community (Chart Data)
  const spendingByCommunityData = useMemo(() => {
    return communities
      .map((comm) => {
        const spent = expenses
          .filter((e) => e.communityId === comm.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.totalCost, 0);
        return {
          name: comm.name,
          Amount: spent,
        };
      })
      .filter((item) => item.Amount > 0)
      .sort((a, b) => b.Amount - a.Amount);
  }, [communities, expenses]);

  // 8. Spending by Project (Chart Data)
  const spendingByProjectData = useMemo(() => {
    return projects
      .map((proj) => {
        const spent = expenses
          .filter((e) => e.projectId === proj.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.totalCost, 0);
        return {
          name: proj.name.length > 20 ? proj.name.substring(0, 20) + '...' : proj.name,
          Amount: spent,
        };
      })
      .filter((item) => item.Amount > 0)
      .sort((a, b) => b.Amount - a.Amount);
  }, [projects, expenses]);

  // 9. Top Vendors
  const topVendorsData = useMemo(() => {
    const vendorMap: { [key: string]: number } = {};
    expenses
      .filter((e) => e.status === 'Approved')
      .forEach((e) => {
        const vendor = e.vendor || 'Unknown Vendor';
        vendorMap[vendor] = (vendorMap[vendor] || 0) + e.totalCost;
      });

    return Object.keys(vendorMap)
      .map((v) => ({ name: v, Amount: vendorMap[v] }))
      .sort((a, b) => b.Amount - a.Amount)
      .slice(0, 5);
  }, [expenses]);

  // Recent 5 expenses
  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [expenses]);

  // Inventory Statistics State & Calculations
  const [inventorySortBy, setInventorySortBy] = useState<'items' | 'specification' | 'oem'>('items');
  const [inventorySortOrder, setInventorySortOrder] = useState<'asc' | 'desc'>('asc');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');

  // Unified Inventory Items
  const allInventoryItems = useMemo(() => {
    // 1. Map Solar Products from CMS
    const solarItems = solarProducts
      .filter((p) => !p.isArchived)
      .map((p) => {
        const status: 'In Stock' | 'Low Stock' | 'Out of Stock' =
          p.quantity <= 0 ? 'Out of Stock' : p.quantity <= p.minStockLevel ? 'Low Stock' : 'In Stock';
        return {
          id: p.id,
          name: p.name,
          category: p.equipmentType || 'Solar Panels',
          modelNumber: p.modelNumber || 'N/A',
          oem: p.brand || 'Unspecified OEM',
          specification: p.capacityLabel ? `${p.capacityLabel} (${p.panelType || 'Module'})` : (p.panelType || 'Standard Module'),
          specNumeric: p.capacityWattage || 0,
          specSecondary: [p.voltage, p.efficiency ? `Eff: ${p.efficiency}` : null].filter(Boolean).join(' • '),
          quantity: p.quantity,
          minStockLevel: p.minStockLevel,
          unitPrice: p.unitPrice,
          totalValue: p.totalValue || p.quantity * p.unitPrice,
          status,
          supplier: p.supplier,
          source: 'Solar CMS',
        };
      });

    // 2. Map Logistics Products (deduplicating by model/sku)
    const existingModelSet = new Set(solarItems.map((i) => i.modelNumber.toLowerCase()));
    const logisticItems = (logisticsProducts || [])
      .filter((lp) => !existingModelSet.has((lp.sku || lp.modelNumber || '').toLowerCase()))
      .map((lp) => {
        const balances = (stockBalances || []).filter((b) => b.productId === lp.id);
        const totalStock =
          balances.length > 0
            ? balances.reduce((sum, b) => sum + b.currentStock, 0)
            : Object.values(lp.initialStockPerStore || {}).reduce((sum, v) => sum + v, 0);

        const minStock =
          Object.values(lp.minThresholdPerStore || {}).reduce((sum, v) => sum + v, 0) || 10;

        const status: 'In Stock' | 'Low Stock' | 'Out of Stock' =
          totalStock <= 0 ? 'Out of Stock' : totalStock <= minStock ? 'Low Stock' : 'In Stock';

        const specLabel = lp.specs?.wattage
          ? `${lp.specs.wattage}W`
          : lp.specs?.capacityKwh
          ? `${lp.specs.capacityKwh} kWh`
          : lp.specs?.voltage || 'Standard Hardware';

        const specNumeric =
          lp.specs?.wattage || (lp.specs?.capacityKwh ? lp.specs.capacityKwh * 1000 : 0);

        const specSecondary = [
          lp.specs?.voltage,
          lp.specs?.chemistry,
          lp.specs?.efficiency ? `Eff: ${lp.specs.efficiency}` : null,
        ]
          .filter(Boolean)
          .join(' • ');

        return {
          id: lp.id,
          name: lp.name,
          category: lp.category || 'Renewable Hardware',
          modelNumber: lp.sku || lp.modelNumber || 'N/A',
          oem: lp.brand || 'Tier-1 OEM',
          specification: specLabel,
          specNumeric,
          specSecondary,
          quantity: totalStock,
          minStockLevel: minStock,
          unitPrice: lp.unitCost,
          totalValue: totalStock * lp.unitCost,
          status,
          supplier: undefined,
          source: 'Nationwide Logistics',
        };
      });

    return [...solarItems, ...logisticItems];
  }, [solarProducts, logisticsProducts, stockBalances]);

  // Overall Inventory Metrics
  const inventoryMetrics = useMemo(() => {
    const totalItems = allInventoryItems.length;
    let totalUnits = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allInventoryItems.forEach((item) => {
      totalUnits += item.quantity;
      totalValuation += item.totalValue;
      if (item.status === 'Out of Stock') outOfStockCount++;
      else if (item.status === 'Low Stock') lowStockCount++;
    });

    return {
      totalItems,
      totalUnits,
      totalValuation,
      lowStockCount,
      outOfStockCount,
    };
  }, [allInventoryItems]);

  // Available Categories for filtering
  const availableCategories = useMemo(() => {
    const set = new Set(allInventoryItems.map((i) => i.category));
    return ['All', ...Array.from(set)];
  }, [allInventoryItems]);

  // Dynamic Grouping Summaries based on selected sort:
  // 1. Grouped by OEM
  const oemStatistics = useMemo(() => {
    const map: Record<
      string,
      { oem: string; totalUnits: number; totalValuation: number; itemCount: number; categories: Set<string> }
    > = {};

    allInventoryItems.forEach((item) => {
      if (!map[item.oem]) {
        map[item.oem] = {
          oem: item.oem,
          totalUnits: 0,
          totalValuation: 0,
          itemCount: 0,
          categories: new Set(),
        };
      }
      map[item.oem].totalUnits += item.quantity;
      map[item.oem].totalValuation += item.totalValue;
      map[item.oem].itemCount += 1;
      map[item.oem].categories.add(item.category);
    });

    return Object.values(map).sort((a, b) => b.totalValuation - a.totalValuation);
  }, [allInventoryItems]);

  // 2. Grouped by Specification
  const specificationStatistics = useMemo(() => {
    const map: Record<
      string,
      { spec: string; specNumeric: number; totalUnits: number; totalValuation: number; itemCount: number }
    > = {};

    allInventoryItems.forEach((item) => {
      const key = item.specification;
      if (!map[key]) {
        map[key] = {
          spec: key,
          specNumeric: item.specNumeric,
          totalUnits: 0,
          totalValuation: 0,
          itemCount: 0,
        };
      }
      map[key].totalUnits += item.quantity;
      map[key].totalValuation += item.totalValue;
      map[key].itemCount += 1;
    });

    return Object.values(map).sort((a, b) => b.specNumeric - a.specNumeric || b.totalUnits - a.totalUnits);
  }, [allInventoryItems]);

  // 3. Grouped by Items / Category
  const itemCategoryStatistics = useMemo(() => {
    const map: Record<
      string,
      { category: string; totalUnits: number; totalValuation: number; itemCount: number }
    > = {};

    allInventoryItems.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = {
          category: item.category,
          totalUnits: 0,
          totalValuation: 0,
          itemCount: 0,
        };
      }
      map[item.category].totalUnits += item.quantity;
      map[item.category].totalValuation += item.totalValue;
      map[item.category].itemCount += 1;
    });

    return Object.values(map).sort((a, b) => b.totalValuation - a.totalValuation);
  }, [allInventoryItems]);

  // Filtered and Sorted Items for the Table
  const filteredAndSortedItems = useMemo(() => {
    let list = [...allInventoryItems];

    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.oem.toLowerCase().includes(q) ||
          item.specification.toLowerCase().includes(q) ||
          item.modelNumber.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (inventoryCategoryFilter !== 'All') {
      list = list.filter((item) => item.category === inventoryCategoryFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (inventorySortBy === 'items') {
        cmp = a.name.localeCompare(b.name);
        if (cmp === 0) cmp = a.modelNumber.localeCompare(b.modelNumber);
      } else if (inventorySortBy === 'specification') {
        if (a.specNumeric !== b.specNumeric) {
          cmp = a.specNumeric - b.specNumeric;
        } else {
          cmp = a.specification.localeCompare(b.specification);
        }
      } else if (inventorySortBy === 'oem') {
        cmp = a.oem.localeCompare(b.oem);
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      }

      return inventorySortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [allInventoryItems, inventorySearch, inventoryCategoryFilter, inventorySortBy, inventorySortOrder]);

  // Color warning helpers
  const getUtilizationColor = (pct: number) => {
    if (pct >= 100) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (pct >= 80) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-sm text-white/50">Real-time solar electrification program metrics and budget analysis.</p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400">
          <Activity className="h-4 w-4 animate-pulse text-emerald-400" />
          Live Active Synchronization
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Program Budget</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold font-sans text-white">{formatCurrency(kpis.totalBudget)}</h3>
            <p className="text-xs font-mono text-white/40 mt-1">Sum of active programmes</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Recorded Cost</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold font-sans text-white">{formatCurrency(kpis.totalCost)}</h3>
            <p className="text-xs font-mono text-white/40 mt-1">Approved expenses only</p>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Remaining Balance</span>
            <div className={`p-2 rounded-xl ${kpis.remainingBudget < 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-xl md:text-2xl font-bold font-sans ${kpis.remainingBudget < 0 ? 'text-rose-400' : 'text-white'}`}>
              {formatCurrency(kpis.remainingBudget)}
            </h3>
            <p className="text-xs font-mono text-white/40 mt-1">Variance remaining</p>
          </div>
        </div>

        {/* Budget Utilization % */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Budget Utilization</span>
            <div className={`p-2 rounded-xl ${kpis.utilizationPct >= 80 ? (kpis.utilizationPct >= 100 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20') : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold font-sans text-white">{kpis.utilizationPct.toFixed(1)}%</h3>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${kpis.utilizationPct >= 100 ? 'bg-rose-500' : kpis.utilizationPct >= 80 ? 'bg-amber-500' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(kpis.utilizationPct, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Structures Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition">
          <Landmark className="h-5 w-5 text-white/60 mx-auto mb-1" />
          <p className="text-xl font-bold font-sans text-white">{kpis.totalProg}</p>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Programmes</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition">
          <MapPin className="h-5 w-5 text-white/60 mx-auto mb-1" />
          <p className="text-xl font-bold font-sans text-white">{kpis.totalComm}</p>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Communities</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition">
          <Flame className="h-5 w-5 text-white/60 mx-auto mb-1" />
          <p className="text-xl font-bold font-sans text-white">{kpis.totalProj}</p>
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Solar Projects</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition">
          <Activity className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-xl font-bold font-sans text-indigo-400">{kpis.activeProj}</p>
          <span className="text-[10px] font-semibold text-indigo-400/60 uppercase tracking-wider">Active</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center col-span-2 md:col-span-1 hover:bg-white/10 transition">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold font-sans text-emerald-400">{kpis.completedProj}</p>
          <span className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wider">Completed</span>
        </div>
      </div>

      {/* INVENTORY STATISTICS DASHBOARD SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-5">
        {/* Section Header with Sort Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400/20 via-emerald-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-400 rounded-xl shadow-inner">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Inventory Statistics</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  Sorted by {inventorySortBy === 'items' ? 'Items' : inventorySortBy === 'specification' ? 'Specification' : 'OEM'}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Physical stock levels, technical specifications, capitalization, and OEM breakdown
              </p>
            </div>
          </div>

          {/* Sort Selection & Order Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <span className="text-[11px] font-mono text-white/40 uppercase px-2 hidden sm:inline">Sort by:</span>
              <button
                type="button"
                onClick={() => {
                  if (inventorySortBy === 'items') {
                    setInventorySortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setInventorySortBy('items');
                    setInventorySortOrder('asc');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  inventorySortBy === 'items'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Items</span>
                {inventorySortBy === 'items' && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-black/20 rounded">
                    {inventorySortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (inventorySortBy === 'specification') {
                    setInventorySortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setInventorySortBy('specification');
                    setInventorySortOrder('desc');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  inventorySortBy === 'specification'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Specification</span>
                {inventorySortBy === 'specification' && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-black/20 rounded">
                    {inventorySortOrder === 'desc' ? 'High→Low' : 'Low→High'}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (inventorySortBy === 'oem') {
                    setInventorySortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setInventorySortBy('oem');
                    setInventorySortOrder('asc');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  inventorySortBy === 'oem'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>OEM</span>
                {inventorySortBy === 'oem' && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-black/20 rounded">
                    {inventorySortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setInventorySortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sort direction: currently ${inventorySortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-mono transition"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">{inventorySortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>
        </div>

        {/* 5 Core Inventory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Inventory SKUs</span>
            <p className="text-lg font-bold text-white mt-0.5">{inventoryMetrics.totalItems} Models</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Total Units</span>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{inventoryMetrics.totalUnits.toLocaleString()} Units</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Capitalization Value</span>
            <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">{formatCurrency(inventoryMetrics.totalValuation)}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Low Stock Alerts</span>
            <p className="text-lg font-bold text-amber-400 mt-0.5">{inventoryMetrics.lowStockCount} Products</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-white/50 uppercase">Out of Stock</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{inventoryMetrics.outOfStockCount} Products</p>
          </div>
        </div>

        {/* Dynamic Aggregated Breakdown Cards based on Sort Focus */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              {inventorySortBy === 'oem' && <><Building2 className="h-3 w-3 text-amber-400" /> Aggregation by OEM (Original Equipment Manufacturer)</>}
              {inventorySortBy === 'specification' && <><Cpu className="h-3 w-3 text-emerald-400" /> Aggregation by Technical Specification Rating</>}
              {inventorySortBy === 'items' && <><Package className="h-3 w-3 text-indigo-400" /> Aggregation by Item Category Family</>}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              {inventorySortBy === 'oem' ? `${oemStatistics.length} OEMs Active` : inventorySortBy === 'specification' ? `${specificationStatistics.length} Spec Tiers` : `${itemCategoryStatistics.length} Categories`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {inventorySortBy === 'oem' &&
              oemStatistics.map((oemStat) => (
                <div
                  key={oemStat.oem}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs transition flex flex-col gap-0.5 min-w-[140px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white tracking-tight">{oemStat.oem}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">{oemStat.totalUnits} pcs</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span>{oemStat.itemCount} model{oemStat.itemCount > 1 ? 's' : ''}</span>
                    <span className="text-emerald-400">{formatCurrency(oemStat.totalValuation)}</span>
                  </div>
                </div>
              ))}

            {inventorySortBy === 'specification' &&
              specificationStatistics.map((specStat) => (
                <div
                  key={specStat.spec}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs transition flex flex-col gap-0.5 min-w-[130px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-300 font-mono">{specStat.spec}</span>
                    <span className="text-[10px] font-mono text-white font-semibold">{specStat.totalUnits} units</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span>{specStat.itemCount} SKU{specStat.itemCount > 1 ? 's' : ''}</span>
                    <span className="text-emerald-400">{formatCurrency(specStat.totalValuation)}</span>
                  </div>
                </div>
              ))}

            {inventorySortBy === 'items' &&
              itemCategoryStatistics.map((catStat) => (
                <div
                  key={catStat.category}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs transition flex flex-col gap-0.5 min-w-[130px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-300">{catStat.category}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">{catStat.totalUnits} pcs</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span>{catStat.itemCount} item{catStat.itemCount > 1 ? 's' : ''}</span>
                    <span className="text-emerald-400">{formatCurrency(catStat.totalValuation)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search items, specs, OEMs..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setInventoryCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                  inventoryCategoryFilter === cat
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'text-white/50 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Itemized Sorted Inventory Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-white/60 font-mono uppercase text-[10px]">
                <th
                  onClick={() => {
                    if (inventorySortBy === 'items') {
                      setInventorySortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setInventorySortBy('items');
                      setInventorySortOrder('asc');
                    }
                  }}
                  className="p-3 cursor-pointer hover:text-amber-400 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Item & Model</span>
                    {inventorySortBy === 'items' && <ArrowUpDown className="h-3 w-3 text-amber-400" />}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (inventorySortBy === 'specification') {
                      setInventorySortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setInventorySortBy('specification');
                      setInventorySortOrder('desc');
                    }
                  }}
                  className="p-3 cursor-pointer hover:text-amber-400 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Specification</span>
                    {inventorySortBy === 'specification' && <ArrowUpDown className="h-3 w-3 text-amber-400" />}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (inventorySortBy === 'oem') {
                      setInventorySortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setInventorySortBy('oem');
                      setInventorySortOrder('asc');
                    }
                  }}
                  className="p-3 cursor-pointer hover:text-amber-400 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>OEM</span>
                    {inventorySortBy === 'oem' && <ArrowUpDown className="h-3 w-3 text-amber-400" />}
                  </div>
                </th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-center">Stock Count</th>
                <th className="p-3 text-right">Total Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40 font-mono text-xs">
                    No inventory records match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.04] transition">
                    <td className="p-3">
                      <div className="font-semibold text-white tracking-tight">{item.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40 font-mono">
                        <span>Model: {item.modelNumber}</span>
                        <span>•</span>
                        <span className="text-indigo-300">{item.category}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-medium text-emerald-300">{item.specification}</div>
                      {item.specSecondary && (
                        <div className="text-[10px] text-white/40 mt-0.5">{item.specSecondary}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-amber-300 border border-white/10">
                        <Building2 className="h-3 w-3" />
                        {item.oem}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-white/70">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-white font-mono">{item.quantity} pcs</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase mt-0.5 ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(item.totalValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Warning Section */}
      {budgetWarnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-amber-400 shrink-0" />
            <h3 className="font-sans font-bold text-amber-200 text-sm">Budget Utilization Warnings ({budgetWarnings.length})</h3>
          </div>
          <p className="text-xs text-amber-350/80 leading-relaxed">
            The following programs or individual solar projects have exceeded <strong>80% of their allocated budget</strong>.
            Please review recent expenses or negotiate variance adjustments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgetWarnings.map((warn, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5 flex flex-col justify-between hover:bg-white/10 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${warn.type === 'programme' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'}`}>
                      {warn.type}
                    </span>
                    <span className={`text-xs font-mono font-bold ${warn.pct >= 100 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {warn.pct.toFixed(0)}% Used
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{warn.name}</h4>
                </div>
                <div className="mt-3 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-white/40">Spent: {formatCurrency(warn.spent)}</span>
                  <span className="text-white/60 font-bold">Limit: {formatCurrency(warn.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS GRID 1: Monthly Trend & Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Monthly Expenses */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Monthly Spend Analysis</h4>
            <p className="text-xs text-white/40 font-mono">Timeline tracking of approved transactions</p>
          </div>
          <div className="h-72">
            {monthlySpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.4)' }} style={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255, 255, 255, 0.4)' }}
                    style={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Total Expenses']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: 12, fontFamily: 'sans-serif', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="Amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-white/40">No approved expense data recorded.</div>
            )}
          </div>
        </div>

        {/* Chart B: Budget vs Actual Cost (Programme Level) */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Programme Budgets vs. Actual Costs</h4>
            <p className="text-xs text-white/40 font-mono">Target budget boundaries contrasted with current spends</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.4)' }} style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255, 255, 255, 0.4)' }}
                  style={{ fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: 12, fontFamily: 'sans-serif', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif', color: 'rgba(255, 255, 255, 0.7)' }} />
                <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: Spending by Category & Community */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Share (Pie) */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl lg:col-span-1 hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Expense Categories</h4>
            <p className="text-xs text-white/40 font-mono">Total distribution share</p>
          </div>
          <div className="h-60 flex items-center justify-center">
            {spendingByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {spendingByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs font-mono text-white/40">No category statistics available.</p>
            )}
          </div>
          {/* Legend */}
          <div className="max-h-24 overflow-y-auto mt-2 space-y-1.5 text-[11px]">
            {spendingByCategoryData.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-white/60">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
                <span className="font-mono font-semibold shrink-0 text-white">{formatCurrency(entry.value)}</span>
              </div>
            ))}
            {spendingByCategoryData.length > 5 && (
              <div className="text-[10px] text-white/40 text-center font-mono mt-1">+{spendingByCategoryData.length - 5} more categories</div>
            )}
          </div>
        </div>

        {/* Community Spends (Horizontal Bar) */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl lg:col-span-1 hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Spends by Community</h4>
            <p className="text-xs text-white/40 font-mono">Top community funding deployments</p>
          </div>
          <div className="h-72">
            {spendingByCommunityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByCommunityData} layout="vertical" margin={{ left: 15, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.4)' }} style={{ fontSize: 9, fontFamily: 'monospace' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.7)' }} style={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: 12 }} />
                  <Bar dataKey="Amount" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-white/40">No community data.</div>
            )}
          </div>
        </div>

        {/* Top Vendors (Horizontal Bar) */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl lg:col-span-1 hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Top Vendors</h4>
            <p className="text-xs text-white/40 font-mono">Supplier aggregate allocations</p>
          </div>
          <div className="h-72">
            {topVendorsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVendorsData} layout="vertical" margin={{ left: 15, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.4)' }} style={{ fontSize: 9, fontFamily: 'monospace' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.7)' }} style={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: 12 }} />
                  <Bar dataKey="Amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-white/40">No vendor data.</div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Recent Expenses & Project Budgets breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses List */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl lg:col-span-2 hover:bg-white/10 transition duration-150">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-sans font-bold text-white text-sm">Recent Transactions</h4>
              <p className="text-xs text-white/40 font-mono">Latest recorded expenditures across sites</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white/10 border border-white/10 px-2 py-0.5 rounded text-white/70">
              {expenses.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-mono text-[9px]">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Project</th>
                  <th className="py-2.5">Vendor</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Total Cost</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-white/80">
                {recentExpenses.map((exp) => {
                  const projName = projects.find((p) => p.id === exp.projectId)?.name || 'Unknown Project';
                  const catName = categories.find((c) => c.id === exp.categoryId)?.name || 'Unknown';
                  return (
                    <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-white/40 whitespace-nowrap">{exp.date}</td>
                      <td className="py-3 truncate max-w-[120px] text-white" title={projName}>
                        {projName}
                      </td>
                      <td className="py-3 font-mono text-white/50 truncate max-w-[100px]">{exp.vendor}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/70 font-semibold border border-white/10">
                          {catName}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        {formatCurrency(exp.totalCost)}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wide uppercase ${
                            exp.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : exp.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {exp.status.replace(' Approval', '')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project budgets utilization summary */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl lg:col-span-1 hover:bg-white/10 transition duration-150">
          <div className="mb-4">
            <h4 className="font-sans font-bold text-white text-sm">Solar Projects Budgets</h4>
            <p className="text-xs text-white/40 font-mono">Funding consumption level by installation site</p>
          </div>

          <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
            {projects.map((proj) => {
              const spent = expenses
                .filter((e) => e.projectId === proj.id && e.status === 'Approved')
                .reduce((sum, e) => sum + e.totalCost, 0);
              const pct = proj.budget > 0 ? (spent / proj.budget) * 100 : 0;
              return (
                <div key={proj.id} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white line-clamp-1 max-w-[170px]" title={proj.name}>
                      {proj.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-white/60'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-indigo-400'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>Spent: {formatCurrency(spent)}</span>
                    <span>Budget: {formatCurrency(proj.budget)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
