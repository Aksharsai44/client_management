import React from 'react';
import { DemoRequest } from '../../types';
import {
  FileSpreadsheet,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  XCircle,
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
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Demo Requests & Temporary Dummy Credentials
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted requests from the brochure WhatsApp form. Generate dummy credentials, test login, or deactivate access.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          {demoRequests.length} Total Requests
        </span>
      </div>

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
            {demoRequests.map((req) => {
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
                      <MessageSquare className="w-3 h-3 text-emerald-600 inline" />
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
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-2xs"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Create Dummy Key</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleDummyCredentialStatus(req.id, !isActive)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
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
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                              title="Test Demo Client View"
                            >
                              Test Portal
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
