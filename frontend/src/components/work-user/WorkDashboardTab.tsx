import React from 'react';
import { Meeting, ResourceItem, CommunityPost, AttendanceRecord, User } from '../../types';
import { Video } from 'lucide-react';

interface WorkDashboardTabProps {
  batchMeetings: Meeting[];
  workerAttendanceRate: number;
  batchResources: ResourceItem[];
  batchPosts: CommunityPost[];
  attendanceRecords: AttendanceRecord[];
  activeBatchId: string;
  currentUser: User;
  setActiveTab: (tab: any) => void;
}

export const WorkDashboardTab: React.FC<WorkDashboardTabProps> = ({
  batchMeetings,
  workerAttendanceRate,
  batchResources,
  batchPosts,
  attendanceRecords,
  activeBatchId,
  currentUser,
  setActiveTab,
}) => {
  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const nextMeeting = upcomingMeetings[0];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Upcoming Sync Calls</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {upcomingMeetings.length}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">1-Click Join Ready</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Your Attendance Rate</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{workerAttendanceRate}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Full Call Presence</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Shared Deliverables</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{batchResources.length}</div>
          <span className="text-[10px] text-purple-600 font-medium">Docs & Reviews</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Community Threads</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{batchPosts.length}</div>
          <span className="text-[10px] text-teal-600 font-medium">Batch Discussions</span>
        </div>
      </div>

      {/* Upcoming Meeting + Mini Calendar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Upcoming Client Review Session
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              All Meetings &rarr;
            </button>
          </div>

          {nextMeeting ? (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {nextMeeting.scheduleType}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{nextMeeting.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{nextMeeting.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {nextMeeting.dateTime.replace('T', ' ')}
                  </span>
                  <span>{nextMeeting.durationMinutes} mins</span>
                  <span>Host: {nextMeeting.hostName}</span>
                </div>
              </div>

              <a
                href={nextMeeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-2 shadow-xs shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Join Call</span>
              </a>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No upcoming calls scheduled today.
            </div>
          )}
        </div>

        {/* Mini Calendar Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">Calendar Log</h4>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-[11px] text-amber-700 font-semibold"
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
                    className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-900 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Latest 3-4 Resources */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Latest Uploaded Deliverables</h3>
            <p className="text-xs text-slate-500">
              Recent documents, architecture diagrams, and client reviews
            </p>
          </div>
          <button
            onClick={() => setActiveTab('resources')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900"
          >
            View All Deliverables &rarr;
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {batchResources.slice(0, 4).map((res) => (
            <div
              key={res.id}
              onClick={() => setActiveTab('resources')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  {res.fileType}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-2">{res.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{res.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>{res.uploaderName}</span>
                <span>{res.uploadedAt.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
