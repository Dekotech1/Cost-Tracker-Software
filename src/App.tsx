import React, { useState, useEffect, useMemo } from 'react';
import {
  Program,
  Community,
  SolarProject,
  Expense,
  ExpenseCategory,
  AuditLog,
  User,
  UserRole,
  StoreItem,
} from './types';
import {
  INITIAL_PROGRAMS,
  INITIAL_COMMUNITIES,
  INITIAL_PROJECTS,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STORE_ITEMS,
  USERS,
  DEFAULT_CATEGORIES,
  getStoredData,
  setStoredData,
  initializeStorageIfNeeded,
} from './data/mockData';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Programmes from './components/Programmes';
import Communities from './components/Communities';
import Projects from './components/Projects';
import Store from './components/Store';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import AuditTrail from './components/AuditTrail';
import Onboarding from './components/Onboarding';

export default function App() {
  // Ensure storage is initialized with mock values
  useEffect(() => {
    initializeStorageIfNeeded();
  }, []);

  // Initialize state directly from local storage with fallbacks
  const [programs, setPrograms] = useState<Program[]>(() => {
    initializeStorageIfNeeded();
    return getStoredData<Program[]>('programs', INITIAL_PROGRAMS);
  });

  const [communities, setCommunities] = useState<Community[]>(() => {
    return getStoredData<Community[]>('communities', INITIAL_COMMUNITIES);
  });

  const [projects, setProjects] = useState<SolarProject[]>(() => {
    return getStoredData<SolarProject[]>('projects', INITIAL_PROJECTS);
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    return getStoredData<ExpenseCategory[]>('categories', DEFAULT_CATEGORIES);
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    return getStoredData<Expense[]>('expenses', INITIAL_EXPENSES);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return getStoredData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  });

  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    return getStoredData<StoreItem[]>('store_items', INITIAL_STORE_ITEMS);
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return getStoredData<User>('current_user', USERS[0]); // Default to Administrator
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    return getStoredData<User[]>('users_list', USERS);
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return getStoredData<boolean>('onboarding_completed', false);
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Keep Local Storage in sync when state updates
  useEffect(() => {
    setStoredData('programs', programs);
  }, [programs]);

  useEffect(() => {
    setStoredData('communities', communities);
  }, [communities]);

  useEffect(() => {
    setStoredData('projects', projects);
  }, [projects]);

  useEffect(() => {
    setStoredData('categories', categories);
  }, [categories]);

  useEffect(() => {
    setStoredData('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    setStoredData('audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    setStoredData('store_items', storeItems);
  }, [storeItems]);

  useEffect(() => {
    setStoredData('current_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStoredData('users_list', usersList);
  }, [usersList]);

  useEffect(() => {
    setStoredData('onboarding_completed', onboardingCompleted);
  }, [onboardingCompleted]);

  // 1. Audit Log Helper
  const handleAddAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      userId: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleClearAuditLogs = () => {
    const defaultLog: AuditLog = {
      id: 'audit-reset',
      action: 'Cleared Trail',
      userId: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      details: 'Administrator cleared system audit logs history cache.',
    };
    setAuditLogs([defaultLog]);
  };

  // 2. Program Handlers
  const handleAddProgram = (newProg: Omit<Program, 'id'>) => {
    const program: Program = {
      ...newProg,
      id: `prog-${Date.now()}`,
    };
    setPrograms((prev) => [...prev, program]);
  };

  const handleUpdateProgram = (updatedProg: Program) => {
    setPrograms((prev) => prev.map((p) => (p.id === updatedProg.id ? updatedProg : p)));
  };

  const handleArchiveProgram = (programId: string) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, status: 'Archived' } : p))
    );
  };

  const handleUnarchiveProgram = (programId: string) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, status: 'Active' } : p))
    );
  };

  // 3. Community Handlers
  const handleAddCommunity = (newComm: Omit<Community, 'id'>) => {
    const community: Community = {
      ...newComm,
      id: `comm-${Date.now()}`,
    };
    setCommunities((prev) => [...prev, community]);
  };

  const handleUpdateCommunity = (updatedComm: Community) => {
    setCommunities((prev) => prev.map((c) => (c.id === updatedComm.id ? updatedComm : c)));
  };

  const handleDeleteCommunity = (communityId: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
  };

  // 4. Solar Project Handlers
  const handleAddProject = (newProj: Omit<SolarProject, 'id'>) => {
    const project: SolarProject = {
      ...newProj,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [...prev, project]);
  };

  const handleUpdateProject = (updatedProj: SolarProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  // 5. Expense Handlers
  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'createdAt' | 'status' | 'totalCost'>) => {
    // Automatically approve if submitted by Administrator, Project Manager, or Finance Officer, otherwise Pending
    const shouldAutoApprove = currentUser.role === 'Administrator' || currentUser.role === 'Project Manager' || currentUser.role === 'Finance Officer';

    const expense: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalCost: newExp.quantity * newExp.unitCost,
      status: shouldAutoApprove ? 'Approved' : 'Pending Approval',
      approvedBy: shouldAutoApprove ? currentUser.name : undefined,
    };
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleUpdateExpense = (updatedExp: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
  };

  const handleApproveExpense = (expenseId: string, approvedBy: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId ? { ...e, status: 'Approved', approvedBy } : e
      )
    );
  };

  const handleRejectExpense = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, status: 'Rejected' } : e))
    );
  };

  // 6. Custom Category Handler
  const handleAddCustomCategory = (name: string) => {
    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert('This category already exists.');
      return;
    }
    const newCat: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // 7. Store / Inventory Handlers
  const handleAddStoreItem = (newItem: Omit<StoreItem, 'id' | 'lastRestockedDate'>) => {
    const item: StoreItem = {
      ...newItem,
      id: `store-${Date.now()}`,
      lastRestockedDate: new Date().toISOString().split('T')[0],
    };
    setStoreItems((prev) => [...prev, item]);
    handleAddAuditLog(
      'Created Store Item',
      `Created new hardware store item "${item.name}" under category "${categories.find(c => c.id === item.categoryId)?.name || 'Unknown'}"`
    );
  };

  const handleRestockStoreItem = (itemId: string, restockQty: number, createExpense: boolean, programId?: string, communityId?: string, projectId?: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: i.quantity + restockQty,
              lastRestockedDate: new Date().toISOString().split('T')[0]
            }
          : i
      )
    );

    handleAddAuditLog(
      'Restocked Store Item',
      `Restocked "${item.name}" with +${restockQty} units (New stock: ${item.quantity + restockQty} units)`
    );

    // Optionally create an expense for buying this new stock
    if (createExpense && programId && communityId && projectId) {
      const shouldAutoApprove = currentUser.role === 'Administrator' || currentUser.role === 'Project Manager' || currentUser.role === 'Finance Officer';
      const purchaseExpense: Expense = {
        id: `exp-restock-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        programId,
        communityId,
        projectId,
        categoryId: item.categoryId,
        description: `Restock Purchase: ${restockQty} x ${item.name}`.trim(),
        vendor: `${item.manufacturer} Supplier`,
        invoiceNumber: `REST-${Date.now().toString().slice(-6)}`,
        quantity: restockQty,
        unitCost: item.unitCost,
        totalCost: restockQty * item.unitCost,
        paymentMethod: 'Bank Transfer',
        referenceNumber: `REST-REF-${Date.now().toString().slice(-6)}`,
        status: shouldAutoApprove ? 'Approved' : 'Pending Approval',
        approvedBy: shouldAutoApprove ? currentUser.name : undefined,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        notes: `Restock procurement charge added to project ledger.`,
      };
      setExpenses((prev) => [purchaseExpense, ...prev]);
    }
  };

  const handleDispatchStoreItem = (
    itemId: string,
    programId: string,
    communityId: string,
    projectId: string,
    quantity: number,
    dispatchedBy: string,
    notes?: string
  ) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    if (item.quantity < quantity) {
      alert("Error: Insufficient stock in store.");
      return;
    }

    // Deduct stock
    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity: i.quantity - quantity }
          : i
      )
    );

    // Create an automated expense for this project
    const shouldAutoApprove = currentUser.role === 'Administrator' || currentUser.role === 'Project Manager' || currentUser.role === 'Finance Officer';
    const newExpense: Expense = {
      id: `exp-dispatch-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      programId,
      communityId,
      projectId,
      categoryId: item.categoryId,
      description: `Store Dispatch: ${quantity} x ${item.name}. ${notes || ''}`.trim(),
      vendor: `Central Store [Mfr: ${item.manufacturer}]`,
      invoiceNumber: `DISP-${Date.now().toString().slice(-6)}`,
      quantity,
      unitCost: item.unitCost,
      totalCost: quantity * item.unitCost,
      paymentMethod: 'Bank Transfer', // Default internal charge
      referenceNumber: `STORE-REF-${Date.now().toString().slice(-6)}`,
      status: shouldAutoApprove ? 'Approved' : 'Pending Approval',
      approvedBy: shouldAutoApprove ? currentUser.name : undefined,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      notes: `Materials drawn from central warehouse stock. Dispatched by ${dispatchedBy}.`,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Add Audit Log
    handleAddAuditLog(
      'Store Dispatch',
      `Dispatched ${quantity} units of "${item.name}" from central store to Project ID: ${projectId}. (Value: ₦${(quantity * item.unitCost).toLocaleString()})`
    );
  };

  // Render proper view based on active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            programs={programs}
            communities={communities}
            projects={projects}
            expenses={expenses}
            categories={categories}
          />
        );
      case 'programmes':
        return (
          <Programmes
            programs={programs}
            expenses={expenses}
            currentUserRole={currentUser.role}
            onAddProgram={handleAddProgram}
            onUpdateProgram={handleUpdateProgram}
            onArchiveProgram={handleArchiveProgram}
            onUnarchiveProgram={handleUnarchiveProgram}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case 'communities':
        return (
          <Communities
            communities={communities}
            programs={programs}
            projects={projects}
            expenses={expenses}
            currentUserRole={currentUser.role}
            onAddCommunity={handleAddCommunity}
            onUpdateCommunity={handleUpdateCommunity}
            onDeleteCommunity={handleDeleteCommunity}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case 'projects':
        return (
          <Projects
            projects={projects}
            communities={communities}
            programs={programs}
            expenses={expenses}
            currentUserRole={currentUser.role}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case 'store':
        return (
          <Store
            storeItems={storeItems}
            categories={categories}
            projects={projects}
            programs={programs}
            communities={communities}
            currentUserRole={currentUser.role}
            currentUserName={currentUser.name}
            onAddStoreItem={handleAddStoreItem}
            onRestockStoreItem={handleRestockStoreItem}
            onDispatchStoreItem={handleDispatchStoreItem}
          />
        );
      case 'expenses':
        return (
          <Expenses
            expenses={expenses}
            programs={programs}
            communities={communities}
            projects={projects}
            categories={categories}
            currentUserRole={currentUser.role}
            currentUserName={currentUser.name}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onAddCustomCategory={handleAddCustomCategory}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case 'reports':
        return (
          <Reports
            expenses={expenses}
            programs={programs}
            communities={communities}
            projects={projects}
            categories={categories}
          />
        );
      case 'audit':
        return (
          <AuditTrail
            auditLogs={auditLogs}
            onClearLogs={(currentUser.role === 'Administrator' || currentUser.role === 'Finance Officer') ? handleClearAuditLogs : undefined}
          />
        );
      default:
        return <div className="text-center py-12">Tab not implemented.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden z-10 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/15 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/8 blur-[100px] rounded-full"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          users={usersList}
          onRestartOnboarding={() => {
            setOnboardingCompleted(false);
          }}
        />
      </div>

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {renderActiveView()}
      </main>

      {/* User Onboarding Flow overlay/widget */}
      {!onboardingCompleted && (
        <Onboarding
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          onAddUser={(newUser) => setUsersList((prev) => [...prev, newUser])}
          users={usersList}
          setActiveTab={setActiveTab}
          onComplete={() => setOnboardingCompleted(true)}
          onboardingCompleted={onboardingCompleted}
        />
      )}

      {/* Footer credit lines (humble, compliant) */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/5 py-4 print:hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-white/30">
          SolarCorp Internal Field Operations & Budget Verification Console © 2026
        </div>
      </footer>
    </div>
  );
}
