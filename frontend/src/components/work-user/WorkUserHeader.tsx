import React from 'react';
import { Layers } from 'lucide-react';
import { Batch, User } from '../../types';

interface WorkUserHeaderProps {
  currentBatch: Batch;
  currentUser: User;
  userBatches: Batch[];
  activeBatchId: string;
  setActiveBatchId: (id: string) => void;
}

export const WorkUserHeader: React.FC<WorkUserHeaderProps> = ({
  currentBatch,
  currentUser,
  userBatches,
  activeBatchId,
  setActiveBatchId,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {currentBatch.name}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
              {currentBatch.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Work Workspace &bull; {currentUser.designation || 'Engineer & Contributor'}
          </p>
        </div>
      </div>

      {/* Batch Switcher */}
      {userBatches.length > 1 && (
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 pl-2">Assigned Groups:</span>
          <select
            value={activeBatchId}
            onChange={(e) => setActiveBatchId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
          >
            {userBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
