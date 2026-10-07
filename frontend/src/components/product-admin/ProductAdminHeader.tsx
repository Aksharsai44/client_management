import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { User } from '../../types';

interface ProductAdminHeaderProps {
  currentUser: User;
  isSuperAdmin: boolean;
}

export const ProductAdminHeader: React.FC<ProductAdminHeaderProps> = ({
  currentUser,
  isSuperAdmin,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            {isSuperAdmin
              ? 'Product Super Admin Console'
              : 'Product Administrator (Delegated Scope)'}
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Product Admin Control Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage incoming demo requests, provision temporary credentials, monitor company admins, customize brochure pricing, and configure LLM API keys.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 font-medium">Logged in as</span>
          <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
          <span className="text-[10px] text-purple-600 font-semibold">{currentUser.email}</span>
        </div>
      </div>
    </div>
  );
};
