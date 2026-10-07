import React from 'react';
import { CompanyAdminMetric } from '../../../types';

interface CompanyMetricsModalProps {
  selectedCompanyMetric: CompanyAdminMetric;
  onClose: () => void;
}

export const CompanyMetricsModal: React.FC<CompanyMetricsModalProps> = ({
  selectedCompanyMetric,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Company Admin Metrics
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedCompanyMetric.companyName}
            </h3>
            <p className="text-xs text-slate-500">
              Lead Admin: {selectedCompanyMetric.adminName} ({selectedCompanyMetric.adminEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl text-center">
            <span className="text-2xl font-black text-blue-900">
              {selectedCompanyMetric.totalClients}
            </span>
            <p className="text-xs text-blue-700 font-semibold mt-0.5">Total Clients</p>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-xl text-center">
            <span className="text-2xl font-black text-indigo-900">
              {selectedCompanyMetric.totalUsers}
            </span>
            <p className="text-xs text-indigo-700 font-semibold mt-0.5">
              Total Users (Workers + Clients)
            </p>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl text-center">
            <span className="text-2xl font-black text-purple-900">
              {selectedCompanyMetric.totalBatches}
            </span>
            <p className="text-xs text-purple-700 font-semibold mt-0.5">Active Batches</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-center">
            <span className="text-2xl font-black text-emerald-900">
              {selectedCompanyMetric.activeMeetingsCount}
            </span>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Scheduled Calls</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Storage Utilization:</span>
            <span className="font-bold text-slate-800">
              {selectedCompanyMetric.storageUsedMb} MB
            </span>
          </div>
          <div className="flex justify-between">
            <span>WhatsApp Integration:</span>
            <span className="font-bold text-emerald-600">
              {selectedCompanyMetric.whatsappEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Email Notifications:</span>
            <span className="font-bold text-blue-600">
              {selectedCompanyMetric.emailEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Close Metrics
          </button>
        </div>
      </div>
    </div>
  );
};
