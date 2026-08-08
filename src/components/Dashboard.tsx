import React, { useMemo } from 'react';
import { Program, Community, SolarProject, Expense, ExpenseCategory, SolarPanelProduct, SolarPanelCapacity } from '../types';
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

  // Solar Panel Inventory Summary (Requirement #9)
  const solarInventoryMetrics = useMemo(() => {
    const activePanels = solarProducts.filter(p => p.equipmentType === 'Solar Panels' && !p.isArchived);
    const totalTypes = activePanels.length;
    let totalPhysicalPanels = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const capacityMap: Record<string, number> = {};

    // Initialize all capacities with 0 so all appear in capacity summary
    solarCapacities.forEach(c => {
      capacityMap[c.label] = 0;
    });

    activePanels.forEach(p => {
      totalPhysicalPanels += p.quantity;
      totalInventoryValue += p.totalValue;

      if (p.quantity <= 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minStockLevel) {
        lowStockCount++;
      }

      const capLabel = p.capacityLabel || 'Custom';
      capacityMap[capLabel] = (capacityMap[capLabel] || 0) + p.quantity;
    });

    return {
      totalTypes,
      totalPhysicalPanels,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      capacityEntries: Object.entries(capacityMap)
    };
  }, [solarProducts, solarCapacities]);

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

      {/* SOLAR PANEL INVENTORY DASHBOARD SUMMARY (Requirement #9) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Sun className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Solar Panel Inventory Statistics</h3>
              <p className="text-xs text-white/50">Capacity breakdown, physical counts, and total inventory capitalization</p>
            </div>
          </div>
        </div>

        {/* 5 Core Inventory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Panel Types</span>
            <p className="text-lg font-bold text-white mt-0.5">{solarInventoryMetrics.totalTypes} Models</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Total Panels</span>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{solarInventoryMetrics.totalPhysicalPanels.toLocaleString()} Units</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Inventory Value</span>
            <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">{formatCurrency(solarInventoryMetrics.totalInventoryValue)}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] font-mono text-white/50 uppercase">Low Stock Alerts</span>
            <p className="text-lg font-bold text-amber-400 mt-0.5">{solarInventoryMetrics.lowStockCount} Products</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-white/50 uppercase">Out of Stock</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{solarInventoryMetrics.outOfStockCount} Products</p>
          </div>
        </div>

        {/* Capacity Breakdown Pills */}
        <div className="pt-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-2">
            Capacity Summary Breakdown:
          </span>
          <div className="flex flex-wrap gap-2">
            {solarInventoryMetrics.capacityEntries.map(([label, count]) => (
              <div 
                key={label}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                  count > 0 ? 'bg-amber-500/10 border-amber-500/20 text-white' : 'bg-white/5 border-white/5 text-white/30'
                }`}
              >
                <span className="font-bold text-amber-400">{label}:</span>
                <span className="font-semibold">{count} panels</span>
              </div>
            ))}
          </div>
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
