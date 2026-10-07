import React from 'react';
import { User, Meeting, ResourceItem, AttendanceRecord } from '../../types';
import { Building, Users, Video, FileText, Clock, CalendarDays } from 'lucide-react';

interface CompanyDashboardTabProps {
  batchUsers: User[];
  batchMeetings: Meeting[];
  batchResources: ResourceItem[];
  attendanceRecords: AttendanceRecord[];
  activeBatchId: string;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  setActiveTab: (tab: any) => void;
}

export const CompanyDashboardTab: React.FC<CompanyDashboardTabProps> = ({
  batchUsers,
  batchMeetings,
  batchResources,
  attendanceRecords,
  activeBatchId,
  selectedCalendarDate,
  setSelectedCalendarDate,
  setActiveTab,
}) => {
  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const nextMeeting = upcomingMeetings[0];

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Clients in Batch</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {batchUsers.filter((u) => u.role === 'client').length}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Enterprise Contacts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Workers & Engineers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {batchUsers.filter((u) => u.role === 'work_user').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Assigned Squad</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Scheduled Calls</span>
            <Video className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {batchMeetings.length}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Upcoming & Past</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Shared Resources</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {batchResources.length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Documents & Reports</span>
        </div>
      </div>

      {/* Middle Row: Upcoming Meeting Call + Mini Calendar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Meeting Call Card (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Upcoming Client Call & Conference
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('scheduling')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage Schedule &rarr;
            </button>
          </div>

          {nextMeeting ? (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {nextMeeting.scheduleType} sync
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {nextMeeting.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">{nextMeeting.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center space-x-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{nextMeeting.dateTime.replace('T', ' ')}</span>
                  </span>
                  <span>{nextMeeting.durationMinutes} minutes</span>
                </div>
              </div>

              <a
                href={nextMeeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-2 shadow-sm shrink-0 transition-transform hover:scale-102"
              >
                <Video className="w-4 h-4" />
                <span>Join Call Now</span>
              </a>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No upcoming calls scheduled for this batch today.
            </div>
          )}
        </div>

        {/* Interactive Mini Calendar widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-slate-600" />
              <h4 className="font-bold text-slate-900 text-xs">Batch Attendance Calendar</h4>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-[11px] text-blue-600 font-semibold hover:underline"
            >
              Full View
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-center font-bold text-xs text-slate-800 mb-2">October 2026</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-1">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
                const hasAttendance = attendanceRecords.some(
                  (r) => r.batchId === activeBatchId && r.date === dateStr
                );
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedCalendarDate(dateStr);
                      setActiveTab('calendar');
                    }}
                    className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : hasAttendance
                        ? 'bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {hasAttendance && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-emerald-600 -mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Latest 3-4 Resources Added */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Latest Resources & Reports Added
            </h3>
            <p className="text-xs text-slate-500">
              Recent documents uploaded by clients and workers (showing latest 4)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('resources')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View All Resources ({batchResources.length}) &rarr;
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {batchResources.slice(0, 4).map((res) => (
            <div
              key={res.id}
              onClick={() => setActiveTab('resources')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                  <span className="font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {res.fileType}
                  </span>
                  <span>{res.fileSize}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-2">{res.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{res.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-medium text-slate-700 truncate">{res.uploaderName}</span>
                <span>{res.uploadedAt.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
