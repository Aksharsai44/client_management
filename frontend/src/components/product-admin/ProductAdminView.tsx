import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyAdminMetric, PricingPlan, DemoRequest } from '../../types';
import { DemoRequestsTab } from './DemoRequestsTab';
import { CompanyAdminsTab } from './CompanyAdminsTab';
import { PricingPlansTab } from './PricingPlansTab';
import { IntegrationsTab } from './IntegrationsTab';
import { CompanyMetricsModal } from './modals/CompanyMetricsModal';
import { CreateDummyCredentialModal } from './modals/CreateDummyCredentialModal';
import { PricingPlanModal } from './modals/PricingPlanModal';

export const ProductAdminView: React.FC = () => {
  const {
    activeTab,
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
    toggleClientIntegration,
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

  // Permission Guard: Scoped product admins can handle demo requests and assigned companies only
  const effectiveTab =
    !isSuperAdmin && (activeTab === 'pricing' || activeTab === 'integrations')
      ? 'demo_requests'
      : activeTab === 'dashboard'
      ? 'demo_requests'
      : activeTab;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* TAB 1: DEMO REQUESTS */}
      {effectiveTab === 'demo_requests' && (
        <DemoRequestsTab
          demoRequests={demoRequests}
          onOpenCreateCredential={(req) => setActiveDemoForCred(req)}
          toggleDummyCredentialStatus={toggleDummyCredentialStatus}
          quickSwitchRole={quickSwitchRole}
        />
      )}

      {/* TAB 2: COMPANY ADMINS & METRICS (BATCH VIEW) */}
      {effectiveTab === 'company_admins' && (
        <CompanyAdminsTab
          visibleCompanyMetrics={visibleCompanyMetrics}
          isSuperAdmin={isSuperAdmin}
          onSelectMetric={(admin) => setSelectedCompanyMetric(admin)}
        />
      )}

      {/* TAB 3: PRICING CUSTOMIZER (SYNCED TO BROCHURE) */}
      {effectiveTab === 'pricing' && (
        <PricingPlansTab
          pricingPlans={pricingPlans}
          onOpenNewPlanModal={() => setIsNewPlanModal(true)}
          onEditPlan={(plan) => setEditingPlan(plan)}
          deletePricingPlan={deletePricingPlan}
        />
      )}

      {/* TAB 4: INTEGRATIONS & SETTINGS */}
      {effectiveTab === 'integrations' && (
        <IntegrationsTab
          companyAdminMetrics={companyAdminMetrics}
          integrationSettings={integrationSettings}
          updateIntegrationSettings={updateIntegrationSettings}
          toggleCompanyIntegration={toggleCompanyIntegration}
          toggleClientIntegration={toggleClientIntegration}
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
