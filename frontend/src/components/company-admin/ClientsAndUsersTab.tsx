import React, { useState } from 'react';
import { User, ClientCompany, CompanySettings } from '../../types';
import {
  Building,
  Building2,
  Plus,
  Upload,
  CheckCircle2,
  Search,
  Eye,
  User as UserIcon,
  Edit2,
  Trash2,
  Zap,
  Lock,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { ViewClientCompanyModal } from './modals/ViewClientCompanyModal';

interface ClientsAndUsersTabProps {
  companySettings: CompanySettings;
  batchCompanies: ClientCompany[];
  batchUsers: User[];
  currentBatchName: string;
  onOpenAddClient: () => void;
  onOpenAddUser: () => void;
  onViewReport: (user: User) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  csvUploadSuccess: string | null;
  onEditClient?: (company: ClientCompany) => void;
  onDeleteClient?: (companyId: string) => void;
  onViewClient?: (company: ClientCompany) => void;
  onToggleClientStatus?: (company: ClientCompany) => void;
}

export const ClientsAndUsersTab: React.FC<ClientsAndUsersTabProps> = ({
  companySettings,
  batchCompanies,
  batchUsers,
  currentBatchName,
  onOpenAddClient,
  onOpenAddUser,
  onViewReport,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onCsvUpload,
  csvUploadSuccess,
  onEditClient,
  onDeleteClient,
  onViewClient,
  onToggleClientStatus,
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'client' | 'work_user'>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string | null>(null);
  const [viewingCompany, setViewingCompany] = useState<ClientCompany | null>(null);

  const displayedUsers = batchUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(userSearchTerm.toLowerCase()));
    const matchesRole =
      userRoleFilter === 'all' ? true : u.role === userRoleFilter;
    const matchesCompany =
      selectedCompanyFilter ? u.companyName === selectedCompanyFilter : true;
    return matchesSearch && matchesRole && matchesCompany;
  });

  return (
    <div className="space-y-6">
      {/* Top Actions: Add Client Company */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Client Companies & User Registry
          </h2>
          <p className="text-xs text-slate-500">
            Manage batch clients and work users. Default universal password:{' '}
            <span className="font-mono font-bold text-slate-700">
              {companySettings.universalDefaultPassword}
            </span>
          </p>
        </div>

        <div>
          <button
            onClick={onOpenAddClient}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
          >
            <Building className="w-4 h-4" />
            <span>Add Client Company</span>
          </button>
        </div>
      </div>

      {csvUploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{csvUploadSuccess}</span>
        </div>
      )}

      {/* Client Companies in Current Batch */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                Associated Client Organizations ({batchCompanies.length})
              </h3>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">
                Active Batch
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Onboarded partner companies with isolated communication & access control.
            </p>
          </div>

          {selectedCompanyFilter && (
            <button
              onClick={() => {
                setSelectedCompanyFilter(null);
                setUserSearchTerm('');
              }}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Filtered: <strong className="font-bold">{selectedCompanyFilter}</strong></span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batchCompanies.map((comp) => {
            const companyUsers = batchUsers.filter((u) => u.companyName === comp.name);
            const isActiveFilter = selectedCompanyFilter === comp.name;

            return (
              <div
                key={comp.id}
                className={`rounded-2xl border transition-all duration-200 p-5 bg-white flex flex-col justify-between relative group hover:shadow-md ${
                  isActiveFilter
                    ? 'border-2 border-sky-500 shadow-md ring-2 ring-sky-100'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  {/* Top Row: Tags + Quick Action Buttons (NO QR Code) */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-300/80 flex items-center gap-1 shadow-2xs">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        CLIENT ORG
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          comp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {comp.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {/* Action Icon Buttons */}
                    <div className="flex items-center gap-1">
                      {/* View Details Eye */}
                      <button
                        type="button"
                        onClick={() => (onViewClient ? onViewClient(comp) : setViewingCompany(comp))}
                        title="View Client Details"
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200/70 text-slate-500 hover:text-sky-600 flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Pencil */}
                      <button
                        type="button"
                        onClick={() => onEditClient && onEditClient(comp)}
                        title="Edit Client Organization"
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/70 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Trash */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove "${comp.name}"?`)) {
                            onDeleteClient && onDeleteClient(comp.id);
                          }
                        }}
                        title="Delete Client Organization"
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/70 text-rose-500 hover:text-rose-700 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Company Name & Subtitle */}
                  <div className="space-y-1 mb-3">
                    <h4
                      className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-sky-950 transition-colors line-clamp-1"
                      title={comp.name}
                    >
                      {comp.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {comp.websiteUrl ? comp.websiteUrl.replace(/^https?:\/\//, '') : comp.clientName}
                      </span>
                    </div>
                  </div>

                  {/* Inset Metadata Box */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs mb-3.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Contact:</span>
                      <span className="font-bold text-slate-800">{comp.clientName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Email:</span>
                      <span className="font-mono text-slate-700 text-[11px] truncate max-w-[170px]" title={comp.email}>
                        {comp.email}
                      </span>
                    </div>
                    {comp.phone && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium">Phone:</span>
                        <span className="font-mono text-slate-700 text-[11px]">{comp.phone}</span>
                      </div>
                    )}
                    {comp.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1.5 border-t border-slate-200/60 leading-relaxed">
                        {comp.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>{companyUsers.length} Users</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCompanyFilter === comp.name) {
                        setSelectedCompanyFilter(null);
                        setUserSearchTerm('');
                      } else {
                        setSelectedCompanyFilter(comp.name);
                        setUserSearchTerm(comp.name);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                      isActiveFilter
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActiveFilter ? 'bg-white' : 'bg-slate-400'}`}
                    ></span>
                    <span>{isActiveFilter ? 'Viewing Users' : 'Filter Users'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* "+ Add Client Organization" Dashed Reference Card */}
          <button
            type="button"
            onClick={onOpenAddClient}
            className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/20 hover:bg-sky-50/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 group-hover:border-sky-300 group-hover:bg-sky-600 text-sky-600 group-hover:text-white shadow-2xs flex items-center justify-center transition-all group-hover:scale-110 mb-3">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
              Add Client Organization
            </h4>
            <p className="text-xs text-slate-500 max-w-[210px] mt-1.5 leading-relaxed">
              Onboard a client organization to this batch with stakeholder contact and portal access.
            </p>
          </button>
        </div>
      </div>

      {/* Users Table with Search Bar & Filter Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full 2xl:max-w-xs shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search user by name, email, or company..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Right Group: Role Filters + Add User Manually + Upload CSV strictly on one line */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 overflow-x-auto no-scrollbar shrink-0">
            {/* Filter Buttons [All, Client, Worker] */}
            <div className="inline-flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  userRoleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Users ({batchUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('client')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  userRoleFilter === 'client'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clients ({batchUsers.filter((u) => u.role === 'client').length})
              </button>
              <button
                onClick={() => setUserRoleFilter('work_user')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  userRoleFilter === 'work_user'
                    ? 'bg-white text-amber-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Workers ({batchUsers.filter((u) => u.role === 'work_user').length})
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0"></div>

            {/* Action Buttons: Add User Manually & Upload CSV */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenAddUser}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add User Manually</span>
              </button>

              <label className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer border border-slate-300 shadow-2xs transition-colors whitespace-nowrap shrink-0">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={onCsvUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">User Profile</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Organization</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-right">Actions & Attendance Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={
                          u.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'client'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.role === 'client' ? 'Client' : 'Work Employee'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">
                    {u.companyName || currentBatchName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {u.phone || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Eye Icon for Attendance Analysis Report */}
                      <button
                        onClick={() => onViewReport(u)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="View & Download Attendance Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onViewUser(u)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="View Profile Details"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditUser(u)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove user ${u.name}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No users match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Client Details Modal */}
      {viewingCompany && (
        <ViewClientCompanyModal
          viewingCompany={viewingCompany}
          onClose={() => setViewingCompany(null)}
          onOpenEdit={(company) => {
            setViewingCompany(null);
            onEditClient && onEditClient(company);
          }}
        />
      )}
    </div>
  );
};
