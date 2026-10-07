export type UserRole = 'product_super_admin' | 'product_admin' | 'company_admin' | 'client' | 'work_user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyId?: string;
  companyName?: string;
  batchIds: string[];
  status: 'active' | 'inactive';
  phone?: string;
  designation?: string;
  joinedDate?: string;
  assignedCompanyAdminIds?: string[]; // For product_admin
}

export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  teamSize: string;
  requirements: string;
  submittedAt: string;
  status: 'pending' | 'credential_created' | 'completed' | 'deactivated';
  dummyCredential?: {
    username: string;
    temporaryPassword: string;
    expiresAt: string;
    isActive: boolean;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  maxUsers: number;
  maxClients: number;
  whatsAppIntegration: boolean;
  emailAlerts: boolean;
  aiTranscripts: boolean;
  customBranding: boolean;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  companyId: string;
  description: string;
  clientCount: number;
  workerCount: number;
  startDate: string;
  status: 'active' | 'completed' | 'archived';
  leadAdminId?: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  clientName: string;
  email: string;
  phone: string;
  description: string;
  websiteUrl: string;
  documents: { name: string; url: string; size: string }[];
  batchId: string;
  createdAt: string;
  status: 'active' | 'paused';
}

export interface Meeting {
  id: string;
  batchId: string;
  title: string;
  description: string;
  scheduleType: 'daily' | 'weekly' | 'custom';
  dateTime: string;
  durationMinutes: number;
  meetingUrl: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  hostName: string;
  aiSummary?: {
    overview: string;
    keyPoints: string[];
    actionItems: string[];
  };
  transcript?: {
    speaker: string;
    timestamp: string;
    text: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  batchId: string;
  date: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'work_user';
  status: 'present' | 'absent';
  minutesPresent: number;
  totalMeetingMinutes: number;
  notes?: string;
}

export interface PostAttachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'ppt' | 'doc' | 'image' | 'link' | 'spreadsheet' | 'other';
  size?: string;
}

export interface PostLink {
  id: string;
  title: string;
  url: string;
}

export interface CommunityReply {
  id: string;
  postId: string;
  parentReplyId?: string; // nested reply support
  replyToUserName?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
  attachments?: PostAttachment[];
}

export interface CommunityPost {
  id: string;
  batchId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  likes: number;
  likedBy?: string[];
  replies: CommunityReply[];
  attachmentUrl?: string;
  attachments?: PostAttachment[];
  links?: PostLink[];
}

export interface ChatMessage {
  id: string;
  batchId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  recipientId?: string; // optional for 1:1, undefined for batch group
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
}

export interface ResourceItem {
  id: string;
  batchId: string;
  title: string;
  description: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: UserRole;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  fileUrl: string;
  reviews?: ResourceReview[];
}

export interface ResourceReview {
  id: string;
  resourceId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  rating: number; // 1 to 5 stars
  feedback: string;
  createdAt: string;
}

export interface CompanyAdminMetric {
  companyAdminId: string;
  companyName: string;
  adminName: string;
  adminEmail: string;
  totalClients: number;
  totalUsers: number;
  totalBatches: number;
  activeMeetingsCount: number;
  storageUsedMb: number;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  phone?: string;
  website?: string;
  industry?: string;
  tier?: 'Starter' | 'Growth' | 'Enterprise';
  status?: 'active' | 'paused';
  createdAt?: string;
}

export interface IntegrationSettings {
  aiProvider: 'gemini' | 'openai' | 'anthropic';
  modelName: string;
  apiKey: string;
  whatsappEnabledGlobal: boolean;
  emailAlertsGlobal: boolean;
  companySettings: {
    [companyId: string]: {
      whatsappEnabled: boolean;
      emailEnabled: boolean;
    };
  };
}

export interface CompanySettings {
  allowChatWithUsers: boolean;
  whatsappAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  universalDefaultPassword: string;
}
