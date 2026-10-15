import React from 'react';
import { CompanyAdminMetric } from '../../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteCompanyModalProps {
  company: CompanyAdminMetric | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (companyAdminId: string) => void;
}

export const DeleteCompanyModal: React.FC<DeleteCompanyModalProps> = ({
  company,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Delete Company Organization
            </h3>
            <p className="text-xs text-slate-500">
              Confirm permanent removal of enterprise tenant
            </p>
          </div>
        </div>

        <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-900 space-y-2.5">
          <p className="text-sm font-bold text-red-950">
            Are you sure you want to delete this organization?
          </p>
          <div className="p-2.5 bg-white rounded-xl border border-red-200/80 space-y-1 text-slate-700">
            <p className="font-bold text-slate-900">
              {company.companyName}
            </p>
            <p className="text-[11px] text-slate-500">
              Lead Administrator: <span className="font-semibold text-slate-800">{company.adminName}</span> ({company.adminEmail})
            </p>
          </div>
          <p className="text-[11px] text-red-600 leading-relaxed">
            This action is permanent and will remove the organization tenant from the database.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(company.companyAdminId);
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
