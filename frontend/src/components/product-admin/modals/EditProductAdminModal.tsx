import React, { useState, useEffect } from 'react';
import { User, CompanyAdminMetric } from '../../../types';
import { ShieldCheck, User as UserIcon, Mail, Phone, Briefcase, CheckSquare, X, Save, Key, Eye, EyeOff } from 'lucide-react';

interface EditProductAdminModalProps {
  admin: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: User) => void;
  companyAdminMetrics: CompanyAdminMetric[];
}

export const EditProductAdminModal: React.FC<EditProductAdminModalProps> = ({
  admin,
  isOpen,
  onClose,
  onSave,
  companyAdminMetrics,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'product_admin' | 'product_super_admin'>('product_admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [assignedCompanies, setAssignedCompanies] = useState<string[]>([]);

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
      setRole((admin.role as 'product_admin' | 'product_super_admin') || 'product_admin');
      setPassword(admin.password || 'AdminPass#2026');
      setPhone(admin.phone || '');
      setDesignation(admin.designation || 'Product Administrator');
      setStatus(admin.status || 'active');
      setAssignedCompanies(admin.assignedCompanyAdminIds || []);
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const isSuperAdminUser = role === 'product_super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...admin,
      name,
      email,
      role,
      password,
      phone,
      designation,
      status,
      assignedCompanyAdminIds: isSuperAdminUser ? [] : assignedCompanies,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Edit Product Administrator
              </h3>
              <p className="text-xs text-slate-500">
                Update account credentials and delegated company admin scopes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admin Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {!isSuperAdminUser && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Login Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="AdminPass#1234"
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 700-1122"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Product Administrator"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Administrator Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'product_admin' | 'product_super_admin')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium cursor-pointer"
              >
                <option value="product_admin">Product Admin (Scoped)</option>
                <option value="product_super_admin">Product Super Admin (Global)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium cursor-pointer"
              >
                <option value="active">Active (Access Enabled)</option>
                <option value="inactive">Inactive (Access Suspended)</option>
              </select>
            </div>
          </div>

          {isSuperAdminUser ? (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold block">Global Platform Permissions</span>
                <span className="text-[11px] text-purple-700">
                  This user has unrestricted access to all company tenants, pricing plans, and integrations.
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">
                  Assigned Company Admins (Visible Scope)
                </label>
                <div className="space-x-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedCompanies(companyAdminMetrics.map((c) => c.companyAdminId))
                    }
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setAssignedCompanies([])}
                    className="text-slate-500 font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {companyAdminMetrics.map((comp) => {
                  const isChecked = assignedCompanies.includes(comp.companyAdminId);
                  return (
                    <label
                      key={comp.companyAdminId}
                      className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-white text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedCompanies([...assignedCompanies, comp.companyAdminId]);
                          } else {
                            setAssignedCompanies(
                              assignedCompanies.filter((id) => id !== comp.companyAdminId)
                            );
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-800">
                        {comp.companyName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({comp.adminName})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
