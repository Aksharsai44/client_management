import React, { useState, useRef, useEffect } from 'react';
import { User, Batch, ChatMessage, UserRole } from '../../types';
import {
  Send,
  Search,
  Users,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Copy,
  Sparkles,
  Info,
  ShieldCheck,
  Building,
  UserCheck,
  Briefcase,
  X,
  FileText,
  MessageSquare,
} from 'lucide-react';

export interface WorkspaceChatProps {
  currentBatch: Batch;
  batchUsers: User[];
  currentUser: User;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, recipientId?: string) => void;
  activeBatchId: string;
}

export const WorkspaceChat: React.FC<WorkspaceChatProps> = ({
  currentBatch,
  batchUsers,
  currentUser,
  chatMessages,
  sendChatMessage,
  activeBatchId,
}) => {
  // Selected conversation: null means General Batch Group Chat, or user ID for 1:1 Direct Message
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setChatSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [mockAttachment, setMockAttachment] = useState<{ name: string; size: string } | null>(null);

  // Message reactions state { [msgId]: { [emoji]: number } }
  const [reactions, setReactions] = useState<{ [msgId: string]: { [emoji: string]: number } }>({
    msg_01: { '👍': 3, '🚀': 2 },
    msg_02: { '👀': 2 },
    msg_03: { '🔥': 2, '✅': 3 },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedUserId]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const msgReactions = prev[msgId] || {};
      const currentCount = msgReactions[emoji] || 0;
      return {
        ...prev,
        [msgId]: {
          ...msgReactions,
          [emoji]: currentCount + 1,
        },
      };
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !mockAttachment) return;
    const finalMsg = mockAttachment
      ? `${inputText.trim()} [Attached: ${mockAttachment.name}]`
      : inputText.trim();

    sendChatMessage(finalMsg, selectedUserId || undefined);

    setInputText('');
    setMockAttachment(null);
    setShowEmojiPicker(false);
  };

  const quickPresets = [
    'Reviewed and approved! 👍',
    'Joining the live meeting now 🚀',
    'Investigating this right away 🔍',
    'Sandbox is ready for validation ✅',
    'Shared the updated documents in Resources 📁',
  ];

  const emojisList = ['👍', '❤️', '🚀', '🎉', '🔥', '✅', '👀', '💡'];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'product_super_admin':
      case 'product_admin':
        return {
          label: 'Product Admin',
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: ShieldCheck,
        };
      case 'company_admin':
        return {
          label: 'Company Admin',
          bg: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Building,
        };
      case 'client':
        return {
          label: 'Client',
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'work_user':
        return {
          label: 'Team Member',
          bg: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Briefcase,
        };
      default:
        return {
          label: 'User',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Users,
        };
    }
  };

  // Find active direct user if selected
  const activeUser = selectedUserId ? batchUsers.find((u) => u.id === selectedUserId) : null;

  // Filter messages based on active context
  const filteredMessages = chatMessages.filter((m) => {
    if (activeUser) {
      return (
        (m.senderId === currentUser.id && m.recipientId === activeUser.id) ||
        (m.senderId === activeUser.id && m.recipientId === currentUser.id)
      );
    }
    // Main batch group chat
    return m.batchId === activeBatchId && !m.recipientId;
  });

  // Filter directory users
  const filteredUsers = batchUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col md:flex-row antialiased">
      {/* LEFT PANEL: Directory & Conversations */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0 h-full">
        {/* Header - LOCKED */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 tracking-tight">Team Chat</h3>
              <p className="text-[10px] text-slate-500 font-medium">Batch Collaboration & DMs</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Search - LOCKED */}
        <div className="p-2.5 border-b border-slate-200/80 bg-white/50 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setChatSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Main Batch Group Chat - PERMANENTLY LOCKED AT TOP */}
        <div className="p-2.5 border-b border-slate-200 bg-white/60 shrink-0">
          <div className="px-1 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Team Space</span>
            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
              Group
            </span>
          </div>
          <button
            onClick={() => setSelectedUserId(null)}
            className={`w-full text-left px-2.5 py-2.5 rounded-xl flex items-center space-x-3 transition-all ${
              selectedUserId === null
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-800 hover:bg-slate-200/60 font-semibold'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                selectedUserId === null
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs truncate font-bold">
                {currentBatch.name}
              </div>
              <div
                className={`text-[10px] truncate ${
                  selectedUserId === null ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                All batch participants ({batchUsers.length})
              </div>
            </div>
          </button>
        </div>

        {/* Direct Team Members - SCROLLABLE LIST ONLY */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0 custom-chat-scrollbar">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Direct Messages</span>
            <span className="text-[9px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-bold">
              {filteredUsers.length}
            </span>
          </div>
            <div className="mt-1 space-y-0.5">
              {filteredUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                const roleBadge = getRoleBadge(u.role);
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{u.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isSelected ? 'bg-white/20 text-white' : roleBadge.bg
                          }`}
                        >
                          {roleBadge.label}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] truncate block ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {u.companyName || u.designation || 'Enterprise Team'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      {/* RIGHT PANEL: Modern Enterprise Chat Stream - INDEPENDENT SCROLL */}
      <div className="flex-1 flex flex-col bg-white h-full min-h-0 overflow-hidden">
        {/* Chat Stream Header */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {activeUser ? (
              <div className="relative">
                <img
                  src={
                    activeUser.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={activeUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  {activeUser ? activeUser.name : `${currentBatch.name} (Team Group)`}
                </h4>
                {activeUser && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      getRoleBadge(activeUser.role).bg
                    }`}
                  >
                    {getRoleBadge(activeUser.role).label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeUser
                  ? `${activeUser.email} • ${activeUser.companyName || 'Enterprise Partner'}`
                  : `Batch Team Collaboration • ${batchUsers.length} members`}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowInfoBanner(!showInfoBanner)}
              className={`p-2 rounded-lg border text-slate-600 hover:text-slate-900 transition-colors ${
                showInfoBanner
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Conversation Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-1 pl-2 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Realtime
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Info Banner (When toggled) */}
        {showInfoBanner && (
          <div className="bg-blue-50/70 border-b border-blue-200 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 animate-in fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Team Sync:</strong> All messages are archived to enterprise audit logs
                and associated with batch {currentBatch.code}.
              </span>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="text-blue-500 hover:text-blue-700 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Stream Body - INDEPENDENT SCROLL */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 min-h-0 custom-chat-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-800 text-sm">No messages yet in this conversation</h5>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Start the conversation by sending an update or question below.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const roleBadge = getRoleBadge(msg.senderRole);
              const RoleIcon = roleBadge.icon;
              const msgReactions = reactions[msg.id] || {};

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 group ${
                    isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  <img
                    src={
                      msg.senderAvatar ||
                      (isMe
                        ? currentUser.avatar
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
                    }
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 shadow-2xs"
                  />

                  {/* Message Bubble & Metadata */}
                  <div className={`max-w-md sm:max-w-lg flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Header: Name + Role + Timestamp */}
                    <div className="flex items-center space-x-2 mb-1 px-1">
                      <span className="font-extrabold text-xs text-slate-900">{msg.senderName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border flex items-center space-x-1 ${roleBadge.bg}`}
                      >
                        <RoleIcon className="w-2.5 h-2.5" />
                        <span>{roleBadge.label}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`relative rounded-2xl px-4 py-2.5 text-xs transition-all ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Footer within bubble */}
                      <div
                        className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${
                          isMe ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                      </div>
                    </div>

                    {/* Reaction Pills */}
                    {Object.keys(msgReactions).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5 px-1">
                        {Object.entries(msgReactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 font-semibold text-slate-700 flex items-center space-x-1 transition-colors"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-slate-600 font-bold">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions on Hover */}
                    <div
                      className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 mt-1 px-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs`}
                    >
                      {emojisList.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-xs p-1"
                          title={`React ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Copy message text"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Presets Bar */}
        {showQuickReplies && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 animate-in fade-in">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
              Quick:
            </span>
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset);
                  setShowQuickReplies(false);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-medium transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* Attachment preview if selected */}
        {mockAttachment && (
          <div className="px-4 py-2 bg-blue-50/70 border-t border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{mockAttachment.name}</span>
              <span className="text-[10px] text-blue-500">({mockAttachment.size})</span>
            </div>
            <button
              onClick={() => setMockAttachment(null)}
              className="text-blue-500 hover:text-rose-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Rich Input Composer */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col space-y-2 shrink-0">
          {/* Input field */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  activeUser
                    ? `Message @${activeUser.name}...`
                    : `Message team in ${currentBatch.name}...`
                }
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />

              {/* Action buttons inside input */}
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors ${
                    showEmojiPicker ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                  title="Emoji reactions"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMockAttachment({
                      name: 'Sprint_Progress_Summary.pdf',
                      size: '1.8 MB',
                    })
                  }
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() && !mockAttachment}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs ${
                inputText.trim() || mockAttachment
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom helper row */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className="hover:text-blue-600 flex items-center space-x-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Responses</span>
              </button>
              <span className="hidden sm:inline">&bull; Press Enter to send</span>
            </div>
            <span className="text-[10px] text-slate-400">Enterprise Encrypted</span>
          </div>

          {/* Emoji Drawer */}
          {showEmojiPicker && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 animate-in fade-in">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Pick:
              </span>
              {emojisList.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputText((prev) => prev + ' ' + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-base hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
