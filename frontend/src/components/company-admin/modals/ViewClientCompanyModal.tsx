import React from 'react';
import { ClientCompany } from '../../../types';
import { Building2, User, Mail, Phone, Globe, FileText, Calendar, Edit2, X, FileCheck, ExternalLink } from 'lucide-react';

interface ViewClientCompanyModalProps {
  viewingCompany: ClientCompany | null;
  onClose: () => void;
  onOpenEdit: (company: ClientCompany) => void;
}

export const ViewClientCompanyModal: React.FC<ViewClientCompanyModalProps> = ({
  viewingCompany,
  onClose,
  onOpenEdit,
}) => {
  if (!viewingCompany) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">{viewingCompany.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    viewingCompany.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {viewingCompany.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Client Organization Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs">
          {/* Primary Contact */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Primary Contact</span>
            </div>
            <span className="font-bold text-slate-900">{viewingCompany.clientName}</span>
          </div>

          {/* Email */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Contact Email</span>
            </div>
            <a
              href={`mailto:${viewingCompany.email}`}
              className="font-mono text-blue-600 hover:underline"
            >
              {viewingCompany.email}
            </a>
          </div>

          {/* Phone */}
          {viewingCompany.phone && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Phone / WhatsApp</span>
              </div>
              <span className="font-mono text-slate-800">{viewingCompany.phone}</span>
            </div>
          )}

          {/* Website / Portal */}
          {viewingCompany.websiteUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-600">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Portal / Website</span>
              </div>
              <a
                href={viewingCompany.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate max-w-[200px]"
              >
                <span>{viewingCompany.websiteUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Created Date */}
          {viewingCompany.createdAt && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Onboarded On</span>
              </div>
              <span className="font-semibold text-slate-800">{viewingCompany.createdAt}</span>
            </div>
          )}

          {/* Description */}
          {viewingCompany.description && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
                  Description & Scope
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">{viewingCompany.description}</p>
            </div>
          )}

          {/* Documents */}
          {viewingCompany.documents && viewingCompany.documents.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 block">
                Onboarding Documents ({viewingCompany.documents.length})
              </span>
              <div className="space-y-1.5">
                {viewingCompany.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-slate-800">{doc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEdit(viewingCompany);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Company</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
