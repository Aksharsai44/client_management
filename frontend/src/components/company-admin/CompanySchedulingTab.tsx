import React, { useState } from 'react';
import { Meeting } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Video,
  Clock,
  Sparkles,
  Zap,
  PhoneCall,
  Calendar,
  Trash2,
  Edit2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Users,
  Search,
  Filter,
} from 'lucide-react';

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
  const {
    startCall,
    startInstantCall,
    deleteMeeting,
    updateMeeting,
    setActiveLiveCall,
    currentUser,
    activeBatchId,
  } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'weekly' | 'daily' | 'custom'>('all');
  const [isInstantStarting, setIsInstantStarting] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Filter meetings
  const filteredMeetings = batchMeetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || m.scheduleType === filterType;
    return matchesSearch && matchesFilter;
  });

  const inProgressMeetings = filteredMeetings.filter((m) => m.status === 'in_progress');
  const upcomingMeetings = filteredMeetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = filteredMeetings.filter((m) => m.status === 'completed');

  // Handle Instant Call
  const handleLaunchInstantCall = async () => {
    setIsInstantStarting(true);
    try {
      await startInstantCall({
        title: `Instant Checkpoint (${currentUser.name})`,
        batchId: activeBatchId,
        hostName: currentUser.name,
        hostId: currentUser.id,
        durationMinutes: 30,
        description: `Instant collaboration call launched by ${currentUser.name}.`,
      });
    } catch (err) {
      console.error('Failed to start instant call:', err);
    } finally {
      setIsInstantStarting(false);
    }
  };

  // Copy Meeting Link
  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (meet: Meeting) => {
    const text = `*Scheduled Call: ${meet.title}*\n*Date & Time:* ${meet.dateTime.replace('T', ' ')}\n*Duration:* ${meet.durationMinutes} mins\n*Join Link:* ${meet.meetingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Delete Meeting
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to cancel and delete '${title}'?`)) {
      await deleteMeeting(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Call Scheduling & Live Meeting Room
              </h2>
              <p className="text-xs text-slate-500">
                Schedule calls daily, weekly or custom dates. Launch in-app HD video sessions with real-time PostgreSQL database sync.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleLaunchInstantCall}
            disabled={isInstantStarting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{isInstantStarting ? 'Launching...' : 'Start Instant Call'}</span>
          </button>

          <button
            onClick={onOpenScheduleModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Call</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meetings by title or agenda..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Cadence:</span>
          </span>
          {(['all', 'weekly', 'daily', 'custom'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize shrink-0 transition ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Active In-Progress Live Calls Banner (if any) */}
      {inProgressMeetings.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <h3 className="font-extrabold text-sm tracking-wide">CALL IN PROGRESS NOW</h3>
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-medium">
              Live Real-Time Room
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

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setActiveLiveCall(meet)}
                  className="px-5 py-2.5 bg-white text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition"
                >
                  <PhoneCall className="w-4 h-4 text-red-600" />
                  <span>Join Live Call Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2-Column Grid: Upcoming Scheduled Calls vs Completed History */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Col: Upcoming Scheduled Calls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Video className="w-4 h-4 text-blue-600" />
              <span>Upcoming Scheduled Calls ({upcomingMeetings.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Auto-syncs via SSE
            </span>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map((meet) => (
              <div
                key={meet.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {meet.scheduleType}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Host: {meet.hostName}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1.5">{meet.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{meet.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-600 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{meet.dateTime.replace('T', ' ')}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{meet.durationMinutes} mins</span>
                      </span>
                    </div>
                  </div>

                  {/* Top Right Action Tools */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopy(meet.id, meet.meetingUrl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                      title="Copy Join Link"
                    >
                      {copiedId === meet.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(meet)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition"
                      title="Share Invite via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setEditingMeeting(meet)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Meeting"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(meet.id, meet.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Cancel Call"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Join & Launch Buttons */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                    {meet.meetingUrl}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startCall(meet.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Call Now</span>
                    </button>

                    {meet.meetingUrl && !meet.meetingUrl.includes('clientops.app') && (
                      <a
                        href={meet.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                        title="Open External URL Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {upcomingMeetings.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-2">
                <Video className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No upcoming calls scheduled for this batch.</p>
                <button
                  onClick={onOpenScheduleModal}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Schedule a call now &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Call History with Duration & Transcripts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Call History & Minutes Logged ({completedMeetings.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Recorded in Database
            </span>
          </div>

          <div className="space-y-3">
            {completedMeetings.map((meet) => (
              <div
                key={meet.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{meet.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Completed on {meet.dateTime.replace('T', ' ')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {meet.durationMinutes} Minutes Logged
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Host: {meet.hostName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(meet.id, meet.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {meet.aiSummary?.overview && (
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 line-clamp-2">
                    {meet.aiSummary.overview}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400">
                    {meet.transcript?.length || 0} transcript utterances logged
                  </span>
                  <button
                    onClick={() => onInspectTranscript(meet.id)}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Inspect AI Transcript &rarr;</span>
                  </button>
                </div>
              </div>
            ))}

            {completedMeetings.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No completed call sessions logged yet.</p>
                <p className="text-[11px] text-slate-400">
                  When you conclude an in-app live call, it will appear here automatically with duration logged.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Call Details</h3>
              <button
                onClick={() => setEditingMeeting(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateMeeting(editingMeeting.id, {
                  title: editingMeeting.title,
                  description: editingMeeting.description,
                  dateTime: editingMeeting.dateTime,
                  durationMinutes: Number(editingMeeting.durationMinutes),
                  meetingUrl: editingMeeting.meetingUrl,
                  scheduleType: editingMeeting.scheduleType,
                });
                setEditingMeeting(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingMeeting.title}
                  onChange={(e) =>
                    setEditingMeeting({ ...editingMeeting, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={editingMeeting.dateTime}
                  onChange={(e) =>
                    setEditingMeeting({ ...editingMeeting, dateTime: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editingMeeting.durationMinutes}
                    onChange={(e) =>
                      setEditingMeeting({
                        ...editingMeeting,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cadence</label>
                  <select
                    value={editingMeeting.scheduleType}
                    onChange={(e) =>
                      setEditingMeeting({
                        ...editingMeeting,
                        scheduleType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="weekly">Weekly Sync</option>
                    <option value="daily">Daily Standup</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting URL</label>
                <input
                  type="url"
                  value={editingMeeting.meetingUrl}
                  onChange={(e) =>
                    setEditingMeeting({ ...editingMeeting, meetingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
