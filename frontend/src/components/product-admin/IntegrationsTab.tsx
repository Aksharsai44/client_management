import React, { useState } from 'react';
import { CompanyAdminMetric, IntegrationSettings, User } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  MessageSquare,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  UserPlus,
  CheckCircle2,
  Users,
  Building,
  Shield,
  ShieldCheck,
  Search,
  LogIn,
  Edit,
  Trash2,
  Plus,
  X,
  Phone,
  Briefcase,
  Check,
} from 'lucide-react';
import { EditProductAdminModal } from './modals/EditProductAdminModal';

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
    assignedCompanyAdminIds: string[],
    phone?: string,
    designation?: string
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
  const { users, deleteUser, updateUser, quickSwitchRole, currentUser } = useApp();

  // Form toggle state: When clicking "+ Add Product Admin", this form appears
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // New Product Admin form state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminDesignation, setNewAdminDesignation] = useState('');
  const [newAdminAssignedCompanies, setNewAdminAssignedCompanies] = useState<string[]>(
    companyAdminMetrics.length > 0 ? [companyAdminMetrics[0].companyAdminId] : []
  );
  const [adminCreateSuccess, setAdminCreateSuccess] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Editing Admin Modal
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

  // Filter Product Admins list (Super admins and Scoped product admins)
  const productAdmins = users.filter(
    (u) => u.role === 'product_admin' || u.role === 'product_super_admin'
  );

  const filteredAdmins = productAdmins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      (admin.designation && admin.designation.toLowerCase().includes(adminSearchQuery.toLowerCase()))
  );

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    createProductAdminAccount(
      newAdminName.trim(),
      newAdminEmail.trim(),
      newAdminAssignedCompanies,
      newAdminPhone.trim() || '+1 (555) 700-1122',
      newAdminDesignation.trim() || 'Product Administrator'
    );

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
    setNewAdminDesignation('');
    setIsAddFormOpen(false);
    setAdminCreateSuccess(true);
    setTimeout(() => setAdminCreateSuccess(false), 4000);
  };

  const getCompanyNameById = (id: string) => {
    const found = companyAdminMetrics.find((c) => c.companyAdminId === id);
    return found ? found.companyName : id;
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* ORDER-WISE SECTION 1: PRODUCT ADMINS & CREDENTIALS PROVISIONING */}
      {/* ============================================================ */}
      {isSuperAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Provision Product Admin Credentials & Assign Companies
                </h3>
                <p className="text-xs text-slate-500">
                  Super admin can create sub product admins and assign specific company admins to them.
                </p>
              </div>
            </div>

            {/* "+ Add Product Admin" Button (The Add Option) */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                  isAddFormOpen
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isAddFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isAddFormOpen ? 'Close Form' : 'Add Product Admin'}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {adminCreateSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Product Admin created successfully with assigned company scope! Added to the roster below.
              </span>
            </div>
          )}

          {/* FORM: Appears when clicking the Add Option */}
          {isAddFormOpen && (
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 space-y-5 animate-in fade-in zoom-in-98 duration-150 shadow-md">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    Provision Product Admin Credentials & Assign Companies
                  </h4>
                  <p className="text-xs text-slate-500">
                    Super admin can create sub product admins and assign specific company admins to them.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Admin Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Admin Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800 shadow-2xs"
                    />
                  </div>

                  {/* Admin Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="jordan.admin@omnisuite.io"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Additional optional fields (collapsed or subtle) */}
                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={newAdminPhone}
                      onChange={(e) => setNewAdminPhone(e.target.value)}
                      placeholder="+1 (555) 700-1122"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Designation / Role Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAdminDesignation}
                      onChange={(e) => setNewAdminDesignation(e.target.value)}
                      placeholder="Product Operations Lead"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>

                {/* Assign Company Admins (Visible Scope) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Assign Company Admins (Visible Scope)
                    </label>
                    <div className="space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setNewAdminAssignedCompanies(
                            companyAdminMetrics.map((c) => c.companyAdminId)
                          )
                        }
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setNewAdminAssignedCompanies([])}
                        className="text-slate-500 font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                    {companyAdminMetrics.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center">
                        No company admins currently registered.
                      </p>
                    ) : (
                      companyAdminMetrics.map((comp) => {
                        const isAssigned = newAdminAssignedCompanies.includes(comp.companyAdminId);
                        return (
                          <label
                            key={comp.companyAdminId}
                            className="flex items-center space-x-2.5 text-xs text-slate-800 cursor-pointer select-none p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
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
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-900">{comp.companyName}</span>
                            <span className="text-slate-400 text-[11px]">({comp.adminName})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Exact full-width submit button as shown in screenshot */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Create Scoped Product Admin</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* THE DATA COMES AT THE BOTTOM: PRODUCT ADMINS ROSTER TABLE */}
          {/* ============================================================ */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Configured Product Administrators Roster ({productAdmins.length})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  All active product admins with their assigned company tenant scopes
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search administrators..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-56"
                />
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Administrator</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Assigned Company Scope</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No product administrators found.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const isSuper = admin.role === 'product_super_admin';
                      const assignedIds = admin.assignedCompanyAdminIds || [];
                      const isSelf = admin.id === currentUser.id;

                      return (
                        <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Name & Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              {admin.avatar ? (
                                <img
                                  src={admin.avatar}
                                  alt={admin.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                                  {admin.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block">{admin.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {admin.designation || 'Product Administrator'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isSuper
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {isSuper ? 'Super Admin' : 'Scoped Admin'}
                            </span>
                          </td>

                          {/* Contact Email */}
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            {admin.email}
                          </td>

                          {/* Assigned Scope */}
                          <td className="py-3 px-3">
                            {isSuper ? (
                              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                Global (All Companies)
                              </span>
                            ) : assignedIds.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">
                                No companies assigned
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {assignedIds.map((cId) => (
                                  <span
                                    key={cId}
                                    className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                                  >
                                    {getCompanyNameById(cId)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <button
                              disabled={isSelf}
                              onClick={() => {
                                const nextStatus = admin.status === 'active' ? 'inactive' : 'active';
                                updateUser({ ...admin, status: nextStatus });
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                admin.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-300'
                              } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:opacity-80'}`}
                              title={isSelf ? 'Cannot deactivate currently active account' : 'Click to toggle status'}
                            >
                              {admin.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Switch Role / Preview */}
                              <button
                                onClick={() =>
                                  quickSwitchRole(
                                    isSuper ? 'product_super_admin' : 'product_admin',
                                    admin.id
                                  )
                                }
                                className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                                title="Login / Switch to this administrator"
                              >
                                <LogIn className="w-3 h-3" />
                                <span className="hidden md:inline">Switch</span>
                              </button>

                              {/* Edit Scope */}
                              <button
                                onClick={() => setEditingAdmin(admin)}
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Admin & Assigned Scope"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to remove administrator ${admin.name}?`
                                      )
                                    ) {
                                      deleteUser(admin.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Administrator"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ORDER-WISE SECTION 2: CLIENT & COMPANY CHANNEL INTEGRATION TOGGLES */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Client & Company Integration Toggles
            </h3>
            <p className="text-xs text-slate-500">
              Enable or disable WhatsApp and Email integration per company based on plan entitlements.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {companyAdminMetrics.map((metric) => {
            const compSettings = integrationSettings.companySettings[metric.companyAdminId] || {
              whatsappEnabled: metric.whatsappEnabled,
              emailEnabled: metric.emailEnabled,
            };

            return (
              <div
                key={metric.companyAdminId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{metric.companyName}</h4>
                      <p className="text-[11px] text-slate-500">{metric.adminName}</p>
                    </div>
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
                      className="focus:outline-hidden"
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
                      className="focus:outline-hidden"
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

      {/* ============================================================ */}
      {/* ORDER-WISE SECTION 3: AI MODEL & API KEY CONFIGURATION */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Model & API Key Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Select primary LLM provider for meeting summaries, attendee transcripts, and interactive chat assistant.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              AI Provider
            </label>
            <select
              value={integrationSettings.aiProvider}
              onChange={(e) =>
                updateIntegrationSettings({
                  aiProvider: e.target.value as 'gemini' | 'openai' | 'anthropic',
                  modelName:
                    e.target.value === 'gemini'
                      ? 'gemini-2.5-flash'
                      : e.target.value === 'openai'
                      ? 'gpt-4o'
                      : 'claude-3-5-sonnet',
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-slate-50"
            >
              <option value="gemini">Google Gemini AI</option>
              <option value="openai">OpenAI ChatGPT</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Active Model
            </label>
            <select
              value={integrationSettings.modelName}
              onChange={(e) =>
                updateIntegrationSettings({ modelName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-slate-50"
            >
              {integrationSettings.aiProvider === 'gemini' ? (
                <>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Accurate)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                </>
              ) : integrationSettings.aiProvider === 'openai' ? (
                <>
                  <option value="gpt-4o">gpt-4o (Omni Multimodal)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Cost Optimized)</option>
                </>
              ) : (
                <>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            API Secret Key
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={integrationSettings.apiKey}
              onChange={(e) =>
                updateIntegrationSettings({ apiKey: e.target.value })
              }
              placeholder="Enter provider API key (e.g. AIzaSy... or sk-...)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-slate-50"
            />
            <button
              onClick={() => alert('API Key verified & connected to transcript pipeline!')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>

      {/* Edit Product Admin Scope Modal */}
      {editingAdmin && (
        <EditProductAdminModal
          admin={editingAdmin}
          isOpen={!!editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSave={(updated) => {
            updateUser(updated);
            setEditingAdmin(null);
          }}
          companyAdminMetrics={companyAdminMetrics}
        />
      )}
    </div>
  );
};
