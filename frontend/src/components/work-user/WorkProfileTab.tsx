import React from 'react';
import { User, Batch } from '../../types';

interface WorkProfileTabProps {
  currentUser: User;
  batches: Batch[];
}

export const WorkProfileTab: React.FC<WorkProfileTabProps> = ({
  currentUser,
  batches,
}) => {
  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
      <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
        <img
          src={
            currentUser.avatar ||
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
          }
          alt={currentUser.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
        />
        <div>
          <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase mt-1 inline-block">
            Employee Contributor &bull; {currentUser.companyName}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Designation</span>
          <span className="font-semibold text-slate-800">
            {currentUser.designation || 'Lead Architect'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Organization</span>
          <span className="font-semibold text-slate-800">{currentUser.companyName}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500">Active Batches</span>
          <span className="font-semibold text-slate-800">
            {batches.map((b) => b.name).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};
