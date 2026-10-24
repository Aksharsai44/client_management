import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Batch, ChatMessage, UserRole, ChatAttachment } from '../../types';
import { UserAvatar } from './UserAvatar';
import { useApp } from '../../context/AppContext';
import { chatApi } from '../../services/chatApi';
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
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Maximize2,
  FileSpreadsheet,
  FileCode,
  Loader2,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
} from 'lucide-react';

export interface WorkspaceChatProps {
  currentBatch: Batch;
  batchUsers: User[];
  currentUser: User;
  chatMessages: ChatMessage[];
  sendChatMessage: (
    text: string,
    recipientId?: string,
    attachment?: ChatAttachment,
    attachments?: ChatAttachment[]
  ) => void;
  activeBatchId: string;
}

// Helper to extract numerical epoch timestamp from a message for WhatsApp-style sorting
const getMessageTimeMs = (msg: ChatMessage): number => {
  if (!msg) return 0;

  // 1. If explicit ISO createdAt exists
  if (msg.createdAt) {
    const t = new Date(msg.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  // 2. If id has epoch milliseconds (e.g. msg_1729500000000)
  const numMatch = msg.id?.match(/msg_(\d{11,14})/);
  if (numMatch) {
    const t = parseInt(numMatch[1], 10);
    if (!isNaN(t) && t > 0) return t;
  }

  // 3. Parse timestamp string (e.g. "05:42 PM", "10:35 AM", "17:42")
  if (msg.timestamp) {
    const timeMatch = msg.timestamp.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const meridian = timeMatch[4]?.toUpperCase();
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      const d = new Date();
      d.setHours(hours, minutes, seconds, 0);
      return d.getTime();
    }
  }

  // 4. Sequential fallback for seed initial data (msg_01, msg_02, etc.)
  const seqMatch = msg.id?.match(/msg_(\d+)/);
  if (seqMatch) {
    return parseInt(seqMatch[1], 10);
  }

  return 0;
};

export const WorkspaceChat: React.FC<WorkspaceChatProps> = ({
  currentBatch,
  batchUsers,
  currentUser,
  chatMessages,
  sendChatMessage,
  activeBatchId,
}) => {
  const {
    markMessagesAsRead,
    users: allUsers,
    batches,
    setActiveBatchId,
    editChatMessage,
    deleteChatMessage,
    deleteChatMessageForMe,
  } = useApp();

  const userBatches = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'product_super_admin' || currentUser.role === 'product_admin') {
      return batches || [];
    }
    return (batches || []).filter((b) => {
      if (currentUser.companyId && b.companyId === currentUser.companyId) return true;
      if (b.leadAdminId === currentUser.id) return true;
      if (
        currentUser.companyName &&
        currentUser.companyName.toLowerCase().includes('acme') &&
        b.companyId === 'comp_acme'
      ) {
        return true;
      }
      return false;
    });
  }, [batches, currentUser]);

  // Scoped directory of chat contacts for currentUser (strictly limited to members of the current batch/group)
  const directoryUsers = useMemo(() => {
    const map = new Map<string, User>();

    // 1. All users in batchUsers (excluding currentUser so user doesn't chat with self)
    (batchUsers || []).forEach((u) => {
      if (u.id !== currentUser.id) {
        map.set(u.id, u);
      }
    });

    // 2. If currentUser is client or work_user, ensure they can always see and message their Company Admin
    if (currentUser.role === 'client' || currentUser.role === 'work_user') {
      const companyAdmin = (allUsers || []).find(
        (u) =>
          u.role === 'company_admin' &&
          (u.id === currentBatch.leadAdminId ||
            (u.batchIds && u.batchIds.includes(activeBatchId)) ||
            (currentUser.companyId && u.companyId === currentUser.companyId))
      );
      if (companyAdmin && companyAdmin.id !== currentUser.id && !map.has(companyAdmin.id)) {
        map.set(companyAdmin.id, companyAdmin);
      }
    }

    return Array.from(map.values());
  }, [batchUsers, allUsers, currentUser, currentBatch.leadAdminId, activeBatchId]);

  // Selected conversation: null means General Batch Group Chat, or user ID for 1:1 Direct Message
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setChatSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Selected attachments before sending (supports multiple photos/documents/videos)
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Message edit state (edits in bottom input box)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Delete message confirmation modal state
  const [deleteConfirmMsgId, setDeleteConfirmMsgId] = useState<string | null>(null);

  // Active message actions menu (3-dots)
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);

  // WhatsApp-style Multi-Photo Lightbox Gallery modal
  const [lightboxGallery, setLightboxGallery] = useState<{
    images: ChatAttachment[];
    index: number;
  } | null>(null);

  // Single Media / Document preview modal fallback
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  // Hidden file input refs & main chat input ref
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Message reactions state { [msgId]: { [emoji]: number } }
  const [reactions, setReactions] = useState<{ [msgId: string]: { [emoji: string]: number } }>({
    msg_01: { '👍': 3, '🚀': 2 },
    msg_02: { '👀': 2 },
    msg_03: { '🔥': 2, '✅': 3 },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);
  const hasAutoSelectedRef = useRef(false);
  const prevUnreadCountRef = useRef(0);

  // Reset selected user if they are not in the current batch directory (e.g. batch changed)
  useEffect(() => {
    if (selectedUserId && !directoryUsers.some((u) => u.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [directoryUsers, selectedUserId]);

  // Find active direct user if selected
  const activeUser = selectedUserId
    ? directoryUsers.find((u) => u.id === selectedUserId) ||
      (allUsers || []).find((u) => u.id === selectedUserId) ||
      null
    : null;

  // Helper to determine if a message is deleted for the current logged-in user
  const isDeletedForCurrentUser = (m: ChatMessage) => {
    return Boolean(m.deletedForUserIds && m.deletedForUserIds.includes(currentUser.id));
  };

  // Unread direct messages targeting currentUser (excluding deleted-for-me messages)
  const unreadDirectMessages = useMemo(() => {
    return chatMessages.filter(
      (m) =>
        m.recipientId === currentUser.id &&
        m.status !== 'read' &&
        !isDeletedForCurrentUser(m)
    );
  }, [chatMessages, currentUser.id]);

  // If there is an unread incoming message from a user in this batch, auto-select on initial load or new arrival
  useEffect(() => {
    const validUnreads = unreadDirectMessages.filter((m) =>
      directoryUsers.some((u) => u.id === m.senderId)
    );
    if (validUnreads.length > 0) {
      const isNewArrival = validUnreads.length > prevUnreadCountRef.current;
      if (!hasAutoSelectedRef.current || (isNewArrival && selectedUserId === null)) {
        const lastUnread = validUnreads[validUnreads.length - 1];
        setSelectedUserId(lastUnread.senderId);
        hasAutoSelectedRef.current = true;
      }
    }
    prevUnreadCountRef.current = validUnreads.length;
  }, [unreadDirectMessages, directoryUsers, selectedUserId]);

  // Filter messages based on active context
  const filteredMessages = useMemo(() => {
    let msgs: ChatMessage[] = [];

    // Filter out messages that currentUser chose to "Delete for me"
    const activeMessages = chatMessages.filter((m) => !isDeletedForCurrentUser(m));

    if (selectedUserId) {
      // 1-on-1 Direct Message conversation
      msgs = activeMessages.filter((m) => {
        return (
          (m.senderId === currentUser.id && m.recipientId === selectedUserId) ||
          (m.senderId === selectedUserId && m.recipientId === currentUser.id)
        );
      });
    } else {
      // Main batch group chat
      msgs = activeMessages.filter((m) => {
        // Direct messages are strictly isolated to 1:1 conversation
        if (m.recipientId && m.recipientId !== 'group') return false;

        // Group messages match by batchId
        if (m.batchId) {
          return m.batchId === activeBatchId || m.batchId === currentBatch.id;
        }

        // Organization level group messages if no batchId
        if (currentUser.companyId && m.companyId === currentUser.companyId) {
          return true;
        }
        return false;
      });
    }

    // Sort chronologically (oldest to newest) for chat stream rendering
    return msgs.slice().sort((a, b) => getMessageTimeMs(a) - getMessageTimeMs(b));
  }, [chatMessages, selectedUserId, currentUser, activeBatchId, currentBatch.id]);

  // Auto-scroll when messages change or recipient changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, selectedUserId]);

  // Close attachment dropdown and message action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(e.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
      // Only close 3-dots message action menu if click is outside the menu and its trigger button
      if (target && !target.closest('.message-actions-menu') && !target.closest('.message-actions-trigger')) {
        setActiveMenuMsgId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for Lightbox Photo Gallery (Esc, Left Arrow, Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxGallery) {
        if (e.key === 'Escape') {
          setLightboxGallery(null);
        } else if (e.key === 'ArrowLeft') {
          setLightboxGallery((prev) =>
            prev
              ? {
                  ...prev,
                  index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                }
              : null
          );
        } else if (e.key === 'ArrowRight') {
          setLightboxGallery((prev) =>
            prev
              ? {
                  ...prev,
                  index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                }
              : null
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxGallery]);

  // WhatsApp-style Auto-read receipt:
  // When viewing this conversation, find all messages sent by others that are not 'read' yet,
  // and mark them as read in the database so the sender sees Blue Double Ticks!
  useEffect(() => {
    if (!markMessagesAsRead) return;

    const unreadFromOthers = filteredMessages.filter(
      (m) => m.senderId !== currentUser.id && m.status !== 'read'
    );

    if (unreadFromOthers.length > 0) {
      const unreadIds = unreadFromOthers.map((m) => m.id);
      markMessagesAsRead(unreadIds, activeUser ? activeUser.id : undefined);
    }
  }, [filteredMessages, currentUser.id, selectedUserId, markMessagesAsRead, activeUser]);

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

  // Resolve media URLs safely (handles relative /chat_attachments/ or /media/ by targeting backend host)
  const resolveMediaUrl = (url?: string): string => {
    if (!url || url === '#') return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return cleanPath;
  };

  // Safe Image error handler: attempts direct backend URL fallback, then thumbnailUrl
  const handleImgError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    att?: ChatAttachment
  ) => {
    if (!att) return;
    const currentSrc = e.currentTarget.src;
    const cleanUrl = att.url || '';
    const directBackend = `http://localhost:8000${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
    if (!currentSrc.includes(':8000') && cleanUrl.startsWith('/')) {
      e.currentTarget.src = directBackend;
    } else if (att.thumbnailUrl && currentSrc !== att.thumbnailUrl) {
      e.currentTarget.src = att.thumbnailUrl;
    }
  };

  // Download any file, image, or document safely
  const handleDownloadFile = async (rawUrl?: string, filename?: string) => {
    const name = filename || 'downloaded-file';
    const url = resolveMediaUrl(rawUrl);

    if (!url || url === '#' || (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:'))) {
      const ext = name.split('.').pop()?.toLowerCase() || 'txt';
      let mime = 'text/plain';
      if (ext === 'pdf') mime = 'application/pdf';
      else if (['doc', 'docx'].includes(ext))
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (['xls', 'xlsx'].includes(ext))
        mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const dummyContent = `=================================================\n${name}\nDownloaded from Client Management Workspace Chat\nBatch: ${currentBatch.name}\nTimestamp: ${new Date().toLocaleString()}\n=================================================`;
      const blob = new Blob([dummyContent], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Remote URL: Fetch as blob so cross-origin downloads trigger real file save
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Open or View document
  const handleOpenOrViewDoc = (doc: ChatAttachment) => {
    const url = resolveMediaUrl(doc.url);
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      handleDownloadFile(doc.url, doc.name);
    }
  };

  // Start message editing: populates the main bottom chat input and focuses it
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setInputText(msg.text || '');
    setActiveMenuMsgId(null);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  };

  // Save edited message from the bottom input box
  const handleSaveEdit = async () => {
    if (!editingMessageId) return;
    const targetMsg = chatMessages.find((m) => m.id === editingMessageId);
    const hasAttachments =
      (targetMsg?.attachments && targetMsg.attachments.length > 0) ||
      (targetMsg?.attachment && targetMsg.attachment.url);

    // If text-only message has empty text, do not save empty
    if (!inputText.trim() && !hasAttachments) return;

    if (editChatMessage) {
      await editChatMessage(editingMessageId, inputText.trim());
    }
    setEditingMessageId(null);
    setInputText('');
  };

  // Cancel edit and clear bottom input
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputText('');
  };

  // Confirm delete message: Delete for Everyone (both users)
  const handleConfirmDeleteForEveryone = async () => {
    if (!deleteConfirmMsgId) return;
    const targetId = deleteConfirmMsgId;
    if (editingMessageId === targetId) {
      handleCancelEdit();
    }
    setDeleteConfirmMsgId(null);
    setActiveMenuMsgId(null);

    if (deleteChatMessage) {
      await deleteChatMessage(targetId);
    }
  };

  // Confirm delete message: Delete for Me (only disappears from current user's chat)
  const handleConfirmDeleteForMe = async () => {
    if (!deleteConfirmMsgId) return;
    const targetId = deleteConfirmMsgId;
    if (editingMessageId === targetId) {
      handleCancelEdit();
    }
    setDeleteConfirmMsgId(null);
    setActiveMenuMsgId(null);

    if (deleteChatMessageForMe) {
      await deleteChatMessageForMe(targetId, currentUser.id);
    }
  };

  // Handle local file selection (reads dataUrl for 100% instant rendering + uploads to backend)
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    typeHint: 'image' | 'document' | 'video'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setShowAttachmentMenu(false);
    setIsUploading(true);

    const newAttachments: ChatAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Read as Data URL immediately so the client preview and sender always have a guaranteed instant image
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const sizeMb = file.size / (1024 * 1024);
      const sizeStr =
        sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

      let finalUrl = dataUrl;
      try {
        const uploaded = await chatApi.uploadAttachment(file);
        if (uploaded && uploaded.url) {
          finalUrl = uploaded.url;
        }
      } catch (err) {
        console.warn('Backend attachment upload fallback to dataUrl:', err);
      }

      newAttachments.push({
        name: file.name,
        type: typeHint,
        url: finalUrl,
        size: sizeStr,
        thumbnailUrl: dataUrl,
      });
    }

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const firstAttachment = pendingAttachments[0];
    const allAttachments = pendingAttachments.length > 0 ? pendingAttachments : undefined;

    sendChatMessage(
      inputText.trim(),
      selectedUserId || undefined,
      firstAttachment,
      allAttachments
    );

    setInputText('');
    setPendingAttachments([]);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  // Document badge styling matching Screenshot 2 (Word blue 'W', PDF red 'PDF', Excel green 'X')
  const getDocBadgeStyle = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return { bg: 'bg-[#e02424]', label: 'PDF', textSize: 'text-[11px] font-black tracking-tighter' };
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return { bg: 'bg-[#107c41]', label: 'X', textSize: 'text-base font-black' };
    } else if (['doc', 'docx'].includes(ext)) {
      return { bg: 'bg-[#185abd]', label: 'W', textSize: 'text-base font-black' };
    } else if (['ppt', 'pptx'].includes(ext)) {
      return { bg: 'bg-[#d83b01]', label: 'P', textSize: 'text-base font-black' };
    } else if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      return { bg: 'bg-[#b45309]', label: 'ZIP', textSize: 'text-[10px] font-bold' };
    }
    return { bg: 'bg-[#0284c7]', label: ext.toUpperCase().slice(0, 3) || 'DOC', textSize: 'text-[10px] font-bold' };
  };

  // WhatsApp Document Card Renderer (Matches Screenshot 2)
  const renderDocumentCard = (
    doc: ChatAttachment,
    isMe: boolean,
    timestamp: string,
    isRead: boolean
  ) => {
    const badge = getDocBadgeStyle(doc.name);
    const ext = doc.name?.split('.').pop()?.toLowerCase() || '';
    const cardBg = isMe
      ? 'bg-[#005c4b] border-[#025a4a] text-white'
      : 'bg-[#202c33] border-[#2a3942] text-slate-100';

    const extDisplay = ext.toUpperCase() || 'FILE';
    const sizeDisplay = doc.size || '12 kB';
    const actionLabel = ext === 'pdf' ? 'View' : 'Open';

    return (
      <div
        key={doc.name}
        className={`rounded-2xl border shadow-sm overflow-hidden min-w-[270px] max-w-sm mb-1.5 ${cardBg}`}
      >
        {/* Document Info Header */}
        <div className="p-3 flex items-start space-x-3">
          {/* App Icon Badge */}
          <div
            className={`w-10 h-10 rounded-xl ${badge.bg} text-white flex items-center justify-center shrink-0 shadow-xs ${badge.textSize} select-none`}
          >
            {badge.label}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-1">
            <p
              className="font-semibold text-xs leading-snug line-clamp-2 break-all text-white"
              title={doc.name}
            >
              {doc.name}
            </p>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-300">
              <span className="font-medium">
                {extDisplay} • {sizeDisplay}
              </span>
              <div className="flex items-center space-x-1 text-[10px] text-slate-300 shrink-0 ml-2">
                <span>{timestamp}</span>
                {isMe && (
                  <CheckCheck
                    className={`w-3.5 h-3.5 stroke-[2.5] ${
                      isRead ? 'text-[#53bdeb]' : 'text-slate-300'
                    }`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${isMe ? 'border-black/20' : 'border-white/10'}`} />

        {/* WhatsApp Green Action Buttons: Open/View and Save as... */}
        <div className="flex items-center text-xs divide-x divide-white/10">
          <button
            type="button"
            onClick={() => handleOpenOrViewDoc(doc)}
            className="flex-1 py-2 text-center text-[#25d366] hover:bg-black/15 font-semibold transition-colors flex items-center justify-center space-x-1"
            title={`Open ${doc.name}`}
          >
            <span>{actionLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadFile(doc.url, doc.name)}
            className="flex-1 py-2 text-center text-[#25d366] hover:bg-black/15 font-semibold transition-colors flex items-center justify-center space-x-1"
            title={`Save / Download ${doc.name}`}
          >
            <span>Save as...</span>
          </button>
        </div>
      </div>
    );
  };

  // WhatsApp Photo Grid Collage Renderer (Matches Screenshot 1)
  const renderPhotoGrid = (
    photos: ChatAttachment[],
    isMe: boolean,
    timestamp: string,
    isRead: boolean,
    showOverlayTimestamp: boolean = false,
    isEdited: boolean = false
  ) => {
    if (photos.length === 0) return null;

    // Single Photo: Compact small size
    if (photos.length === 1) {
      const photo = photos[0];
      const mediaUrl = resolveMediaUrl(photo.url) || photo.thumbnailUrl;
      return (
        <div className="relative group/photo overflow-hidden bg-black/20 cursor-pointer w-full max-w-[210px] max-h-[190px] flex items-center justify-center">
          <img
            src={mediaUrl}
            alt={photo.name || 'Photo'}
            className="w-full max-h-[190px] object-cover hover:opacity-95 transition-opacity block"
            onClick={() => setLightboxGallery({ images: photos, index: 0 })}
            onError={(e) => handleImgError(e, photo)}
          />
          {/* Bottom Left: HD Badge */}
          <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 py-0.2 rounded border border-white/20 select-none pointer-events-none z-10">
            <span>HD</span>
          </div>
          {/* Bottom Right: Timestamp + Double blue ticks (only when no caption text below) */}
          {showOverlayTimestamp && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center space-x-0.5 select-none z-10">
              {isEdited && <span className="italic text-[8px] opacity-80 mr-0.5 font-medium">edited</span>}
              <span>{timestamp}</span>
              {isMe && (
                <CheckCheck
                  className={`w-3 h-3 stroke-[2] ${
                    isRead ? 'text-[#53bdeb]' : 'text-white/80'
                  }`}
                />
              )}
            </div>
          )}
          {/* Top Right: Quick Download button on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadFile(photo.url, photo.name);
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity z-10 shadow-sm"
            title="Download photo"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      );
    }

    // 2 Photos: Side-by-side compact
    if (photos.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5 bg-black/20 w-full max-w-[210px]">
          {photos.map((photo, idx) => {
            const mediaUrl = resolveMediaUrl(photo.url) || photo.thumbnailUrl;
            return (
              <div
                key={idx}
                className="relative aspect-square cursor-pointer overflow-hidden group/tile bg-black/30"
                onClick={() => setLightboxGallery({ images: photos, index: idx })}
              >
                <img
                  src={mediaUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-200"
                  onError={(e) => handleImgError(e, photo)}
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 py-0.2 rounded border border-white/20 select-none pointer-events-none z-10">
                  HD
                </div>
                {showOverlayTimestamp && idx === 1 && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-0.5 select-none z-10">
                    {isEdited && <span className="italic text-[8px] opacity-80 mr-0.5 font-medium">edited</span>}
                    <span>{timestamp}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3 h-3 stroke-[2] ${
                          isRead ? 'text-[#53bdeb]' : 'text-white/80'
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // 3 Photos: 1 wide top, 2 bottom compact
    if (photos.length === 3) {
      const topUrl = resolveMediaUrl(photos[0].url) || photos[0].thumbnailUrl;
      return (
        <div className="grid grid-cols-2 gap-0.5 bg-black/20 w-full max-w-[210px]">
          <div
            className="col-span-2 relative h-24 cursor-pointer overflow-hidden group/tile bg-black/30"
            onClick={() => setLightboxGallery({ images: photos, index: 0 })}
          >
            <img
              src={topUrl}
              alt={photos[0].name}
              className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-200"
              onError={(e) => handleImgError(e, photos[0])}
            />
            <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 py-0.2 rounded border border-white/20 select-none pointer-events-none z-10">
              HD
            </div>
          </div>
          {photos.slice(1, 3).map((photo, idx) => {
            const mediaUrl = resolveMediaUrl(photo.url) || photo.thumbnailUrl;
            return (
              <div
                key={idx}
                className="relative aspect-square cursor-pointer overflow-hidden group/tile bg-black/30"
                onClick={() => setLightboxGallery({ images: photos, index: idx + 1 })}
              >
                <img
                  src={mediaUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-200"
                  onError={(e) => handleImgError(e, photo)}
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 py-0.2 rounded border border-white/20 select-none pointer-events-none z-10">
                  HD
                </div>
                {showOverlayTimestamp && idx === 1 && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-0.5 select-none z-10">
                    {isEdited && <span className="italic text-[8px] opacity-80 mr-0.5 font-medium">edited</span>}
                    <span>{timestamp}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3 h-3 stroke-[2] ${
                          isRead ? 'text-[#53bdeb]' : 'text-white/80'
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // 4 or More Photos: Exact 2x2 WhatsApp Collage Layout - Compact & Small
    const visiblePhotos = photos.slice(0, 4);
    const extraPhotosCount = photos.length - 4; // e.g. 5 total => +1

    return (
      <div className="overflow-hidden bg-black/20 w-full max-w-[210px]">
        <div className="grid grid-cols-2 gap-0.5">
          {visiblePhotos.map((photo, idx) => {
            const isFourth = idx === 3;
            const hasOverlay = isFourth && extraPhotosCount > 0;
            const mediaUrl = resolveMediaUrl(photo.url) || photo.thumbnailUrl;

            return (
              <div
                key={idx}
                className="relative aspect-square cursor-pointer overflow-hidden group/tile bg-black/40"
                onClick={() => setLightboxGallery({ images: photos, index: idx })}
              >
                <img
                  src={mediaUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-200"
                  onError={(e) => handleImgError(e, photo)}
                />

                {/* Bottom-left HD badge on every tile */}
                <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 py-0.2 rounded border border-white/20 select-none pointer-events-none z-10">
                  HD
                </div>

                {/* Timestamp + Blue double check on bottom-right of tiles if no caption */}
                {showOverlayTimestamp && (
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1 py-0.2 rounded flex items-center space-x-0.5 select-none z-10">
                    {isEdited && <span className="italic text-[8px] opacity-80 mr-0.5 font-medium">edited</span>}
                    <span>{timestamp}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3 h-3 stroke-[2] ${
                          isRead ? 'text-[#53bdeb]' : 'text-white/80'
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* 4th Photo overlay if >4 photos (e.g. +1 or +2) */}
                {hasOverlay && (
                  <div className="absolute inset-0 bg-black/60 hover:bg-black/70 flex items-center justify-center transition-colors z-20">
                    <span className="text-white text-xl sm:text-2xl font-black tracking-tight select-none">
                      +{extraPhotosCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const quickPresets = [
    'Reviewed and approved! 👍',
    'Joining the live meeting now 🚀',
    'Investigating this right away 🔍',
    'Sandbox is ready for validation ✅',
    'Shared the updated documents in Resources 📁',
    'Can you please review the attached specifications?',
  ];

  const emojisList = ['👍', '❤️', '🚀', '🎉', '🔥', '✅', '👀', '💡', '👏', '🙏'];

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

  // Helper to render document file type icon
  const getDocIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (['js', 'ts', 'tsx', 'py', 'json', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
    return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  // Memoized map of user ID to their latest direct message and its timestamp
  const userLatestMessageMap = useMemo(() => {
    const map = new Map<string, { lastMsg: ChatMessage | null; time: number }>();

    directoryUsers.forEach((u) => {
      const msgs = chatMessages.filter(
        (m) =>
          !isDeletedForCurrentUser(m) &&
          ((m.senderId === u.id && m.recipientId === currentUser.id) ||
            (m.senderId === currentUser.id && m.recipientId === u.id))
      );

      if (msgs.length === 0) {
        map.set(u.id, { lastMsg: null, time: 0 });
        return;
      }

      let latest = msgs[0];
      let latestTime = getMessageTimeMs(latest);
      for (let i = 1; i < msgs.length; i++) {
        const t = getMessageTimeMs(msgs[i]);
        if (t >= latestTime) {
          latestTime = t;
          latest = msgs[i];
        }
      }
      map.set(u.id, { lastMsg: latest, time: latestTime });
    });

    return map;
  }, [directoryUsers, chatMessages, currentUser.id]);

  // Filter and sort directory users: whoever has the latest message floats to the top (WhatsApp style)
  const filteredUsers = useMemo(() => {
    return directoryUsers
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        const timeA = userLatestMessageMap.get(a.id)?.time || 0;
        const timeB = userLatestMessageMap.get(b.id)?.time || 0;

        // 1. Conversation order: User with the most recent message (incoming or outgoing) moves to the TOP!
        if (timeA !== timeB) {
          return timeB - timeA;
        }

        // 2. Unread messages priority if time is identical (e.g. neither has messages yet)
        const unreadA = chatMessages.filter(
          (m) =>
            !isDeletedForCurrentUser(m) &&
            m.senderId === a.id &&
            m.recipientId === currentUser.id &&
            m.status !== 'read'
        ).length;
        const unreadB = chatMessages.filter(
          (m) =>
            !isDeletedForCurrentUser(m) &&
            m.senderId === b.id &&
            m.recipientId === currentUser.id &&
            m.status !== 'read'
        ).length;
        if (unreadA !== unreadB) {
          return unreadB - unreadA;
        }

        // 3. Fallback: alphabetical by name
        return a.name.localeCompare(b.name);
      });
  }, [directoryUsers, searchQuery, userLatestMessageMap, chatMessages, currentUser.id]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col md:flex-row antialiased">
      {/* Hidden File Inputs for WhatsApp attachments */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'document')}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'video')}
      />

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
              <p className="text-[10px] text-slate-500 font-medium">Real-time WhatsApp Workspace</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected</span>
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
          <div className="px-1 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-1">
            <span className="shrink-0">Team Space</span>
            {userBatches.length > 1 && currentUser.role === 'company_admin' ? (
              <select
                value={activeBatchId}
                onChange={(e) => setActiveBatchId && setActiveBatchId(e.target.value)}
                className="text-[9px] bg-blue-50 border border-blue-200 text-blue-700 px-1 py-0.5 rounded font-bold cursor-pointer outline-none max-w-[130px] truncate"
                title="Switch Cohort / Batch"
              >
                {userBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code ? `${b.code} - ${b.name}` : b.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                Group
              </span>
            )}
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
              <div className="text-xs truncate font-bold">{currentBatch.name}</div>
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
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 px-3">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No batch members yet</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Add clients or work users to this batch to message them directly.
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                const roleBadge = getRoleBadge(u.role);

                // Check if there are any unread messages from this user
                const unreadCount = chatMessages.filter(
                  (m) =>
                    !isDeletedForCurrentUser(m) &&
                    m.senderId === u.id &&
                    m.recipientId === currentUser.id &&
                    m.status !== 'read'
                ).length;

                // Last message with this user from the memoized map
                const lastUserMsg = userLatestMessageMap.get(u.id)?.lastMsg || null;

                return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full text-left px-2.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <UserAvatar name={u.name} size="sm" showStatus isOnline />
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{u.name}</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isSelected ? 'bg-white/20 text-white' : roleBadge.bg
                          }`}
                        >
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-0.5">
                      <span
                        className={`truncate block max-w-[150px] ${
                          unreadCount > 0
                            ? isSelected
                              ? 'text-white font-extrabold'
                              : 'text-slate-900 font-bold'
                            : isSelected
                            ? 'text-blue-100'
                            : 'text-slate-400'
                        }`}
                      >
                        {lastUserMsg
                          ? lastUserMsg.text || (lastUserMsg.attachment ? `[${lastUserMsg.attachment.type}]` : 'Attachment')
                          : u.companyName || u.designation || 'Enterprise Team'}
                      </span>
                      {lastUserMsg && (
                        <span
                          className={`text-[9px] shrink-0 ml-1 ${
                            isSelected ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {lastUserMsg.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Modern Enterprise Chat Stream - INDEPENDENT SCROLL */}
      <div className="flex-1 flex flex-col bg-white h-full min-h-0 overflow-hidden">
        {/* Chat Stream Header */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {activeUser ? (
              <UserAvatar name={activeUser.name} size="md" showStatus isOnline />
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
          <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Info Banner (When toggled) */}
        {showInfoBanner && (
          <div className="bg-blue-50/80 border-b border-blue-200 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 animate-in fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>WhatsApp Read Receipts Active:</strong> Unseen messages display white double ticks (
                  <span className="font-mono text-slate-500">✓✓</span>). When seen by the recipient, they update to
                WhatsApp blue double ticks (<span className="font-mono text-sky-500 font-bold">✓✓</span>) in
                real-time.
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

        {/* Direct Message Alert Banner when viewing general team space */}
        {selectedUserId === null && unreadDirectMessages.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-sm shrink-0 animate-in fade-in">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white animate-bounce" />
              </div>
              <div className="truncate">
                <span className="font-extrabold text-blue-100">
                  Direct message from{' '}
                  <span className="text-white underline underline-offset-2">
                    {unreadDirectMessages[unreadDirectMessages.length - 1].senderName || 'Company Admin'}
                  </span>
                  :
                </span>{' '}
                <span className="opacity-95 italic">
                  "{unreadDirectMessages[unreadDirectMessages.length - 1].text ||
                    (unreadDirectMessages[unreadDirectMessages.length - 1].attachment
                      ? `[${unreadDirectMessages[unreadDirectMessages.length - 1].attachment?.type}]`
                      : 'Attachment')}"
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedUserId(unreadDirectMessages[unreadDirectMessages.length - 1].senderId)}
              className="px-3 py-1 bg-white text-blue-700 font-extrabold rounded-lg hover:bg-blue-50 transition-colors shadow-xs ml-3 shrink-0"
            >
              Open Chat
            </button>
          </div>
        )}

        {/* Message Stream Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 min-h-0 custom-chat-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-800 text-sm">No messages yet in this conversation</h5>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Send messages, photos, documents, or video files with real-time delivery and read receipts.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const roleBadge = getRoleBadge(msg.senderRole);
              const RoleIcon = roleBadge.icon;
              const msgReactions = reactions[msg.id] || {};
              const isRead = msg.status === 'read';
              const isEditing = editingMessageId === msg.id;

              // Collect all attachments for this message (filter out empty objects from backend)
              const allAttachments: ChatAttachment[] = [
                ...(msg.attachments || []).filter((a) => a && (a.url || a.name)),
                ...(msg.attachment &&
                (msg.attachment.url || msg.attachment.name) &&
                !(msg.attachments || []).some((a) => a.url === msg.attachment?.url)
                  ? [msg.attachment]
                  : []),
              ];
              const photos = allAttachments.filter((a) => a.type === 'image');
              const documents = allAttachments.filter((a) => a.type === 'document');
              const videos = allAttachments.filter((a) => a.type === 'video');
              const hasMediaOnly = (photos.length > 0 || documents.length > 0) && !msg.text && !isEditing;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 group ${
                    isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  <UserAvatar name={msg.senderName} size="sm" className="mt-0.5" />

                  {/* Message Bubble & Metadata */}
                  <div
                    className={`max-w-md sm:max-w-lg flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
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

                    {/* 1. Document Attachments: Rendered using Screenshot 2 WhatsApp style */}
                    {/* A. Photo Message: Unified WhatsApp Photo Card (Top Photo + Bottom Caption) */}
                    {photos.length > 0 ? (
                      <div
                        className={`overflow-hidden rounded-2xl shadow-sm w-fit transition-all max-w-[210px] sm:max-w-[220px] ${
                          isMe
                            ? 'bg-[#005c4b] text-white rounded-tr-xs'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {/* Photo Grid / Collage */}
                        {renderPhotoGrid(photos, isMe, msg.timestamp, isRead, !msg.text, msg.isEdited)}

                        {/* Caption (if text exists) */}
                        {msg.text && (
                          <div className="px-3.5 pt-2 pb-1.5 text-xs">
                            <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-white/70">
                              {msg.isEdited && (
                                <span className="italic text-[9px] opacity-80 mr-1 font-medium">edited</span>
                              )}
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span title={isRead ? 'Seen (Read)' : 'Sent / Delivered (Unseen)'}>
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 stroke-[2.5] inline-block ${
                                      isRead ? 'text-[#53bdeb]' : 'text-white/70'
                                    }`}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : documents.length > 0 ? (
                      /* B. Document Message: Unified WhatsApp Document Card (Top Doc Info + Bottom Caption) */
                      <div
                        className={`rounded-2xl border shadow-sm overflow-hidden min-w-[270px] max-w-sm mb-1.5 ${
                          isMe
                            ? 'bg-[#005c4b] border-[#025a4a] text-white rounded-tr-xs'
                            : 'bg-[#202c33] border-[#2a3942] text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {documents.map((doc, docIdx) => {
                          const badge = getDocBadgeStyle(doc.name);
                          const ext = doc.name?.split('.').pop()?.toLowerCase() || '';
                          const extDisplay = ext.toUpperCase() || 'FILE';
                          const sizeDisplay = doc.size || '12 kB';
                          const actionLabel = ext === 'pdf' ? 'View' : 'Open';

                          return (
                            <div key={docIdx}>
                              {/* Document Info Header */}
                              <div className="p-3 flex items-start space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-xl ${badge.bg} text-white flex items-center justify-center shrink-0 shadow-xs ${badge.textSize} select-none`}
                                >
                                  {badge.label}
                                </div>

                                <div className="flex-1 min-w-0 pr-1">
                                  <p
                                    className="font-semibold text-xs leading-snug line-clamp-2 break-all text-white"
                                    title={doc.name}
                                  >
                                    {doc.name}
                                  </p>
                                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-300">
                                    <span className="font-medium">
                                      {extDisplay} • {sizeDisplay}
                                    </span>
                                    {!msg.text && !isEditing && docIdx === documents.length - 1 && (
                                      <div className="flex items-center space-x-1 text-[10px] text-slate-300 shrink-0 ml-2">
                                        <span>{msg.timestamp}</span>
                                        {isMe && (
                                          <CheckCheck
                                            className={`w-3.5 h-3.5 stroke-[2.5] ${
                                              isRead ? 'text-[#53bdeb]' : 'text-slate-300'
                                            }`}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className={`border-t ${isMe ? 'border-black/20' : 'border-white/10'}`} />

                              {/* Action buttons */}
                              <div className="flex items-center text-xs divide-x divide-white/10">
                                <button
                                  type="button"
                                  onClick={() => handleOpenOrViewDoc(doc)}
                                  className="flex-1 py-2 text-center text-[#25d366] hover:bg-black/15 font-semibold transition-colors flex items-center justify-center space-x-1"
                                  title={`Open ${doc.name}`}
                                >
                                  <span>{actionLabel}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(doc.url, doc.name)}
                                  className="flex-1 py-2 text-center text-[#25d366] hover:bg-black/15 font-semibold transition-colors flex items-center justify-center space-x-1"
                                  title={`Save / Download ${doc.name}`}
                                >
                                  <span>Save as...</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Caption (if text exists) */}
                        {msg.text && (
                          <div
                            className={`px-3.5 pt-2.5 pb-2 text-xs border-t ${
                              isMe ? 'border-black/20' : 'border-white/10'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-white/70">
                              {msg.isEdited && (
                                <span className="italic text-[9px] opacity-80 mr-1 font-medium">edited</span>
                              )}
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span title={isRead ? 'Seen (Read)' : 'Sent / Delivered (Unseen)'}>
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 stroke-[2.5] inline-block ${
                                      isRead ? 'text-[#53bdeb]' : 'text-white/70'
                                    }`}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : videos.length > 0 ? (
                      /* C. Video Message: Unified WhatsApp Video Card */
                      <div
                        className={`overflow-hidden rounded-2xl shadow-sm w-full max-w-sm sm:max-w-md ${
                          isMe
                            ? 'bg-[#005c4b] text-white rounded-tr-xs'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {videos.map((vid, idx) => (
                          <div key={idx} className="relative group/vid bg-black/90">
                            <video src={resolveMediaUrl(vid.url)} controls playsInline className="w-full max-h-72" />
                            <div className="p-2 bg-black/80 flex items-center justify-between text-white text-xs">
                              <span className="truncate text-[11px] font-semibold">{vid.name}</span>
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(vid.url, vid.name)}
                                className="p-1 hover:bg-white/20 rounded transition-colors text-emerald-400"
                                title="Download video"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Caption (if text exists) */}
                        {msg.text && (
                          <div className="px-3.5 pt-2.5 pb-2 text-xs">
                            <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-white/70">
                              {msg.isEdited && (
                                <span className="italic text-[9px] opacity-80 mr-1 font-medium">edited</span>
                              )}
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span title={isRead ? 'Seen (Read)' : 'Sent / Delivered (Unseen)'}>
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 stroke-[2.5] inline-block ${
                                      isRead ? 'text-[#53bdeb]' : 'text-white/70'
                                    }`}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {!msg.text && (
                          <div className="flex items-center justify-end space-x-1 px-3 py-1.5 text-[10px] text-white/70">
                            {msg.isEdited && (
                              <span className="italic text-[9px] opacity-80 mr-1 font-medium">edited</span>
                            )}
                            <span>{msg.timestamp}</span>
                            {isMe && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 stroke-[2.5] inline-block ${
                                  isRead ? 'text-[#53bdeb]' : 'text-white/70'
                                }`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* D. Text Only Message: WhatsApp Text Bubble */
                      <div
                        className={`relative rounded-2xl px-4 py-2.5 text-xs transition-all shadow-xs max-w-md sm:max-w-lg ${
                          isMe
                            ? 'bg-[#005c4b] text-white rounded-tr-xs'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-white/70">
                          {msg.isEdited && (
                            <span className="italic text-[9px] opacity-80 mr-1 font-medium">edited</span>
                          )}
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            <span title={isRead ? 'Seen (Read)' : 'Sent / Delivered (Unseen)'}>
                              <CheckCheck
                                className={`w-4 h-4 stroke-[2.5] inline-block ${
                                  isRead ? 'text-[#53bdeb]' : 'text-white/70'
                                }`}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    )}

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

                    {/* Message Actions Bar on Hover (Reactions + Copy + 3-dots Menu for Edit / Delete / Download) */}
                    <div
                      className={`transition-opacity flex items-center space-x-1 mt-1 px-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs relative z-10 ${
                        activeMenuMsgId === msg.id ? 'opacity-100 ring-2 ring-blue-500/20' : 'opacity-0 group-hover:opacity-100'
                      }`}
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

                      {msg.text && (
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
                      )}

                      {/* 3-dots Action Menu for Edit, Delete, and Download */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id);
                          }}
                          className={`p-1 rounded transition-colors message-actions-trigger ${
                            activeMenuMsgId === msg.id
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="More options (Edit, Delete, Download)"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>

                        {activeMenuMsgId === msg.id && (
                          <div
                            className={`absolute top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 message-actions-menu ${
                              isMe ? 'right-0' : 'left-0'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Edit (available if user is sender or company/super admin) */}
                            {(isMe ||
                              currentUser.role === 'company_admin' ||
                              currentUser.role === 'product_super_admin') && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit message</span>
                              </button>
                            )}

                            {/* Download attachments */}
                            {allAttachments.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  allAttachments.forEach((att) =>
                                    handleDownloadFile(att.url, att.name)
                                  );
                                  setActiveMenuMsgId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                  {allAttachments.length > 1
                                    ? `Download (${allAttachments.length})`
                                    : 'Download file'}
                                </span>
                              </button>
                            )}

                            {/* Copy text */}
                            {msg.text && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopyMessage(msg.id, msg.text);
                                  setActiveMenuMsgId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy text</span>
                              </button>
                            )}

                            {/* Delete message */}
                            {(isMe ||
                              currentUser.role === 'product_super_admin' ||
                              currentUser.role === 'company_admin') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmMsgId(msg.id);
                                  setActiveMenuMsgId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-semibold border-t border-slate-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete message</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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

        {/* Multi-Attachment preview strip before sending */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center space-x-2.5 overflow-x-auto animate-in fade-in">
            {pendingAttachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 text-xs"
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-8 h-8 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                ) : att.type === 'video' ? (
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <VideoIcon className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {getDocIcon(att.name)}
                  </div>
                )}
                <div className="min-w-0 max-w-[130px]">
                  <p className="font-semibold text-xs text-slate-800 truncate" title={att.name}>
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {att.size || att.type.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {pendingAttachments.length > 1 && (
              <button
                type="button"
                onClick={() => setPendingAttachments([])}
                className="text-[11px] text-rose-600 hover:underline font-bold px-2 py-1 shrink-0"
              >
                Clear all ({pendingAttachments.length})
              </button>
            )}
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-200 flex items-center space-x-2 text-xs text-indigo-700 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing multimedia files for WhatsApp upload...</span>
          </div>
        )}

        {/* Rich Input Composer */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col space-y-2 shrink-0 relative">
          {/* Hidden multi-file input elements */}
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={docInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'document')}
          />
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />

          {/* WhatsApp Attachment Picker Popup Menu */}
          {showAttachmentMenu && (
            <div
              ref={attachmentMenuRef}
              className="absolute bottom-16 left-3 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2"
            >
              {/* Photo Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Photos</span>
              </button>

              {/* Document Button */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Document</span>
              </button>

              {/* Video Button */}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Video</span>
              </button>
            </div>
          )}

          {/* Editing Message Banner */}
          {editingMessageId && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 animate-in fade-in slide-in-from-bottom-1 shadow-xs">
              <div className="flex items-center space-x-2 truncate min-w-0">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Edit2 className="w-3 h-3" />
                </div>
                <span className="font-bold text-blue-800 shrink-0">Editing message</span>
                <span className="text-slate-400 shrink-0">•</span>
                <span className="truncate text-slate-600 italic">
                  {chatMessages.find((m) => m.id === editingMessageId)?.text || 'Message'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-blue-100 transition-colors shrink-0 ml-2"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input field */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={chatInputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (editingMessageId) {
                      handleSaveEdit();
                    } else {
                      handleSendMessage();
                    }
                  } else if (e.key === 'Escape' && editingMessageId) {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                placeholder={
                  editingMessageId
                    ? 'Edit your message...'
                    : activeUser
                    ? `Message @${activeUser.name}...`
                    : `Message team in ${currentBatch.name}...`
                }
                className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                  editingMessageId
                    ? 'bg-blue-50/40 border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white'
                    : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white'
                }`}
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
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors ${
                    showAttachmentMenu ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                  title="Attach Photos, Documents, or Videos"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Send or Save / Cancel Buttons */}
            {editingMessageId ? (
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!inputText.trim()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs ${
                    inputText.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-sm'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Save</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() && pendingAttachments.length === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs ${
                  inputText.trim() || pendingAttachments.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
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
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="text-slate-400">WhatsApp Double Ticks Active</span>
              <span className="text-sky-500 font-bold flex items-center space-x-0.5">
                <CheckCheck className="w-3 h-3 stroke-[2.5]" />
                <span>Read</span>
              </span>
            </div>
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

      {/* WhatsApp Multi-Photo Lightbox Gallery Modal with Next/Prev and Download */}
      {lightboxGallery && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-between p-4 backdrop-blur-md animate-in fade-in select-none"
          onClick={() => setLightboxGallery(null)}
        >
          {/* Header Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white py-2 px-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <span className="font-bold text-sm truncate max-w-sm">
                {lightboxGallery.images[lightboxGallery.index]?.name || 'Photo'}
              </span>
              <span className="text-xs text-slate-300 font-medium shrink-0">
                ({lightboxGallery.index + 1} of {lightboxGallery.images.length})
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Direct Download button */}
              <button
                type="button"
                onClick={() => {
                  const cur = lightboxGallery.images[lightboxGallery.index];
                  handleDownloadFile(cur?.url, cur?.name);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-slate-900 font-extrabold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                title="Download this photo"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download</span>
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setLightboxGallery(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo with Prev / Next Navigation Arrows */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            {lightboxGallery.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxGallery((prev) =>
                    prev
                      ? {
                          ...prev,
                          index:
                            prev.index === 0
                              ? prev.images.length - 1
                              : prev.index - 1,
                        }
                      : null
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all z-20 shadow-xl"
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Displayed Image */}
            <img
              src={
                resolveMediaUrl(lightboxGallery.images[lightboxGallery.index]?.url) ||
                lightboxGallery.images[lightboxGallery.index]?.thumbnailUrl
              }
              alt={lightboxGallery.images[lightboxGallery.index]?.name}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              onError={(e) =>
                handleImgError(e, lightboxGallery.images[lightboxGallery.index])
              }
            />

            {/* Next Arrow */}
            {lightboxGallery.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxGallery((prev) =>
                    prev
                      ? {
                          ...prev,
                          index:
                            prev.index === prev.images.length - 1
                              ? 0
                              : prev.index + 1,
                        }
                      : null
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all z-20 shadow-xl"
                title="Next photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip for Multi-Image Gallery */}
          {lightboxGallery.images.length > 1 && (
            <div
              className="flex items-center space-x-2 py-2 px-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxGallery.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setLightboxGallery((prev) => (prev ? { ...prev, index: i } : null))
                  }
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    lightboxGallery.index === i
                      ? 'border-[#25d366] scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveMediaUrl(img.url) || img.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => handleImgError(e, img)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Message Confirmation Modal with "Delete for me" vs "Delete for everyone" */}
      {deleteConfirmMsgId && (() => {
        const targetMsg = chatMessages.find((m) => m.id === deleteConfirmMsgId);
        const isRead = targetMsg?.status === 'read';
        // WhatsApp Rule: If message has blue double ticks (seen / read),
        // "Delete for everyone" is no longer available! Only "Delete for me" is allowed.
        const canDeleteForEveryone = !isRead;

        return (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
            onClick={() => setDeleteConfirmMsgId(null)}
          >
            <div
              className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Delete message?</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Choose how you want to delete this message</p>
                </div>
              </div>

              {/* If message was seen (blue double tick), explain why Delete for Everyone is not available */}
              {isRead ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800">
                  <CheckCheck className="w-4 h-4 text-[#53bdeb] stroke-[2.5] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Message already seen</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                      This message was already seen (blue double tick). It can only be deleted from your chat view.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can delete this message for everyone or delete it only from your chat view.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 pt-1">
                {/* Option 1: Delete for everyone (only available if recipient has NOT seen the message) */}
                {canDeleteForEveryone && (
                  <button
                    type="button"
                    onClick={handleConfirmDeleteForEveryone}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete for everyone</span>
                  </button>
                )}

                {/* Option 2: Delete for me (always available) */}
                <button
                  type="button"
                  onClick={handleConfirmDeleteForMe}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 ${
                    canDeleteForEveryone
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  }`}
                >
                  <span>Delete for me</span>
                </button>

                {/* Option 3: Cancel */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmMsgId(null)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Single Media / Document Fallback Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold truncate max-w-md">{previewMedia.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewMedia.url, previewMedia.name)}
                  className="px-3 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20ba59] text-slate-900 text-xs font-bold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={resolveMediaUrl(previewMedia.url)}
                alt={previewMedia.name}
                className="max-h-[75vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
