import React, { useState } from 'react';
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
  CheckCircle2,
} from 'lucide-react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (company: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    phone?: string;
    website?: string;
    industry?: string;
    tier?: 'Starter' | 'Growth' | 'Enterprise';
    status?: 'active' | 'paused';
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    storageUsedMb?: number;
  }) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    website: '',
    industry: 'Enterprise Software & Logistics',
    tier: 'Enterprise' as 'Starter' | 'Growth' | 'Enterprise',
    status: 'active' as 'active' | 'paused',
    storageUsedMb: 150,
    whatsappEnabled: true,
    emailEnabled: true,
  });

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('Please provide a valid company name.');
      return;
    }
    if (!formData.adminName.trim()) {
      setError('Please enter the primary administrator name.');
      return;
    }
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setError('Please enter a valid administrator work email.');
      return;
    }

    onAdd({
      companyName: formData.companyName.trim(),
      adminName: formData.adminName.trim(),
      adminEmail: formData.adminEmail.trim(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      website: formData.website.trim() || 'https://omnisuite.io',
      industry: formData.industry,
      tier: formData.tier,
      status: formData.status,
      storageUsedMb: Number(formData.storageUsedMb) || 100,
      whatsappEnabled: formData.whatsappEnabled,
      emailEnabled: formData.emailEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Add Company Organization
              </h3>
              <p className="text-xs text-slate-500">
                Provision a new enterprise tenant and assign lead admin credentials
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
                placeholder="e.g. Apex Global Logistics Inc."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
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
                placeholder="e.g. Rachel Adams"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
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
                placeholder="admin@company.com"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
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
                placeholder="https://company.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Industry / Sector</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              >
                <option value="Enterprise Cloud Logistics & Supply">Enterprise Cloud Logistics & Supply</option>
                <option value="Healthcare AI & Clinical Telemetry">Healthcare AI & Clinical Telemetry</option>
                <option value="FinTech & Algorithmic Banking">FinTech & Algorithmic Banking</option>
                <option value="SaaS & Developer Platform">SaaS & Developer Platform</option>
                <option value="Cybersecurity & Zero-Trust Governance">Cybersecurity & Zero-Trust Governance</option>
                <option value="Digital Media & Creative Agency">Digital Media & Creative Agency</option>
              </select>
            </div>

            {/* Tier */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Subscription Plan Tier</span>
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              >
                <option value="Starter">Starter Tier (Up to 15 users, 2 batches)</option>
                <option value="Growth">Growth Tier (Up to 50 users, 5 batches)</option>
                <option value="Enterprise">Enterprise Tier (Unlimited scale & AI features)</option>
              </select>
            </div>

            {/* Initial Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Tenant Initial Status</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              >
                <option value="active">Active (Access Enabled)</option>
                <option value="paused">Paused (Access Temporarily Suspended)</option>
              </select>
            </div>

            {/* Initial Storage Quota */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Allocated Storage (MB)</span>
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={formData.storageUsedMb}
                onChange={(e) => setFormData({ ...formData, storageUsedMb: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Integration Flags */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Default Channel Integrations
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.whatsappEnabled}
                  onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Alerts</span>
                </span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.emailEnabled}
                  onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center space-x-1">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Notifications</span>
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>Create Company Organization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
