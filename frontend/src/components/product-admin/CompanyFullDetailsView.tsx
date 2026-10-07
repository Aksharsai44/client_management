import React, { useState } from 'react';
import { CompanyAdminMetric, ClientCompany, User, Batch } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Building2,
  Building,
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Layers,
  HardDrive,
  MessageSquare,
  Bell,
  Calendar,
  Users,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  LogIn,
  Search,
  FileText,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { EditCompanyModal } from './modals/EditCompanyModal';
import { DeleteCompanyModal } from './modals/DeleteCompanyModal';
import { AddClientCompanyModal } from '../company-admin/modals/AddClientCompanyModal';

interface CompanyFullDetailsViewProps {
  company: CompanyAdminMetric;
  onBack: () => void;
  onUpdateCompany: (company: CompanyAdminMetric) => void;
  onDeleteCompany: (companyAdminId: string) => void;
  onToggleStatus: (companyAdminId: string) => void;
}

export const CompanyFullDetailsView: React.FC<CompanyFullDetailsViewProps> = ({
  company,
  onBack,
  onUpdateCompany,
  onDeleteCompany,
  onToggleStatus,
}) => {
  const {
    clientCompanies,
    users,
    batches,
    meetings,
    addClientCompany,
    toggleCompanyIntegration,
    quickSwitchRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'users' | 'batches' | 'settings'>('overview');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Modals inside details view
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Derive associated Batches
  const companyBatches = batches.filter(
    (b) =>
      b.companyId === company.companyAdminId ||
      b.leadAdminId === company.companyAdminId ||
      (company.companyName.toLowerCase().includes('acme') && b.id.includes('alpha')) ||
      (company.companyName.toLowerCase().includes('acme') && b.id.includes('beta')) ||
      (company.companyName.toLowerCase().includes('apex') && b.id.includes('gamma'))
  );

  const companyBatchIds = companyBatches.map((b) => b.id);

  // Derive associated Clients
  const companyClients = clientCompanies.filter(
    (c) =>
      companyBatchIds.includes(c.batchId) ||
      (company.companyName.toLowerCase().includes('acme') &&
        ['client_comp_1', 'client_comp_2', 'client_comp_3'].includes(c.id))
  );

  const filteredClients = companyClients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  // Derive associated Users
  const companyUsers = users.filter(
    (u) =>
      u.companyName === company.companyName ||
      u.companyId === company.companyAdminId ||
      u.id === company.companyAdminId ||
      u.batchIds.some((bId) => companyBatchIds.includes(bId)) ||
      (company.companyName.toLowerCase().includes('acme') &&
        (u.companyName?.includes('Acme') || u.companyName?.includes('Globex') || u.companyName?.includes('Vertex')))
  );

  const filteredUsers = companyUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Associated meetings
  const companyMeetings = meetings.filter(
    (m) => companyBatchIds.includes(m.batchId) || m.hostName.toLowerCase().includes(company.adminName.toLowerCase())
  );

  const isPaused = company.status === 'paused';
  const storageLimitMb = company.tier === 'Enterprise' ? 2000 : company.tier === 'Growth' ? 1000 : 500;
  const storagePercent = Math.min(100, Math.round(((company.storageUsedMb || 100) / storageLimitMb) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Company Admins</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Organizations</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900">{company.companyName}</span>
          </div>
        </div>

        {/* Quick Actions on Top Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(company.companyAdminId)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isPaused
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {isPaused ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Tenant' : 'Pause Tenant'}</span>
          </button>

          <button
            onClick={() => quickSwitchRole('company_admin', company.companyAdminId)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Preview platform as this Company Administrator"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Switch to Admin</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Organization Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-black text-2xl shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {company.companyName}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isPaused
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {isPaused ? 'Paused' : 'Active Tenant'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-400/20 text-purple-300 border border-purple-400/30">
                  {company.tier || 'Enterprise'} Tier
                </span>
              </div>
              <p className="text-sm text-slate-300 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{company.industry || 'Enterprise Cloud & Managed Services'}</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Lead Administrator</span>
              <span className="font-bold text-white text-sm">{company.adminName}</span>
              <span className="text-slate-300 block font-mono text-[11px] truncate max-w-[160px]">
                {company.adminEmail}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Contact & Web</span>
              <span className="font-bold text-white text-xs block">{company.phone || '+1 (555) 000-0000'}</span>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-indigo-200 underline flex items-center space-x-1 mt-0.5 text-[11px]"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 text-[11px]">No website listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Clients */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clients</span>
            <Building className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{companyClients.length || company.totalClients}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active Client Companies</p>
        </div>

        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{companyUsers.length || company.totalUsers}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Admins, Workers & Clients</p>
        </div>

        {/* Total Batches */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batches</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{companyBatches.length || company.totalBatches}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Assigned Cohorts</p>
        </div>

        {/* Scheduled Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {companyMeetings.length || company.activeMeetingsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Scheduled Sessions</p>
        </div>

        {/* Storage Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{company.storageUsedMb || 120} <span className="text-xs font-normal text-slate-500">MB</span></div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                storagePercent > 80 ? 'bg-red-500' : storagePercent > 50 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{storagePercent}% of {storageLimitMb} MB limit</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'clients'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Associated Clients ({companyClients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Users & Roster ({companyUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'batches'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cohorts & Batches ({companyBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Integrations & Quotas</span>
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Organization Profile Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Enterprise Tenant Information</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Organization Name</span>
                  <span className="font-bold text-slate-900 text-sm">{company.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Primary Administrator</span>
                  <span className="font-bold text-slate-900 text-sm">{company.adminName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Administrator Email</span>
                  <span className="font-mono text-slate-800">{company.adminEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone Contact</span>
                  <span className="text-slate-800 font-bold">{company.phone || '+1 (555) 000-0000'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Official Website</span>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-[200px]">{company.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Not specified</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Industry Sector</span>
                  <span className="font-semibold text-slate-800">{company.industry || 'Technology'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Account Created / Provisioned</span>
                  <span className="text-slate-600">{company.createdAt || '2026-01-15'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Current Subscription Tier</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 inline-block mt-0.5">
                    {company.tier || 'Enterprise'} Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Clients Preview inside Overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Associated Client Organizations</h3>
                </div>
                <button
                  onClick={() => setActiveTab('clients')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All ({companyClients.length}) →
                </button>
              </div>

              {companyClients.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No client organizations added yet. Click &quot;Add Client Organization&quot; to onboard one.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {companyClients.slice(0, 4).map((client) => (
                    <div
                      key={client.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{client.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {client.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Contact: {client.clientName} ({client.email})</p>
                      <p className="text-[11px] text-slate-400 truncate">{client.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Channels & Actions */}
          <div className="space-y-6">
            {/* Channel Integrations Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Integration Channels</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">WhatsApp Sync</span>
                      <span className="text-[10px] text-slate-500">Automated alerts & bot links</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleCompanyIntegration(company.companyAdminId, 'whatsapp', !company.whatsappEnabled)
                    }
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                      company.whatsappEnabled
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {company.whatsappEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Email Alerts</span>
                      <span className="text-[10px] text-slate-500">Daily summaries & notifications</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleCompanyIntegration(company.companyAdminId, 'email', !company.emailEnabled)
                    }
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                      company.emailEnabled
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {company.emailEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Organization Actions
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Organization Profile</span>
              </button>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Add Client to This Company</span>
              </button>
              <button
                onClick={() => onToggleStatus(company.companyAdminId)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  isPaused
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300'
                }`}
              >
                {isPaused ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume Organization Access' : 'Suspend / Pause Organization'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ASSOCIATED CLIENTS */}
      {activeTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>Client Organizations ({companyClients.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboarded enterprise clients under {company.companyName}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-48"
                />
              </div>

              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client Organization</span>
              </button>
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Building className="w-8 h-8 mx-auto text-slate-300" />
              <p>No client organizations found.</p>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + Add first client organization
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-all bg-slate-50/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{client.name}</h4>
                      <p className="text-xs text-slate-500">Contact: <strong className="text-slate-700">{client.clientName}</strong></p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {client.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{client.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                    <div className="flex items-center space-x-1 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {client.documents && client.documents.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1 text-[11px] text-indigo-600 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{client.documents.length} Attachment document(s) uploaded</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: TEAM MEMBERS & USERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Team Members & Portal Users ({companyUsers.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All platform users affiliated with {company.companyName}
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Email</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Designation</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'company_admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'work_user'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{user.email}</td>
                    <td className="py-3 px-3 text-slate-600">{user.phone || '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{user.designation || 'Member'}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: BATCHES & COHORTS */}
      {activeTab === 'batches' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Cohorts & Batches ({companyBatches.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated work pipelines and participant batches for {company.companyName}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {companyBatches.map((batch) => (
              <div
                key={batch.id}
                className="border border-slate-200 rounded-xl p-5 hover:border-purple-300 transition-all bg-slate-50/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{batch.name}</h4>
                    <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {batch.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {batch.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{batch.description}</p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-black text-slate-900 block">{batch.clientCount}</span>
                    <span className="text-[10px] text-slate-500">Clients</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-black text-slate-900 block">{batch.workerCount}</span>
                    <span className="text-[10px] text-slate-500">Workers</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-black text-slate-900 block">{batch.startDate}</span>
                    <span className="text-[10px] text-slate-500">Start Date</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: INTEGRATIONS & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Enterprise Quotas & Integration Controls</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure communication gateway toggles and resource allocation limits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Communication Channels
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">WhatsApp Dispatch Service</span>
                  <button
                    onClick={() =>
                      toggleCompanyIntegration(company.companyAdminId, 'whatsapp', !company.whatsappEnabled)
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      company.whatsappEnabled
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {company.whatsappEnabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Enables WhatsApp alerts for client calls, batch reminders, and urgent inquiries.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Email Alerts & Digest</span>
                  <button
                    onClick={() =>
                      toggleCompanyIntegration(company.companyAdminId, 'email', !company.emailEnabled)
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      company.emailEnabled
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {company.emailEnabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Delivers automated email confirmations for booked demo calls and batch broadcasts.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Resource Allocation
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Storage Consumption</span>
                  <span className="font-bold text-indigo-700">{company.storageUsedMb} MB / {storageLimitMb} MB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <p className="text-slate-500 text-[11px]">
                  All documents, call audio records, and chat attachments consume allotted cloud storage.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                <span className="font-semibold text-slate-800 block">Universal Password Policy</span>
                <p className="text-slate-500 text-[11px]">
                  New client accounts provisioned under this company inherit the universal company password policy for instant onboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isEditModalOpen && (
        <EditCompanyModal
          company={company}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updated) => {
            onUpdateCompany(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteCompanyModal
          company={company}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={(id) => {
            onDeleteCompany(id);
            onBack();
          }}
        />
      )}

      {isAddClientModalOpen && (
        <AddClientCompanyModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          activeBatchId={companyBatchIds[0] || 'batch_alpha'}
          onAdd={(newClient) => {
            addClientCompany(newClient);
            setIsAddClientModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
