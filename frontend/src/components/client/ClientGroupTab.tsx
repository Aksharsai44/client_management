import React, { useState, useMemo } from 'react';
import { User, Batch } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  Eye,
  Building2,
  Users,
  Search,
  Filter,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Briefcase,
  UserCheck,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface ClientGroupTabProps {
  currentBatch: Batch;
  batchUsers: User[];
  onViewReport: (user: User) => void;
  userBatches?: Batch[];
  activeBatchId?: string;
  setActiveBatchId?: (id: string) => void;
}

export const ClientGroupTab: React.FC<ClientGroupTabProps> = ({
  currentBatch,
  batchUsers,
  onViewReport,
  userBatches = [],
  activeBatchId,
  setActiveBatchId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'work_user' | 'company_admin'>('all');

  // Breakdown counts for this batch
  const clientCount = useMemo(() => batchUsers.filter((u) => u.role === 'client').length, [batchUsers]);
  const workerCount = useMemo(() => batchUsers.filter((u) => u.role === 'work_user').length, [batchUsers]);
  const adminCount = useMemo(() => batchUsers.filter((u) => u.role === 'company_admin').length, [batchUsers]);

  // Filtered participants
  const filteredUsers = useMemo(() => {
    return batchUsers.filter((u) => {
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.designation && u.designation.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [batchUsers, roleFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* INTERACTIVE BATCH SELECTOR & SHIFTER HEADER                                */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Active Batch Context */}
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Client Cohort:
                </span>
                <span className="text-xs font-black text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {currentBatch.name}
                </span>
                {currentBatch.code && (
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentBatch.code}
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                {currentBatch.description ||
                  `Dedicated workspace for participants in ${currentBatch.name}. Switching batches shifts all participant views and records.`}
              </p>
            </div>
          </div>

          {/* Right: Scroll Down Dropdown Batch Switcher */}
          {userBatches && userBatches.length > 1 && (
            <div className="flex items-center space-x-2.5 bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs shrink-0">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <ArrowRightLeft className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Select Batch:</span>
              </div>

              <div className="relative">
                <select
                  value={activeBatchId || currentBatch.id}
                  onChange={(e) => setActiveBatchId && setActiveBatchId(e.target.value)}
                  className="appearance-none bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs transition-all"
                >
                  {userBatches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white text-slate-800 py-1.5 font-semibold">
                      {b.name} {b.code ? `(${b.code})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-blue-100 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Batch Meta Strip */}
        <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-blue-100/70 text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-4">
            <span>
              Cohort Size: <strong className="text-slate-800">{batchUsers.length} Members</strong>
            </span>
            <span>&bull;</span>
            <span>
              Clients: <strong className="text-blue-700">{clientCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Engineers & Leads: <strong className="text-purple-700">{workerCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Admins: <strong className="text-amber-700">{adminCount}</strong>
            </span>
          </div>

          <div className="text-slate-500">
            Assigned strictly to: <span className="font-bold text-slate-800">{currentBatch.name}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BATCH PARTICIPANTS CARD & DIRECTORY                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Client Group & Batch Participants ({batchUsers.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only members belonging to <strong className="text-slate-700 font-bold">{currentBatch.name}</strong> are accessible in this view.
            </p>
          </div>

          {/* Quick Search & Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white w-48 transition-all"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({batchUsers.length})
              </button>
              <button
                onClick={() => setRoleFilter('client')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  roleFilter === 'client'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clients ({clientCount})
              </button>
              <button
                onClick={() => setRoleFilter('work_user')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  roleFilter === 'work_user'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team ({workerCount})
              </button>
              {adminCount > 0 && (
                <button
                  onClick={() => setRoleFilter('company_admin')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    roleFilter === 'company_admin'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin ({adminCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((member) => {
            const isClient = member.role === 'client';
            const isWorker = member.role === 'work_user';
            const isAdmin = member.role === 'company_admin';

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <UserAvatar name={member.name} size="md" showStatus isOnline className="w-11 h-11 group-hover:border-blue-400 transition-colors" />

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {member.email}
                    </span>

                    <div className="flex items-center space-x-1.5 mt-1.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isClient
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isWorker
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isAdmin
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>

                      {member.designation && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          &bull; {member.designation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onViewReport(member)}
                  className="p-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 hover:border-blue-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  title="View Attendance Report"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="col-span-full p-10 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">
                {searchTerm
                  ? `No participants found matching "${searchTerm}" in ${currentBatch.name}.`
                  : `No participants assigned to ${currentBatch.name} under selected role.`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
