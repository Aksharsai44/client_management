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
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginUser,
    users,
    quickSwitchRole,
    setCurrentView,
    demoRequests,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Corporate Email or User ID' });
      return;
    }
    if (!password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await loginUser(identifier, password);
      if (!result.success) {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDemoCredentials = demoRequests.filter(
    (d) => d.dummyCredential && d.dummyCredential.isActive
  );

  // Get dynamic sample accounts from active database users
  const latestClientUser = users.find((u) => u.role === 'client');
  const latestWorkerUser = users.find((u) => u.role === 'work_user');
  const latestCompanyAdmin = users.find((u) => u.role === 'company_admin');

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
          Sign in with your Email or User ID to access your role-specific dashboard
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
                Corporate Email Address or User ID
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. name@company.com or user_179189..."
                  className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {identifier.toLowerCase().includes('admin') && !identifier.toLowerCase().includes('comp')
                    ? 'Product Admin: Password from .env required'
                    : 'Default: OmniDefault@2026'}
                </span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Persona Switcher for Immediate Review */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Persona Login Simulator
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const adminUsername =
                    import.meta.env.VITE_PRODUCT_ADMIN_USERNAME ||
                    'admin@product.com';
                  setIdentifier(adminUsername);
                  setPassword('');
                  setStatusMessage({
                    type: 'error',
                    text: 'Product Admin is password-protected. Enter the password configured in .env to sign in.',
                  });
                }}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-colors cursor-pointer"
                title="Autofill Product Admin username"
              >
                <div className="flex items-center justify-between text-purple-700 font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Product Admin</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-900">
                    .env Protected
                  </span>
                </div>
                <div className="text-[10px] text-purple-600 truncate mt-0.5 font-mono">
                  {import.meta.env.VITE_PRODUCT_ADMIN_USERNAME || 'admin@product.com'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier(latestCompanyAdmin?.email || 'admin@acmecorp.com');
                  setPassword('Acme@123');
                }}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-colors cursor-pointer"
                title="Autofill Company Admin credentials"
              >
                <div className="flex items-center justify-between text-blue-700 font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Company Admin</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                    Autofill
                  </span>
                </div>
                <div className="text-[10px] text-blue-600 truncate mt-0.5 font-mono">
                  {latestCompanyAdmin?.email || 'admin@acmecorp.com'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier(latestClientUser?.email || latestClientUser?.id || 'john@gmail.com');
                  setPassword(latestClientUser?.password || 'OmniDefault@2026');
                }}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
                title="Autofill Client Portal credentials"
              >
                <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Client Portal</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    Autofill
                  </span>
                </div>
                <div className="text-[10px] text-emerald-600 truncate mt-0.5 font-mono">
                  {latestClientUser?.email || 'john@gmail.com'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier(latestWorkerUser?.email || latestWorkerUser?.id || 'raju@gmail.com');
                  setPassword(latestWorkerUser?.password || 'OmniDefault@2026');
                }}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors cursor-pointer"
                title="Autofill Worker Portal credentials"
              >
                <div className="flex items-center justify-between text-amber-700 font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Work User</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    Autofill
                  </span>
                </div>
                <div className="text-[10px] text-amber-600 truncate mt-0.5 font-mono">
                  {latestWorkerUser?.email || 'raju@gmail.com'}
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
                        setIdentifier(req.dummyCredential!.username);
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
