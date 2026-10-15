import React, { useState } from 'react';
import { ClientCompany } from '../../../types';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Add Client Company to Batch</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
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
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              placeholder="e.g. Apex Global Logistics"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Contact Name</label>
              <input
                type="text"
                required
                value={clientForm.clientName}
                onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                placeholder="e.g. Rachel Green"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="rachel@apex.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
            <input
              type="text"
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={2}
              value={clientForm.description}
              onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
              placeholder="Primary stakeholder requirements..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Create Client Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
