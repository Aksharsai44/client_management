import React, { useState } from 'react';
import { DemoRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  Trash2,
  Radio,
} from 'lucide-react';

interface DemoRequestsTabProps {
  demoRequests: DemoRequest[];
  onOpenCreateCredential: (req: DemoRequest) => void;
  toggleDummyCredentialStatus: (id: string, active: boolean) => void;
  quickSwitchRole: (role: any) => void;
}

export const DemoRequestsTab: React.FC<DemoRequestsTabProps> = ({
  demoRequests,
  onOpenCreateCredential,
  toggleDummyCredentialStatus,
  quickSwitchRole,
}) => {
  const { integrationSettings, deleteDemoRequest, refreshDemoRequests } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'credential_created'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDemoRequests();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredRequests = demoRequests.filter((req) => {
    const matchesSearch =
      req.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.requirements && req.requirements.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'credential_created'
        ? req.status === 'credential_created' || !!req.dummyCredential
        : req.status === 'pending' && !req.dummyCredential;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = demoRequests.filter((r) => !r.dummyCredential || r.status === 'pending').length;
  const activeCredCount = demoRequests.filter((r) => r.dummyCredential?.isActive).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Demo Requests & Temporary Dummy Credentials
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live pipeline syncing. Auto-refreshes when leads submit on the public brochure.
          </p>
        </div>

        {/* Refresh Button & Count */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh database records"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {demoRequests.length} Total
          </span>
        </div>
      </div>

      {/* Target WhatsApp Routing Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Incoming Brochure Demo Bookings are routed to WhatsApp: <strong className="font-mono font-bold text-emerald-950">{integrationSettings.demoWhatsappNumber || '+1 (555) 019-2831'}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 font-semibold flex items-center space-x-1">
            <Radio className="w-3 h-3 text-emerald-600 inline" />
            <span>Real-time SSE Active</span>
          </span>
          <span className="text-[10px] text-slate-500">
            Configurable in Integrations tab
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, contact, email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({demoRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('credential_created')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'credential_created'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Credentials Active ({activeCredCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-3 px-3">Company & Contact</th>
              <th className="py-3 px-3">Contact Details</th>
              <th className="py-3 px-3">Team Size & Needs</th>
              <th className="py-3 px-3">Submitted At</th>
              <th className="py-3 px-3">Dummy Credential Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">No demo requests found</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {searchQuery
                      ? 'No results match your search query.'
                      : 'When potential clients request a demo on the brochure, they appear here in real time.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const hasCred = !!req.dummyCredential;
                const isActive = req.dummyCredential?.isActive;
                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{req.companyName}</div>
                      <div className="text-slate-500 text-[11px]">{req.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-mono text-[11px]">{req.email}</div>
                      <div className="text-emerald-700 font-medium text-[11px] flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3 text-emerald-600 inline shrink-0" />
                        <span>{req.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold mb-1">
                        {req.teamSize}
                      </span>
                      <p className="text-slate-500 text-[11px] line-clamp-2">
                        {req.requirements || 'Standard enterprise demo evaluation'}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {req.submittedAt}
                    </td>
                    <td className="py-3 px-3">
                      {hasCred ? (
                        <div>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{isActive ? 'Active Dummy Credential' : 'Deactivated'}</span>
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            Pass: <span className="font-bold text-slate-700">{req.dummyCredential?.temporaryPassword}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Expires: {req.dummyCredential?.expiresAt}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          Pending Dummy Key
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {!hasCred ? (
                          <button
                            onClick={() => onOpenCreateCredential(req)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-2xs cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Create Dummy Key</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleDummyCredentialStatus(req.id, !isActive)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                isActive
                                  ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                                  : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                            {isActive && (
                              <button
                                onClick={() => quickSwitchRole('client')}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                                title="Test Demo Client View"
                              >
                                Test Portal
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete demo request from ${req.companyName}?`)) {
                              deleteDemoRequest(req.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
  );
};
