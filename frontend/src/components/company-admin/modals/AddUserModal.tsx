import React, { useState } from 'react';
import { User, CompanySettings } from '../../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Omit<User, 'id'>) => void;
  activeBatchId: string;
  companySettings: CompanySettings;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeBatchId,
  companySettings,
}) => {
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'client' as 'client' | 'work_user',
    designation: '',
    phone: '',
  });

  if (!isOpen) return null;

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
              batchIds: [activeBatchId],
              status: 'active',
            });
            onClose();
            setUserForm({ name: '', email: '', role: 'client', designation: '', phone: '' });
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            Default Password will be assigned as:{' '}
            <span className="font-mono font-bold text-slate-900">
              {companySettings.universalDefaultPassword}
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
