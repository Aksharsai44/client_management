import React, { useState, useEffect } from 'react';
import { User, CompanySettings, ClientCompany } from '../../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Omit<User, 'id'>) => void;
  activeBatchId: string;
  companySettings: CompanySettings;
  clientCompanies?: ClientCompany[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeBatchId,
  companySettings,
  clientCompanies = [],
}) => {
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'client' as 'client' | 'work_user',
    designation: '',
    phone: '',
    companyName: clientCompanies.length > 0 ? clientCompanies[0].name : '',
    password: companySettings?.universalDefaultPassword || 'Pass#2026',
  });

  useEffect(() => {
    if (clientCompanies.length > 0 && !userForm.companyName) {
      setUserForm((prev) => ({ ...prev, companyName: clientCompanies[0].name }));
    }
  }, [clientCompanies]);

  if (!isOpen) return null;

  const selectedClient = clientCompanies.find((c) => c.name === userForm.companyName);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Add User Manually</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd({
              name: userForm.name,
              email: userForm.email,
              role: userForm.role,
              designation: userForm.designation,
              phone: userForm.phone,
              companyName: userForm.companyName,
              companyId: selectedClient?.companyId || '',
              password: userForm.password || companySettings.universalDefaultPassword || 'Pass#2026',
              batchIds: [activeBatchId || 'batch_alpha'],
              status: 'active',
            });
            onClose();
            setUserForm({
              name: '',
              email: '',
              role: 'client',
              designation: '',
              phone: '',
              companyName: clientCompanies.length > 0 ? clientCompanies[0].name : '',
              password: companySettings?.universalDefaultPassword || 'Pass#2026',
            });
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">User Name</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="e.g. Leo Vance"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email ID (Login Username)
            </label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="leo.vance@company.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">User Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
              >
                <option value="client">Client</option>
                <option value="work_user">Work Employee (Worker)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={userForm.designation}
                onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                placeholder="e.g. Lead Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Associated Client Organization Dropdown */}
          {clientCompanies.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Associated Client Organization
              </label>
              <select
                value={userForm.companyName}
                onChange={(e) => setUserForm({ ...userForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
              >
                {clientCompanies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.clientName ? `(${c.clientName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="text"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Password"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            Assigned Universal Password:{' '}
            <span className="font-mono font-bold text-slate-900">
              {userForm.password || companySettings.universalDefaultPassword}
            </span>
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
