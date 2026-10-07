import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyAdminMetric, PricingPlan, DemoRequest } from '../../types';
import { ProductAdminHeader } from './ProductAdminHeader';
import { DemoRequestsTab } from './DemoRequestsTab';
import { CompanyAdminsTab } from './CompanyAdminsTab';
import { PricingPlansTab } from './PricingPlansTab';
import { IntegrationsTab } from './IntegrationsTab';
import { CompanyMetricsModal } from './modals/CompanyMetricsModal';
import { CreateDummyCredentialModal } from './modals/CreateDummyCredentialModal';
import { PricingPlanModal } from './modals/PricingPlanModal';
import {
  FileSpreadsheet,
  Building2,
  DollarSign,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ProductAdminView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    demoRequests,
    createDummyCredential,
    toggleDummyCredentialStatus,
    companyAdminMetrics,
    pricingPlans,
    updatePricingPlan,
    addPricingPlan,
    deletePricingPlan,
    integrationSettings,
    updateIntegrationSettings,
    toggleCompanyIntegration,
    createProductAdminAccount,
    currentUser,
    quickSwitchRole,
  } = useApp();

  // Modals state
  const [selectedCompanyMetric, setSelectedCompanyMetric] = useState<CompanyAdminMetric | null>(null);
  const [activeDemoForCred, setActiveDemoForCred] = useState<DemoRequest | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);

  // Filter company admins if user is regular product_admin (not super_admin)
  const isSuperAdmin = currentUser.role === 'product_super_admin';
  const visibleCompanyMetrics = isSuperAdmin
    ? companyAdminMetrics
    : companyAdminMetrics.filter((m) =>
        currentUser.assignedCompanyAdminIds?.includes(m.companyAdminId)
      );

  const pendingDemoCount = demoRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Module Title Header */}
      <ProductAdminHeader currentUser={currentUser} isSuperAdmin={isSuperAdmin} />

      {/* ORDER-WISE IN-PAGE TAB NAVIGATION BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Product Admins & Integrations</span>
        </button>

        <button
          onClick={() => setActiveTab('demo_requests')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'demo_requests'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Demo Requests</span>
          {pendingDemoCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'demo_requests'
                  ? 'bg-white text-indigo-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingDemoCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('company_admins')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'company_admins'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company Admins</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'company_admins'
                ? 'bg-white text-indigo-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {visibleCompanyMetrics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pricing Plans</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'pricing'
                ? 'bg-white text-indigo-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {pricingPlans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ml-auto ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View All in Order</span>
        </button>
      </div>

      {/* TAB 1: DEMO REQUESTS */}
      {(activeTab === 'demo_requests' || activeTab === 'dashboard') && (
        <DemoRequestsTab
          demoRequests={demoRequests}
          onOpenCreateCredential={(req) => setActiveDemoForCred(req)}
          toggleDummyCredentialStatus={toggleDummyCredentialStatus}
          quickSwitchRole={quickSwitchRole}
        />
      )}

      {/* TAB 2: COMPANY ADMINS & METRICS (BATCH VIEW) */}
      {(activeTab === 'company_admins' || activeTab === 'dashboard') && (
        <CompanyAdminsTab
          visibleCompanyMetrics={visibleCompanyMetrics}
          isSuperAdmin={isSuperAdmin}
          onSelectMetric={(admin) => setSelectedCompanyMetric(admin)}
        />
      )}

      {/* TAB 3: PRICING CUSTOMIZER (SYNCED TO BROCHURE) */}
      {(activeTab === 'pricing' || activeTab === 'dashboard') && (
        <PricingPlansTab
          pricingPlans={pricingPlans}
          onOpenNewPlanModal={() => setIsNewPlanModal(true)}
          onEditPlan={(plan) => setEditingPlan(plan)}
          deletePricingPlan={deletePricingPlan}
        />
      )}

      {/* TAB 4: INTEGRATIONS & SETTINGS */}
      {(activeTab === 'integrations' || activeTab === 'dashboard') && (
        <IntegrationsTab
          companyAdminMetrics={companyAdminMetrics}
          integrationSettings={integrationSettings}
          updateIntegrationSettings={updateIntegrationSettings}
          toggleCompanyIntegration={toggleCompanyIntegration}
          isSuperAdmin={isSuperAdmin}
          createProductAdminAccount={createProductAdminAccount}
        />
      )}

      {/* MODAL: Company Admin Detailed Metrics */}
      {selectedCompanyMetric && (
        <CompanyMetricsModal
          selectedCompanyMetric={selectedCompanyMetric}
          onClose={() => setSelectedCompanyMetric(null)}
        />
      )}

      {/* MODAL: Create Dummy Credential */}
      {activeDemoForCred && (
        <CreateDummyCredentialModal
          demoRequest={activeDemoForCred}
          onClose={() => setActiveDemoForCred(null)}
          onSubmit={(reqId, pass, days) => createDummyCredential(reqId, pass, days)}
        />
      )}

      {/* MODAL: Edit or Add Pricing Plan */}
      {(editingPlan || isNewPlanModal) && (
        <PricingPlanModal
          editingPlan={editingPlan}
          isOpen={true}
          onClose={() => {
            setEditingPlan(null);
            setIsNewPlanModal(false);
          }}
          onSave={(planData) => {
            if (editingPlan) {
              updatePricingPlan(planData as PricingPlan);
            } else {
              addPricingPlan(planData as Omit<PricingPlan, 'id'>);
            }
          }}
        />
      )}
    </div>
  );
};
