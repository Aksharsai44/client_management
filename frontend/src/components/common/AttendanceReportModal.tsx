import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, AttendanceRecord, Meeting } from '../../types';
import {
  X,
  Printer,
  Download,
  CalendarCheck,
  Clock,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface AttendanceReportModalProps {
  user: User;
  onClose: () => void;
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ user, onClose }) => {
  const { meetings, attendanceRecords, activeBatchId, batches } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);

  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
  const batchMeetings = meetings.filter((m) => m.batchId === activeBatchId);
  const userRecords = attendanceRecords.filter(
    (r) => r.userId === user.id && r.batchId === activeBatchId
  );

  const totalCalls = batchMeetings.length > 0 ? batchMeetings.length : 1;
  const attendedCount = userRecords.filter((r) => r.status === 'present').length;
  const absentCount = userRecords.filter((r) => r.status === 'absent').length;
  const totalMinutes = userRecords.reduce((sum, r) => sum + (r.minutesPresent || 0), 0);
  const attendanceRate = Math.round((attendedCount / (attendedCount + absentCount || 1)) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportText = `=====================================================
OFFICIAL ATTENDANCE AND PARTICIPATION REPORT
OmniSuite Enterprise Management System
=====================================================

PARTICIPANT DETAILS:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role.toUpperCase()}
- Organization: ${user.companyName || activeBatch?.name}
- Batch: ${activeBatch?.name} (${activeBatch?.code})
- Date of Report: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

PERFORMANCE ANALYSIS & METRICS:
- Overall Attendance Rate: ${attendanceRate}%
- Total Calls Attended: ${attendedCount}
- Total Calls Absent: ${absentCount}
- Total Minutes Present: ${totalMinutes} Minutes
- Average Minutes Per Call: ${attendedCount > 0 ? Math.round(totalMinutes / attendedCount) : 0} Minutes

DETAILED CALL BREAKDOWN:
${batchMeetings.map((m) => {
  const rec = userRecords.find((r) => r.meetingId === m.id);
  const status = rec ? rec.status.toUpperCase() : 'NO LOGGED RECORD';
  const mins = rec ? rec.minutesPresent : 0;
  return `* Call: ${m.title}
  Date: ${m.dateTime.replace('T', ' ')}
  Scheduled Length: ${m.durationMinutes} mins
  User Status: ${status}
  Minutes Present: ${mins} mins
  Notes: ${rec?.notes || 'Normal participation'}
`;
}).join('\n')}

CERTIFICATION:
This document confirms verified attendance metrics logged automatically
during live sessions on the OmniSuite enterprise collaboration platform.

Generated on: ${new Date().toISOString()}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_Report_${user.name.replace(/\s+/g, '_')}_${activeBatch?.code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Attendance & Performance Report
              </h3>
              <p className="text-xs text-slate-500">
                Detailed attendance analysis for {user.name} ({activeBatch?.name})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Print report"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content (printable) */}
        <div ref={reportRef} className="p-6 overflow-y-auto space-y-6">
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center space-x-3">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-300"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{user.name}</h4>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-600">
                    {user.companyName || activeBatch?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Reporting Cycle</span>
              <p className="text-sm font-bold text-slate-800">October 2026</p>
              <p className="text-xs text-slate-500">{activeBatch?.code}</p>
            </div>
          </div>

          {/* Key Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-center">
              <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-blue-900">{attendanceRate}%</div>
              <p className="text-xs text-blue-700 font-medium">Attendance Rate</p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-center">
              <FileCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-emerald-900">{attendedCount}</div>
              <p className="text-xs text-emerald-700 font-medium">Sessions Attended</p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 text-center">
              <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-rose-900">{absentCount}</div>
              <p className="text-xs text-rose-700 font-medium">Sessions Absent</p>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 text-center">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-indigo-900">{totalMinutes}m</div>
              <p className="text-xs text-indigo-700 font-medium">Total Minutes Logged</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Participation Index</span>
              <span className="text-xs font-bold text-slate-900">{attendanceRate}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  attendanceRate >= 80
                    ? 'bg-emerald-500'
                    : attendanceRate >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
          </div>

          {/* Table Breakdown of Call History */}
          <div>
            <h5 className="font-bold text-slate-900 text-sm mb-3">
              Detailed Session Attendance Log
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Session Title</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Duration Present</th>
                    <th className="py-2.5 px-3">Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {batchMeetings.map((m) => {
                    const record = userRecords.find((r) => r.meetingId === m.id);
                    const isPresent = record?.status === 'present';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {m.title}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {m.dateTime.replace('T', ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPresent ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {record ? `${record.minutesPresent} / ${m.durationMinutes} mins` : '0 mins'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 italic">
                          {record?.notes || (isPresent ? 'Full session participation' : 'Unexcused')}
                        </td>
                      </tr>
                    );
                  })}
                  {batchMeetings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No meeting sessions found for this batch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-3 flex justify-between">
            <span>Verified System Log &bull; OmniSuite Enterprise</span>
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
