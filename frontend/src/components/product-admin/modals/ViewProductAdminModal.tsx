import React, { useState } from 'react';
import { User, CompanyAdminMetric } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import {
  ShieldCheck,
  Shield,
  X,
  Mail,
  Phone,
  Briefcase,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building,
  Edit,
  Calendar,
} from 'lucide-react';

interface ViewProductAdminModalProps {
  admin: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (admin: User) => void;
  companyAdminMetrics: CompanyAdminMetric[];
}

export const ViewProductAdminModal: React.FC<ViewProductAdminModalProps> = ({
  admin,
  isOpen,
  onClose,
  onEdit,
  companyAdminMetrics,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!isOpen || !admin) return null;

  const isSuper = admin.role === 'product_super_admin';
  const assignedIds = admin.assignedCompanyAdminIds || [];
  const assignedCompanies = companyAdminMetrics.filter((c) =>
    assignedIds.includes(c.companyAdminId)
  );

  const getPasswordText = () => {
    if (isSuper && !admin.password) return 'Admin@12345 (Default Super Admin)';
    return admin.password || 'AdminPass#2026';
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(admin.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(getPasswordText());
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Product Administrator Details
              </h3>
              <p className="text-xs text-slate-500">
                View profile credentials and delegated company tenant scope
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <UserAvatar name={admin.name} size="lg" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{admin.name}</h4>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <Briefcase className="w-3 h-3 text-slate-400" />
                <span>{admin.designation || 'Product Administrator'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isSuper
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {isSuper ? 'Super Admin' : 'Scoped Admin'}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                admin.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}
            >
              {admin.status === 'active' ? 'Active Account' : 'Inactive Account'}
            </span>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Account Credentials & Contact</span>
          </h5>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {/* Contact Email */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block mb-1 font-medium flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Contact Email</span>
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-900 font-semibold truncate">
                  {admin.email}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Password */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block mb-1 font-medium flex items-center space-x-1">
                <Key className="w-3 h-3" />
                <span>Login Password</span>
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-900 font-semibold">
                  {showPassword ? getPasswordText() : '••••••••••••'}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                    title="Copy password"
                  >
                    {copiedPassword ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block mb-1 font-medium flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>Phone Number</span>
              </span>
              <span className="text-xs text-slate-800 font-medium">
                {admin.phone || '+1 (555) 700-1122'}
              </span>
            </div>

            {/* Joined Date */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block mb-1 font-medium flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Joined Platform</span>
              </span>
              <span className="text-xs text-slate-800 font-medium">
                {admin.joinedDate || 'Recently Added'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Scope Section */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assigned Company Scope</span>
          </h5>

          {isSuper ? (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center space-x-3">
              <Shield className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold block">Global Platform Permissions</span>
                <span className="text-[11px] text-purple-700">
                  This Product Super Admin has unrestricted access to manage all company organizations, client batches, pricing customizers, and integrations.
                </span>
              </div>
            </div>
          ) : assignedCompanies.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs italic">
              No company organizations currently assigned to this administrator.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {assignedCompanies.map((comp) => (
                <div
                  key={comp.companyAdminId}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">{comp.companyName}</span>
                    <span className="text-slate-400 text-[11px]">({comp.adminName})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Tenant
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(admin);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Administrator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
