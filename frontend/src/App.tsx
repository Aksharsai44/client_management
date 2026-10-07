import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BrochurePage } from './components/brochure/BrochurePage';
import { LoginPage } from './components/auth/LoginPage';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { ProductAdminView } from './components/product-admin/ProductAdminView';
import { CompanyAdminView } from './components/company-admin/CompanyAdminView';
import { ClientView } from './components/client/ClientView';
import { WorkUserView } from './components/work-user/WorkUserView';
import {
  FileText,
  KeyRound,
  ShieldCheck,
  Building,
  UserCheck,
  Briefcase,
  RotateCcw,
} from 'lucide-react';

const GlobalRoleSwitcherBar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, quickSwitchRole } = useApp();

  const handleResetData = () => {
    if (confirm('Reset platform data to default sample state?')) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  const isRoleActive = (role: string) => {
    return currentView === 'app' && currentUser?.role === role;
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-[11px] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-50 sticky top-0 shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="font-black tracking-wider uppercase text-blue-400 text-[10px] bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/60">
          Module Navigator
        </span>
        <span className="text-slate-400 hidden sm:inline text-[11px]">
          Quick jump to any platform view:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Brochure View */}
        <button
          onClick={() => setCurrentView('brochure')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            currentView === 'brochure'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Public Landing Page with WhatsApp Demo Form"
        >
          <FileText className="w-3 h-3" />
          <span>Brochure & Pricing</span>
        </button>

        {/* Login Page */}
        <button
          onClick={() => setCurrentView('login')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            currentView === 'login'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Universal Login Screen"
        >
          <KeyRound className="w-3 h-3" />
          <span>Login Page</span>
        </button>

        <span className="text-slate-700 mx-0.5 hidden md:inline">|</span>

        {/* Product Admin */}
        <button
          onClick={() => quickSwitchRole('product_super_admin')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            isRoleActive('product_super_admin') || isRoleActive('product_admin')
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-purple-900/60 hover:text-purple-200'
          }`}
          title="Demo requests, temporary dummy keys, pricing & company metrics"
        >
          <ShieldCheck className="w-3 h-3 text-purple-400" />
          <span>Product Admin</span>
        </button>

        {/* Company Admin */}
        <button
          onClick={() => quickSwitchRole('company_admin')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            isRoleActive('company_admin')
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-blue-900/60 hover:text-blue-200'
          }`}
          title="Batches, client onboarding, scheduling, attendance & transcripts"
        >
          <Building className="w-3 h-3 text-blue-400" />
          <span>Company Admin</span>
        </button>

        {/* Client Portal */}
        <button
          onClick={() => quickSwitchRole('client')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            isRoleActive('client')
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/60 hover:text-emerald-200'
          }`}
          title="Client batch group, meetings, AI transcripts & 5-star reviews"
        >
          <UserCheck className="w-3 h-3 text-emerald-400" />
          <span>Client Portal</span>
        </button>

        {/* Work User */}
        <button
          onClick={() => quickSwitchRole('work_user')}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-colors ${
            isRoleActive('work_user')
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-amber-900/60 hover:text-amber-200'
          }`}
          title="Assigned squads, chat, resources, meeting attendance"
        >
          <Briefcase className="w-3 h-3 text-amber-400" />
          <span>Work User</span>
        </button>

        {/* Reset Storage */}
        <button
          onClick={handleResetData}
          className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-700 transition-colors ml-1"
          title="Reset Local Storage Sample Data"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { currentView, currentUser, activeTab } = useApp();

  const renderRoleModule = () => {
    if (!currentUser) return <CompanyAdminView />;

    switch (currentUser.role) {
      case 'product_super_admin':
      case 'product_admin':
        return <ProductAdminView />;
      case 'company_admin':
        return <CompanyAdminView />;
      case 'client':
        return <ClientView />;
      case 'work_user':
        return <WorkUserView />;
      default:
        return <CompanyAdminView />;
    }
  };

  return (
    <div
      className={`bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 ${
        currentView === 'app' ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Persistent Module Navigator */}
      <GlobalRoleSwitcherBar />

      {currentView === 'brochure' ? (
        <BrochurePage />
      ) : currentView === 'login' ? (
        <LoginPage />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <TopBar />
          <div className="flex-1 flex overflow-hidden min-h-0">
            <Sidebar />
            <main
              className={`flex-1 bg-slate-50/50 min-h-0 ${
                activeTab === 'chat'
                  ? 'overflow-hidden flex flex-col h-full'
                  : 'overflow-y-auto'
              }`}
            >
              {renderRoleModule()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
