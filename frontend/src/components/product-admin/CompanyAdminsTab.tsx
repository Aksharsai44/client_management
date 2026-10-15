import React, { useState } from 'react';
import { CompanyAdminMetric } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Building,
  Eye,
  Plus,
  Search,
  Edit,
  Trash2,
  PauseCircle,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  Users,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import { AddCompanyFullPageView } from './AddCompanyFullPageView';
import { EditCompanyFullPageView } from './EditCompanyFullPageView';
import { DeleteCompanyModal } from './modals/DeleteCompanyModal';
import { CompanyFullDetailsView } from './CompanyFullDetailsView';

interface CompanyAdminsTabProps {
  visibleCompanyMetrics: CompanyAdminMetric[];
  isSuperAdmin: boolean;
  onSelectMetric?: (admin: CompanyAdminMetric) => void;
}

export const CompanyAdminsTab: React.FC<CompanyAdminsTabProps> = ({
  visibleCompanyMetrics,
  isSuperAdmin,
  onSelectMetric,
}) => {
  const {
    addCompanyAdminMetric,
    updateCompanyAdminMetric,
    deleteCompanyAdminMetric,
    toggleCompanyStatus,
    companyAdminMetrics,
    pricingPlans,
  } = useApp();

  // Full-page detailed view state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyAdminMetric | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanyAdminMetric | null>(null);
  const [copiedPassOrgId, setCopiedPassOrgId] = useState<string | null>(null);

  // Sync current list from AppContext (scoped if regular admin)
  const sourceList = isSuperAdmin
    ? companyAdminMetrics
    : visibleCompanyMetrics;

  // Filtered companies
  const filteredMetrics = sourceList.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.status !== 'paused') ||
      (statusFilter === 'paused' && company.status === 'paused');

    const matchesTier =
      tierFilter === 'all' ||
      (company.tier || 'Enterprise').toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesTier;
  });

  // Selected company for full detailed view
  const currentSelectedCompany = selectedCompanyId
    ? companyAdminMetrics.find((c) => c.companyAdminId === selectedCompanyId) || null
    : null;

  // 1. If Add Company is active, show the Full Page Add Company View! (Super Admin only)
  if (isAddModalOpen && isSuperAdmin) {
    return (
      <AddCompanyFullPageView
        onBack={() => setIsAddModalOpen(false)}
        onAdd={(newCompany) => {
          addCompanyAdminMetric(newCompany);
          setIsAddModalOpen(false);
        }}
      />
    );
  }

  // 2. If Edit Company is active, show the Full Page Edit Company View!
  if (editingCompany) {
    return (
      <EditCompanyFullPageView
        company={editingCompany}
        onBack={() => setEditingCompany(null)}
        onSave={(updated) => {
          updateCompanyAdminMetric(updated);
          setEditingCompany(null);
        }}
      />
    );
  }

  // 3. If a company is selected (clicked Eye icon or View Full Details), show the Full Page Detailed View!
  if (currentSelectedCompany) {
    return (
      <CompanyFullDetailsView
        company={currentSelectedCompany}
        onBack={() => setSelectedCompanyId(null)}
        onEdit={() => {
          setEditingCompany(currentSelectedCompany);
          setSelectedCompanyId(null);
        }}
        onUpdateCompany={(updated) => updateCompanyAdminMetric(updated)}
        onDeleteCompany={(id) => {
          deleteCompanyAdminMetric(id);
          setSelectedCompanyId(null);
        }}
        onToggleStatus={(id) => toggleCompanyStatus(id)}
      />
    );
  }

  // Summary Metrics
  const totalCompaniesCount = sourceList.length;
  const activeCompaniesCount = sourceList.filter((c) => c.status !== 'paused').length;
  const totalClientsSum = sourceList.reduce((acc, c) => acc + (c.totalClients || 0), 0);
  const totalUsersSum = sourceList.reduce((acc, c) => acc + (c.totalUsers || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Company Admins & Client Organizations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage enterprise company tenants, provision admins, inspect full client portfolios, and adjust settings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isSuperAdmin && (
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Scoped to assigned companies only
            </span>
          )}

          {/* Primary Action: Add Company (Restricted to Product Super Admin only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company Organization</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organizations</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalCompaniesCount}</div>
          <p className="text-[10px] text-emerald-600 font-medium">{activeCompaniesCount} Active</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clients</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalClientsSum}</div>
          <p className="text-[10px] text-slate-500">Across all cohorts</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Users</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalUsersSum}</div>
          <p className="text-[10px] text-slate-500">Workers & Clients</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Health</div>
          <div className="text-xl font-black text-emerald-600 mt-1">100%</div>
          <p className="text-[10px] text-slate-500">Zero service incidents</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, admin, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>

          {/* Tier Filter - Synced with Pricing & Plans */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">All Plan Tiers</option>
            {pricingPlans.map((plan) => {
              const count = companyAdminMetrics.filter(
                (c) => (c.tier || 'Enterprise').toLowerCase() === plan.name.toLowerCase()
              ).length;
              return (
                <option key={plan.id} value={plan.name}>
                  {plan.name} Tier ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Company Cards Grid */}
      {filteredMetrics.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-slate-300" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">No company organizations found</h4>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? 'Try adjusting your search filters'
                : isSuperAdmin
                ? 'Get started by creating your first company tenant'
                : 'No company organizations are currently assigned to your account. Please contact your Product Super Admin.'}
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              + Add Company Organization
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMetrics.map((admin) => {
            const isPaused = admin.status === 'paused';
            return (
              <div
                key={admin.companyAdminId}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between relative"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3
                          onClick={() => {
                            setSelectedCompanyId(admin.companyAdminId);
                          }}
                          className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {admin.companyName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{admin.adminName}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompanyStatus(admin.companyAdminId);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition-colors flex items-center space-x-1 ${
                          isPaused
                            ? 'text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Click to toggle active/pause status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span>{isPaused ? 'Paused' : 'Active'}</span>
                      </button>

                      <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {admin.tier || 'Enterprise'}
                      </span>
                    </div>
                  </div>

                  {/* Industry & Contact Info */}
                  <div className="mt-3 text-xs space-y-1 text-slate-500">
                    {admin.industry && (
                      <p className="text-[11px] text-slate-600 truncate font-medium">
                        {admin.industry}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{admin.adminEmail}</span>
                    </div>
                    {admin.phone && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{admin.phone}</span>
                      </div>
                    )}

                    {/* Organization Admin Credentials Badge */}
                    <div className="mt-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1">
                          <Key className="w-3 h-3 text-indigo-500" />
                          <span>Admin Login Credentials</span>
                        </span>
                        <span className="text-[9px] font-semibold text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-indigo-150">
                          Tenant Login
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 text-[10px]">Email (Login ID):</span>
                        <span className="font-mono text-slate-800 font-medium truncate max-w-[150px]">
                          {admin.adminEmail}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 text-[10px]">Password:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-[11px]">
                            {admin.password || 'Acme@123'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(admin.password || 'Acme@123');
                              setCopiedPassOrgId(admin.companyAdminId);
                              setTimeout(() => setCopiedPassOrgId(null), 2000);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white transition-colors cursor-pointer"
                            title="Copy admin password"
                          >
                            {copiedPassOrgId === admin.companyAdminId ? (
                              <Check className="w-3 h-3 text-emerald-600 font-bold" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Counts Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50/80 p-2 rounded-xl">
                      <div className="text-base font-black text-slate-900">{admin.totalClients}</div>
                      <p className="text-[10px] text-slate-500 font-medium">Clients</p>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-xl">
                      <div className="text-base font-black text-slate-900">{admin.totalUsers}</div>
                      <p className="text-[10px] text-slate-500 font-medium">Total Users</p>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-xl">
                      <div className="text-base font-black text-slate-900">{admin.totalBatches}</div>
                      <p className="text-[10px] text-slate-500 font-medium">Batches</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Primary: View Full Details */}
                  <button
                    onClick={() => {
                      setSelectedCompanyId(admin.companyAdminId);
                    }}
                    className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer group-hover:bg-indigo-600 group-hover:text-white"
                  >
                    <span>View Full Details & Clients</span>
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Secondary: Edit & Delete */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCompany(admin);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Company Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCompany(admin);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCompany && (
        <DeleteCompanyModal
          company={deletingCompany}
          isOpen={!!deletingCompany}
          onClose={() => setDeletingCompany(null)}
          onConfirm={(id) => {
            deleteCompanyAdminMetric(id);
            setDeletingCompany(null);
          }}
        />
      )}
    </div>
  );
};
