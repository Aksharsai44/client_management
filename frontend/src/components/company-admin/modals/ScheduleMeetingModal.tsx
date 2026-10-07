import React, { useState } from 'react';
import { Meeting } from '../../../types';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meeting: Omit<Meeting, 'id' | 'status'>) => void;
  activeBatchId: string;
  hostName: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeBatchId,
  hostName,
}) => {
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduleType: 'weekly' as 'daily' | 'weekly' | 'custom',
    dateTime: '2026-10-07T14:00',
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/new',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Schedule Call for Batch</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd({
              batchId: activeBatchId,
              title: meetingForm.title,
              description: meetingForm.description,
              scheduleType: meetingForm.scheduleType,
              dateTime: meetingForm.dateTime,
              durationMinutes: meetingForm.durationMinutes,
              meetingUrl: meetingForm.meetingUrl,
              hostName: hostName,
            });
            onClose();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call Title</label>
            <input
              type="text"
              required
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              placeholder="e.g. Weekly Client Sprint Review"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cadence</label>
              <select
                value={meetingForm.scheduleType}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, scheduleType: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="daily">Daily Standup</option>
                <option value="weekly">Weekly Sync</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={meetingForm.durationMinutes}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, durationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={meetingForm.dateTime}
              onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting URL Link</label>
            <input
              type="url"
              required
              value={meetingForm.meetingUrl}
              onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Schedule Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
