import React from 'react';
import { Meeting } from '../../types';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface CompanyAiTranscriptsTabProps {
  batchMeetings: Meeting[];
  selectedMeetingId: string;
  setSelectedMeetingId: (id: string) => void;
  selectedMeeting: Meeting | undefined;
  aiChatHistory: { sender: 'user' | 'ai'; text: string }[];
  aiChatQuery: string;
  setAiChatQuery: (q: string) => void;
  handleAiQuestionSubmit: (e: React.FormEvent) => void;
}

export const CompanyAiTranscriptsTab: React.FC<CompanyAiTranscriptsTabProps> = ({
  batchMeetings,
  selectedMeetingId,
  setSelectedMeetingId,
  selectedMeeting,
  aiChatHistory,
  aiChatQuery,
  setAiChatQuery,
  handleAiQuestionSubmit,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Call Selector Dropdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              AI Call Summary, Transcript & Interactive Q&A
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any recorded call to read the AI summary, speaker transcripts, or ask contextual questions directly.
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600">Select Call:</span>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
          >
            {batchMeetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.dateTime.split('T')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedMeeting ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: AI Summary & Full Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary Box */}
            <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 text-purple-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Executive AI Summary</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                {selectedMeeting.aiSummary?.overview || 'Review completed with full team alignment.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Key Discussion Points:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedMeeting.aiSummary?.keyPoints?.map((kp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Assigned Action Items:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedMeeting.aiSummary?.actionItems?.map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Speaker Transcript Stream */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Complete Speaker Transcript ({selectedMeeting.transcript?.length || 0} Utterances)
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {selectedMeeting.transcript?.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{entry.speaker}</span>
                      <span className="font-mono text-[10px] text-slate-400">{entry.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Interactive AI Transcript Q&A Chat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col h-[580px]">
            <div className="pb-3 border-b border-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-xs">
                Ask Questions on This Call
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {aiChatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-3 rounded-xl ${
                    item.sender === 'user'
                      ? 'bg-blue-600 text-white ml-6 rounded-tr-none'
                      : 'bg-purple-50 text-slate-800 mr-6 rounded-tl-none border border-purple-200'
                  }`}
                >
                  <span className="text-[10px] font-bold block mb-1 opacity-75">
                    {item.sender === 'user' ? 'You' : 'Gemini AI Assistant'}
                  </span>
                  <p className="leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAiQuestionSubmit} className="pt-3 border-t border-slate-200 flex space-x-2">
              <input
                type="text"
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                placeholder="e.g. What were the action items?"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-2xs">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No Recorded Calls in This Batch Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule a session in the Scheduling tab or switch to another batch to review AI summaries, speaker transcripts, and interactive Q&A.
          </p>
        </div>
      )}
    </div>
  );
};
