import React, { useState, useMemo } from 'react';
import { Expense, Program, Community, SolarProject, ExpenseCategory } from '../types';
import { Download, FileSpreadsheet, FileText, Printer, SlidersHorizontal, BarChart3, HelpCircle } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
  programs: Program[];
  communities: Community[];
  projects: SolarProject[];
  categories: ExpenseCategory[];
}

interface FilterState {
  programId: string;
  communityId: string;
  projectId: string;
  categoryId: string;
  vendor: string;
  startDate: string;
  endDate: string;
  periodType: 'None' | 'Month' | 'Quarter' | 'Year';
  periodValue: string; // e.g. "2026-02", "Q1", "2026"
}

export default function Reports({
  expenses,
  programs,
  communities,
  projects,
  categories,
}: ReportsProps) {
  const [filters, setFilters] = useState<FilterState>({
    programId: 'All',
    communityId: 'All',
    projectId: 'All',
    categoryId: 'All',
    vendor: 'All',
    startDate: '',
    endDate: '',
    periodType: 'None',
    periodValue: '',
  });

  // Extract all unique vendors for filter dropdown
  const uniqueVendors = useMemo(() => {
    const list = new Set<string>();
    expenses.forEach((e) => {
      if (e.vendor) list.add(e.vendor);
    });
    return Array.from(list).sort();
  }, [expenses]);

  // Handle cascaded filter selections
  const communitiesForSelectedProgram = useMemo(() => {
    if (filters.programId === 'All') return communities;
    return communities.filter((c) => c.programId === filters.programId);
  }, [communities, filters.programId]);

  const projectsForSelectedCommunity = useMemo(() => {
    if (filters.communityId === 'All') {
      if (filters.programId === 'All') return projects;
      return projects.filter((p) => p.programId === filters.programId);
    }
    return projects.filter((p) => p.communityId === filters.communityId);
  }, [projects, filters.communityId, filters.programId]);

  // Period values options list based on type
  const periodValueOptions = useMemo(() => {
    if (filters.periodType === 'Month') {
      return [
        { label: 'January 2026', value: '2026-01' },
        { label: 'February 2026', value: '2026-02' },
        { label: 'March 2026', value: '2026-03' },
        { label: 'April 2026', value: '2026-04' },
        { label: 'May 2026', value: '2026-05' },
        { label: 'June 2026', value: '2026-06' },
        { label: 'July 2026', value: '2026-07' },
        { label: 'August 2026', value: '2026-08' },
        { label: 'September 2026', value: '2026-09' },
        { label: 'October 2026', value: '2026-10' },
        { label: 'November 2026', value: '2026-11' },
        { label: 'December 2026', value: '2026-12' },
      ];
    }
    if (filters.periodType === 'Quarter') {
      return [
        { label: 'Q1 (Jan - Mar)', value: 'Q1' },
        { label: 'Q2 (Apr - Jun)', value: 'Q2' },
        { label: 'Q3 (Jul - Sep)', value: 'Q3' },
        { label: 'Q4 (Oct - Dec)', value: 'Q4' },
      ];
    }
    if (filters.periodType === 'Year') {
      return [
        { label: 'Year 2026', value: '2026' },
      ];
    }
    return [];
  }, [filters.periodType]);

  // Compute matched filter expenses
  const matchedExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // 1. Program
      if (filters.programId !== 'All' && e.programId !== filters.programId) return false;
      // 2. Community
      if (filters.communityId !== 'All' && e.communityId !== filters.communityId) return false;
      // 3. Project
      if (filters.projectId !== 'All' && e.projectId !== filters.projectId) return false;
      // 4. Category
      if (filters.categoryId !== 'All' && e.categoryId !== filters.categoryId) return false;
      // 5. Vendor
      if (filters.vendor !== 'All' && e.vendor !== filters.vendor) return false;

      // 6. Date Range
      if (filters.startDate && e.date < filters.startDate) return false;
      if (filters.endDate && e.date > filters.endDate) return false;

      // 7. Calendar Period
      if (filters.periodType !== 'None' && filters.periodValue) {
        const expenseDateObj = new Date(e.date);
        const expenseYear = expenseDateObj.getFullYear();
        const expenseMonth = expenseDateObj.getMonth() + 1; // 1-indexed

        if (filters.periodType === 'Month') {
          const [yearStr, monthStr] = filters.periodValue.split('-');
          if (expenseYear !== Number(yearStr) || expenseMonth !== Number(monthStr)) return false;
        }

        if (filters.periodType === 'Quarter') {
          const monthToQuarter = Math.ceil(expenseMonth / 3);
          if (filters.periodValue !== `Q${monthToQuarter}`) return false;
        }

        if (filters.periodType === 'Year') {
          if (expenseYear !== Number(filters.periodValue)) return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  // Aggregate matched budgets and variance statistics
  const summaryStats = useMemo(() => {
    // Determine the relevant project scopes to sum budgets
    let budgetPool = 0;

    if (filters.projectId !== 'All') {
      const proj = projects.find((p) => p.id === filters.projectId);
      budgetPool = proj ? proj.budget : 0;
    } else if (filters.communityId !== 'All') {
      budgetPool = projects
        .filter((p) => p.communityId === filters.communityId)
        .reduce((sum, p) => sum + p.budget, 0);
    } else if (filters.programId !== 'All') {
      const prog = programs.find((p) => p.id === filters.programId);
      budgetPool = prog ? prog.budget : 0;
    } else {
      // General full pool
      budgetPool = programs
        .filter((p) => p.status !== 'Archived')
        .reduce((sum, p) => sum + p.budget, 0);
    }

    const totalSpent = matchedExpenses
      .filter((e) => e.status === 'Approved')
      .reduce((sum, e) => sum + e.totalCost, 0);

    const remaining = budgetPool - totalSpent;
    const utilization = budgetPool > 0 ? (totalSpent / budgetPool) * 100 : 0;

    return {
      budgetPool,
      totalSpent,
      remaining,
      utilization,
    };
  }, [matchedExpenses, filters, programs, communities, projects]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // EXPORT TO CSV FUNCTION
  const handleExportCSV = () => {
    if (matchedExpenses.length === 0) {
      alert('No data matches filters to export.');
      return;
    }

    // Header line
    let csvContent = 'Date,Programme,Community,Project,Category,Vendor,Invoice Number,Qty,Unit Cost,Total Cost,Payment Method,Reference,Status,Approved By,Notes\n';

    // Populate lines
    matchedExpenses.forEach((e) => {
      const prog = programs.find((p) => p.id === e.programId)?.name || 'Unknown';
      const comm = communities.find((c) => c.id === e.communityId)?.name || 'Unknown';
      const proj = projects.find((p) => p.id === e.projectId)?.name || 'Unknown';
      const cat = categories.find((c) => c.id === e.categoryId)?.name || 'Unknown';

      // Clean notes to prevent CSV breaking
      const cleanDesc = e.description.replace(/"/g, '""');
      const cleanNotes = (e.notes || '').replace(/"/g, '""');
      const cleanVendor = e.vendor.replace(/"/g, '""');

      csvContent += `"${e.date}","${prog}","${comm}","${proj}","${cat}","${cleanVendor}","${e.invoiceNumber}",${e.quantity},${e.unitCost},${e.totalCost},"${e.paymentMethod}","${e.referenceNumber || ''}","${e.status}","${e.approvedBy || ''}","${cleanNotes}"\n`;
    });

    // Create file trigger blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SolarCostReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT TO EXCEL SIMULATOR (Using Excel-friendly XML or high-quality tab-separated/CSV download)
  const handleExportExcel = () => {
    // Excel supports direct CSV rendering
    handleExportCSV();
  };

  // PRINTABLE PDF REPORT HANDLER
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in print:bg-white print:p-0 print:m-0">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Financial Reporting Engine</h2>
          <p className="text-sm text-white/50">Extract financial variance logs, budget aggregates, and export reports for donors and internal audits.</p>
        </div>

        {/* EXPORTS BAR */}
        <div className="mt-3 md:mt-0 flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-3 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 border border-emerald-400/20 cursor-pointer transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Print PDF
          </button>
        </div>
      </div>

      {/* FILTER BUILDER PANEL */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xs space-y-4 print:hidden backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <SlidersHorizontal className="h-4 w-4 text-white/40" />
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Configure Report Scope</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Programme */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Programme context</label>
            <select
              value={filters.programId}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  programId: e.target.value,
                  communityId: 'All',
                  projectId: 'All',
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Programmes</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.code}
                </option>
              ))}
            </select>
          </div>

          {/* Community */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Community context</label>
            <select
              value={filters.communityId}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  communityId: e.target.value,
                  projectId: 'All',
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Communities</option>
              {communitiesForSelectedProgram.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Solar Project context</label>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters((prev) => ({ ...prev, projectId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Projects</option>
              {projectsForSelectedCommunity.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Expense Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Supplier / Vendor</label>
            <select
              value={filters.vendor}
              onChange={(e) => setFilters((prev) => ({ ...prev, vendor: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="All" className="bg-slate-900 text-white">All Suppliers</option>
              {uniqueVendors.map((v) => (
                <option key={v} value={v} className="bg-slate-900 text-white">
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Calendar Scope Type</label>
            <select
              value={filters.periodType}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  periodType: e.target.value as any,
                  periodValue: '',
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            >
              <option value="None" className="bg-slate-900 text-white">Full History (No Date Bounds)</option>
              <option value="Month" className="bg-slate-900 text-white">Monthly Bound</option>
              <option value="Quarter" className="bg-slate-900 text-white">Quarterly Bound</option>
              <option value="Year" className="bg-slate-900 text-white">Annual Bound</option>
            </select>
          </div>

          {/* Period Value */}
          {filters.periodType !== 'None' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase">Specific period value *</label>
              <select
                required
                value={filters.periodValue}
                onChange={(e) => setFilters((prev) => ({ ...prev, periodValue: e.target.value }))}
                className="w-full bg-white/5 border border-indigo-500/30 rounded-xl text-xs font-bold px-3 py-2 text-indigo-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
              >
                <option value="" className="bg-slate-900 text-white">Select period...</option>
                {periodValueOptions.map((o) => (
                  <option key={o.value} value={o.value} className="bg-slate-900 text-white">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date range bounds fallback */}
          {filters.periodType === 'None' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase">Start Date (From)</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase">End Date (To)</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* AGGREGATED VARIANCE METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Allocated Budget Pool */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Allocated Budget Context</span>
            <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(summaryStats.budgetPool)}</h3>
          </div>
          <p className="text-[10px] font-mono text-white/40 mt-2">Summed based on selected scope filters</p>
        </div>

        {/* Expenses charged */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Charged Expense Costs</span>
            <h3 className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(summaryStats.totalSpent)}</h3>
          </div>
          <p className="text-[10px] font-mono text-white/40 mt-2">Approved transactions matching</p>
        </div>

        {/* Variance Remaining */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Remaining Balance</span>
            <h3 className={`text-xl font-bold mt-1 ${summaryStats.remaining < 0 ? 'text-rose-400' : 'text-white'}`}>
              {formatCurrency(summaryStats.remaining)}
            </h3>
          </div>
          <p className="text-[10px] font-mono text-white/40 mt-2">Budget Variance Balance</p>
        </div>

        {/* Spent Rate */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Aggregated Used %</span>
            <h3 className="text-xl font-bold text-white mt-1">{summaryStats.utilization.toFixed(1)}%</h3>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-1.5 rounded-full ${summaryStats.utilization >= 100 ? 'bg-rose-500' : summaryStats.utilization >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(summaryStats.utilization, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* MATCHED TRANSACTIONS TABLE LIST (PDF printable view starts here) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden print:border-none print:shadow-none backdrop-blur-md">
        {/* Printable report letterhead */}
        <div className="hidden print:block p-6 border-b border-slate-200 text-left">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-950 font-sans tracking-tight">SolarCorp Nigeria Limited</h1>
              <p className="text-xs text-slate-500 font-mono">RENEWABLE MINI-GRIDS FIELD AUDIT REPORT</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Scope: {filters.programId === 'All' ? 'Full Corporate Scope' : programs.find(p => p.id === filters.programId)?.code}</p>
            </div>
          </div>

          {/* Printable Stat Row */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 uppercase block font-bold text-[9px] font-mono">Aggregated Budget</span>
              <span className="font-bold text-sm text-slate-900">{formatCurrency(summaryStats.budgetPool)}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block font-bold text-[9px] font-mono">Approved Spends</span>
              <span className="font-bold text-sm text-emerald-700">{formatCurrency(summaryStats.totalSpent)}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block font-bold text-[9px] font-mono">Remaining Balance</span>
              <span className="font-bold text-sm text-slate-900">{formatCurrency(summaryStats.remaining)}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block font-bold text-[9px] font-mono">Utilization Ratio</span>
              <span className="font-bold text-sm text-slate-900">{summaryStats.utilization.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Header toolbar for report scope */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 print:hidden">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white/40" />
            <h4 className="text-xs font-bold text-white/85">Matching Transactions ({matchedExpenses.length})</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 font-mono text-[9px] uppercase tracking-wider text-white/40">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Hierarchy (Prog / Comm / Project)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor & Supplier</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4 text-right">Charged Cost</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-white/80">
              {matchedExpenses.length > 0 ? (
                matchedExpenses.map((exp) => {
                  const program = programs.find((p) => p.id === exp.programId);
                  const community = communities.find((c) => c.id === exp.communityId);
                  const project = projects.find((p) => p.id === exp.projectId);
                  const category = categories.find((c) => c.id === exp.categoryId);

                  return (
                    <tr key={exp.id} className="hover:bg-white/10 transition">
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-white/50 whitespace-nowrap">{exp.date}</td>

                      {/* Hierarchy path */}
                      <td className="py-3 px-4">
                        <div className="max-w-[200px]">
                          <p className="font-bold text-white truncate">{project ? project.name : 'Unknown'}</p>
                          <p className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                            {program ? program.code : 'Unknown'} → {community ? community.name : 'Unknown'}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-semibold text-white/80 whitespace-nowrap">
                          {category ? category.name : 'Unknown'}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4 font-mono font-bold text-white truncate max-w-[130px]">{exp.vendor}</td>

                      {/* Invoice */}
                      <td className="py-3 px-4 font-mono font-bold text-white/50 truncate max-w-[100px]">{exp.invoiceNumber}</td>

                      {/* Total Cost */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(exp.totalCost)}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[10px] text-white/50">
                        {exp.paymentMethod}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold tracking-wider uppercase ${exp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : exp.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {exp.status.replace(' Approval', '')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <HelpCircle className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white">No Matching Audit Entries</h4>
                    <p className="text-xs text-white/40 mt-1">Try relaxing or widening your filter categories.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
