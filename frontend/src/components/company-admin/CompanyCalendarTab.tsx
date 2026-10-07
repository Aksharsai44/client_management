import React from 'react';
import { User, AttendanceRecord, Batch } from '../../types';
import { Eye } from 'lucide-react';

interface CompanyCalendarTabProps {
  currentBatch: Batch;
  activeBatchId: string;
  batchUsers: User[];
  attendanceRecords: AttendanceRecord[];
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  onViewReport: (user: User) => void;
}

export const CompanyCalendarTab: React.FC<CompanyCalendarTabProps> = ({
  currentBatch,
  activeBatchId,
  batchUsers,
  attendanceRecords,
  selectedCalendarDate,
  setSelectedCalendarDate,
  onViewReport,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Attendance Tracking & Session Audits
          </h2>
          <p className="text-xs text-slate-500">
            Inspect call presence. Click on any date or click the Eye icon on any user to view & download official attendance analysis PDF reports.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Calendar Month View */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">October 2026</h3>
            <span className="text-xs font-bold text-slate-500">{currentBatch.code}</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
              const recordsForDay = attendanceRecords.filter(
                (r) => r.batchId === activeBatchId && r.date === dateStr
              );
              const isSelected = selectedCalendarDate === dateStr;
              const hasCall = recordsForDay.length > 0;
              const hasAbsence = recordsForDay.some((r) => r.status === 'absent');

              return (
                <button
                  key={day}
                  onClick={() => setSelectedCalendarDate(dateStr)}
                  className={`h-9 w-full rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : hasCall
                      ? hasAbsence
                        ? 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{day}</span>
                  {hasCall && !isSelected && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        hasAbsence ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Full Presence</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Partial/Absent</span>
            </span>
          </div>
        </div>

        {/* Attendance for Selected Date & User Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Session Log for {selectedCalendarDate}
              </h3>
              <p className="text-xs text-slate-500">
                Who attended today&apos;s call and how many minutes they stayed on the session
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Minutes on Call</th>
                  <th className="py-2.5 px-3 text-right">Detailed Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchUsers.map((u) => {
                  const rec = attendanceRecords.find(
                    (r) =>
                      r.batchId === activeBatchId &&
                      r.date === selectedCalendarDate &&
                      r.userId === u.id
                  );
                  const isPresent = rec?.status === 'present';
                  const minutes = rec?.minutesPresent || 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {u.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize text-slate-500">{u.role.replace('_', ' ')}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {rec ? `${minutes} minutes` : 'No session record'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onViewReport(u)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Analysis Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
