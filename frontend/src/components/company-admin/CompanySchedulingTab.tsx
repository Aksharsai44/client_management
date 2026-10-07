import React from 'react';
import { Meeting } from '../../types';
import { Plus, Video, Clock, Sparkles } from 'lucide-react';

interface CompanySchedulingTabProps {
  batchMeetings: Meeting[];
  onOpenScheduleModal: () => void;
  onInspectTranscript: (meetingId: string) => void;
}

export const CompanySchedulingTab: React.FC<CompanySchedulingTabProps> = ({
  batchMeetings,
  onOpenScheduleModal,
  onInspectTranscript,
}) => {
  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = batchMeetings.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Call Scheduling & Meeting Management
          </h2>
          <p className="text-xs text-slate-500">
            Schedule calls daily, weekly or on custom dates. Provide direct Google Meet/Zoom links with automated history.
          </p>
        </div>
        <button
          onClick={onOpenScheduleModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Call</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Video className="w-4 h-4 text-blue-600" />
            <span>Upcoming Scheduled Calls</span>
          </h3>

          <div className="space-y-3">
            {upcomingMeetings.map((meet) => (
              <div
                key={meet.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {meet.scheduleType}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">{meet.title}</h4>
                  <p className="text-[11px] text-slate-500">{meet.description}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-600 font-medium">
                    <span>{meet.dateTime.replace('T', ' ')}</span>
                    <span>&bull;</span>
                    <span>{meet.durationMinutes} mins</span>
                  </div>
                </div>

                <a
                  href={meet.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shrink-0 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </a>
              </div>
            ))}
            {upcomingMeetings.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                No upcoming calls scheduled for this batch.
              </div>
            )}
          </div>
        </div>

        {/* Call History with Duration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Call History & Minutes Logged</span>
          </h3>

          <div className="space-y-3">
            {completedMeetings.map((meet) => (
              <div
                key={meet.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{meet.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      Completed on {meet.dateTime.replace('T', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {meet.durationMinutes} Minutes Logged
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Host: {meet.hostName}</span>
                  <button
                    onClick={() => onInspectTranscript(meet.id)}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>View AI Transcript &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
            {completedMeetings.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                No completed sessions logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
