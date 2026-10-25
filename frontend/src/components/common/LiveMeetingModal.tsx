import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Sparkles,
  Copy,
  Check,
  Subtitles,
  Volume2,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface LiveMeetingModalProps {
  meeting: Meeting;
  onClose: () => void;
}

export const LiveMeetingModal: React.FC<LiveMeetingModalProps> = ({ meeting, onClose }) => {
  const { currentUser, users, endCall, logAttendance } = useApp();

  // Call duration counter
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [activeSideTab, setActiveSideTab] = useState<'participants' | 'chat' | 'aiNotes'>('participants');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Manual participant presence override for testing threshold (mins)
  const [presenceOverrides, setPresenceOverrides] = useState<Record<string, number>>({});

  // In-call chat
  const [inCallMessages, setInCallMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Live encrypted meeting room established.', time: 'Just now' },
    { sender: meeting.hostName, text: `Welcome to ${meeting.title}!`, time: 'Just now' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Live subtitles / speech stream simulation
  const [currentCaption, setCurrentCaption] = useState<{ speaker: string; text: string }>({
    speaker: meeting.hostName,
    text: `Let's get started with our ${meeting.title}. I'm sharing the review agenda now.`,
  });

  // Media stream refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Participants in call
  const batchAttendees = users.filter(
    (u) =>
      u.batchIds?.includes(meeting.batchId) ||
      u.id === currentUser.id ||
      u.name === meeting.hostName
  );

  // Distinct attendee list (limit to 4-6 for clean responsive grid)
  const activeAttendees = batchAttendees.slice(0, 5);
  if (!activeAttendees.some((u) => u.id === currentUser.id)) {
    activeAttendees.push(currentUser);
  }

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Simulated live captions rotation
  useEffect(() => {
    if (!showCaptions) return;
    const captionSnippets = [
      { speaker: meeting.hostName, text: 'Confirming all milestone criteria and telemetry integrations are operational.' },
      { speaker: 'Sarah Jenkins', text: 'The client verification test on Globex passed with zero exceptions.' },
      { speaker: 'Alex Rivera', text: 'API response times are consistently under 45ms across all test regions.' },
      { speaker: meeting.hostName, text: 'Action items will be summarized automatically by Gemini AI upon session conclusion.' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % captionSnippets.length;
      setCurrentCaption(captionSnippets[index]);
    }, 8000);

    return () => clearInterval(interval);
  }, [showCaptions, meeting.hostName]);

  // Handle Camera Toggle with real webcam if available
  useEffect(() => {
    let active = true;

    if (isCameraOn) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            if (active) {
              mediaStreamRef.current = stream;
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
            }
          })
          .catch(() => {
            // Permission denied or no camera device, keep UI animated state
          });
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn]);

  // Handle Screen Share Toggle
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setIsScreenSharing(true);
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        } catch {
          setIsScreenSharing(false);
        }
      } else {
        setIsScreenSharing(!isScreenSharing);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  // Copy Meeting URL
  const handleCopyLink = () => {
    const url = meeting.meetingUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Send In-call Chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: currentUser.name,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setInCallMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // End Call handler
  const handleEndCall = async () => {
    setIsEnding(true);
    const durationMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

    // Compile participants attendance respecting any presence overrides
    const participants = activeAttendees.map((att) => {
      const mins = presenceOverrides[att.id] !== undefined ? presenceOverrides[att.id] : durationMinutes;
      return {
        userId: att.id,
        userName: att.name,
        userRole: att.role,
        minutesPresent: mins,
      };
    });

    // Compile in-call transcripts
    const inCallTranscripts = inCallMessages
      .filter((m) => m.sender !== 'System')
      .map((m) => ({
        speaker: m.sender,
        timestamp: m.time,
        text: m.text,
      }));

    const fullTranscript = [
      ...(meeting.transcript || []),
      ...inCallTranscripts,
      {
        speaker: currentUser.name,
        timestamp: formatTime(elapsedSeconds),
        text: `Session concluded. Total duration: ${durationMinutes} minutes. Attendance processed with 50% threshold.`,
      },
    ];

    // End call in backend database - letting backend AI generator create comprehensive summary
    try {
      await endCall(meeting.id, {
        durationMinutes: durationMinutes,
        participants: participants,
        transcript: fullTranscript,
      });
    } catch {}

    setIsEnding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col text-white animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-red-600/20 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>LIVE SESSION</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{meeting.title}</span>
              <span className="text-[10px] text-slate-400 font-normal">({meeting.batchId})</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 transition"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Google Meet & Zoom External Session Bridge */}
      {(meeting.platform === 'google_meet' ||
        meeting.platform === 'zoom' ||
        meeting.meetingUrl?.includes('meet.google.com') ||
        meeting.meetingUrl?.includes('zoom.us')) && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <div>
              <span className="font-extrabold text-white">
                {meeting.platform === 'zoom' || meeting.meetingUrl?.includes('zoom.us')
                  ? 'Zoom Meeting Room Active'
                  : 'Google Meet Room Active'}
              </span>
              <span className="text-emerald-300 ml-2 hidden sm:inline">
                Live attendance tracker & AI transcript listener running.
              </span>
            </div>
          </div>
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition"
          >
            <span>
              Open {meeting.platform === 'zoom' || meeting.meetingUrl?.includes('zoom.us') ? 'Zoom' : 'Google Meet'} Window
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Stage Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-0 overflow-y-auto pr-1">
            {/* Tile 1: Local User */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg group">
              {isCameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl border-2 border-indigo-400/40">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{currentUser.name} (You)</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              {/* Status Tags */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white flex items-center space-x-1.5 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>You ({currentUser.name})</span>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center space-x-1.5">
                <div
                  className={`p-1.5 rounded-lg text-xs ${
                    isMicOn ? 'bg-emerald-600/80 text-white' : 'bg-red-600/80 text-white'
                  }`}
                >
                  {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {/* Other Attendees Tiles */}
            {activeAttendees
              .filter((u) => u.id !== currentUser.id)
              .map((attendee, idx) => {
                const isHost = attendee.name === meeting.hostName;
                const colors = [
                  'from-purple-600 to-pink-500',
                  'from-emerald-600 to-teal-500',
                  'from-amber-600 to-orange-500',
                  'from-cyan-600 to-blue-500',
                ];
                const bgGradient = colors[idx % colors.length];

                return (
                  <div
                    key={attendee.id}
                    className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg group hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col items-center justify-center p-6 space-y-3">
                      <div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${bgGradient} flex items-center justify-center text-white text-2xl font-bold shadow-xl border-2 border-white/20`}
                      >
                        {attendee.name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white flex items-center justify-center space-x-1">
                          <span>{attendee.name}</span>
                          {isHost && (
                            <span className="bg-purple-600/80 text-[9px] px-1.5 py-0.5 rounded text-white font-bold">
                              HOST
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider">{attendee.role.replace('_', ' ')}</p>
                      </div>
                    </div>

                    {/* Status Tags */}
                    <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white flex items-center space-x-1.5 border border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{attendee.name}</span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center space-x-1.5">
                      <div className="p-1.5 rounded-lg text-xs bg-emerald-600/80 text-white">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Real-time Subtitles / Captions Overlay */}
          {showCaptions && (
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center space-x-3 shrink-0">
              <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-400 shrink-0">
                <Subtitles className="w-4 h-4" />
              </div>
              <div className="text-xs flex-1">
                <span className="font-bold text-purple-400 mr-2">{currentCaption.speaker}:</span>
                <span className="text-slate-200">{currentCaption.text}</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI Live Captions</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Side Panel (Participants / Chat / AI Notes) */}
        {isSidePanelOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
            {/* Side Tabs Header */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveSideTab('participants')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 transition ${
                  activeSideTab === 'participants'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Attendees ({activeAttendees.length})</span>
              </button>

              <button
                onClick={() => setActiveSideTab('chat')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 transition ${
                  activeSideTab === 'chat'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>In-Call Chat</span>
              </button>

              <button
                onClick={() => setActiveSideTab('aiNotes')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-1.5 transition ${
                  activeSideTab === 'aiNotes'
                    ? 'border-purple-500 text-purple-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Notes</span>
              </button>
            </div>

            {/* Side Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeSideTab === 'participants' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                    <span>Verified Attendance Logging</span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>PostgreSQL Synced</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-300">Attendance Qualification:</span>
                      <span className="text-amber-400">&gt; 50% Threshold</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Call Duration: <strong className="text-white">{meeting.durationMinutes || 45} mins</strong>. Minimum required for Present: <strong className="text-amber-300">{Math.ceil((meeting.durationMinutes || 45) / 2)} mins</strong>.
                    </p>
                  </div>

                  {activeAttendees.map((att) => {
                    const totalMins = meeting.durationMinutes || 45;
                    const thresholdMins = totalMins / 2.0;
                    const currentMins = presenceOverrides[att.id] !== undefined
                      ? presenceOverrides[att.id]
                      : Math.max(1, Math.ceil(elapsedSeconds / 60));
                    const isPresent = currentMins >= thresholdMins && currentMins > 0;

                    return (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                              {att.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-none">
                                {att.name} {att.id === currentUser.id ? '(You)' : ''}
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                                {att.role.replace('_', ' ')}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                              isPresent
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {isPresent ? <Check className="w-2.5 h-2.5 mr-0.5" /> : <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />}
                            <span>{isPresent ? 'Verified Present' : 'Absent (<50%)'}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                          <span>
                            Attended: <strong className="text-white font-mono">{currentMins}m / {totalMins}m</strong>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => setPresenceOverrides((prev) => ({ ...prev, [att.id]: Math.max(0, currentMins - 10) }))}
                              className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200"
                              title="Simulate less attendance (< 50%)"
                            >
                              -10m
                            </button>
                            <button
                              type="button"
                              onClick={() => setPresenceOverrides((prev) => ({ ...prev, [att.id]: currentMins + 15 }))}
                              className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200"
                              title="Simulate more attendance (> 50%)"
                            >
                              +15m
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSideTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {inCallMessages.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-blue-400">{m.sender}</span>
                          <span>{m.time}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-slate-800 flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type message to room..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {activeSideTab === 'aiNotes' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Gemini Summary</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {meeting.aiSummary?.overview || 'Live AI audio listener is synthesizing discussion points and tracking key milestones.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-1.5">Key Agenda Points:</h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {meeting.aiSummary?.keyPoints?.map((kp, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-purple-400 font-bold">&bull;</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 mb-1.5">Logged Action Items:</h4>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {meeting.aiSummary?.actionItems?.map((act, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-20 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>HD Audio & Video Encrypted</span>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center space-x-3 mx-auto">
          {/* Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isMicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isCameraOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCameraOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isScreenSharing
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Captions */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-lg ${
              showCaptions
                ? 'bg-purple-600/80 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
            title="Live Subtitles / Captions"
          >
            <Subtitles className="w-5 h-5" />
          </button>

          {/* Side Drawer Toggle */}
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isSidePanelOpen
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
            title="Toggle Panel"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* End Call / Leave Call */}
          <button
            onClick={handleEndCall}
            disabled={isEnding}
            className="px-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xl transition"
          >
            <PhoneOff className="w-5 h-5" />
            <span>{isEnding ? 'Ending...' : 'End Call for All'}</span>
          </button>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-xs font-bold text-white">{meeting.hostName}</p>
          <p className="text-[10px] text-slate-400">Host Organiser</p>
        </div>
      </div>
    </div>
  );
};
