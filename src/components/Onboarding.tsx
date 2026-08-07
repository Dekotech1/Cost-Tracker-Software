import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  UserCheck, 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sun, 
  Sparkles, 
  BookOpen, 
  Lock, 
  Eye, 
  CheckCircle2, 
  HelpCircle,
  PiggyBank,
  FileText,
  History,
  Landmark,
  Users2,
  LayoutDashboard,
  X
} from 'lucide-react';

interface OnboardingProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onAddUser: (user: User) => void;
  users: User[];
  setActiveTab: (tab: string) => void;
  onComplete: () => void;
  onboardingCompleted: boolean;
}

export default function Onboarding({
  currentUser,
  onUserChange,
  onAddUser,
  users,
  setActiveTab,
  onComplete,
  onboardingCompleted,
}: OnboardingProps) {
  const [step, setStep] = useState<number>(1); // 1: Register, 2: Permissions explanation, 3: Tutorial intro, 4: Guided Tour
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Field Engineer');
  const [tourStep, setTourStep] = useState<number>(0);

  // Tour steps details
  const tourSteps = [
    {
      tab: 'dashboard',
      title: 'Financial Dashboard',
      description: 'The executive command centre. View budget allocations, real-time spending metrics, and project status charts in one glance.',
      highlight: 'Understand the big picture of cost tracking and budget utilization.',
      icon: LayoutDashboard,
    },
    {
      tab: 'programmes',
      title: 'Macro Programmes',
      description: 'Funding portfolios funded by global donors (e.g., World Bank). Administrators can register and archive entire regional programs here.',
      highlight: 'Enforced RBAC: Only Administrators can edit or create programmes.',
      icon: Landmark,
    },
    {
      tab: 'communities',
      title: 'Community Profiling',
      description: 'Manage beneficiary communities receiving solar assets. Includes demographic logs, state/LGA references, and physical GPS coordinates.',
      highlight: 'Enforced RBAC: Administrators and Project Managers can create or edit community context.',
      icon: Users2,
    },
    {
      tab: 'projects',
      title: 'Solar Projects Grid',
      description: 'Individual hardware deployments (Mini Grids, Water Pumps, Boreholes) linked to communities. Track specific engineering leads and project progress.',
      highlight: 'Enforced RBAC: Managed by Administrators and Project Managers.',
      icon: Sun,
    },
    {
      tab: 'expenses',
      title: 'Expense Recording Ledger',
      description: 'Where financial transparency is enforced. Upload invoice PDF receipts, record transaction tags, and monitor the automated three-way approval status.',
      highlight: 'Enforced RBAC: Field Engineers & Finance Officers can submit expenses; Project Managers approve/reject.',
      icon: PiggyBank,
    },
    {
      tab: 'reports',
      title: 'Reports & Auditing Engine',
      description: 'Extract multi-criteria filtered spreadsheets, calculate budget aggregates, and export CSV/Excel sheets or print physical audit-ready PDFs.',
      highlight: 'Open to all roles for seamless donor reporting and verification.',
      icon: FileText,
    },
    {
      tab: 'audit',
      title: 'Unalterable Audit Trail',
      description: 'A cryptographic-grade ledger tracking all edits, approvals, and credential logs. Fully transparent and un-deletable.',
      highlight: 'Enforced RBAC: Only Administrators can clear the logs history cache.',
      icon: History,
    }
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please enter your full name and corporate email address.');
      return;
    }

    if (!email.includes('@')) {
      alert('Please enter a valid corporate email address.');
      return;
    }

    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    const registeredUser: User = existing || {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: selectedRole
    };

    if (!existing) {
      onAddUser(registeredUser);
    }
    
    onUserChange(registeredUser);
    setStep(2); // Proceed to Permissions explanation
  };

  const handleStartTour = () => {
    setStep(4);
    setTourStep(0);
    setActiveTab(tourSteps[0].tab);
  };

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      setActiveTab(tourSteps[nextStep].tab);
    } else {
      // Completed tour!
      onComplete();
    }
  };

  const handleTourPrev = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      setActiveTab(tourSteps[prevStep].tab);
    }
  };

  // Roles specifications
  const rolesInfo = [
    {
      role: 'Administrator' as UserRole,
      title: 'System Administrator',
      desc: 'Full control over programs, projects, budgets, user directory, and unalterable logs.',
      permissions: ['Manage macro funding programmes', 'Create/edit communities & projects', 'Record & auto-approve field expenses', 'Clear historical audit log caches'],
      color: 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400',
    },
    {
      role: 'Project Manager' as UserRole,
      title: 'Project Manager',
      desc: 'Controls regional engineering assets and coordinates operational cost approval pipelines.',
      permissions: ['Create & update beneficiary communities', 'Configure solar projects & assign lead engineers', 'Verify, approve, or reject field expense claims', 'View logs & audit trail summaries'],
      color: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400',
    },
    {
      role: 'Finance Officer' as UserRole,
      title: 'Finance Officer',
      desc: 'Unrestricted Financial controller. Full access and administration over all programmes, budgets, assets, and audit databases.',
      permissions: ['Manage macro funding programmes', 'Create/edit communities & projects', 'Full ledger control & expense approvals', 'View and clear unalterable audit trails'],
      color: 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400',
    },
    {
      role: 'Field Engineer' as UserRole,
      title: 'Field Engineer',
      desc: 'Coordinates hardware installation on-site and registers daily logistics costs directly.',
      permissions: ['Submit on-site material purchases & transport fees', 'Upload real-time receipt attachments', 'Browse community context & project engineering timelines', 'Read-only financial overview'],
      color: 'border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400',
    }
  ];

  const currentRoleInfo = rolesInfo.find(r => r.role === currentUser.role) || rolesInfo[3];

  return (
    <div className="relative z-50">
      {/* 1. Register Form Mode */}
      {step === 1 && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in my-8">
            <div className="flex items-center gap-3 justify-center border-b border-white/5 pb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-emerald-500 text-slate-900 p-2 rounded-xl">
                <Sun className="h-6 w-6 animate-spin-slow" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold font-sans text-white tracking-tight">Onboarding & Registration</h2>
                <p className="text-xs font-mono text-white/40">SolarCorp Cost Recording & Audit Verification System</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Registration Left Side */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  Your Profile Credentials
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Patricia Collins"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase">Corporate Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@solarcorp.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent font-medium"
                  />
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    Security Notice
                  </h4>
                  <p className="text-[10px] leading-relaxed text-white/50">
                    Your assigned role grants specific capabilities and is logged in the system’s unalterable audit trails. Please choose the role corresponding to your field assignment.
                  </p>
                </div>
              </div>

              {/* Role Selection Right Side */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Select System Role
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rolesInfo.map((r) => {
                    const isSelected = selectedRole === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedRole(r.role)}
                        className={`text-left p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between h-36 ${
                          isSelected 
                            ? 'border-emerald-400 bg-emerald-500/10 text-white' 
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{r.title}</span>
                            {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed truncate-3-lines">{r.desc}</p>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400/80 font-bold mt-2">
                          View authorizations →
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition duration-150 cursor-pointer"
                >
                  Continue to Role Details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Permissions Detail Explanation */}
      {step === 2 && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold font-sans text-white">Your Authorized Privileges</h2>
              <p className="text-xs font-mono text-white/40">Role Access Control Level (ACL): {currentUser.role}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Role Capability Manifest
              </h3>
              <ul className="space-y-2.5">
                {currentRoleInfo.permissions.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/80 leading-tight">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                <Lock className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-rose-400 uppercase">Restricted Actions</h4>
                  <p className="text-[10px] text-white/40">
                    {currentUser.role === 'Administrator' || currentUser.role === 'Finance Officer'
                      ? 'No restrictions. You are registered as an unrestricted system controller with full administrative access.' 
                      : currentUser.role === 'Project Manager'
                      ? 'You cannot modify Program budgets or clear the unalterable audit trails.'
                      : 'You are restricted from launching programs/projects, approving expenses, or modifying system logs.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs py-2 px-3 rounded-xl border border-white/10 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  Confirm & Go to System Tour
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tutorial Intro Mode */}
      {step === 3 && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-yellow-400 to-emerald-500 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Sun className="h-8 w-8 animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Welcome aboard, {currentUser.name}!</h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                Your credentials are successfully active. Let's take a quick 1-minute interactive tour to understand the console's navigation and cost-tracking layout.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold text-white">Interactive walk</h4>
                <p className="text-[10px] text-white/40 mt-1">We will automatically flip through tabs to show you active views.</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold text-white">Full integration</h4>
                <p className="text-[10px] text-white/40 mt-1">Check logs, approve budgets, and export files easily.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onComplete}
                className="w-1/3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/85 font-bold text-xs py-2 px-3 rounded-xl border border-white/5 transition cursor-pointer"
              >
                Skip Tour
              </button>
              <button
                onClick={handleStartTour}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Start Interactive Tour
                <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Interactive Floating Guided Tour Step */}
      {step === 4 && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
          <div className="bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 rounded-3xl p-5 space-y-4 border-l-4 border-l-emerald-400 animate-slide-up backdrop-blur-md relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                  {React.createElement(tourSteps[tourStep].icon, { className: "h-5 w-5" })}
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Console Guide • Step {tourStep + 1} of {tourSteps.length}</h4>
                  <h3 className="text-sm font-bold text-white font-sans">{tourSteps[tourStep].title}</h3>
                </div>
              </div>
              <button 
                onClick={onComplete} 
                className="text-white/40 hover:text-white transition cursor-pointer p-1"
                title="Cancel tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-left">
              <p className="text-xs text-white/80 leading-relaxed">
                {tourSteps[tourStep].description}
              </p>
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-2.5 flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-300 font-medium leading-normal">
                  {tourSteps[tourStep].highlight}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {tourSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-150 ${i === tourStep ? 'w-3.5 bg-emerald-400' : 'w-1.5 bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={handleTourPrev}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Prev
                  </button>
                )}
                <button
                  onClick={handleTourNext}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                >
                  {tourStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
