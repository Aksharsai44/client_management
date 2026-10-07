import React from 'react';
import { Meeting } from '../../types';
import { Video } from 'lucide-react';

interface WorkMeetingsTabProps {
  batchMeetings: Meeting[];
  onInspectTranscript: (meetingId: string) => void;
}

export const WorkMeetingsTab: React.FC<WorkMeetingsTabProps> = ({
  batchMeetings,
  onInspectTranscript,
}) => {
  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = batchMeetings.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Scheduled Client Sync Meetings</h3>
        <div className="space-y-3">
          {upcomingMeetings.map((meet) => (
            <div
              key={meet.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{meet.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{meet.description}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-600">
                  <span>{meet.dateTime.replace('T', ' ')}</span>
                  <span>&bull;</span>
                  <span>{meet.durationMinutes} mins scheduled</span>
                </div>
              </div>
              <a
                href={meet.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Join Meeting</span>
              </a>
            </div>
          ))}
          {upcomingMeetings.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No upcoming meetings scheduled.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Meeting History & Minutes Logged</h3>
        <div className="space-y-3">
          {completedMeetings.map((meet) => (
            <div
              key={meet.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{meet.title}</h4>
                <p className="text-[11px] text-slate-500">{meet.dateTime.replace('T', ' ')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {meet.durationMinutes} Mins Recorded
                </span>
                <button
                  onClick={() => onInspectTranscript(meet.id)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Inspect Transcript
                </button>
              </div>
            </div>
          ))}
          {completedMeetings.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No past recorded meetings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
