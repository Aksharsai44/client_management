import React, { useState } from 'react';
import { Meeting, AttendanceRecord, User } from '../../types';

interface ClientCalendarTabProps {
  batchMeetings: Meeting[];
  attendanceRecords: AttendanceRecord[];
  activeBatchId: string;
  currentUser: User;
}

export const ClientCalendarTab: React.FC<ClientCalendarTabProps> = ({
  batchMeetings,
  attendanceRecords,
  activeBatchId,
  currentUser,
}) => {
  const [calDate, setCalDate] = useState('2026-10-04');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Your Attendance Calendar & Minute Logs
        </h2>
        <p className="text-xs text-slate-500">
          Green denotes verified presence; red indicates an absence during the session.
        </p>

        {/* Month grid */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-xl mx-auto">
          <div className="text-center font-bold text-xs text-slate-800 mb-2">October 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-1">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
              const rec = attendanceRecords.find(
                (r) =>
                  r.batchId === activeBatchId &&
                  r.date === dateStr &&
                  r.userId === currentUser.id
              );
              const isPresent = rec?.status === 'present';
              const isAbsent = rec?.status === 'absent';

              return (
                <div
                  key={day}
                  onClick={() => setCalDate(dateStr)}
                  className={`h-9 w-full rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    calDate === dateStr ? 'ring-2 ring-blue-600 shadow-xs' : ''
                  } ${
                    isPresent
                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                      : isAbsent
                      ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{day}</span>
                  {rec && (
                    <span className="text-[9px] font-semibold -mt-1">
                      {isPresent ? `${rec.minutesPresent}m` : '0m'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row-Based Session Attendance & Minutes Breakdown */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">
            Row-Based Session Attendance & Minutes Breakdown
          </h4>

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
    </div>
  );
};
