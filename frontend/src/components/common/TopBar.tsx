import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Layers,
  ChevronDown,
  Building,
  UserCheck,
  Briefcase,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    activeBatchId,
    batches,
    setCurrentView,
    logout,
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Available batches for current user
  const userBatches = batches.filter(
    (b) =>
      currentUser.role === 'product_super_admin' ||
      currentUser.role === 'product_admin' ||
      currentUser.role === 'company_admin' ||
      (currentUser.batchIds && currentUser.batchIds.includes(b.id))
  );

  const availableBatches = userBatches.length > 0 ? userBatches : batches;
  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'product_super_admin':
        return 'Product Super Admin';
      case 'product_admin':
        return 'Product Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'client':
        return 'Client Portal';
      case 'work_user':
        return 'Work User (Employee)';
      default:
        return 'User';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'product_super_admin':
      case 'product_admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'company_admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'client':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'work_user':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-750 border-gray-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Brand + User Type Badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div
          onClick={() => setCurrentView('brochure')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Back to Public Brochure"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-tight">
              Client Management
            </span>
            <span className="text-[10px] block font-bold uppercase tracking-wider text-blue-600">
              Workspace
            </span>
          </div>
        </div>

        {/* User Type Badge (Replacing former Active Batch selector) */}
        <div className="flex items-center pl-3 sm:pl-4 border-l border-slate-200">
          <div
            className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs ${getRoleBadgeColor(
              currentUser.role
            )}`}
          >
            {currentUser.role === 'product_super_admin' || currentUser.role === 'product_admin' ? (
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            ) : currentUser.role === 'company_admin' ? (
              <Building className="w-4 h-4 text-blue-600 shrink-0" />
            ) : currentUser.role === 'client' ? (
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Role:
            </span>
            <span className="font-extrabold text-xs whitespace-nowrap">
              {currentUser.role === 'product_super_admin'
                ? 'Product Super Admin'
                : currentUser.role === 'product_admin'
                ? 'Product Admin'
                : currentUser.role === 'company_admin'
                ? 'Company Admin'
                : currentUser.role === 'client'
                ? 'Client User'
                : 'Work User (Employee)'}
            </span>
            <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse hidden sm:inline-block" />
          </div>
        </div>
      </div>

      {/* Right Controls: Profile */}
      <div className="flex items-center space-x-3">

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 focus:outline-none"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getRoleBadgeColor(
                  currentUser.role
                )}`}
              >
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  {currentUser.companyName || 'Product Core'}
                </p>
              </div>

              <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Batch: </span>
                {activeBatch?.name || 'All Batches'}
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
