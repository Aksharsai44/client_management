import React from 'react';
import { CompanySettings } from '../../types';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface CompanySettingsTabProps {
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
}

export const CompanySettingsTab: React.FC<CompanySettingsTabProps> = ({
  companySettings,
  updateCompanySettings,
}) => {
  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Company Administration Settings
        </h2>
        <p className="text-xs text-slate-500">
          Configure communication toggles, alert channels, universal default credentials, and batch sub-admins.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggle 1: Chat with Users */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Chat with Users & Clients</h4>
            <p className="text-xs text-slate-500">
              Allow clients and employees to chat with one another and the company admin.
            </p>
          </div>
          <button
            onClick={() =>
              updateCompanySettings({
                allowChatWithUsers: !companySettings.allowChatWithUsers,
              })
            }
          >
            {companySettings.allowChatWithUsers ? (
              <ToggleRight className="w-7 h-7 text-emerald-600 cursor-pointer" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-400 cursor-pointer" />
            )}
          </button>
        </div>

        {/* Toggle 2: WhatsApp Alerts */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs">WhatsApp Alert System</h4>
            <p className="text-xs text-slate-500">
              Automated meeting and reminder dispatch to clients&apos; WhatsApp numbers.
            </p>
          </div>
          <button
            onClick={() =>
              updateCompanySettings({
                whatsappAlertsEnabled: !companySettings.whatsappAlertsEnabled,
              })
            }
          >
            {companySettings.whatsappAlertsEnabled ? (
              <ToggleRight className="w-7 h-7 text-emerald-600 cursor-pointer" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-400 cursor-pointer" />
            )}
          </button>
        </div>

        {/* Toggle 3: Email Alerts */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Email Alert System</h4>
            <p className="text-xs text-slate-500">
              Instant email delivery for schedule changes and uploaded reports.
            </p>
          </div>
          <button
            onClick={() =>
              updateCompanySettings({
                emailAlertsEnabled: !companySettings.emailAlertsEnabled,
              })
            }
          >
            {companySettings.emailAlertsEnabled ? (
              <ToggleRight className="w-7 h-7 text-blue-600 cursor-pointer" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-400 cursor-pointer" />
            )}
          </button>
        </div>

        {/* Universal Default Password */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs">
            Universal Default Password for New Users
          </h4>
          <p className="text-xs text-slate-500">
            Assigned automatically when clients or work employees are created manually or imported via CSV.
          </p>
          <input
            type="text"
            value={companySettings.universalDefaultPassword}
            onChange={(e) =>
              updateCompanySettings({ universalDefaultPassword: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
