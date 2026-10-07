import React from 'react';
import { User, Batch } from '../../types';
import { Eye } from 'lucide-react';

interface ClientGroupTabProps {
  currentBatch: Batch;
  batchUsers: User[];
  onViewReport: (user: User) => void;
}

export const ClientGroupTab: React.FC<ClientGroupTabProps> = ({
  currentBatch,
  batchUsers,
  onViewReport,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Client Group & Batch Participants ({batchUsers.length})
        </h2>
        <p className="text-xs text-slate-500">
          Only members belonging to {currentBatch.name} are accessible in this view.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batchUsers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={
                    member.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{member.name}</h4>
                  <span className="text-[10px] text-slate-500 block">{member.email}</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 inline-block mt-1">
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewReport(member)}
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                title="View Attendance Report"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
