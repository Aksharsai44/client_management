import React, { useState, useEffect } from 'react';
import { CompanyAdminMetric } from '../../../types';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Layers,
  HardDrive,
  MessageSquare,
  Bell,
  X,
  Save,
  CheckCircle2,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatUniversalPrice } from '../../../utils/currency';

const generateSecurePassword = () => 'OrgPass#' + Math.floor(1000 + Math.random() * 9000);

interface EditCompanyModalProps {
  company: CompanyAdminMetric | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: CompanyAdminMetric) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  company,
  isOpen,
  onClose,
  onSave,
}) => {
  const { pricingPlans, selectedCurrency } = useApp();
  const [formData, setFormData] = useState<Partial<CompanyAdminMetric>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        password: company.password || 'Acme@123',
        phone: company.phone || '+1 (555) 000-0000',
        website: company.website || 'https://omnisuite.io',
        industry: company.industry || 'Enterprise Software & Logistics',
        tier: company.tier || 'Enterprise',
        status: company.status || 'active',
      });
      setError(null);
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      setError('Please provide a valid company name.');
      return;
    }
    if (!formData.adminName?.trim()) {
      setError('Please enter the primary administrator name.');
      return;
    }
    if (!formData.adminEmail?.trim() || !formData.adminEmail.includes('@')) {
      setError('Please enter a valid administrator work email.');
      return;
    }

    onSave({
      ...company,
      companyName: formData.companyName.trim(),
      adminName: formData.adminName.trim(),
      adminEmail: formData.adminEmail.trim(),
      password: formData.password?.trim() || company.password,
      phone: formData.phone?.trim() || '+1 (555) 000-0000',
      website: formData.website?.trim() || 'https://omnisuite.io',
      industry: formData.industry || 'Enterprise Software & Logistics',
      tier: formData.tier || 'Enterprise',
      status: formData.status || 'active',
      storageUsedMb: Number(formData.storageUsedMb) || company.storageUsedMb,
      whatsappEnabled: formData.whatsappEnabled ?? company.whatsappEnabled,
      emailEnabled: formData.emailEnabled ?? company.emailEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Edit Company Organization
              </h3>
              <p className="text-xs text-slate-500">
                Update enterprise profile, administrator contact, and subscription tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Company Organization Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Admin Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Administrator Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.adminName || ''}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Admin Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Work Email *</span>
              </label>
              <input
                type="email"
                required
                value={formData.adminEmail || ''}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Admin Password & Password Generator */}
            <div className="sm:col-span-2 space-y-1.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Login Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, password: generateSecurePassword() }))}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                  title="Generate a fresh secure random password"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                  <span>Generate Password</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="e.g. OrgPass#4921"
                  className="w-full pl-3 pr-20 py-2 text-xs font-mono font-bold tracking-wider border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-2xs"
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.password) {
                        navigator.clipboard.writeText(formData.password);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy password to clipboard"
                  >
                    {copiedPassword ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Updating this will change the password used by this organization administrator to access their tenant.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website URL</span>
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Industry / Sector</span>
              </label>
              <input
                type="text"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Enterprise Cloud Logistics"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Tier - Synced with Pricing & Plans */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subscription Plan Tier</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Synced
                </span>
              </div>
              <select
                value={formData.tier || 'Enterprise'}
                onChange={(e) => {
                  const nextTier = e.target.value;
                  const matchedPlan = pricingPlans.find((p) => p.name === nextTier);
                  setFormData({
                    ...formData,
                    tier: nextTier,
                    whatsappEnabled: matchedPlan ? matchedPlan.whatsAppIntegration : formData.whatsappEnabled,
                    emailEnabled: matchedPlan ? matchedPlan.emailAlerts : formData.emailEnabled,
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                {pricingPlans.map((plan) => {
                  const priceInfo = formatUniversalPrice(
                    plan.monthlyPrice,
                    selectedCurrency,
                    plan.currency || 'INR'
                  );
                  return (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} Tier &bull; {priceInfo.formatted}/mo (Max {plan.maxUsers} Users &bull; {plan.maxClients} Clients)
                    </option>
                  );
                })}
                {!pricingPlans.some((p) => p.name.toLowerCase() === (formData.tier || '').toLowerCase()) && formData.tier && (
                  <option value={formData.tier}>{formData.tier} Tier (Custom)</option>
                )}
                {pricingPlans.length === 0 && (
                  <>
                    <option value="Enterprise">Enterprise Tier</option>
                    <option value="Growth">Growth Tier</option>
                    <option value="Starter">Starter Tier</option>
                  </>
                )}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Tenant Status</span>
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                <option value="active">Active (Access Enabled)</option>
                <option value="paused">Paused (Access Temporarily Suspended)</option>
              </select>
            </div>

            {/* Storage Quota */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Storage Utilization (MB)</span>
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={formData.storageUsedMb ?? 100}
                onChange={(e) => setFormData({ ...formData, storageUsedMb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Integration Flags */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Channel Integrations
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.whatsappEnabled ?? true}
                  onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Alerts Enabled</span>
                </span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.emailEnabled ?? true}
                  onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center space-x-1">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Notifications Enabled</span>
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
