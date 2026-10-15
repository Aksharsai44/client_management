import React, { useState, useEffect } from 'react';
import { CompanyAdminMetric } from '../../types';
import {
  ArrowLeft,
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
  CheckCircle2,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  Save,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatUniversalPrice } from '../../utils/currency';

const generateSecurePassword = () => 'OrgPass#' + Math.floor(1000 + Math.random() * 9000);

interface EditCompanyFullPageViewProps {
  company: CompanyAdminMetric;
  onBack: () => void;
  onSave: (company: CompanyAdminMetric) => void;
}

export const EditCompanyFullPageView: React.FC<EditCompanyFullPageViewProps> = ({
  company,
  onBack,
  onSave,
}) => {
  const { pricingPlans, selectedCurrency } = useApp();
  const [formData, setFormData] = useState<Partial<CompanyAdminMetric>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = pricingPlans.find(
    (p) => p.name.toLowerCase() === (formData.tier || '').toLowerCase()
  ) || (pricingPlans.length > 0 ? pricingPlans[0] : null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      setError('Please provide a valid company organization name.');
      return;
    }
    if (!formData.adminName?.trim()) {
      setError('Please enter the lead administrator name.');
      return;
    }
    if (!formData.adminEmail?.trim() || !formData.adminEmail.includes('@')) {
      setError('Please enter a valid administrator work email.');
      return;
    }
    if (!formData.password?.trim()) {
      setError('Please specify or generate an admin login password.');
      return;
    }

    onSave({
      ...company,
      companyName: formData.companyName.trim(),
      adminName: formData.adminName.trim(),
      adminEmail: formData.adminEmail.trim(),
      password: formData.password.trim(),
      phone: formData.phone?.trim() || '+1 (555) 000-0000',
      website: formData.website?.trim() || 'https://omnisuite.io',
      industry: formData.industry || 'Enterprise Software & Logistics',
      tier: formData.tier || 'Enterprise',
      status: formData.status || 'active',
      storageUsedMb: Number(formData.storageUsedMb) || company.storageUsedMb || 100,
      whatsappEnabled: formData.whatsappEnabled ?? company.whatsappEnabled ?? true,
      emailEnabled: formData.emailEnabled ?? company.emailEnabled ?? true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-500">Organizations</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">{company.companyName}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-blue-700">Edit Organization</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Full Page Tenant Editor</span>
          </span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Edit {company.companyName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-400/20 text-blue-300 border border-blue-400/30">
                  {formData.tier || 'Enterprise'} Tier
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/20">
                  {formData.status === 'paused' ? 'Paused' : 'Active'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Update enterprise profile details, administrator work email, login password, subscription tier, and channel integration controls.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between shadow-2xs">
          <span className="font-semibold">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 text-base"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Full Page Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Organization Profile & Lead Admin Credentials (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Company Profile */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Organization Profile & Identity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enterprise legal entity name, industry vertical, and primary web presence
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company Organization Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900 font-medium"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Industry / Sector</span>
                  </label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Enterprise Cloud Logistics"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
                  />
                </div>

                {/* Subscription Tier - Synced with Pricing & Plans */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Subscription Plan Tier</span>
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Live Synced with Pricing Plans
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
                    className="w-full px-3.5 py-2.5 text-xs border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-bold shadow-2xs cursor-pointer"
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

                  {/* Real-time Synced Plan Summary Card */}
                  {selectedPlan && (
                    <div className="p-3.5 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200 rounded-xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-blue-950 text-xs">
                            {selectedPlan.name} Plan
                          </span>
                          {selectedPlan.popular && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xs text-blue-950">
                            {
                              formatUniversalPrice(
                                selectedPlan.monthlyPrice,
                                selectedCurrency,
                                selectedPlan.currency || 'INR'
                              ).formatted
                            }
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold"> /month</span>
                        </div>
                      </div>

                      {selectedPlan.tagline && (
                        <p className="text-[11px] text-slate-600 italic">
                          &ldquo;{selectedPlan.tagline}&rdquo;
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-blue-100/80">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>Max <strong>{selectedPlan.maxUsers}</strong> Team Users</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Max <strong>{selectedPlan.maxClients}</strong> Client Orgs</span>
                        </div>
                      </div>

                      {selectedPlan.features && selectedPlan.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-blue-100/60">
                          {selectedPlan.features.slice(0, 4).map((f, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-blue-100 text-slate-700 font-medium"
                            >
                              ✓ {f}
                            </span>
                          ))}
                          {selectedPlan.features.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-500 font-medium">
                              +{selectedPlan.features.length - 4} more features
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Website URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Lead Administrator & Login Credentials */}
            <div className="bg-white border border-blue-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-blue-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Lead Administrator & Dedicated Login Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Administrator access credentials for this company's isolated tenant workspace
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admin Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead Administrator Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName || ''}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900 font-medium"
                  />
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Admin Work Email (Login ID) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail || ''}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900 font-mono font-medium"
                  />
                </div>

                {/* Password with Generator & Visibility Toggle */}
                <div className="sm:col-span-2 space-y-2 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Admin Login Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, password: generateSecurePassword() }))}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1.5 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                      title="Generate a fresh secure random password"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Generate Password</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. OrgPass#4921"
                      className="w-full pl-3.5 pr-24 py-2.5 text-xs font-mono font-bold tracking-wider border border-blue-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-2xs"
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
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Updating this password will allow this administrator to log into this tenant with their new credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Tenant Status, Quotas & Channel Controls (1 col) */}
          <div className="space-y-6">
            {/* Status & Storage Quota */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tenant State & Quota</h3>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Access Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900 font-medium"
                >
                  <option value="active">Active (Access Enabled)</option>
                  <option value="paused">Paused (Access Suspended)</option>
                </select>
              </div>

              {/* Storage Quota */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Allocated Storage (MB)</span>
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={formData.storageUsedMb ?? 100}
                  onChange={(e) => setFormData({ ...formData, storageUsedMb: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900"
                />
              </div>
            </div>

            {/* Channel Integrations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Channel Integrations</h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-xs text-slate-700 p-3 bg-slate-50/80 rounded-xl border border-slate-100 cursor-pointer select-none hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.whatsappEnabled ?? true}
                    onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold block text-slate-900">WhatsApp Alerts</span>
                      <span className="text-[10px] text-slate-500">Live booking & demo alerts</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 text-xs text-slate-700 p-3 bg-slate-50/80 rounded-xl border border-slate-100 cursor-pointer select-none hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled ?? true}
                    onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold block text-slate-900">Email Notifications</span>
                      <span className="text-[10px] text-slate-500">Automated event reports</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
