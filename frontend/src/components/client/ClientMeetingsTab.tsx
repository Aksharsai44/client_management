import React from 'react';
import { Meeting } from '../../types';
import { useApp } from '../../context/AppContext';
import { Video, PhoneCall, Clock, Sparkles, ShieldCheck } from 'lucide-react';

interface ClientMeetingsTabProps {
  batchMeetings: Meeting[];
  onInspectTranscript: (meetingId: string) => void;
}

export const ClientMeetingsTab: React.FC<ClientMeetingsTabProps> = ({
  batchMeetings,
  onInspectTranscript,
}) => {
  const { setActiveLiveCall } = useApp();

  const inProgressMeetings = batchMeetings.filter((m) => m.status === 'in_progress');
  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = batchMeetings.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Live Active Meeting Banner if any is in-progress */}
      {inProgressMeetings.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <h3 className="font-extrabold text-sm tracking-wide">LIVE SESSION IN PROGRESS</h3>
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-medium">
              Real-time Active
            </span>
          </div>

          {inProgressMeetings.map((meet) => (
            <div
              key={meet.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-base">{meet.title}</h4>
                <p className="text-xs text-white/80 mt-0.5">{meet.description}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-white/90">
                  <span>Host: {meet.hostName}</span>
                  <span>&bull;</span>
                  <span>Batch: {meet.batchId}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveLiveCall(meet)}
                className="px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shrink-0 transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Join Live Call Now</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Calls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Upcoming & Scheduled Checkpoints ({upcomingMeetings.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            PostgreSQL Real-Time Synced
          </span>
        </div>

        <div className="space-y-3">
          {upcomingMeetings.map((meet) => (
            <div
              key={meet.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {meet.scheduleType}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Host: {meet.hostName}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{meet.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{meet.description}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-600">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meet.dateTime.replace('T', ' ')}</span>
                  </span>
                  <span>&bull;</span>
                  <span>{meet.durationMinutes} mins scheduled</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setActiveLiveCall(meet)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Room</span>
                </button>
              </div>
            </div>
          ))}

          {upcomingMeetings.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-1">
              <Video className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No upcoming checkpoints scheduled for this batch.</p>
            </div>
          )}
        </div>
      </div>

      {/* Meeting History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Meeting History & Logged Duration ({completedMeetings.length})</span>
          </h3>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Attendance</span>
          </span>
        </div>

        <div className="space-y-3">
          {completedMeetings.map((meet) => (
            <div
              key={meet.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{meet.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Concluded on {meet.dateTime.replace('T', ' ')} &bull; Host: {meet.hostName}
                </p>
                {meet.aiSummary?.overview && (
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                    "{meet.aiSummary.overview}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  {meet.durationMinutes} Mins Logged
                </span>
                <button
                  onClick={() => onInspectTranscript(meet.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Inspect AI Transcript</span>
                </button>
              </div>
            </div>
          ))}

          {completedMeetings.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-1">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No completed call sessions logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
