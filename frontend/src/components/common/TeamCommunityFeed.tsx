import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, CommunityPost, CommunityReply, PostAttachment, PostLink } from '../../types';
import {
  Send,
  Edit2,
  Trash2,
  MessageCircle,
  Paperclip,
  Link2,
  Plus,
  X,
  FileText,
  Presentation,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  ExternalLink,
  Calendar,
  Clock,
  Heart,
  CornerDownRight,
  Sparkles,
  Download,
  Search,
  Filter,
  Tag,
  ChevronDown,
  Check,
} from 'lucide-react';

const PRESET_TOPIC_TYPES = [
  { label: 'Announcement', icon: '📢' },
  { label: 'Roadmap', icon: '🚀' },
  { label: 'Engineering', icon: '🛠️' },
  { label: 'Question', icon: '❓' },
  { label: 'Resource', icon: '📁' },
  { label: 'Discussion', icon: '💬' },
  { label: 'Security', icon: '🔒' },
];

interface TeamCommunityFeedProps {
  batchPosts: CommunityPost[];
  currentUser: User;
  addCommunityPost: (
    title: string,
    content: string,
    tags?: string[],
    attachments?: PostAttachment[],
    links?: PostLink[]
  ) => void;
  editCommunityPost: (postId: string, title: string, content: string) => void;
  deleteCommunityPost: (postId: string) => void;
  addCommunityReply: (
    postId: string,
    content: string,
    parentReplyId?: string,
    replyToUserName?: string,
    attachments?: PostAttachment[]
  ) => void;
  deleteCommunityReply: (postId: string, replyId: string) => void;
}

// Helpers
export const formatPostDate = (isoOrDateStr: string) => {
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) {
      const parts = isoOrDateStr.split(' ');
      return {
        date: parts[0] || isoOrDateStr,
        time: parts[1] || '',
        relative: isoOrDateStr,
      };
    }
    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const now = new Date();
    const diffSecs = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
    let relative = 'Just now';
    if (diffSecs >= 86400) {
      const days = Math.floor(diffSecs / 86400);
      relative = `${days}d ago`;
    } else if (diffSecs >= 3600) {
      const hours = Math.floor(diffSecs / 3600);
      relative = `${hours}h ago`;
    } else if (diffSecs >= 60) {
      const mins = Math.floor(diffSecs / 60);
      relative = `${mins}m ago`;
    }

    return {
      date: dateFormatted,
      time: timeFormatted,
      relative,
    };
  } catch {
    return {
      date: isoOrDateStr,
      time: '',
      relative: isoOrDateStr,
    };
  }
};

const getAttachmentIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-rose-500" />;
    case 'ppt':
      return <Presentation className="w-4 h-4 text-amber-500" />;
    case 'doc':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-purple-500" />;
    case 'link':
      return <Link2 className="w-4 h-4 text-sky-500" />;
    default:
      return <File className="w-4 h-4 text-slate-500" />;
  }
};

const detectFileType = (fileName: string): PostAttachment['type'] => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['ppt', 'pptx'].includes(ext || '')) return 'ppt';
  if (['doc', 'docx'].includes(ext || '')) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'spreadsheet';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) return 'image';
  return 'other';
};

interface ThreadReplyNode extends CommunityReply {
  children: ThreadReplyNode[];
}

const buildReplyTree = (replies: CommunityReply[]): ThreadReplyNode[] => {
  const map = new Map<string, ThreadReplyNode>();
  const roots: ThreadReplyNode[] = [];

  replies.forEach((r) => {
    map.set(r.id, { ...r, children: [] });
  });

  replies.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentReplyId && map.has(r.parentReplyId)) {
      map.get(r.parentReplyId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

// Threaded Reply Item Component
interface ReplyItemProps {
  reply: ThreadReplyNode;
  postId: string;
  depth: number;
  currentUser: User;
  onDeleteReply: (postId: string, replyId: string) => void;
  onToggleLikeReply: (postId: string, replyId: string) => void;
  activeReplyTo: { replyId: string; authorName: string } | null;
  setActiveReplyTo: (val: { replyId: string; authorName: string } | null) => void;
  replyDraft: string;
  setReplyDraft: (text: string) => void;
  onSubmitNestedReply: (parentReplyId: string, replyToUserName: string) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  postId,
  depth,
  currentUser,
  onDeleteReply,
  onToggleLikeReply,
  activeReplyTo,
  setActiveReplyTo,
  replyDraft,
  setReplyDraft,
  onSubmitNestedReply,
}) => {
  const isOwnReply = reply.authorId === currentUser.id;
  const isTargetOfReply = activeReplyTo?.replyId === reply.id;
  const hasLiked = reply.likedBy?.includes(currentUser.id);
  const timeInfo = formatPostDate(reply.createdAt);

  return (
    <div className="space-y-2 relative group/reply">
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isTargetOfReply
            ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-100 shadow-xs'
            : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80 shadow-2xs'
        }`}
      >
        {/* Reply Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <img
              src={
                reply.authorAvatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={reply.authorName}
              className="w-6 h-6 rounded-full object-cover border border-slate-300 shadow-2xs"
            />
            <span className="font-bold text-slate-900 text-xs">{reply.authorName}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-bold uppercase tracking-wider">
              {reply.authorRole.replace('_', ' ')}
            </span>

            {/* Replying To indication */}
            {reply.replyToUserName && (
              <span className="text-[10px] text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <CornerDownRight className="w-3 h-3 text-sky-500" />
                <span>@{reply.replyToUserName}</span>
              </span>
            )}

            {/* Timestamp */}
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium pl-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {timeInfo.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {timeInfo.time}
              </span>
              <span className="text-slate-400 font-semibold">({timeInfo.relative})</span>
            </div>
          </div>

          {/* Delete action */}
          {isOwnReply && (
            <button
              onClick={() => {
                if (window.confirm('Delete this reply?')) onDeleteReply(postId, reply.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete reply"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Reply Body */}
        <p className="text-slate-700 text-xs pl-8 leading-relaxed whitespace-pre-line">
          {reply.content}
        </p>

        {/* Reply Attachments (if any) */}
        {reply.attachments && reply.attachments.length > 0 && (
          <div className="pl-8 pt-2 flex flex-wrap gap-2">
            {reply.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-2xs transition-all"
              >
                {getAttachmentIcon(att.type)}
                <span className="font-medium max-w-[150px] truncate">{att.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Reply Footer: Likes & "Reply" trigger */}
        <div className="flex items-center space-x-3 pl-8 pt-2 text-[11px]">
          <button
            onClick={() => onToggleLikeReply(postId, reply.id)}
            className={`flex items-center space-x-1 font-semibold transition-colors ${
              hasLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{reply.likes || 0}</span>
          </button>

          <button
            onClick={() => {
              if (isTargetOfReply) {
                setActiveReplyTo(null);
                setReplyDraft('');
              } else {
                setActiveReplyTo({ replyId: reply.id, authorName: reply.authorName });
                setReplyDraft(`@${reply.authorName} `);
              }
            }}
            className="flex items-center space-x-1 text-sky-600 hover:text-sky-800 font-bold transition-colors"
          >
            <CornerDownRight className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Inline Reply Composer (Thread to Thread) */}
      {isTargetOfReply && (
        <div className="ml-4 sm:ml-8 p-3 rounded-2xl bg-sky-50/50 border border-sky-200 shadow-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-900 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-sky-600" />
              Replying to <strong className="font-bold">@{reply.authorName}</strong>
            </span>
            <button
              onClick={() => {
                setActiveReplyTo(null);
                setReplyDraft('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (replyDraft.trim()) {
                    onSubmitNestedReply(reply.id, reply.authorName);
                  }
                }
              }}
              placeholder={`Write a reply to @${reply.authorName}...`}
              className="flex-1 px-3 py-2 rounded-xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
            <button
              onClick={() => onSubmitNestedReply(reply.id, reply.authorName)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1 shadow-2xs"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Nested Children (Recursive Branch) */}
      {reply.children && reply.children.length > 0 && (
        <div className="pl-4 sm:pl-6 border-l-2 border-slate-200/90 space-y-2.5 mt-2">
          {reply.children.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              postId={postId}
              depth={depth + 1}
              currentUser={currentUser}
              onDeleteReply={onDeleteReply}
              onToggleLikeReply={onToggleLikeReply}
              activeReplyTo={activeReplyTo}
              setActiveReplyTo={setActiveReplyTo}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              onSubmitNestedReply={onSubmitNestedReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TeamCommunityFeed: React.FC<TeamCommunityFeedProps> = ({
  batchPosts,
  currentUser,
  addCommunityPost,
  editCommunityPost,
  deleteCommunityPost,
  addCommunityReply,
  deleteCommunityReply,
}) => {
  const { toggleLikePost, toggleLikeReply } = useApp();

  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Announcement']);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PostAttachment[]>([]);
  const [pendingLinks, setPendingLinks] = useState<PostLink[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [linkTitleInput, setLinkTitleInput] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Edit State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitleDraft, setEditTitleDraft] = useState('');
  const [editContentDraft, setEditContentDraft] = useState('');

  // Top-level Reply State per post
  const [topReplyInput, setTopReplyInput] = useState<{ [postId: string]: string }>({});

  // Active Nested Reply State
  const [activeReplyTo, setActiveReplyTo] = useState<{
    postId: string;
    replyId: string;
    authorName: string;
  } | null>(null);
  const [nestedReplyDraft, setNestedReplyDraft] = useState('');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Document Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAtts: PostAttachment[] = Array.from(files).map((file) => {
      const type = detectFileType(file.name);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      return {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type,
        size: sizeStr,
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Auto-suggest Resource tag when uploading documents
    if (selectedTags.length === 1 && selectedTags[0] === 'Announcement') {
      setSelectedTags(['Announcement', 'Resource']);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setCustomTagInput('');
  };

  // Handle Link Add
  const handleAddLink = () => {
    if (!linkUrlInput.trim()) return;
    let url = linkUrlInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const title = linkTitleInput.trim() || url.replace(/^https?:\/\//i, '');
    setPendingLinks((prev) => [
      ...prev,
      {
        id: `link_${Date.now()}`,
        title,
        url,
      },
    ]);
    setLinkUrlInput('');
    setLinkTitleInput('');
    setShowLinkInput(false);
  };

  // Publish Post
  const handlePublish = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    addCommunityPost(
      newPostTitle.trim(),
      newPostContent.trim(),
      selectedTags.length > 0 ? selectedTags : ['General'],
      pendingAttachments,
      pendingLinks
    );

    // Reset
    setNewPostTitle('');
    setNewPostContent('');
    setSelectedTags(['Announcement']);
    setPendingAttachments([]);
    setPendingLinks([]);
  };

  // Handle Nested Reply Submission
  const handleNestedReplySubmit = (
    postId: string,
    parentReplyId: string,
    replyToUserName: string
  ) => {
    if (!nestedReplyDraft.trim()) return;
    addCommunityReply(postId, nestedReplyDraft.trim(), parentReplyId, replyToUserName);
    setActiveReplyTo(null);
    setNestedReplyDraft('');
  };

  // Available tags for filtering
  const allTags = Array.from(
    new Set(batchPosts.flatMap((p) => p.tags || []))
  );

  // Filtered posts
  const filteredPosts = batchPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Post Creation Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base tracking-tight">
                Batch Community Forum & Threads
              </h2>
              <p className="text-xs text-slate-500">
                Share updates, technical questions, roadmaps, and document attachments
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {batchPosts.length} Topics
          </span>
        </div>

        {/* Post Form */}
        <div className="space-y-3">
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Topic Title or Announcement Headline..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
          />

          <textarea
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Write your discussion post, share project milestones, architecture notes..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-none"
          />

          {/* Pending Attachments & Links Preview */}
          {(pendingAttachments.length > 0 || pendingLinks.length > 0) && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Attached Files & Links ({pendingAttachments.length + pendingLinks.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {pendingAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs group"
                  >
                    {getAttachmentIcon(att.type)}
                    <span className="font-semibold text-slate-800 max-w-[160px] truncate">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                    <button
                      onClick={() =>
                        setPendingAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                      className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {pendingLinks.map((lnk) => (
                  <div
                    key={lnk.id}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs shadow-2xs group text-sky-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold max-w-[160px] truncate">{lnk.title}</span>
                    <button
                      onClick={() => setPendingLinks((prev) => prev.filter((l) => l.id !== lnk.id))}
                      className="p-0.5 text-sky-500 hover:text-rose-600 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Link Flyout / Input */}
          {showLinkInput && (
            <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-sky-600" />
                  Attach External Link / Document URL
                </span>
                <button
                  onClick={() => setShowLinkInput(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf or figma link..."
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-sky-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Link Title (e.g. Design Specs, Sprint Deck)..."
                  value={linkTitleInput}
                  onChange={(e) => setLinkTitleInput(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-sky-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  Attach Link
                </button>
              </div>
            </div>
          )}

          {/* Post Footer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* File Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.zip"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
                title="Upload PDF, PPT, Word, Excel, or Image"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload Document / PPT / PDF</span>
              </button>

              {/* Link Attachment Button */}
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
              >
                <Link2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Add Web Link</span>
              </button>

              {/* Topic Type / Tag Selector Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagMenu(!showTagMenu)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
                >
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Type: <strong className="font-bold text-slate-900">{selectedTags[0]}</strong>
                    {selectedTags.length > 1 ? ` (+${selectedTags.length - 1})` : ''}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Popover Menu */}
                {showTagMenu && (
                  <div className="absolute left-0 bottom-full mb-2 z-30 w-72 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-900 text-xs">Select Topic Category</span>
                      <button
                        type="button"
                        onClick={() => setShowTagMenu(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_TOPIC_TYPES.map((pt) => {
                        const isSelected = selectedTags.includes(pt.label);
                        return (
                          <button
                            key={pt.label}
                            type="button"
                            onClick={() => handleToggleTag(pt.label)}
                            className={`px-2 py-1.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>{pt.icon}</span>
                              <span className="truncate">{pt.label}</span>
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Tag Input */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Add Custom Tag
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTag();
                            }
                          }}
                          placeholder="e.g. Sprint-3, UI-Design..."
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTag}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Tag Badges display */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                  >
                    <span>#{tag}</span>
                    {selectedTags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                        className="p-0.5 text-blue-400 hover:text-rose-600 rounded"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handlePublish}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by topic, keyword, or author..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Topics ({batchPosts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isOwnPost = post.authorId === currentUser.id;
          const isEditing = editingPostId === post.id;
          const hasLikedPost = post.likedBy?.includes(currentUser.id);
          const timeInfo = formatPostDate(post.createdAt);
          const replyTree = buildReplyTree(post.replies || []);

          return (
            <div
              key={post.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 transition-all hover:border-slate-300"
            >
              {/* Post Header: Author, Role, Date & Time */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={
                      post.authorAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-sm">{post.authorName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {post.authorRole.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Exact Date & Time */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {timeInfo.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {timeInfo.time}
                      </span>
                      <span className="font-semibold text-slate-500">({timeInfo.relative})</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete for author */}
                {isOwnPost && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditTitleDraft(post.title);
                        setEditContentDraft(post.content);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit post"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this post?')) deleteCommunityPost(post.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Body or Edit Mode */}
              {isEditing ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="text"
                    value={editTitleDraft}
                    onChange={(e) => setEditTitleDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={editContentDraft}
                    onChange={(e) => setEditContentDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        editCommunityPost(post.id, editTitleDraft, editContentDraft);
                        setEditingPostId(null);
                      }}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Uploaded Attachments Display */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Attached Documents ({post.attachments.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {post.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-xs hover:border-blue-400 hover:shadow-xs transition-all group"
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              {getAttachmentIcon(att.type)}
                              <div className="truncate">
                                <span className="font-bold text-slate-900 group-hover:text-blue-600 block truncate">
                                  {att.name}
                                </span>
                                {att.size && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {att.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links Display */}
                  {post.links && post.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.links.map((lnk) => (
                        <a
                          key={lnk.id}
                          href={lnk.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-sky-800 transition-colors shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          <span>{lnk.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    {post.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Likes & Replies Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center space-x-1.5 font-bold transition-colors ${
                      hasLikedPost ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${hasLikedPost ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span>{post.likes || 0} Likes</span>
                  </button>

                  <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>{post.replies?.length || 0} Replies</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">Thread ID: #{post.id}</span>
              </div>

              {/* Threaded Replies Section */}
              <div className="pt-3 border-t border-slate-100 space-y-4">
                {/* Reply Tree */}
                {replyTree.length > 0 && (
                  <div className="space-y-3 pl-1">
                    {replyTree.map((replyNode) => (
                      <ReplyItem
                        key={replyNode.id}
                        reply={replyNode}
                        postId={post.id}
                        depth={0}
                        currentUser={currentUser}
                        onDeleteReply={deleteCommunityReply}
                        onToggleLikeReply={toggleLikeReply}
                        activeReplyTo={
                          activeReplyTo?.postId === post.id
                            ? {
                                replyId: activeReplyTo.replyId,
                                authorName: activeReplyTo.authorName,
                              }
                            : null
                        }
                        setActiveReplyTo={(val) => {
                          if (val) {
                            setActiveReplyTo({ postId: post.id, ...val });
                          } else {
                            setActiveReplyTo(null);
                          }
                        }}
                        replyDraft={nestedReplyDraft}
                        setReplyDraft={setNestedReplyDraft}
                        onSubmitNestedReply={(parentReplyId, replyToUserName) =>
                          handleNestedReplySubmit(post.id, parentReplyId, replyToUserName)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Main Top-Level Reply Input for Post */}
                <div className="flex items-center space-x-2 pt-2">
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={topReplyInput[post.id] || ''}
                      onChange={(e) =>
                        setTopReplyInput({ ...topReplyInput, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const text = topReplyInput[post.id];
                          if (text && text.trim()) {
                            addCommunityReply(post.id, text.trim());
                            setTopReplyInput({ ...topReplyInput, [post.id]: '' });
                          }
                        }
                      }}
                      placeholder="Join the discussion... reply to this thread"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => {
                        const text = topReplyInput[post.id];
                        if (!text || !text.trim()) return;
                        addCommunityReply(post.id, text.trim());
                        setTopReplyInput({ ...topReplyInput, [post.id]: '' });
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-2xs transition-all flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No topics found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No community discussions match your query. Be the first to start a conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
