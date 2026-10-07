import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
  Building,
  UserCheck,
  Briefcase,
  KeyRound,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginUser,
    quickSwitchRole,
    setCurrentView,
    demoRequests,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    const result = loginUser(email, password);
    if (!result.success) {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const activeDemoCredentials = demoRequests.filter(
    (d) => d.dummyCredential && d.dummyCredential.isActive
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => setCurrentView('brochure')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Brochure</span>
        </button>

        <div className="flex items-center justify-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Client Management</h2>
            <span className="text-[10px] font-bold text-blue-600 block uppercase tracking-widest -mt-1">
              Workspace
            </span>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Sign in to access your role-specific dashboard & workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200">
          {statusMessage && (
            <div
              className={`mb-5 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: OmniDefault@2026</span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign In to Portal
            </button>
          </form>

          {/* Quick Persona Switcher for Immediate Review */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Persona Login Simulator
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickSwitchRole('product_super_admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-purple-700 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Product Admin</span>
                </div>
                <div className="text-[10px] text-purple-600 truncate mt-0.5">
                  superadmin@omnisuite.io
                </div>
              </button>

              <button
                onClick={() => quickSwitchRole('company_admin')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-xs">
                  <Building className="w-3.5 h-3.5" />
                  <span>Company Admin</span>
                </div>
                <div className="text-[10px] text-blue-600 truncate mt-0.5">
                  admin@acmecorp.com
                </div>
              </button>

              <button
                onClick={() => quickSwitchRole('client')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Client Portal</span>
                </div>
                <div className="text-[10px] text-emerald-600 truncate mt-0.5">
                  sarah.client@globex.com
                </div>
              </button>

              <button
                onClick={() => quickSwitchRole('work_user')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-xs">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work User</span>
                </div>
                <div className="text-[10px] text-amber-600 truncate mt-0.5">
                  alex.dev@acme.internal
                </div>
              </button>
            </div>
          </div>

          {/* Active Demo Credentials Section */}
          {activeDemoCredentials.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Demo Request Keys ({activeDemoCredentials.length})</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {activeDemoCredentials.map((req) => (
                  <div
                    key={req.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-slate-800 truncate">{req.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{req.dummyCredential?.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEmail(req.dummyCredential!.username);
                        setPassword(req.dummyCredential!.temporaryPassword);
                      }}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[10px] rounded transition-colors shrink-0"
                    >
                      Autofill Key
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
