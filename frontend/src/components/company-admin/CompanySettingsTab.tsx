import React, { useState, useEffect } from 'react';
import { CompanySettings } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ToggleLeft,
  ToggleRight,
  Shield,
  Save,
  Check,
  Copy,
  Radio,
  MessageSquare,
  Mail,
  RefreshCw,
  Database,
  Sparkles,
  Eye,
  EyeOff,
  Key,
  Server,
  Activity,
  Building2,
} from 'lucide-react';

interface CompanySettingsTabProps {
  companySettings?: CompanySettings;
  updateCompanySettings?: (settings: Partial<CompanySettings>, targetCompanyId?: string) => Promise<void> | void;
}

export const CompanySettingsTab: React.FC<CompanySettingsTabProps> = ({
  companySettings: propCompanySettings,
  updateCompanySettings: propUpdateCompanySettings,
}) => {
  const context = useApp();
  const companySettings = propCompanySettings || context.companySettings;
  const updateCompanySettings = propUpdateCompanySettings || context.updateCompanySettings;
  const { refreshCompanySettings, currentUser, companyAdminMetrics } = context;

  const activeCompanyId =
    currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : 'default');

  const activeCompanyOrg = companyAdminMetrics.find(
    (c) => c.companyAdminId === activeCompanyId || c.companyName.toLowerCase().includes(activeCompanyId.toLowerCase())
  );

  const [passwordInput, setPasswordInput] = useState(
    companySettings.universalDefaultPassword || 'OmniDefault@2026'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  useEffect(() => {
    if (companySettings.universalDefaultPassword) {
      setPasswordInput(companySettings.universalDefaultPassword);
    }
  }, [companySettings.universalDefaultPassword]);

  const showFeedback = (msg: string) => {
    setLastActionMessage(msg);
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setLastActionMessage(null), 3500);
  };

  const handleSavePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) return;
    await updateCompanySettings({ universalDefaultPassword: passwordInput.trim() }, activeCompanyId);
    setPasswordSaved(true);
    showFeedback('Universal default password saved and synced in real time.');
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordInput);
    setPasswordCopied(true);
    showFeedback('Password copied to clipboard.');
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let generated = 'Omni@';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordInput(generated);
    showFeedback('New secure password generated. Click "Save Password" to apply.');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCompanySettings(activeCompanyId);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showFeedback('Settings re-synchronized successfully in real time.');
    } catch {
      showFeedback('Refresh failed. Please check connection.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  return (
    <div className="max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Company Administration Settings
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time synchronization for company communication toggles, alert dispatches, and universal user security credentials.
          </p>
          {activeCompanyOrg && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                {activeCompanyOrg.companyName} ({activeCompanyId})
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Admin: {activeCompanyOrg.adminEmail}</span>
            </div>
          )}
        </div>

        {/* Real-Time Live Status Pill & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-60"
            title="Sync latest settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="font-semibold">{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[11px] font-medium hidden md:inline">SSE Bus Active</span>
            <span className="text-[10px] text-slate-400">({lastSyncedTime})</span>
          </div>
        </div>
      </div>

      {/* Real-time sync feedback banner */}
      {lastActionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{lastActionMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Real-Time DB Sync</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Toggle 1: Chat with Users */}
        <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 sm:mt-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">Chat with Users & Clients</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    companySettings.allowChatWithUsers
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {companySettings.allowChatWithUsers ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls team chat channels across clients, company employees, and admins. Changes reflect instantly in navigation menus.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const nextVal = !companySettings.allowChatWithUsers;
              await updateCompanySettings({ allowChatWithUsers: nextVal }, activeCompanyId);
              showFeedback(`Chat feature ${nextVal ? 'enabled' : 'disabled'} and saved successfully.`);
            }}
            className="cursor-pointer focus:outline-hidden p-1.5 transition-transform hover:scale-105 shrink-0"
            title={companySettings.allowChatWithUsers ? 'Disable Chat' : 'Enable Chat'}
          >
            {companySettings.allowChatWithUsers ? (
              <ToggleRight className="w-8 h-8 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>

        {/* Toggle 2: WhatsApp Alerts */}
        <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 sm:mt-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">WhatsApp Alert System</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    companySettings.whatsappAlertsEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {companySettings.whatsappAlertsEnabled ? 'Live Routing' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated meeting reminders, invoice alerts, and schedule changes dispatched directly via WhatsApp API.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const nextVal = !companySettings.whatsappAlertsEnabled;
              await updateCompanySettings({ whatsappAlertsEnabled: nextVal }, activeCompanyId);
              showFeedback(`WhatsApp alerts ${nextVal ? 'enabled' : 'disabled'} and saved successfully.`);
            }}
            className="cursor-pointer focus:outline-hidden p-1.5 transition-transform hover:scale-105 shrink-0"
            title={companySettings.whatsappAlertsEnabled ? 'Disable WhatsApp Alerts' : 'Enable WhatsApp Alerts'}
          >
            {companySettings.whatsappAlertsEnabled ? (
              <ToggleRight className="w-8 h-8 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>

        {/* Toggle 3: Email Alerts */}
        <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 sm:mt-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">Email Alert System</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    companySettings.emailAlertsEnabled
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {companySettings.emailAlertsEnabled ? 'Active' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant transactional emails for schedule modifications, report releases, and deliverable review reminders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const nextVal = !companySettings.emailAlertsEnabled;
              await updateCompanySettings({ emailAlertsEnabled: nextVal }, activeCompanyId);
              showFeedback(`Email alerts ${nextVal ? 'enabled' : 'disabled'} and saved successfully.`);
            }}
            className="cursor-pointer focus:outline-hidden p-1.5 transition-transform hover:scale-105 shrink-0"
            title={companySettings.emailAlertsEnabled ? 'Disable Email Alerts' : 'Enable Email Alerts'}
          >
            {companySettings.emailAlertsEnabled ? (
              <ToggleRight className="w-8 h-8 text-blue-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>

        {/* Universal Default Password Section */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Universal Default Password for New Users
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned automatically when client accounts or employees are created manually or imported via CSV files.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePassword}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Generate a secure random password"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate</span>
            </button>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordSaved(false);
                  }}
                  placeholder="e.g. OmniDefault@2026"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                  title="Copy password to clipboard"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {passwordSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Saved values persist directly to the database.</span>
              <span className="text-slate-400">Length: {passwordInput.length} chars</span>
            </div>
          </form>
        </div>

        {/* Real-time Architecture Information Card */}
        <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-50 to-indigo-50/30 text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Real-Time Architecture Status</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Database REST API</span>
              <span className="font-mono text-slate-800 font-semibold">/api/settings/company/</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Live Event Stream</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SSE company_settings_updated
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cross-Tab Event Channel</span>
              <span className="font-mono text-slate-800 font-semibold">client_mgmt_settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
