import React, { useState } from 'react';
import { Meeting, User } from '../../types';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';

interface WorkAiTranscriptsTabProps {
  batchMeetings: Meeting[];
  selectedMeetingId: string;
  setSelectedMeetingId: (id: string) => void;
  currentUser: User;
}

export const WorkAiTranscriptsTab: React.FC<WorkAiTranscriptsTabProps> = ({
  batchMeetings,
  selectedMeetingId,
  setSelectedMeetingId,
  currentUser,
}) => {
  const selectedMeeting =
    batchMeetings.find((m) => m.id === selectedMeetingId) || batchMeetings[0];

  const [workAiQuery, setWorkAiQuery] = useState('');
  const [workAiChat, setWorkAiChat] = useState<
    { sender: 'worker' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: `Hello ${currentUser.name}! You can query action items, technical decisions, and transcript notes for this session.`,
    },
  ]);

  const handleWorkAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workAiQuery.trim() || !selectedMeeting) return;

    const q = workAiQuery.trim();
    setWorkAiChat((prev) => [...prev, { sender: 'worker', text: q }]);
    setWorkAiQuery('');

    setTimeout(() => {
      let resp = `Regarding your query on "${selectedMeeting.title}": ${selectedMeeting.aiSummary?.overview || 'Sprint deliverables confirmed.'}`;
      if (q.toLowerCase().includes('action') || q.toLowerCase().includes('task')) {
        resp = `Assigned tasks: ${selectedMeeting.aiSummary?.actionItems?.join('; ') || 'Continue backlog development.'}`;
      }
      setWorkAiChat((prev) => [...prev, { sender: 'ai', text: resp }]);
    }, 600);
  };

  if (!selectedMeeting) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-2xs">
        <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-sm">No Recorded Calls in This Batch Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Once review sessions take place, transcripts, action items, and AI summaries will be accessible here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            AI Summary & Audio Transcript
          </h2>
          <p className="text-xs text-slate-500">
            Select a meeting to review points and query details.
          </p>
        </div>
        <select
          value={selectedMeetingId}
          onChange={(e) => setSelectedMeetingId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
        >
          {batchMeetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Executive Summary</span>
            </div>
            <p className="text-xs text-slate-700 bg-purple-50/50 p-3 rounded-xl">
              {selectedMeeting.aiSummary?.overview}
            </p>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-900">Action Items:</span>
              {selectedMeeting.aiSummary?.actionItems?.map((act, i) => (
                <div key={i} className="flex items-center space-x-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Speaker Transcript</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {selectedMeeting.transcript?.map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{t.speaker}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{t.timestamp}</span>
                  </div>
                  <p className="text-slate-600">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col h-[500px]">
          <h3 className="font-bold text-slate-900 text-xs pb-2 border-b border-slate-100 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Transcript Q&A</span>
          </h3>
          <div className="flex-1 overflow-y-auto py-2 space-y-2">
            {workAiChat.map((c, i) => (
              <div
                key={i}
                className={`text-xs p-2.5 rounded-xl ${
                  c.sender === 'worker'
                    ? 'bg-amber-600 text-white ml-6'
                    : 'bg-purple-50 text-slate-800 mr-6 border border-purple-200'
                }`}
              >
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleWorkAiAsk} className="pt-2 flex space-x-1.5">
            <input
              type="text"
              value={workAiQuery}
              onChange={(e) => setWorkAiQuery(e.target.value)}
              placeholder="Ask about this session..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
