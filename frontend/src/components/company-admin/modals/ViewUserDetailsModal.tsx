import React from 'react';
import { User } from '../../../types';
import { Eye, Edit2 } from 'lucide-react';

interface ViewUserDetailsModalProps {
  viewingUser: User | null;
  onClose: () => void;
  currentBatchName: string;
  onOpenReport: (user: User) => void;
  onOpenEdit: (user: User) => void;
}

export const ViewUserDetailsModal: React.FC<ViewUserDetailsModalProps> = ({
  viewingUser,
  onClose,
  currentBatchName,
  onOpenReport,
  onOpenEdit,
}) => {
  if (!viewingUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <img
              src={
                viewingUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={viewingUser.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-300"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base">{viewingUser.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{viewingUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            &times;
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Role</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                viewingUser.role === 'client'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {viewingUser.role === 'client' ? 'Client Representative' : 'Work Employee'}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Designation</span>
            <span className="font-semibold text-slate-800">
              {viewingUser.designation || 'Specialist'}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Organization</span>
            <span className="font-semibold text-slate-800">
              {viewingUser.companyName || currentBatchName}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Contact Phone</span>
            <span className="font-mono text-slate-700">{viewingUser.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Joined Date</span>
            <span className="text-slate-700">{viewingUser.joinedDate || '2026-01-15'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Account Status</span>
            <span
              className={`font-bold capitalize ${
                viewingUser.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {viewingUser.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onOpenReport(viewingUser);
              onClose();
            }}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Attendance Report</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                onOpenEdit(viewingUser);
                onClose();
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
