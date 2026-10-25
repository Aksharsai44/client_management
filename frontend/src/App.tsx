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
import { LiveMeetingModal } from './components/common/LiveMeetingModal';

const MainAppContent: React.FC = () => {
  const { currentView, currentUser, activeTab, activeLiveCall, setActiveLiveCall } = useApp();

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
      {/* Live Video / Audio Meeting Call Room */}
      {activeLiveCall && (
        <LiveMeetingModal
          meeting={activeLiveCall}
          onClose={() => setActiveLiveCall(null)}
        />
      )}

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
