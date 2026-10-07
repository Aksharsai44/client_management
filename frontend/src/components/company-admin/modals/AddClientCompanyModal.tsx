import React, { useState } from 'react';
import { ClientCompany } from '../../../types';
import { Building2, User, Mail, Phone, Globe, FileText, X } from 'lucide-react';

interface AddClientCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clientCompany: Omit<ClientCompany, 'id' | 'createdAt'>) => void;
  activeBatchId: string;
}

export const AddClientCompanyModal: React.FC<AddClientCompanyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeBatchId,
}) => {
  const [clientForm, setClientForm] = useState({
    name: '',
    clientName: '',
    email: '',
    phone: '',
    description: '',
    websiteUrl: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Add Client Organization</h3>
              <p className="text-xs text-slate-500">Onboard a client organization to the active batch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd({
              name: clientForm.name,
              clientName: clientForm.clientName,
              email: clientForm.email,
              phone: clientForm.phone,
              description: clientForm.description,
              websiteUrl: clientForm.websiteUrl,
              documents: [{ name: 'Onboarding_Agreement.pdf', url: '#', size: '1.8 MB' }],
              batchId: activeBatchId,
              status: 'active',
            });
            onClose();
            setClientForm({
              name: '',
              clientName: '',
              email: '',
              phone: '',
              description: '',
              websiteUrl: '',
            });
          }}
          className="space-y-4"
        >
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Company / Organization Name</span>
            </label>
            <input
              type="text"
              required
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              placeholder="e.g. Apex Global Logistics"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Contact Person & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Contact Person</span>
              </label>
              <input
                type="text"
                required
                value={clientForm.clientName}
                onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                placeholder="e.g. Rachel Green"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                required
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="rachel@apex.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone / WhatsApp</span>
              </label>
              <input
                type="text"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website / Portal URL</span>
              </label>
              <input
                type="url"
                value={clientForm.websiteUrl}
                onChange={(e) => setClientForm({ ...clientForm, websiteUrl: e.target.value })}
                placeholder="https://apexlogistics.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Description & Scope</span>
            </label>
            <textarea
              rows={2}
              value={clientForm.description}
              onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
              placeholder="Primary stakeholder requirements and scope..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Add Client Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
