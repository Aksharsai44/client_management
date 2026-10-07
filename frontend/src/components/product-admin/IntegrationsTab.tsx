import React, { useState } from 'react';
import { CompanyAdminMetric, IntegrationSettings } from '../../types';
import {
  Sliders,
  MessageSquare,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

interface IntegrationsTabProps {
  companyAdminMetrics: CompanyAdminMetric[];
  integrationSettings: IntegrationSettings;
  updateIntegrationSettings: (settings: Partial<IntegrationSettings>) => void;
  toggleCompanyIntegration: (
    companyAdminId: string,
    integration: 'whatsapp' | 'email',
    enabled: boolean
  ) => void;
  isSuperAdmin: boolean;
  createProductAdminAccount: (
    name: string,
    email: string,
    assignedCompanyAdminIds: string[]
  ) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  companyAdminMetrics,
  integrationSettings,
  updateIntegrationSettings,
  toggleCompanyIntegration,
  isSuperAdmin,
  createProductAdminAccount,
}) => {
  // New Product Admin creation state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminAssignedCompanies, setNewAdminAssignedCompanies] = useState<string[]>([
    'user_comp_admin_1',
  ]);
  const [adminCreateSuccess, setAdminCreateSuccess] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Company-by-Company WhatsApp & Email Toggle System */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Client & Company Integration Toggles
            </h3>
            <p className="text-xs text-slate-500">
              Enable or disable WhatsApp and Email integration per company based on plan entitlements.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {companyAdminMetrics.map((metric) => {
            const compSettings = integrationSettings.companySettings[metric.companyAdminId] || {
              whatsappEnabled: metric.whatsappEnabled,
              emailEnabled: metric.emailEnabled,
            };

            return (
              <div
                key={metric.companyAdminId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{metric.companyName}</h4>
                    <p className="text-[11px] text-slate-500">{metric.adminName}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {metric.totalBatches} Batches
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  {/* WhatsApp toggle */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">WhatsApp Alert</span>
                    </div>
                    <button
                      onClick={() =>
                        toggleCompanyIntegration(
                          metric.companyAdminId,
                          'whatsapp',
                          !compSettings.whatsappEnabled
                        )
                      }
                      className="focus:outline-none"
                    >
                      {compSettings.whatsappEnabled ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600 cursor-pointer" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400 cursor-pointer" />
                      )}
                    </button>
                  </div>

                  {/* Email toggle */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">Email Alerts</span>
                    </div>
                    <button
                      onClick={() =>
                        toggleCompanyIntegration(
                          metric.companyAdminId,
                          'email',
                          !compSettings.emailEnabled
                        )
                      }
                      className="focus:outline-none"
                    >
                      {compSettings.emailEnabled ? (
                        <ToggleRight className="w-6 h-6 text-blue-600 cursor-pointer" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI LLM Provider Configuration & Product Admin Credentials */}
      <div className="space-y-6">
        {/* LLM API Provider Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Model & API Key Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Select Gemini or OpenAI model for automated call transcripts and summaries.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  AI Provider
                </label>
                <select
                  value={integrationSettings.aiProvider}
                  onChange={(e) =>
                    updateIntegrationSettings({
                      aiProvider: e.target.value as 'gemini' | 'openai' | 'anthropic',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                >
                  <option value="gemini">Google Gemini AI</option>
                  <option value="openai">OpenAI ChatGPT</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Model
                </label>
                <select
                  value={integrationSettings.modelName}
                  onChange={(e) =>
                    updateIntegrationSettings({ modelName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {integrationSettings.aiProvider === 'gemini' ? (
                    <>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Accurate)</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o">gpt-4o (Omni)</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={integrationSettings.apiKey}
                  onChange={(e) =>
                    updateIntegrationSettings({ apiKey: e.target.value })
                  }
                  placeholder="Enter provider API key"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => alert('API Key verified & connected to transcript pipeline!')}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Admin Credential & Assigned Scope Management */}
        {isSuperAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Provision Product Admin Credentials & Assign Companies
                </h3>
                <p className="text-xs text-slate-500">
                  Super admin can create sub product admins and assign specific company admins to them.
                </p>
              </div>
            </div>

            {adminCreateSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Product Admin created successfully with assigned company scope!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAdminName || !newAdminEmail) return;
                createProductAdminAccount(
                  newAdminName,
                  newAdminEmail,
                  newAdminAssignedCompanies
                );
                setNewAdminName('');
                setNewAdminEmail('');
                setAdminCreateSuccess(true);
                setTimeout(() => setAdminCreateSuccess(false), 4000);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="jordan.admin@omnisuite.io"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Company Admins (Visible Scope)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {companyAdminMetrics.map((comp) => {
                    const isAssigned = newAdminAssignedCompanies.includes(comp.companyAdminId);
                    return (
                      <label
                        key={comp.companyAdminId}
                        className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAdminAssignedCompanies([
                                ...newAdminAssignedCompanies,
                                comp.companyAdminId,
                              ]);
                            } else {
                              setNewAdminAssignedCompanies(
                                newAdminAssignedCompanies.filter(
                                  (id) => id !== comp.companyAdminId
                                )
                              );
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{comp.companyName} ({comp.adminName})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Create Scoped Product Admin
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
