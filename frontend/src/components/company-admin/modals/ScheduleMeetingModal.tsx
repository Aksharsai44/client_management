import React, { useState, useId } from 'react';
import { Meeting } from '../../../types';
import { Video, Calendar, Clock, Sparkles, MessageCircle, Link, Check, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meeting: Omit<Meeting, 'id' | 'status'>) => Promise<any> | void;
  activeBatchId: string;
  hostName: string;
}

const WEEKDAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  activeBatchId,
  hostName,
}) => {
  // Generate a sensible default dateTime for tomorrow at 10:00 AM
  const getInitialDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getInitialEndDate = (monthsAhead: number = 3) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [platform, setPlatform] = useState<'in_app' | 'google_meet' | 'zoom' | 'custom'>('google_meet');
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduleType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'custom',
    dateTime: getInitialDateTime(),
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/new',
  });

  // Recurring schedule across months states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringDays, setRecurringDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [repeatMonths, setRepeatMonths] = useState<number>(3);
  const [useCustomEndDate, setUseCustomEndDate] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(getInitialEndDate(3));

  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePlatformChange = (p: 'in_app' | 'google_meet' | 'zoom' | 'custom') => {
    setPlatform(p);
    if (p === 'in_app') {
      setMeetingForm((prev) => ({
        ...prev,
        meetingUrl: `https://meet.clientops.app/room/${activeBatchId}-${Date.now().toString(36)}`,
      }));
    } else if (p === 'google_meet') {
      setMeetingForm((prev) => ({ ...prev, meetingUrl: 'https://meet.google.com/new' }));
    } else if (p === 'zoom') {
      setMeetingForm((prev) => ({ ...prev, meetingUrl: 'https://zoom.us/join' }));
    }
  };

  const handleCadenceChange = (cadence: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setMeetingForm((prev) => ({ ...prev, scheduleType: cadence }));
    if (cadence === 'daily' || cadence === 'weekly' || cadence === 'monthly') {
      setRecurringPattern(cadence);
    }
  };

  const toggleDay = (day: string) => {
    setRecurringDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleRepeatMonthsChange = (months: number) => {
    setRepeatMonths(months);
    setUseCustomEndDate(false);
    setEndDate(getInitialEndDate(months));
  };

  // Estimate total sessions for preview
  const calculateEstimatedSessions = () => {
    if (!isRecurring) return 1;
    const months = repeatMonths || 3;
    if (recurringPattern === 'daily') {
      return months * 30;
    }
    if (recurringPattern === 'weekly') {
      return months * 4 * Math.max(1, recurringDays.length);
    }
    if (recurringPattern === 'monthly') {
      return months;
    }
    return 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) {
      setErrorMessage('Please provide a meeting title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: any = {
        batchId: activeBatchId,
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim() || 'Scheduled batch synchronization checkpoint and review.',
        scheduleType: meetingForm.scheduleType,
        dateTime: meetingForm.dateTime,
        durationMinutes: Number(meetingForm.durationMinutes) || 45,
        meetingUrl: meetingForm.meetingUrl,
        hostName: hostName,
        platform: platform,
      };

      if (isRecurring) {
        payload.recurringPattern = recurringPattern;
        payload.recurringDays = recurringDays;
        payload.repeatMonths = repeatMonths;
        payload.startDate = meetingForm.dateTime;
        payload.endDate = endDate;
      }

      await onAdd(payload);

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule Call & Checkpoint</h3>
              <p className="text-[11px] text-slate-500">
                Saves to database and alerts batch participants in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Call Platform Room Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Call Platform Room
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePlatformChange('in_app')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition ${
                  platform === 'in_app'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>In-App HD</span>
                </div>
                <span className="text-[9px] text-blue-600 font-medium">Auto Transcripts</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('google_meet')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition ${
                  platform === 'google_meet'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-emerald-700 font-bold">Google Meet</span>
                <span className="text-[9px] text-slate-400 font-normal">meet.google.com</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('zoom')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center space-y-1 transition ${
                  platform === 'zoom'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Zoom Room</span>
                <span className="text-[9px] text-slate-400 font-normal">zoom.us</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Call Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              placeholder="e.g. Sprint Checkpoint & Client Milestone Alignment"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Agenda & Description</label>
            <textarea
              rows={2}
              value={meetingForm.description}
              onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
              placeholder="Outline discussion points, review goals, or files to inspect..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cadence Type</label>
              <select
                value={meetingForm.scheduleType}
                onChange={(e) => handleCadenceChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="weekly">Weekly Checkpoint</option>
                <option value="daily">Daily Standup</option>
                <option value="monthly">Monthly Review</option>
                <option value="custom">Single / Custom Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <select
                value={meetingForm.durationMinutes}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, durationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={15}>15 Minutes (Quick Standup)</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard Review)</option>
                <option value={60}>60 Minutes (Full Strategy Sync)</option>
                <option value={90}>90 Minutes (Deep Dive Workshop)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={meetingForm.dateTime}
              onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Recurring Schedule across months toggle */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Recurring Schedule Across Months
                  </p>
                  <p className="text-[10px] text-blue-700">
                    Auto-creates all sessions in database. No need to create every time!
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="pt-2 border-t border-blue-200/80 space-y-3 animate-fade-in text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Repeat Frequency
                    </label>
                    <select
                      value={recurringPattern}
                      onChange={(e) => setRecurringPattern(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="weekly">Every Week (Selected Days)</option>
                      <option value="daily">Every Day</option>
                      <option value="monthly">Every Month (Same Date)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Repeat For
                    </label>
                    <select
                      value={useCustomEndDate ? 'custom' : repeatMonths}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setUseCustomEndDate(true);
                        } else {
                          handleRepeatMonthsChange(Number(e.target.value));
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={1}>1 Month</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months (Quarterly)</option>
                      <option value={6}>6 Months (Half Year)</option>
                      <option value="custom">Specify Custom End Date</option>
                    </select>
                  </div>
                </div>

                {/* Day selector for weekly recurrence */}
                {recurringPattern === 'weekly' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Days of the Week:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((d) => {
                        const isSelected = recurringDays.includes(d.key);
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => toggleDay(d.key)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom End Date Input */}
                {useCustomEndDate && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Series End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Live Preview calculation */}
                <div className="p-2.5 bg-blue-100/70 border border-blue-300/80 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                  <span className="font-bold">📅 Schedule Series Preview:</span> Will automatically
                  generate approximately{' '}
                  <span className="font-extrabold text-blue-700 underline">
                    {calculateEstimatedSessions()} recurring sessions
                  </span>{' '}
                  at {meetingForm.dateTime ? meetingForm.dateTime.slice(11, 16) : '10:00'} across{' '}
                  {useCustomEndDate ? `until ${endDate}` : `${repeatMonths} months`}{' '}
                  ({meetingForm.durationMinutes} mins each) with real-time SSE broadcasts.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting URL Link</label>
            <div className="relative">
              <input
                type="url"
                required
                value={meetingForm.meetingUrl}
                onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
              <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Strict Attendance Rule Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900">
              <span className="font-bold">Strict Attendance Rule (&gt; 50% Threshold):</span>{' '}
              Participants must be present for at least{' '}
              <span className="font-bold underline">
                {Math.ceil(meetingForm.durationMinutes / 2)} minutes
              </span>{' '}
              of the {meetingForm.durationMinutes}m call to be verified as{' '}
              <span className="font-bold text-emerald-700">Present</span> in the database.
              Otherwise, status is automatically marked as{' '}
              <span className="font-bold text-red-700">Absent</span>.
            </div>
          </div>

          {/* WhatsApp Alert toggle */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">WhatsApp Push Invitation</p>
                <p className="text-[10px] text-emerald-700">
                  Notify batch clients with direct meeting link 15m before session
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendWhatsAppAlert}
              onChange={(e) => setSendWhatsAppAlert(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isRecurring
                      ? `Schedule Series (~${calculateEstimatedSessions()} Calls)`
                      : 'Schedule Call'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
