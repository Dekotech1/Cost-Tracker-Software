import React, { useState, useMemo, useRef } from 'react';
import {
  Expense,
  Program,
  Community,
  SolarProject,
  ExpenseCategory,
  UserRole,
  PaymentMethod,
  ExpenseStatus,
  FileAttachment,
} from '../types';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Upload,
  Calendar,
  Layers,
  MapPin,
  Landmark,
  Tags,
  DollarSign,
  User,
  PlusCircle,
  Clock,
  Eye,
  Check,
  X,
  FileIcon,
} from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  programs: Program[];
  communities: Community[];
  projects: SolarProject[];
  categories: ExpenseCategory[];
  currentUserRole: UserRole;
  currentUserName: string;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'status' | 'totalCost'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onApproveExpense: (expenseId: string, approvedBy: string) => void;
  onRejectExpense: (expenseId: string) => void;
  onAddCustomCategory: (categoryName: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function Expenses({
  expenses,
  programs,
  communities,
  projects,
  categories,
  currentUserRole,
  currentUserName,
  onAddExpense,
  onUpdateExpense,
  onApproveExpense,
  onRejectExpense,
  onAddCustomCategory,
  onAddAuditLog,
}: ExpensesProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedExpenseForView, setSelectedExpenseForView] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending Approval' | 'Rejected'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Cascade dropdown state for form
  const [formProgramId, setFormProgramId] = useState('');
  const [formCommunityId, setFormCommunityId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<FileAttachment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Custom Category trigger state
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategoryName, setNewCustomCategoryName] = useState('');

  // Role Permissions Check
  const canSubmit = currentUserRole !== 'Management';
  const canApprove = currentUserRole === 'Administrator' || currentUserRole === 'Project Manager' || currentUserRole === 'Finance Officer';

  // Computed total cost
  const calculatedTotalCost = useMemo(() => {
    return quantity * unitCost;
  }, [quantity, unitCost]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Dynamic cascading filter lists
  const communitiesForSelectedProgram = useMemo(() => {
    if (!formProgramId) return [];
    return communities.filter((c) => c.programId === formProgramId);
  }, [communities, formProgramId]);

  const projectsForSelectedCommunity = useMemo(() => {
    if (!formCommunityId) return [];
    return projects.filter((p) => p.communityId === formCommunityId);
  }, [projects, formCommunityId]);

  // Handle program choice change
  const handleProgramChange = (progId: string) => {
    setFormProgramId(progId);
    // Reset lower cascading fields
    setFormCommunityId('');
    setFormProjectId('');
  };

  // Handle community choice change
  const handleCommunityChange = (commId: string) => {
    setFormCommunityId(commId);
    setFormProjectId('');
  };

  // Open creation form
  const handleCreateClick = () => {
    setFormProgramId(programs[0]?.id || '');
    setFormCommunityId('');
    setFormProjectId('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setVendor('');
    setInvoiceNumber('');
    setQuantity(1);
    setUnitCost(0);
    setPaymentMethod('Bank Transfer');
    setReferenceNumber('');
    setNotes('');
    setUploadedFile(undefined);
    setShowForm(true);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Trigger Custom Category creation
  const handleCreateCustomCategory = () => {
    if (!newCustomCategoryName.trim()) return;
    onAddCustomCategory(newCustomCategoryName.trim());
    onAddAuditLog('Created Category', `Added custom expense category: ${newCustomCategoryName}`);
    setNewCustomCategoryName('');
    setIsAddingCustomCategory(false);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      alert('Your role does not allow recording or submitting expenses.');
      return;
    }

    if (!formProgramId || !formCommunityId || !formProjectId || !categoryId || !description || !vendor || !invoiceNumber || quantity <= 0 || unitCost <= 0) {
      alert('Please fill out all mandatory fields and ensure quantities/costs are valid.');
      return;
    }

    // Check project budget constraints
    const selectedProj = projects.find((p) => p.id === formProjectId);
    if (selectedProj) {
      const currentSpent = expenses
        .filter((exp) => exp.projectId === selectedProj.id && exp.status === 'Approved')
        .reduce((sum, exp) => sum + exp.totalCost, 0);

      const postExpenseSpent = currentSpent + calculatedTotalCost;
      const budgetRemaining = selectedProj.budget - currentSpent;

      if (postExpenseSpent > selectedProj.budget) {
        if (!confirm(`⚠️ BUDGET OVERRUN WARNING:\nThis expense of ${formatCurrency(calculatedTotalCost)} will exceed the project budget limit (Remaining: ${formatCurrency(budgetRemaining)}).\n\nDo you want to submit this expense anyway as a budget variance?`)) {
          return;
        }
      } else if (postExpenseSpent >= selectedProj.budget * 0.8) {
        alert(`ℹ️ BUDGET WARNING: This expense brings the project's budget utilization to ${(postExpenseSpent / selectedProj.budget * 100).toFixed(0)}% (exceeding the 80% caution threshold).`);
      }
    }

    onAddExpense({
      date,
      programId: formProgramId,
      communityId: formCommunityId,
      projectId: formProjectId,
      categoryId,
      description,
      vendor,
      invoiceNumber,
      quantity,
      unitCost,
      paymentMethod,
      referenceNumber,
      receiptFile: uploadedFile,
      notes,
      createdBy: currentUserName,
    });

    onAddAuditLog('Recorded Expense', `Recorded expense of ₦${(quantity * unitCost).toLocaleString()} for ${description} under ${selectedProj?.name}`);
    setShowForm(false);
  };

  // Filtered expense entries
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Search filter (vendor, description, reference/invoice number)
      const matchesSearch =
        searchQuery === '' ||
        exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status filter
      const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;

      // 3. Category filter
      const matchesCategory = categoryFilter === 'All' || exp.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Expense Recording & Approvals</h2>
          <p className="text-sm text-white/50">Record material purchases, local labour, transport, and equipment invoices.</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          {canSubmit ? (
            <button
              onClick={handleCreateClick}
              id="btn-add-expense"
              className="flex items-center gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition duration-155 cursor-pointer border border-emerald-400/20"
            >
              <Plus className="h-4 w-4" />
              Record Expense
            </button>
          ) : (
            <div className="text-xs font-semibold bg-white/5 border border-white/10 text-white/40 rounded-xl px-3 py-2">
              Management Account (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* SEARCH, CATEGORY FILTER, & STATUS BADGES TOOLBAR */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-xs space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search expenses by vendor, invoice, details, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-56 flex items-center gap-2">
            <Tags className="h-4 w-4 text-white/40 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
        </div>

        {/* Status quick filters */}
        <div className="flex overflow-x-auto gap-2 py-1 border-t border-white/5 pt-3">
          {(['All', 'Pending Approval', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400/20 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              {st} ({st === 'All' ? expenses.length : expenses.filter((e) => e.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* EXPENSE ENTRIES TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 font-mono text-[9px] uppercase tracking-wider text-white/40">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Project / Scope</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor & Ref</th>
                <th className="py-3 px-4 text-right">Qty × Unit</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-white/80">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => {
                  const program = programs.find((p) => p.id === exp.programId);
                  const community = communities.find((c) => c.id === exp.communityId);
                  const project = projects.find((p) => p.id === exp.projectId);
                  const category = categories.find((c) => c.id === exp.categoryId);

                  return (
                    <tr key={exp.id} className="hover:bg-white/10 transition">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-white/50 whitespace-nowrap">
                        {exp.date}
                      </td>

                      {/* Project / Scope Hierarchy */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="max-w-[180px]">
                          <p className="font-bold text-white truncate leading-snug" title={project ? project.name : 'Unknown'}>
                            {project ? project.name : 'Unknown'}
                          </p>
                          <p className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                            {program ? program.code : ''} / {community ? community.name : ''}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-semibold text-white/80 whitespace-nowrap">
                          {category ? category.name : 'Unknown'}
                        </span>
                      </td>

                      {/* Vendor & Invoice */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="max-w-[150px]">
                          <p className="font-mono text-white font-bold truncate leading-none">{exp.vendor}</p>
                          <p className="text-[10px] font-mono text-white/40 mt-1 truncate">
                            Inv: {exp.invoiceNumber}
                          </p>
                        </div>
                      </td>

                      {/* Qty & Unit */}
                      <td className="py-3.5 px-4 text-right font-mono text-white/50 whitespace-nowrap">
                        {exp.quantity} × {formatCurrency(exp.unitCost)}
                      </td>

                      {/* Total Cost */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(exp.totalCost)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider uppercase ${
                            exp.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : exp.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Details Button */}
                          <button
                            onClick={() => setSelectedExpenseForView(exp)}
                            className="p-1 border border-white/10 hover:bg-white/10 rounded text-white/80 cursor-pointer transition"
                            title="View Receipt & Logs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Approval Actions (Admin/PM only on pending logs) */}
                          {canApprove && exp.status === 'Pending Approval' && (
                            <>
                              <button
                                onClick={() => {
                                  onApproveExpense(exp.id, currentUserName);
                                  onAddAuditLog('Approved Expense', `Approved expense of ₦${exp.totalCost.toLocaleString()} (Vendor: ${exp.vendor})`);
                                }}
                                className="p-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 rounded cursor-pointer transition"
                                title="Approve Transaction"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to REJECT this expense?')) {
                                    onRejectExpense(exp.id);
                                    onAddAuditLog('Rejected Expense', `Rejected expense of ₦${exp.totalCost.toLocaleString()} (Vendor: ${exp.vendor})`);
                                  }
                                }}
                                className="p-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 rounded cursor-pointer transition"
                                title="Reject Transaction"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-white">No Expenses Recorded</h4>
                    <p className="text-xs text-white/40 mt-1">Submit your first expense claim using the button above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER / POPUP MODAL */}
      {selectedExpenseForView && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-sans font-bold text-base text-white font-sans">Expense Record Details</h3>
                <p className="text-[10px] font-mono text-indigo-400 uppercase mt-0.5">Transaction reference: {selectedExpenseForView.id}</p>
              </div>
              <button
                onClick={() => setSelectedExpenseForView(null)}
                className="text-white/40 hover:text-white rounded-full p-1.5 hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Structured details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                {/* Cascade Scope */}
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">Target Scope Allocation</p>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="font-bold text-white/80">Prog:</span>
                      <span className="truncate text-white/90">{programs.find(p => p.id === selectedExpenseForView.programId)?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="font-bold text-white/80">Comm:</span>
                      <span className="truncate text-white/90">{communities.find(c => c.id === selectedExpenseForView.communityId)?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="font-bold text-white/80">Project:</span>
                      <span className="font-semibold text-indigo-400 truncate">{projects.find(p => p.id === selectedExpenseForView.projectId)?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Expense details */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 font-bold uppercase block">Description / Particulars</span>
                    <p className="font-semibold text-white text-sm leading-snug">{selectedExpenseForView.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 font-bold uppercase block">Vendor</span>
                      <p className="font-bold text-white">{selectedExpenseForView.vendor}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/40 font-bold uppercase block">Invoice #</span>
                      <p className="font-mono text-white font-bold">{selectedExpenseForView.invoiceNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/40 font-bold uppercase block">Method</span>
                      <p className="font-semibold text-white/95">{selectedExpenseForView.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/40 font-bold uppercase block">Ref Code</span>
                      <p className="font-mono font-bold text-white/90 truncate">{selectedExpenseForView.referenceNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Numbers & Receipt file upload */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-white/40">Total Charged Cost</span>
                  <h3 className="text-2xl font-bold font-sans text-white">{formatCurrency(selectedExpenseForView.totalCost)}</h3>
                  <div className="flex justify-between text-[11px] font-mono text-white/60 border-t border-white/5 pt-2">
                    <span>Qty: {selectedExpenseForView.quantity} units</span>
                    <span>Rate: {formatCurrency(selectedExpenseForView.unitCost)}</span>
                  </div>
                </div>

                {/* Status and Audits */}
                <div className="text-xs space-y-1.5 bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="text-white/40 font-mono text-[9px] font-bold uppercase">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedExpenseForView.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : selectedExpenseForView.status === 'Rejected' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                      {selectedExpenseForView.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/40">Recorded By</span>
                    <span className="font-semibold text-white">{selectedExpenseForView.createdBy}</span>
                  </div>
                  {selectedExpenseForView.approvedBy && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/40">Approved By</span>
                      <span className="font-semibold text-white">{selectedExpenseForView.approvedBy}</span>
                    </div>
                  )}
                  {selectedExpenseForView.notes && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[9px] font-mono text-white/40 font-bold uppercase block">Audit Notes</span>
                      <p className="italic text-white/70 leading-relaxed mt-0.5">{selectedExpenseForView.notes}</p>
                    </div>
                  )}
                </div>

                {/* Simulated Receipt Preview */}
                <div>
                  <span className="text-[10px] font-mono text-white/40 font-bold uppercase block mb-1">Uploaded Receipt / Invoice Asset</span>
                  {selectedExpenseForView.receiptFile ? (
                    <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/25 p-2.5 rounded-xl text-left">
                      <div className="p-2 bg-indigo-500 text-white rounded-lg">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white/95 truncate">{selectedExpenseForView.receiptFile.name}</p>
                        <p className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
                          {(selectedExpenseForView.receiptFile.size / 1024).toFixed(1)} KB • {selectedExpenseForView.receiptFile.type}
                        </p>
                      </div>
                      {selectedExpenseForView.receiptFile.dataUrl && (
                        <a
                          href={selectedExpenseForView.receiptFile.dataUrl}
                          download={selectedExpenseForView.receiptFile.name}
                          className="text-[10px] font-bold font-mono text-indigo-400 hover:underline shrink-0 px-2.5 py-1 bg-white/10 border border-indigo-500/20 rounded transition"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-white/40 italic bg-white/5 border border-dashed border-white/10 p-3 rounded-lg text-center">
                      No receipt attachment uploaded.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedExpenseForView(null)}
                className="px-4 py-2 border border-white/10 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/5 transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD/SUBMIT EXPENSE MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-sans font-bold text-lg text-white font-sans">Record Project Expense</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/40 hover:text-white rounded-full p-1.5 hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Cascade selectors */}
              <div className="bg-white/5 p-4 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 mb-1">
                  <Layers className="h-4 w-4 text-white/50" />
                  <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Project Hierarchy Cascade</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Select Programme */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Programme *</label>
                    <select
                      required
                      value={formProgramId}
                      onChange={(e) => handleProgramChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                    >
                      <option value="" disabled className="bg-slate-900 text-white">Select program...</option>
                      {programs.filter(p => p.status !== 'Archived').map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.code} - {p.name.substring(0, 15)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Community */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Community *</label>
                    <select
                      required
                      value={formCommunityId}
                      onChange={(e) => handleCommunityChange(e.target.value)}
                      disabled={!formProgramId}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent disabled:bg-white/5 disabled:opacity-30"
                    >
                      <option value="" className="bg-slate-900 text-white">Select community...</option>
                      {communitiesForSelectedProgram.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} ({c.state})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Solar Project */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Solar Project *</label>
                    <select
                      required
                      value={formProjectId}
                      onChange={(e) => setFormProjectId(e.target.value)}
                      disabled={!formCommunityId}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent disabled:bg-white/5 disabled:opacity-30"
                    >
                      <option value="" className="bg-slate-900 text-white">Select solar asset...</option>
                      {projectsForSelectedCommunity.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Expense Category Choice & Inline creation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-white/50">Expense Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                      className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <PlusCircle className="h-3 w-3" /> Custom
                    </button>
                  </div>

                  {isAddingCustomCategory ? (
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="New category..."
                        value={newCustomCategoryName}
                        onChange={(e) => setNewCustomCategoryName(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white/5 border border-indigo-500/30 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCustomCategory}
                        className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomCategory(false)}
                        className="bg-white/10 text-white/60 p-1 rounded hover:bg-white/20 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Expense Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Particulars Description */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Description / Particulars *</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Purchase of 20 units of 550W Jinko solar panels"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Supplier & Invoice */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Vendor / Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Solis Power West Africa"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-901"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono text-xs"
                  />
                </div>

                {/* Numbers calculation block */}
                <div className="bg-white/5 p-3 rounded-xl col-span-2 grid grid-cols-3 gap-3 border border-white/10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Quantity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-right font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Unit Cost (₦) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={unitCost || ''}
                      onChange={(e) => setUnitCost(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-right font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase block">Total Cost</span>
                    <p className="text-sm font-bold font-mono text-white mt-2 text-right">
                      {formatCurrency(calculatedTotalCost)}
                    </p>
                  </div>
                </div>

                {/* Payment terms */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Payment Method *</label>
                  <select
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="Bank Transfer" className="bg-slate-900 text-white">Bank Transfer</option>
                    <option value="Cash" className="bg-slate-900 text-white">Cash</option>
                    <option value="Cheque" className="bg-slate-900 text-white">Cheque</option>
                    <option value="Mobile Money" className="bg-slate-900 text-white">Mobile Money</option>
                    <option value="Card" className="bg-slate-900 text-white">Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50">Reference / Transaction Number</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. TXN-8830129"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono text-xs"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Audit Notes / Explanatory Comments</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Justify custom costs, transport delays, emergency maintenance needs here..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Receipt Upload Box */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50">Receipt / Invoice File Upload *</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : uploadedFile
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    />

                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg">
                          <Check className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-white/95 max-w-[250px] truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] font-mono text-white/40 mt-0.5">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Click or Drag to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="h-6 w-6 text-white/40 mx-auto" />
                        <p className="text-xs font-semibold text-white/90">Drag & Drop receipt or Click to Browse</p>
                        <p className="text-[10px] text-white/40 font-mono">Supports PDF, PNG, JPG, Images (Max 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-white/10 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
                >
                  Submit Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
