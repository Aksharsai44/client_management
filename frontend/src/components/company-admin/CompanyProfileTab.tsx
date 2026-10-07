import React from 'react';
import { User, Batch } from '../../types';

interface CompanyProfileTabProps {
  currentUser: User;
  batches: Batch[];
}

export const CompanyProfileTab: React.FC<CompanyProfileTabProps> = ({
  currentUser,
  batches,
}) => {
  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
      <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
        <img
          src={
            currentUser.avatar ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          }
          alt={currentUser.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
        />
        <div>
          <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {currentUser.companyName || 'Acme Solutions'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Designation</span>
          <span className="font-semibold text-slate-800">
            {currentUser.designation || 'Company Director'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Contact Phone</span>
          <span className="font-semibold text-slate-800">
            {currentUser.phone || '+1 (555) 302-8811'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Assigned Batches</span>
          <span className="font-semibold text-slate-800">
            {batches.map((b) => b.code).join(', ')}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Account Status</span>
          <span className="font-bold text-emerald-600">Active & Verified</span>
        </div>
      </div>
    </div>
  );
};
