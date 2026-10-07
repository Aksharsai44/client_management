import React from 'react';
import { Meeting, AttendanceRecord, User } from '../../types';

interface WorkCalendarTabProps {
  batchMeetings: Meeting[];
  attendanceRecords: AttendanceRecord[];
  activeBatchId: string;
  currentUser: User;
}

export const WorkCalendarTab: React.FC<WorkCalendarTabProps> = ({
  batchMeetings,
  attendanceRecords,
  activeBatchId,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Employee Attendance Calendar & Duration
        </h2>

        {/* Row breakdown */}
        <div className="space-y-2">
          {batchMeetings.map((meet) => {
            const record = attendanceRecords.find(
              (r) =>
                r.batchId === activeBatchId &&
                r.meetingId === meet.id &&
                r.userId === currentUser.id
            );
            const isPresent = record?.status === 'present';
            const mins = record?.minutesPresent || 0;

            return (
              <div
                key={meet.id}
                className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900">{meet.title}</span>
                  <span className="text-slate-500 block text-[11px]">
                    {meet.dateTime.replace('T', ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPresent ? 'Present' : 'Absent'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {mins} / {meet.durationMinutes} mins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
