import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  DemoRequest,
  PricingPlan,
  Batch,
  ClientCompany,
  Meeting,
  AttendanceRecord,
  CommunityPost,
  CommunityReply,
  PostAttachment,
  PostLink,
  ChatMessage,
  ChatAttachment,
  ResourceItem,
  ResourceReview,
  CompanyAdminMetric,
  IntegrationSettings,
  CompanySettings,
  ProjectMOU,
  PaymentRecord,
} from '../types';
import { demoRequestApi } from '../services/demoRequestApi';
import { pricingPlanApi } from '../services/pricingPlanApi';
import { companyOrganizationApi } from '../services/companyOrganizationApi';
import { productAdminApi } from '../services/productAdminApi';
import { clientCompanyApi } from '../services/clientCompanyApi';
import { userApi } from '../services/userApi';
import { paymentApi } from '../services/paymentApi';
import { communityApi } from '../services/communityApi';
import { chatApi } from '../services/chatApi';
import { resourceApi } from '../services/resourceApi';
import { settingsApi } from '../services/settingsApi';
import { batchApi } from '../services/batchApi';
import { meetingApi } from '../services/meetingApi';
import {
  INITIAL_USERS,
  INITIAL_BATCHES,
  INITIAL_CLIENT_COMPANIES,
  INITIAL_PRICING_PLANS,
  INITIAL_DEMO_REQUESTS,
  INITIAL_MEETINGS,
  INITIAL_ATTENDANCE,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_RESOURCES,
  INITIAL_COMPANY_ADMIN_METRICS,
  INITIAL_INTEGRATION_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_PROJECT_MOUS,
  INITIAL_PAYMENTS,
} from '../mock/initialData';

interface AppContextType {
  // Navigation & Role
  currentView: 'brochure' | 'login' | 'app';
  setCurrentView: (view: 'brochure' | 'login' | 'app') => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeBatchId: string;
  setActiveBatchId: (batchId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  quickSwitchRole: (role: UserRole, userId?: string) => void;
  loginUser: (
    identifier: string,
    password?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Data
  users: User[];
  batches: Batch[];
  clientCompanies: ClientCompany[];
  pricingPlans: PricingPlan[];
  demoRequests: DemoRequest[];
  meetings: Meeting[];
  attendanceRecords: AttendanceRecord[];
  communityPosts: CommunityPost[];
  chatMessages: ChatMessage[];
  resources: ResourceItem[];
  companyAdminMetrics: CompanyAdminMetric[];
  integrationSettings: IntegrationSettings;
  companySettings: CompanySettings;
  projectMous: ProjectMOU[];
  payments: PaymentRecord[];

  // Universal Currency
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;

  // Actions
  submitDemoRequest: (data: Omit<DemoRequest, 'id' | 'submittedAt' | 'status'>, targetWhatsappNumber?: string) => { whatsappUrl: string };
  createDummyCredential: (requestId: string, temporaryPassword?: string, durationDays?: number) => void;
  toggleDummyCredentialStatus: (requestId: string, active: boolean) => void;
  deleteDemoRequest: (requestId: string) => void;
  refreshDemoRequests: () => Promise<void>;
  refreshPricingPlans: () => Promise<void>;
  refreshClientCompanies: () => Promise<void>;
  refreshWorkspaceUsers: () => Promise<void>;
  refreshProjectMOUs: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshCommunityPosts: () => Promise<void>;
  updatePricingPlan: (plan: PricingPlan) => Promise<void> | void;
  addPricingPlan: (plan: Omit<PricingPlan, 'id'>) => Promise<void> | void;
  deletePricingPlan: (planId: string) => Promise<void> | void;
  addClientCompany: (company: Omit<ClientCompany, 'id' | 'createdAt'>) => Promise<void> | void;
  updateClientCompany: (company: ClientCompany) => Promise<void> | void;
  deleteClientCompany: (companyId: string) => Promise<void> | void;
  addUser: (userData: Omit<User, 'id' | 'joinedDate'>) => Promise<void> | void;
  updateUser: (user: User) => Promise<void> | void;
  deleteUser: (userId: string) => Promise<void> | void;
  addBatch: (batch: Omit<Batch, 'id'>) => Promise<Batch>;
  deleteBatch?: (batchId: string) => Promise<void> | void;
  refreshBatches: () => Promise<void>;
  refreshMeetings: () => Promise<void>;
  refreshAttendanceRecords: () => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'status'>) => Promise<Meeting>;
  updateMeeting: (meetingId: string, partial: Partial<Meeting>) => Promise<Meeting>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  startCall: (meetingId: string) => Promise<Meeting>;
  endCall: (meetingId: string, details?: { durationMinutes?: number; transcript?: any[]; aiSummary?: any; participants?: any[] }) => Promise<Meeting>;
  startInstantCall: (payload: { title?: string; batchId?: string; companyId?: string; hostName?: string; hostId?: string; meetingUrl?: string; durationMinutes?: number; description?: string }) => Promise<Meeting>;
  logAttendance: (record: Partial<AttendanceRecord>) => Promise<AttendanceRecord>;
  bulkMarkAttendance: (records: Partial<AttendanceRecord>[]) => Promise<void>;
  activeLiveCall: Meeting | null;
  setActiveLiveCall: (meeting: Meeting | null) => void;
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
  toggleLikePost: (postId: string) => void;
  toggleLikeReply: (postId: string, replyId: string) => Promise<void> | void;
  sendChatMessage: (
    text: string,
    recipientId?: string,
    attachment?: ChatAttachment,
    attachments?: ChatAttachment[]
  ) => void;
  editChatMessage: (messageId: string, newText: string) => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  deleteChatMessageForMe: (messageId: string, userId: string) => Promise<void>;
  markMessagesAsRead: (messageIds?: string[], targetSenderId?: string) => Promise<void>;
  addResource: (
    title: string,
    description: string,
    fileType: string,
    fileSize: string,
    fileUrl?: string,
    fileName?: string,
    externalLink?: string
  ) => Promise<void> | void;
  addResourceReview: (resourceId: string, rating: number, feedback: string) => Promise<void> | void;
  deleteResource?: (resourceId: string) => Promise<void>;
  refreshResources: () => Promise<void>;
  refreshIntegrationSettings: () => Promise<void>;
  refreshCompanySettings: (companyId?: string) => Promise<void>;
  updateIntegrationSettings: (newSettings: Partial<IntegrationSettings>) => void;
  updateCompanySettings: (newSettings: Partial<CompanySettings>, targetCompanyId?: string) => Promise<void>;
  toggleCompanyIntegration: (companyId: string, type: 'whatsapp' | 'email', value: boolean) => void;
  toggleClientIntegration: (clientId: string, type: 'whatsapp' | 'email', value: boolean) => void;
  createProductAdminAccount: (
    name: string,
    email: string,
    assignedCompanyIds: string[],
    password?: string,
    phone?: string,
    designation?: string,
    role?: 'product_admin' | 'product_super_admin'
  ) => void;
  addCompanyAdminMetric: (company: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    password?: string;
    phone?: string;
    website?: string;
    industry?: string;
    tier?: string;
    status?: 'active' | 'paused';
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    storageUsedMb?: number;
  }) => void;
  updateCompanyAdminMetric: (company: CompanyAdminMetric) => void;
  deleteCompanyAdminMetric: (companyAdminId: string) => void;
  toggleCompanyStatus: (companyAdminId: string) => void;

  // Payments & Project MOUs
  addProjectMOU: (mou: Omit<ProjectMOU, 'id'>, autoCreatePayment?: boolean) => Promise<void> | void;
  updateProjectMOU: (mou: ProjectMOU) => Promise<void> | void;
  deleteProjectMOU: (mouId: string) => Promise<void> | void;
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => Promise<void> | void;
  updatePayment: (payment: PaymentRecord) => Promise<void> | void;
  markPaymentPaid: (
    id: string,
    details: {
      paidDate?: string;
      paymentMethod?: string;
      transactionReference?: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  sendPaymentReminder: (id: string) => Promise<{
    success: boolean;
    message: string;
    emailDetails?: { to: string; subject: string; sentAt: string; preview: string };
  }>;
  deletePayment: (id: string) => Promise<void> | void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'omnisuite_data_';

function getInitialState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (saved && saved !== 'undefined' && saved !== 'null') {
      const parsed = JSON.parse(saved);
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(fallback)) {
          if (!Array.isArray(parsed) || parsed.length === 0) {
            return fallback;
          }
          // Merge missing demo items while preserving all existing user-created items
          const fallbackMap = new Map((fallback as any[]).map((item: any) => [item?.id || item?.companyAdminId, item]));
          const existingIds = new Set(parsed.map((item: any) => item?.id || item?.companyAdminId));

          // Ensure known fallback demo items have updated batchId & companyId if missing in parsed
          const updatedParsed = parsed.map((item: any) => {
            const id = item?.id || item?.companyAdminId;
            if (id && fallbackMap.has(id)) {
              const fb = fallbackMap.get(id);
              return {
                ...fb,
                ...item,
                batchId: item.batchId || fb.batchId,
                companyId: item.companyId || fb.companyId,
              };
            }
            return item;
          });

          const missingFallbackItems = (fallback as any[]).filter(
            (item: any) => {
              const id = item?.id || item?.companyAdminId;
              return id && !existingIds.has(id);
            }
          );
          if (missingFallbackItems.length > 0) {
            return [...updatedParsed, ...missingFallbackItems] as unknown as T;
          }
          return updatedParsed as unknown as T;
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'brochure' | 'login' | 'app'>(() => {
    const saved = getInitialState<'brochure' | 'login' | 'app'>('current_view', 'brochure');
    return saved === 'login' || saved === 'app' ? saved : 'brochure';
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const user = getInitialState('current_user', INITIAL_USERS[2]);
    return user && user.role && user.id ? user : INITIAL_USERS[2];
  });
  const [activeBatchId, setActiveBatchId] = useState<string>(() => {
    const id = getInitialState('active_batch', 'batch_alpha');
    return id || 'batch_alpha';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [users, setUsers] = useState<User[]>(() => getInitialState('users', INITIAL_USERS));
  const [batches, setBatches] = useState<Batch[]>(() => getInitialState('batches', INITIAL_BATCHES));
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>(() => getInitialState('client_companies', INITIAL_CLIENT_COMPANIES));
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(() => getInitialState('pricing_plans', INITIAL_PRICING_PLANS));
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>(() => getInitialState('demo_requests', INITIAL_DEMO_REQUESTS));
  const [meetings, setMeetings] = useState<Meeting[]>(() => getInitialState('meetings', INITIAL_MEETINGS));
  const [activeLiveCall, setActiveLiveCall] = useState<Meeting | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getInitialState('attendance', INITIAL_ATTENDANCE));
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => getInitialState('community_posts', INITIAL_COMMUNITY_POSTS));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getInitialState('chat_messages', INITIAL_CHAT_MESSAGES));
  const [resources, setResources] = useState<ResourceItem[]>(() => getInitialState('resources', INITIAL_RESOURCES));
  const [companyAdminMetrics, setCompanyAdminMetrics] = useState<CompanyAdminMetric[]>(() => getInitialState('company_metrics', INITIAL_COMPANY_ADMIN_METRICS));
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(() => getInitialState('integrations', INITIAL_INTEGRATION_SETTINGS));
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getInitialState('company_settings', INITIAL_COMPANY_SETTINGS));
  const [projectMous, setProjectMous] = useState<ProjectMOU[]>(() => getInitialState('project_mous', INITIAL_PROJECT_MOUS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getInitialState('payments', INITIAL_PAYMENTS));

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'project_mous', JSON.stringify(projectMous));
  }, [projectMous]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'pricing_plans', JSON.stringify(pricingPlans));
  }, [pricingPlans]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'demo_requests', JSON.stringify(demoRequests));
  }, [demoRequests]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'client_companies', JSON.stringify(clientCompanies));
  }, [clientCompanies]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'meetings', JSON.stringify(meetings));
  }, [meetings]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'resources', JSON.stringify(resources));
  }, [resources]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'integrations', JSON.stringify(integrationSettings));
  }, [integrationSettings]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'company_settings', JSON.stringify(companySettings));
  }, [companySettings]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'company_metrics', JSON.stringify(companyAdminMetrics));
  }, [companyAdminMetrics]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'batches', JSON.stringify(batches));
  }, [batches]);

  // Ensure every registered company organization has its designated primary cohort batch
  useEffect(() => {
    if (companyAdminMetrics.length > 0) {
      setBatches((prevBatches) => {
        let updated = false;
        const newBatches = [...prevBatches];
        companyAdminMetrics.forEach((org) => {
          const orgBatchId = `batch_${org.companyAdminId}`;
          if (
            !newBatches.some(
              (b) =>
                b.id === orgBatchId ||
                (org.companyAdminId && b.companyId === org.companyAdminId)
            )
          ) {
            newBatches.push({
              id: orgBatchId,
              name: `${org.companyName} - Primary Cohort`,
              code: 'BAT-01',
              companyId: org.companyAdminId,
              description: `Primary client and worker collaboration workspace for ${org.companyName}.`,
              clientCount: org.totalClients || 0,
              workerCount: org.totalUsers || 0,
              startDate: org.createdAt || new Date().toISOString().split('T')[0],
              status: 'active',
              leadAdminId: org.companyAdminId,
            });
            updated = true;
          }
        });
        return updated ? newBatches : prevBatches;
      });
    }
  }, [companyAdminMetrics]);

  // Universal Currency selection (persisted to localStorage)
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'selected_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'selected_currency', currency);
      const ch = new BroadcastChannel('client_mgmt_pricing_plans');
      ch.postMessage({ type: 'currency_changed', data: currency });
      ch.close();
    } catch {}
  };

  // Real-time synchronization for Demo Requests from PostgreSQL database
  const refreshDemoRequests = async () => {
    try {
      const data = await demoRequestApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setDemoRequests(data);
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Pricing Plans from PostgreSQL database
  const refreshPricingPlans = async () => {
    try {
      const data = await pricingPlanApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setPricingPlans(data);
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Company Organizations from PostgreSQL database
  const refreshCompanyOrganizations = async () => {
    try {
      const data = await companyOrganizationApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setCompanyAdminMetrics(data);
        // Ensure every company admin is present in users list
        setUsers((prev) => {
          const map = new Map<string, User>();
          prev.forEach((u) => map.set(u.id, u));
          data.forEach((org) => {
            const adminId = org.companyAdminId || (org as any).id;
            if (!map.has(adminId)) {
              map.set(adminId, {
                id: adminId,
                name: org.adminName,
                email: org.adminEmail,
                role: 'company_admin',
                companyId: adminId,
                companyName: org.companyName,
                batchIds: [`batch_${adminId}`],
                status: org.status === 'paused' ? 'inactive' : 'active',
                phone: org.phone || '',
                designation: 'Managing Director / Organization Admin',
                joinedDate: org.createdAt || '2026-01-01',
              });
            }
          });
          return Array.from(map.values());
        });
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Product Admins from PostgreSQL database
  const refreshProductAdmins = async () => {
    try {
      const data = await productAdminApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setUsers((prev) => {
          const nonPAdmins = prev.filter((u) => u.role !== 'product_admin');
          return [...nonPAdmins, ...data];
        });
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Client Companies from PostgreSQL database
  const refreshClientCompanies = async () => {
    try {
      const data = await clientCompanyApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setClientCompanies(data);
      } else {
        await clientCompanyApi.seed(INITIAL_CLIENT_COMPANIES);
        const seeded = await clientCompanyApi.getAll();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setClientCompanies(seeded);
        }
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Workspace Users from PostgreSQL database
  const refreshWorkspaceUsers = async () => {
    try {
      const data = await userApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, User>();
          data.forEach((u) => map.set(u.id, u));
          // Preserve any company admins from prev or companyAdminMetrics
          prev.forEach((u) => {
            if (u.role === 'company_admin' && !map.has(u.id)) {
              map.set(u.id, u);
            }
          });
          return Array.from(map.values());
        });
      } else {
        await userApi.seed(INITIAL_USERS);
        const seeded = await userApi.getAll();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setUsers(seeded);
        }
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Workspace Batches from PostgreSQL database
  const refreshBatches = async () => {
    try {
      const data = await batchApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setBatches(data);
      } else {
        const seeded = await batchApi.seed();
        if (seeded && Array.isArray(seeded.batches) && seeded.batches.length > 0) {
          setBatches(seeded.batches);
        }
      }
    } catch {
      // Backend starting or offline - keep existing state
    }
  };

  // Real-time synchronization for Meetings & Call Scheduling from PostgreSQL database
  const refreshMeetings = async () => {
    try {
      const data = await meetingApi.getAllMeetings();
      if (Array.isArray(data) && data.length > 0) {
        setMeetings(data);
      } else {
        const seeded = await meetingApi.seedMeetings();
        if (seeded && Array.isArray((seeded as any).meetings) && (seeded as any).meetings.length > 0) {
          setMeetings((seeded as any).meetings);
        }
      }
    } catch {
      // Backend offline or booting - keep current state
    }
  };

  // Real-time synchronization for Attendance Records from PostgreSQL database
  const refreshAttendanceRecords = async () => {
    try {
      const data = await meetingApi.getAllAttendance();
      if (Array.isArray(data) && data.length > 0) {
        setAttendanceRecords(data);
      }
    } catch {
      // Backend offline or booting
    }
  };

  // Real-time synchronization for Project MOUs from database
  const refreshProjectMOUs = async () => {
    try {
      const data = await paymentApi.getAllProjectMOUs();
      if (Array.isArray(data) && data.length > 0) {
        setProjectMous(data);
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Payments from database
  const refreshPayments = async () => {
    try {
      const data = await paymentApi.getAllPayments();
      if (Array.isArray(data) && data.length > 0) {
        setPayments(data);
      } else {
        await paymentApi.seed();
        const seeded = await paymentApi.getAllPayments();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setPayments(seeded);
        }
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Community Posts from database
  const refreshCommunityPosts = async () => {
    try {
      const data = await communityApi.getAllPosts();
      if (Array.isArray(data) && data.length > 0) {
        setCommunityPosts(data);
      } else {
        await communityApi.seedPosts(INITIAL_COMMUNITY_POSTS);
        const seeded = await communityApi.getAllPosts();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setCommunityPosts(seeded);
        }
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Chat Messages from PostgreSQL database
  const refreshChatMessages = async () => {
    try {
      const data = await chatApi.getAllMessages();
      if (Array.isArray(data) && data.length > 0) {
        setChatMessages(data);
      } else {
        await chatApi.seedMessages(INITIAL_CHAT_MESSAGES);
        const seeded = await chatApi.getAllMessages();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setChatMessages(seeded);
        }
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Resources & Deliverables from PostgreSQL database
  const refreshResources = async () => {
    try {
      const data = await resourceApi.getAllResources();
      if (Array.isArray(data) && data.length > 0) {
        setResources(data);
      } else {
        await resourceApi.seedResources();
        const seeded = await resourceApi.getAllResources();
        if (Array.isArray(seeded) && seeded.length > 0) {
          setResources(seeded);
        }
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Integration Settings from PostgreSQL database
  const refreshIntegrationSettings = async () => {
    try {
      const data = await settingsApi.getIntegrationSettings();
      if (data && typeof data === 'object') {
        setIntegrationSettings(data);
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Real-time synchronization for Company Settings from PostgreSQL database
  const refreshCompanySettings = async (companyId?: string) => {
    try {
      const activeCompanyId = companyId || currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
      const data = await settingsApi.getCompanySettings(activeCompanyId);
      if (data && typeof data === 'object') {
        setCompanySettings((prev) => ({ ...prev, ...data }));
      }
    } catch {
      // Backend offline or starting
    }
  };

  // Re-fetch company settings whenever logged-in user changes (e.g. switching company admin)
  useEffect(() => {
    const compId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    refreshCompanySettings(compId);
  }, [currentUser?.id, currentUser?.companyId, currentUser?.role]);

  useEffect(() => {
    // Initial fetch from PostgreSQL backend
    refreshDemoRequests();
    refreshPricingPlans();
    refreshCompanyOrganizations();
    refreshProductAdmins();
    refreshClientCompanies();
    refreshWorkspaceUsers();
    refreshProjectMOUs();
    refreshPayments();
    refreshCommunityPosts();
    refreshChatMessages();
    refreshResources();
    refreshIntegrationSettings();
    refreshCompanySettings();
    refreshBatches();
    refreshMeetings();
    refreshAttendanceRecords();

    // 1. Subscribe to Server-Sent Events (SSE) stream for real-time live push
    const unsubscribeSSE = demoRequestApi.subscribeToEvents((event) => {
      if (event.type === 'demo_request_created' && event.data) {
        setDemoRequests((prev) => {
          if (prev.some((r) => r.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === 'demo_request_updated' && event.data) {
        setDemoRequests((prev) =>
          prev.map((r) => (r.id === event.data.id ? event.data : r))
        );
      } else if (event.type === 'demo_request_deleted' && event.data) {
        setDemoRequests((prev) => prev.filter((r) => r.id !== event.data.id));
      } else if (event.type === 'pricing_plan_created' && event.data) {
        setPricingPlans((prev) => {
          if (prev.some((p) => p.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === 'pricing_plan_updated' && event.data) {
        setPricingPlans((prev) =>
          prev.map((p) => (p.id === event.data.id ? { ...p, ...event.data } : p))
        );
      } else if (event.type === 'pricing_plan_deleted' && event.data) {
        setPricingPlans((prev) => prev.filter((p) => p.id !== event.data.id));
      } else if (event.type === 'company_organization_created' && event.data) {
        setCompanyAdminMetrics((prev) => {
          if (prev.some((c) => c.companyAdminId === event.data.companyAdminId)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === 'company_organization_updated' && event.data) {
        setCompanyAdminMetrics((prev) =>
          prev.map((c) => (c.companyAdminId === event.data.companyAdminId ? { ...c, ...event.data } : c))
        );
        const activeCompId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
        if (activeCompId && event.data.companyAdminId === activeCompId) {
          setCompanySettings((prev) => ({
            ...prev,
            ...(event.data.whatsappEnabled !== undefined ? { whatsappAlertsEnabled: event.data.whatsappEnabled } : {}),
            ...(event.data.emailEnabled !== undefined ? { emailAlertsEnabled: event.data.emailEnabled } : {}),
          }));
        }
      } else if (event.type === 'company_organization_deleted' && event.data) {
        setCompanyAdminMetrics((prev) => prev.filter((c) => c.companyAdminId !== event.data.companyAdminId));
      } else if (event.type === 'product_admin_created' && event.data) {
        setUsers((prev) => {
          if (prev.some((u) => u.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === 'product_admin_updated' && event.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === event.data.id ? { ...u, ...event.data } : u))
        );
      } else if (event.type === 'product_admin_deleted' && event.data) {
        setUsers((prev) => prev.filter((u) => u.id !== event.data.id));
      } else if (event.type === 'client_created' && event.data) {
        setClientCompanies((prev) => {
          if (prev.some((c) => c.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === 'client_updated' && event.data) {
        setClientCompanies((prev) =>
          prev.map((c) => (c.id === event.data.id ? { ...c, ...event.data } : c))
        );
      } else if (event.type === 'client_deleted' && event.data) {
        setClientCompanies((prev) => prev.filter((c) => c.id !== event.data.id));
      } else if (event.type === 'user_created' && event.data) {
        setUsers((prev) => {
          if (prev.some((u) => u.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === 'user_updated' && event.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === event.data.id ? { ...u, ...event.data } : u))
        );
        setCurrentUser((prev) => (prev.id === event.data.id ? { ...prev, ...event.data } : prev));
      } else if (event.type === 'user_deleted' && event.data) {
        setUsers((prev) => prev.filter((u) => u.id !== event.data.id));
      } else if (event.type === 'project_mou_created' && event.data) {
        setProjectMous((prev) => (prev.some((m) => m.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'project_mou_updated' && event.data) {
        setProjectMous((prev) => prev.map((m) => (m.id === event.data.id ? { ...m, ...event.data } : m)));
      } else if (event.type === 'project_mou_deleted' && event.data) {
        setProjectMous((prev) => prev.filter((m) => m.id !== event.data.id));
      } else if (event.type === 'payment_created' && event.data) {
        setPayments((prev) => (prev.some((p) => p.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'payment_updated' && event.data) {
        setPayments((prev) => prev.map((p) => (p.id === event.data.id ? { ...p, ...event.data } : p)));
      } else if (event.type === 'payment_deleted' && event.data) {
        setPayments((prev) => prev.filter((p) => p.id !== event.data.id));
      } else if (event.type === 'community_post_created' && event.data) {
        setCommunityPosts((prev) => (prev.some((p) => p.id === event.data.id) ? prev.map((p) => (p.id === event.data.id ? event.data : p)) : [event.data, ...prev]));
      } else if (event.type === 'community_post_updated' && event.data) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === event.data.id ? event.data : p)));
      } else if (event.type === 'community_post_deleted' && event.data) {
        const deletedId = event.data.id || event.data.postId;
        setCommunityPosts((prev) => prev.filter((p) => p.id !== deletedId));
      } else if (event.type === 'community_post_liked' && event.data) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === event.data.id ? event.data : p)));
      } else if (event.type === 'community_reply_added' && event.data) {
        if (event.data.post) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === event.data.post.id ? event.data.post : p)));
        } else {
          refreshCommunityPosts();
        }
      } else if (event.type === 'community_reply_deleted' && event.data) {
        if (event.data.post) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === event.data.post.id ? event.data.post : p)));
        } else {
          refreshCommunityPosts();
        }
      } else if (event.type === 'community_reply_liked' && event.data) {
        if (event.data.post) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === event.data.post.id ? event.data.post : p)));
        } else {
          refreshCommunityPosts();
        }
      } else if (event.type === 'chat_message_created' && event.data) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === event.data.id)) {
            return prev.map((m) => (m.id === event.data.id ? event.data : m));
          }
          return [...prev, event.data];
        });
      } else if (event.type === 'chat_message_updated' && event.data) {
        setChatMessages((prev) => prev.map((m) => (m.id === event.data.id ? { ...m, ...event.data } : m)));
      } else if (event.type === 'chat_message_deleted' && event.data) {
        setChatMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      } else if (event.type === 'chat_messages_read' && event.data) {
        const readIds = new Set(event.data.messageIds || []);
        setChatMessages((prev) =>
          prev.map((m) => (readIds.has(m.id) ? { ...m, status: 'read' as const } : m))
        );
      } else if (event.type === 'resource_created' && event.data) {
        setResources((prev) => (prev.some((r) => r.id === event.data.id) ? prev.map((r) => (r.id === event.data.id ? event.data : r)) : [event.data, ...prev]));
      } else if (event.type === 'resource_updated' && event.data) {
        setResources((prev) => prev.map((r) => (r.id === event.data.id ? event.data : r)));
      } else if (event.type === 'resource_reviewed' && event.data) {
        if (event.data.resource) {
          setResources((prev) => prev.map((r) => (r.id === event.data.resource.id ? event.data.resource : r)));
        } else {
          refreshResources();
        }
      } else if (event.type === 'resource_deleted' && event.data) {
        const deletedId = event.data.id || event.data.resourceId;
        setResources((prev) => prev.filter((r) => r.id !== deletedId));
      } else if (event.type === 'integration_settings_updated' && event.data) {
        setIntegrationSettings((prev) => ({ ...prev, ...event.data }));
      } else if (event.type === 'company_settings_updated' && event.data) {
        const activeCompId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
        const eventCompId = event.data.companyId || event.data.company_id;
        if (!eventCompId || eventCompId === 'default' || eventCompId === activeCompId || !activeCompId) {
          setCompanySettings((prev) => ({ ...prev, ...event.data }));
        }
      } else if (event.type === 'batch_created' && event.data) {
        setBatches((prev) => {
          if (prev.some((b) => b.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === 'batch_updated' && event.data) {
        setBatches((prev) =>
          prev.map((b) => (b.id === event.data.id ? { ...b, ...event.data } : b))
        );
      } else if (event.type === 'batch_deleted' && event.data) {
        setBatches((prev) => prev.filter((b) => b.id !== event.data.id));
      } else if (event.type === 'meeting_created' && event.data) {
        setMeetings((prev) => (prev.some((m) => m.id === event.data.id) ? prev.map((m) => m.id === event.data.id ? event.data : m) : [event.data, ...prev]));
      } else if (event.type === 'meeting_updated' && event.data) {
        setMeetings((prev) => prev.map((m) => (m.id === event.data.id ? event.data : m)));
        setActiveLiveCall((prev) => (prev && prev.id === event.data.id ? event.data : prev));
      } else if (event.type === 'meeting_deleted' && event.data) {
        const delId = event.data.id || (event.data.meeting && event.data.meeting.id);
        setMeetings((prev) => prev.filter((m) => m.id !== delId));
        setActiveLiveCall((prev) => (prev && prev.id === delId ? null : prev));
      } else if (event.type === 'call_started' && event.data) {
        setMeetings((prev) => prev.map((m) => (m.id === event.data.id ? { ...m, status: 'in_progress' } : m)));
        setActiveLiveCall(event.data);
      } else if (event.type === 'call_ended' && event.data) {
        setMeetings((prev) => prev.map((m) => (m.id === event.data.id ? event.data : m)));
        setActiveLiveCall((prev) => (prev && prev.id === event.data.id ? null : prev));
        refreshAttendanceRecords();
      } else if (event.type === 'attendance_created' && event.data) {
        setAttendanceRecords((prev) => (prev.some((a) => a.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'attendance_updated' && event.data) {
        setAttendanceRecords((prev) => prev.map((a) => (a.id === event.data.id ? event.data : a)));
      } else if (event.type === 'attendance_deleted' && event.data) {
        setAttendanceRecords((prev) => prev.filter((a) => a.id !== event.data.id));
      } else if (event.type === 'attendance_bulk_updated' && event.data?.records) {
        setAttendanceRecords((prev) => {
          const updatedMap = new Map(event.data.records.map((r: any) => [r.id, r]));
          const remaining = prev.filter((r) => !updatedMap.has(r.id));
          return [...event.data.records, ...remaining];
        });
      }
    });

    // 2. Cross-tab real-time sync with BroadcastChannels
    let demoChannel: BroadcastChannel | null = null;
    let pricingChannel: BroadcastChannel | null = null;
    let orgChannel: BroadcastChannel | null = null;
    let clientChannel: BroadcastChannel | null = null;
    let userChannel: BroadcastChannel | null = null;
    let communityChannel: BroadcastChannel | null = null;
    let chatChannel: BroadcastChannel | null = null;
    let resourceChannel: BroadcastChannel | null = null;
    let settingsChannel: BroadcastChannel | null = null;
    let batchChannel: BroadcastChannel | null = null;
    try {
      batchChannel = new BroadcastChannel('client_mgmt_batches');
      batchChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'batch_created' && data) {
          setBatches((prev) => (prev.some((b) => b.id === data.id) ? prev : [...prev, data]));
        } else if (type === 'batch_updated' && data) {
          setBatches((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
        } else if (type === 'batch_deleted' && data) {
          setBatches((prev) => prev.filter((b) => b.id !== data.id));
        }
      };

      demoChannel = new BroadcastChannel('client_mgmt_demo_requests');
      demoChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'demo_request_created' && data) {
          setDemoRequests((prev) => (prev.some((r) => r.id === data.id) ? prev : [data, ...prev]));
        } else if (type === 'demo_request_updated' && data) {
          setDemoRequests((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        } else if (type === 'demo_request_deleted' && data) {
          setDemoRequests((prev) => prev.filter((r) => r.id !== data.id));
        }
      };

      pricingChannel = new BroadcastChannel('client_mgmt_pricing_plans');
      pricingChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'pricing_plan_created' && data) {
          setPricingPlans((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data]));
        } else if (type === 'pricing_plan_updated' && data) {
          setPricingPlans((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
        } else if (type === 'pricing_plan_deleted' && data) {
          setPricingPlans((prev) => prev.filter((p) => p.id !== data.id));
        } else if (type === 'currency_changed' && data) {
          setSelectedCurrencyState(data);
        }
      };

      orgChannel = new BroadcastChannel('client_mgmt_company_orgs');
      orgChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'company_organization_created' && data) {
          setCompanyAdminMetrics((prev) => (prev.some((c) => c.companyAdminId === data.companyAdminId) ? prev : [data, ...prev]));
        } else if (type === 'company_organization_updated' && data) {
          setCompanyAdminMetrics((prev) => prev.map((c) => (c.companyAdminId === data.companyAdminId ? { ...c, ...data } : c)));
          const activeCompId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
          if (activeCompId && data.companyAdminId === activeCompId) {
            setCompanySettings((prev) => ({
              ...prev,
              ...(data.whatsappEnabled !== undefined ? { whatsappAlertsEnabled: data.whatsappEnabled } : {}),
              ...(data.emailEnabled !== undefined ? { emailAlertsEnabled: data.emailEnabled } : {}),
            }));
          }
        } else if (type === 'company_organization_deleted' && data) {
          setCompanyAdminMetrics((prev) => prev.filter((c) => c.companyAdminId !== data.companyAdminId));
        }
      };

      clientChannel = new BroadcastChannel('client_mgmt_client_companies');
      clientChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'client_created' && data) {
          setClientCompanies((prev) => (prev.some((c) => c.id === data.id) ? prev : [data, ...prev]));
        } else if (type === 'client_updated' && data) {
          setClientCompanies((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
        } else if (type === 'client_deleted' && data) {
          setClientCompanies((prev) => prev.filter((c) => c.id !== data.id));
        }
      };

      userChannel = new BroadcastChannel('client_mgmt_batch_users');
      userChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'user_created' && data) {
          setUsers((prev) => (prev.some((u) => u.id === data.id) ? prev : [...prev, data]));
        } else if (type === 'user_updated' && data) {
          setUsers((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)));
          setCurrentUser((prev) => (prev.id === data.id ? { ...prev, ...data } : prev));
        } else if (type === 'user_deleted' && data) {
          setUsers((prev) => prev.filter((u) => u.id !== data.id));
        }
      };

      communityChannel = new BroadcastChannel('client_mgmt_community_posts');
      communityChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'community_post_created' && data) {
          setCommunityPosts((prev) => (prev.some((p) => p.id === data.id) ? prev.map((p) => (p.id === data.id ? data : p)) : [data, ...prev]));
        } else if (type === 'community_post_updated' && data) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
        } else if (type === 'community_post_deleted' && data) {
          const deletedId = data.id || data.postId;
          setCommunityPosts((prev) => prev.filter((p) => p.id !== deletedId));
        } else if (type === 'community_post_liked' && data) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        } else if (type === 'community_reply_added' && data) {
          if (data.post) {
            setCommunityPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
          } else {
            refreshCommunityPosts();
          }
        } else if (type === 'community_reply_deleted' && data) {
          if (data.post) {
            setCommunityPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
          } else {
            refreshCommunityPosts();
          }
        } else if (type === 'community_reply_liked' && data) {
          if (data.post) {
            setCommunityPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
          } else {
            refreshCommunityPosts();
          }
        }
      };

      chatChannel = new BroadcastChannel('client_mgmt_chat_messages');
      chatChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'chat_message_created' && data) {
          setChatMessages((prev) => (prev.some((m) => m.id === data.id) ? prev.map((m) => (m.id === data.id ? data : m)) : [...prev, data]));
        } else if (type === 'chat_message_updated' && data) {
          setChatMessages((prev) => prev.map((m) => (m.id === data.id ? { ...m, ...data } : m)));
        } else if (type === 'chat_message_deleted' && data) {
          setChatMessages((prev) => prev.filter((m) => m.id !== data.id));
        } else if (type === 'chat_message_deleted_for_me' && data) {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId
                ? {
                    ...m,
                    deletedForUserIds: Array.from(new Set([...(m.deletedForUserIds || []), data.userId])),
                  }
                : m
            )
          );
        } else if (type === 'chat_messages_read' && data) {
          const readIds = new Set(data.messageIds || []);
          setChatMessages((prev) =>
            prev.map((m) => (readIds.has(m.id) ? { ...m, status: 'read' as const } : m))
          );
        }
      };

      resourceChannel = new BroadcastChannel('client_mgmt_resources');
      resourceChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'resource_created' && data) {
          setResources((prev) => (prev.some((r) => r.id === data.id) ? prev.map((r) => (r.id === data.id ? data : r)) : [data, ...prev]));
        } else if (type === 'resource_updated' && data) {
          setResources((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        } else if (type === 'resource_reviewed' && data) {
          if (data?.resource) {
            setResources((prev) => prev.map((r) => (r.id === data.resource.id ? data.resource : r)));
          } else if (data?.resourceId && data?.review) {
            setResources((prev) => prev.map((r) => (r.id === data.resourceId ? { ...r, reviews: [data.review, ...(r.reviews || [])] } : r)));
          } else {
            refreshResources();
          }
        } else if (type === 'resource_deleted' && data) {
          const deletedId = data.id || data.resourceId;
          setResources((prev) => prev.filter((r) => r.id !== deletedId));
        }
      };

      settingsChannel = new BroadcastChannel('client_mgmt_settings');
      settingsChannel.onmessage = (e) => {
        const { type, data } = e.data || {};
        if (type === 'integration_settings_updated' && data) {
          setIntegrationSettings((prev) => ({ ...prev, ...data }));
        } else if (type === 'company_settings_updated' && data) {
          const activeCompId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
          const dataCompId = data.companyId || data.company_id;
          if (!dataCompId || dataCompId === 'default' || dataCompId === activeCompId || !activeCompId) {
            setCompanySettings((prev) => ({ ...prev, ...data }));
          }
        }
      };
    } catch {
      // BroadcastChannel not available in environment
    }

    // 3. Smart background poll (every 5 seconds) as fallback sync
    const pollInterval = setInterval(() => {
      refreshDemoRequests();
      refreshPricingPlans();
      refreshCompanyOrganizations();
      refreshClientCompanies();
      refreshWorkspaceUsers();
      refreshProjectMOUs();
      refreshPayments();
      refreshCommunityPosts();
      refreshChatMessages();
      refreshResources();
      refreshIntegrationSettings();
      const activeCompId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
      refreshCompanySettings(activeCompId);
      refreshBatches();
    }, 5000);

    return () => {
      unsubscribeSSE();
      if (demoChannel) demoChannel.close();
      if (pricingChannel) pricingChannel.close();
      if (orgChannel) orgChannel.close();
      if (clientChannel) clientChannel.close();
      if (userChannel) userChannel.close();
      if (communityChannel) communityChannel.close();
      if (chatChannel) chatChannel.close();
      if (resourceChannel) resourceChannel.close();
      if (settingsChannel) settingsChannel.close();
      if (batchChannel) batchChannel.close();
      clearInterval(pollInterval);
    };
  }, []);

  const quickSwitchRole = (role: UserRole, specificUserId?: string) => {
    // Protect Product Admin: Require authentication with .env credentials
    if (role === 'product_super_admin' || role === 'product_admin') {
      if (currentUser?.role !== 'product_super_admin' && currentUser?.role !== 'product_admin') {
        setCurrentView('login');
        return;
      }
    }

    const targetUser = specificUserId
      ? users.find((u) => u.id === specificUserId)
      : users.find((u) => u.role === role);

    if (targetUser) {
      setCurrentUser(targetUser);
      if (targetUser.batchIds && targetUser.batchIds.length > 0) {
        setActiveBatchId(targetUser.batchIds[0]);
      }
      setActiveTab('dashboard');
      setCurrentView('app');
    }
  };

  const loginUser = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedIdentifier = (identifier || '').trim();
    const lowerIdentifier = trimmedIdentifier.toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedIdentifier) {
      return {
        success: false,
        message: 'Please enter your Corporate Email or User ID.',
      };
    }

    // Ensure we have users list populated
    let currentUsersList = users;
    if (!currentUsersList || currentUsersList.length === 0) {
      try {
        const fresh = await userApi.getAll();
        if (Array.isArray(fresh) && fresh.length > 0) {
          currentUsersList = fresh;
          setUsers(fresh);
        }
      } catch {}
    }

    // Environment-based credentials for Product Admin
    const envAdminEmail = (
      import.meta.env.VITE_PRODUCT_ADMIN_USERNAME ||
      import.meta.env.PRODUCT_ADMIN_USERNAME ||
      'admin@product.com'
    ).trim().toLowerCase();

    const envAdminPassword = (
      import.meta.env.VITE_PRODUCT_ADMIN_PASSWORD ||
      import.meta.env.PRODUCT_ADMIN_PASSWORD ||
      'Admin@12345'
    ).trim();

    const isProductAdminTarget =
      lowerIdentifier === envAdminEmail ||
      lowerIdentifier === 'admin@product.com' ||
      lowerIdentifier === 'superadmin@omnisuite.io' ||
      lowerIdentifier === 'admin' ||
      lowerIdentifier === 'user_super_admin';

    // 1. Strict validation for Product Admin login
    if (isProductAdminTarget) {
      if (!trimmedPassword || trimmedPassword !== envAdminPassword) {
        return {
          success: false,
          message: 'Invalid Product Admin credentials. Password must match the password defined in your .env file.',
        };
      }

      // Valid credentials! Set current user to Product Super Admin
      let adminUser = currentUsersList.find(
        (u) =>
          u.role === 'product_super_admin' ||
          u.email.toLowerCase() === lowerIdentifier ||
          u.id.toLowerCase() === lowerIdentifier
      );
      if (!adminUser) {
        adminUser = {
          id: 'user_super_admin',
          name: 'Alexander Vance',
          email: envAdminEmail,
          role: 'product_super_admin',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          batchIds: ['batch_alpha', 'batch_beta', 'batch_gamma'],
          status: 'active',
          phone: '+1 (555) 019-2831',
          designation: 'Chief Product Officer',
          joinedDate: '2024-01-15',
        };
      } else {
        adminUser = { ...adminUser, email: envAdminEmail };
      }

      setCurrentUser(adminUser);
      setActiveTab('demo_requests');
      setCurrentView('app');
      return { success: true, message: `Welcome back, Product Super Admin!` };
    }

    // 2. Check Database-persisted Product Admins & Product Super Admins
    const matchedPAdmin = currentUsersList.find(
      (u) =>
        (u.role === 'product_admin' || u.role === 'product_super_admin') &&
        (u.email.toLowerCase() === lowerIdentifier || u.id.toLowerCase() === lowerIdentifier)
    );
    if (matchedPAdmin) {
      const expectedPassword = matchedPAdmin.password || 'AdminPass#2026';
      if (!trimmedPassword || (trimmedPassword !== expectedPassword && trimmedPassword !== envAdminPassword)) {
        return {
          success: false,
          message: 'Invalid password for Product Administrator account.',
        };
      }
      if (matchedPAdmin.status === 'inactive') {
        return {
          success: false,
          message: 'This Product Administrator account is currently inactive. Please contact Super Admin.',
        };
      }

      setCurrentUser(matchedPAdmin);
      setActiveTab('demo_requests');
      setCurrentView('app');
      return {
        success: true,
        message: `Welcome back, ${matchedPAdmin.name}! You are logged in as ${
          matchedPAdmin.role === 'product_super_admin' ? 'Product Super Admin' : 'Product Admin'
        }.`,
      };
    }

    // 3. Check Company Organizations (Provisioned from Product Admin with dedicated credentials)
    const matchedOrg = companyAdminMetrics.find(
      (c) =>
        c.adminEmail.toLowerCase() === lowerIdentifier ||
        c.companyAdminId.toLowerCase() === lowerIdentifier ||
        (c.phone && c.phone.trim() === trimmedIdentifier)
    );
    if (matchedOrg) {
      const expectedPassword = matchedOrg.password || 'Acme@123';
      if (
        !trimmedPassword ||
        (trimmedPassword !== expectedPassword &&
          trimmedPassword !== 'Acme@123' &&
          trimmedPassword !== 'OmniDefault@2026')
      ) {
        return {
          success: false,
          message: 'Invalid password for Company Organization administrator account.',
        };
      }

      if (matchedOrg.status === 'paused') {
        return {
          success: false,
          message: 'This Company Organization is currently suspended. Please contact platform administration.',
        };
      }

      let compAdminUser = currentUsersList.find(
        (u) => u.email.toLowerCase() === lowerIdentifier || u.id.toLowerCase() === lowerIdentifier
      );
      if (!compAdminUser) {
        compAdminUser = {
          id: matchedOrg.companyAdminId,
          name: matchedOrg.adminName,
          email: matchedOrg.adminEmail,
          role: 'company_admin',
          companyId: matchedOrg.companyAdminId,
          companyName: matchedOrg.companyName,
          batchIds: [],
          status: 'active',
          phone: matchedOrg.phone || '+1 (555) 000-0000',
          designation: 'Managing Director / Organization Admin',
          joinedDate: matchedOrg.createdAt || new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [...prev, compAdminUser]);
      } else {
        compAdminUser = {
          ...compAdminUser,
          role: 'company_admin',
          companyId: matchedOrg.companyAdminId,
          companyName: matchedOrg.companyName,
        };
      }

      setCurrentUser(compAdminUser);

      // Multi-tenant isolation: check batches explicitly associated with this organization
      const orgBatches = batches.filter(
        (b) =>
          b.companyId === matchedOrg.companyAdminId ||
          b.leadAdminId === matchedOrg.companyAdminId ||
          (matchedOrg.companyName.toLowerCase().includes('acme') && b.companyId === 'comp_acme') ||
          (matchedOrg.companyName.toLowerCase().includes('globex') && b.companyId === 'comp_globex')
      );

      if (orgBatches.length > 0) {
        setActiveBatchId(orgBatches[0].id);
      } else if (batches.length > 0) {
        setActiveBatchId(batches[0].id);
      } else {
        setActiveBatchId('');
      }

      setActiveTab('dashboard');
      setCurrentView('app');
      return {
        success: true,
        message: `Welcome back, ${matchedOrg.adminName} (${matchedOrg.companyName})!`,
      };
    }

    // 4. Check standard users (Client, Work User, Company Admin)
    let matchedUser = currentUsersList.find(
      (u) =>
        u.email.toLowerCase() === lowerIdentifier ||
        u.id.toLowerCase() === lowerIdentifier ||
        (u.phone && u.phone.trim() === trimmedIdentifier)
    );

    // If not found in memory, fetch fresh from PostgreSQL to ensure newly added users are available immediately
    if (!matchedUser) {
      try {
        const freshDbUsers = await userApi.getAll();
        if (Array.isArray(freshDbUsers) && freshDbUsers.length > 0) {
          setUsers(freshDbUsers);
          currentUsersList = freshDbUsers;
          matchedUser = freshDbUsers.find(
            (u) =>
              u.email.toLowerCase() === lowerIdentifier ||
              u.id.toLowerCase() === lowerIdentifier ||
              (u.phone && u.phone.trim() === trimmedIdentifier)
          );
        }
      } catch {}
    }

    if (matchedUser) {
      // Prevent unauthorized access to product admin users
      if (matchedUser.role === 'product_super_admin' || matchedUser.role === 'product_admin') {
        if (!trimmedPassword || trimmedPassword !== envAdminPassword) {
          return {
            success: false,
            message: 'Invalid Product Admin credentials. Check your password in .env.',
          };
        }
      } else {
        // Validate password for Client, Work User (Worker), and Company Admin
        if (!trimmedPassword) {
          return {
            success: false,
            message: 'Please enter your password.',
          };
        }

        const expectedUserPassword =
          matchedUser.password ||
          companySettings.universalDefaultPassword ||
          'OmniDefault@2026';

        const isValidPassword =
          trimmedPassword === expectedUserPassword ||
          trimmedPassword === companySettings.universalDefaultPassword ||
          trimmedPassword === 'OmniDefault@2026' ||
          trimmedPassword === 'Pass#2026';

        if (!isValidPassword) {
          return {
            success: false,
            message: 'Invalid password. Please check your credentials and try again.',
          };
        }
      }

      if (matchedUser.status === 'inactive') {
        return {
          success: false,
          message: 'This user account is currently inactive. Please contact your company administrator.',
        };
      }

      setCurrentUser(matchedUser);

      // Select active batch strictly scoped to user's assigned batch or company
      let targetBatch = '';
      if (matchedUser.batchIds && matchedUser.batchIds.length > 0 && matchedUser.batchIds[0]) {
        targetBatch = matchedUser.batchIds[0];
      } else if (matchedUser.companyId) {
        const compBatch = batches.find((b) => b.companyId === matchedUser.companyId);
        targetBatch = compBatch ? compBatch.id : `batch_${matchedUser.companyId}`;
      } else if (batches.length > 0) {
        targetBatch = batches[0].id;
      }
      setActiveBatchId(targetBatch);

      setActiveTab('dashboard');
      setCurrentView('app');

      const portalTitle =
        matchedUser.role === 'client'
          ? 'Client Portal Dashboard'
          : matchedUser.role === 'work_user'
          ? 'Worker Portal Dashboard'
          : matchedUser.role === 'company_admin'
          ? 'Company Admin Dashboard'
          : 'Dashboard';

      return {
        success: true,
        message: `Welcome back, ${matchedUser.name}! Opening ${portalTitle}...`,
      };
    }

    // 5. Check dummy demo request credentials
    const matchedDemo = demoRequests.find(
      (d) =>
        d.dummyCredential &&
        (d.dummyCredential.username.toLowerCase() === lowerIdentifier ||
          d.email.toLowerCase() === lowerIdentifier) &&
        d.dummyCredential.isActive
    );

    if (matchedDemo && matchedDemo.dummyCredential) {
      if (trimmedPassword && matchedDemo.dummyCredential.temporaryPassword !== trimmedPassword) {
        return { success: false, message: 'Invalid demo password' };
      }
      // Create temporary client persona for this demo user
      const demoUser: User = {
        id: `demo_user_${matchedDemo.id}`,
        name: `${matchedDemo.name} (Demo)`,
        email: matchedDemo.email,
        role: 'client',
        companyName: matchedDemo.companyName,
        batchIds: ['batch_alpha'],
        status: 'active',
        phone: matchedDemo.phone,
        designation: 'Prospective Client',
      };
      setUsers((prev) => (prev.some((u) => u.id === demoUser.id) ? prev : [...prev, demoUser]));
      setCurrentUser(demoUser);
      setActiveBatchId('batch_alpha');
      setActiveTab('dashboard');
      setCurrentView('app');
      return { success: true, message: `Demo access granted for ${matchedDemo.companyName}` };
    }

    return {
      success: false,
      message:
        'No account found matching this User ID or Email. Please check your credentials or contact your administrator.',
    };
  };

  const logout = () => {
    setCurrentView('brochure');
  };

  // Demo requests
  const submitDemoRequest = (
    data: Omit<DemoRequest, 'id' | 'submittedAt' | 'status'>,
    targetWhatsappNumber?: string
  ) => {
    const tempId = `demo_${Date.now()}`;
    const newRequest: DemoRequest = {
      ...data,
      id: tempId,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };

    // Optimistic update
    setDemoRequests((prev) => [newRequest, ...prev]);

    // Persist to PostgreSQL backend database in real time
    demoRequestApi.create(newRequest).then((saved) => {
      setDemoRequests((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
      try {
        const chan = new BroadcastChannel('client_mgmt_demo_requests');
        chan.postMessage({ type: 'demo_request_created', data: saved });
        chan.close();
      } catch {}
    }).catch((err) => {
      console.warn('Backend save fallback to localStorage:', err);
    });

    // Format clean WhatsApp message without fragile 4-byte surrogate emojis that corrupt into replacement characters on WhatsApp Web/Desktop
    const message = [
      '*DEMO REQUEST - CLIENT MANAGEMENT PLATFORM*',
      '----------------------------------------',
      `*Name:* ${data.name}`,
      `*Company:* ${data.companyName}`,
      `*Email:* ${data.email}`,
      `*Phone:* ${data.phone}`,
      `*Team Size:* ${data.teamSize}`,
      `*Requirements:* ${data.requirements || 'Looking forward to testing the product features!'}`,
      '----------------------------------------',
      '_Dispatched from Client Management Portal_',
    ].join('\n');
    const encoded = encodeURIComponent(message);
    const destNumber = targetWhatsappNumber || integrationSettings.demoWhatsappNumber || '15550192831';
    const cleanPhone = destNumber.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;

    return { whatsappUrl };
  };

  const createDummyCredential = (requestId: string, temporaryPassword?: string, durationDays: number = 14) => {
    // Persist to database
    demoRequestApi.createCredential(requestId, temporaryPassword, durationDays).then((updated) => {
      setDemoRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      try {
        const chan = new BroadcastChannel('client_mgmt_demo_requests');
        chan.postMessage({ type: 'demo_request_updated', data: updated });
        chan.close();
      } catch {}
    }).catch(() => {
      // Local fallback
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + durationDays);

      setDemoRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: 'credential_created',
              dummyCredential: {
                username: req.email,
                temporaryPassword: temporaryPassword || `Demo#${Math.floor(1000 + Math.random() * 9000)}`,
                expiresAt: expiry.toISOString().split('T')[0],
                isActive: true,
              },
            };
          }
          return req;
        })
      );
    });
  };

  const toggleDummyCredentialStatus = (requestId: string, active: boolean) => {
    // Persist to database
    demoRequestApi.toggleCredentialStatus(requestId, active).then((updated) => {
      setDemoRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      try {
        const chan = new BroadcastChannel('client_mgmt_demo_requests');
        chan.postMessage({ type: 'demo_request_updated', data: updated });
        chan.close();
      } catch {}
    }).catch(() => {
      setDemoRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId && req.dummyCredential) {
            return {
              ...req,
              status: active ? 'credential_created' : 'deactivated',
              dummyCredential: {
                ...req.dummyCredential,
                isActive: active,
              },
            };
          }
          return req;
        })
      );
    });
  };

  const deleteDemoRequest = (requestId: string) => {
    demoRequestApi.delete(requestId).then(() => {
      setDemoRequests((prev) => prev.filter((r) => r.id !== requestId));
      try {
        const chan = new BroadcastChannel('client_mgmt_demo_requests');
        chan.postMessage({ type: 'demo_request_deleted', data: { id: requestId } });
        chan.close();
      } catch {}
    }).catch(() => {
      setDemoRequests((prev) => prev.filter((r) => r.id !== requestId));
    });
  };

  // Pricing (real-time synced with PostgreSQL and BroadcastChannel)
  const updatePricingPlan = async (updated: PricingPlan) => {
    // Optimistic UI update
    setPricingPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      const saved = await pricingPlanApi.update(updated.id, updated);
      setPricingPlans((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      try {
        const ch = new BroadcastChannel('client_mgmt_pricing_plans');
        ch.postMessage({ type: 'pricing_plan_updated', data: saved });
        ch.close();
      } catch {}
    } catch (err) {
      console.error('Failed to persist pricing plan update to backend:', err);
    }
  };

  const addPricingPlan = async (plan: Omit<PricingPlan, 'id'>) => {
    const tempId = `plan_${Date.now()}`;
    const newPlan: PricingPlan = {
      ...plan,
      id: tempId,
      currency: plan.currency || selectedCurrency || 'INR',
      currencySymbol: plan.currencySymbol || (plan.currency === 'USD' ? '$' : '₹'),
    };
    setPricingPlans((prev) => [...prev, newPlan]);
    try {
      const saved = await pricingPlanApi.create(newPlan);
      setPricingPlans((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
      try {
        const ch = new BroadcastChannel('client_mgmt_pricing_plans');
        ch.postMessage({ type: 'pricing_plan_created', data: saved });
        ch.close();
      } catch {}
    } catch (err) {
      console.error('Failed to persist new pricing plan to backend:', err);
    }
  };

  const deletePricingPlan = async (planId: string) => {
    setPricingPlans((prev) => prev.filter((p) => p.id !== planId));
    try {
      await pricingPlanApi.delete(planId);
      try {
        const ch = new BroadcastChannel('client_mgmt_pricing_plans');
        ch.postMessage({ type: 'pricing_plan_deleted', data: { id: planId } });
        ch.close();
      } catch {}
    } catch (err) {
      console.error('Failed to delete pricing plan from backend:', err);
    }
  };

  // Client Companies
  const addClientCompany = async (company: Omit<ClientCompany, 'id' | 'createdAt'>) => {
    const compId = company.companyId || currentUser?.companyId || '';
    const assignedBatchId = company.batchId || activeBatchId || (compId ? `batch_${compId}` : 'batch_alpha');
    const tempId = `client_comp_${Date.now()}`;
    const newCompany: ClientCompany = {
      ...company,
      id: tempId,
      companyId: compId,
      batchId: assignedBatchId,
      createdAt: new Date().toISOString().split('T')[0],
      status: company.status || 'active',
      documents: company.documents && company.documents.length > 0 ? company.documents : [{ name: 'Onboarding_Agreement.pdf', url: '#', size: '1.8 MB' }],
    };
    // Optimistic UI update
    setClientCompanies((prev) => [newCompany, ...prev]);

    // Save to PostgreSQL database
    let savedCompany = newCompany;
    try {
      savedCompany = await clientCompanyApi.create(newCompany);
      setClientCompanies((prev) =>
        prev.map((c) => (c.id === tempId ? savedCompany : c))
      );
      try {
        const ch = new BroadcastChannel('client_mgmt_client_companies');
        ch.postMessage({ type: 'client_created', data: savedCompany });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend client company persistence fallback to local:', err);
    }

    // Sync company metrics (only totalClients incremented)
    if (compId) {
      setCompanyAdminMetrics((prev) =>
        prev.map((c) => {
          if (c.companyAdminId === compId) {
            const updated = {
              ...c,
              totalClients: (c.totalClients || 0) + 1,
            };
            companyOrganizationApi.update(compId, updated).catch(console.error);
            return updated;
          }
          return c;
        })
      );
    }
  };

  const updateClientCompany = async (company: ClientCompany) => {
    setClientCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? company : c))
    );
    try {
      const updated = await clientCompanyApi.update(company.id, company);
      try {
        const ch = new BroadcastChannel('client_mgmt_client_companies');
        ch.postMessage({ type: 'client_updated', data: updated });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend update client company error:', err);
    }
  };

  const deleteClientCompany = async (companyId: string) => {
    const targetComp = clientCompanies.find((c) => c.id === companyId);
    setClientCompanies((prev) => prev.filter((c) => c.id !== companyId));
    if (targetComp && targetComp.companyId) {
      setCompanyAdminMetrics((prev) =>
        prev.map((c) =>
          c.companyAdminId === targetComp.companyId
            ? { ...c, totalClients: Math.max(0, (c.totalClients || 1) - 1) }
            : c
        )
      );
    }
    try {
      await clientCompanyApi.delete(companyId);
      try {
        const ch = new BroadcastChannel('client_mgmt_client_companies');
        ch.postMessage({ type: 'client_deleted', data: { id: companyId } });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend delete client company error:', err);
    }
  };

  // Users
  const addUser = async (userData: Omit<User, 'id' | 'joinedDate'>) => {
    const compId = userData.companyId || currentUser?.companyId || '';
    const compName = userData.companyName || currentUser?.companyName || '';
    const assignedBatchId = (userData.batchIds && userData.batchIds.length > 0 && userData.batchIds[0])
      ? userData.batchIds[0]
      : (activeBatchId || (compId ? `batch_${compId}` : 'batch_alpha'));
    const tempId = `user_${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: tempId,
      companyId: compId,
      companyName: compName,
      batchIds: [assignedBatchId],
      status: userData.status || 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);

    try {
      const savedUser = await userApi.create(newUser);
      setUsers((prev) => prev.map((u) => (u.id === tempId ? savedUser : u)));
      try {
        const uCh = new BroadcastChannel('client_mgmt_batch_users');
        uCh.postMessage({ type: 'user_created', data: savedUser });
        uCh.close();
      } catch {}
    } catch (err) {
      console.warn('Backend add user persistence fallback to local:', err);
    }

    if (compId) {
      setCompanyAdminMetrics((prev) =>
        prev.map((c) => {
          if (c.companyAdminId === compId) {
            const updated = {
              ...c,
              totalUsers: (c.totalUsers || 0) + 1,
            };
            companyOrganizationApi.update(compId, updated).catch(console.error);
            return updated;
          }
          return c;
        })
      );
    }
  };

  const updateUser = async (updated: User) => {
    // 1. Optimistic local update
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }

    // 2. Cross-tab real-time push
    try {
      const uCh = new BroadcastChannel('client_mgmt_batch_users');
      uCh.postMessage({ type: 'user_updated', data: updated });
      uCh.close();
    } catch {}

    // 3. PostgreSQL backend database persistence
    try {
      const saved = await userApi.update(updated.id, updated);
      if (saved && typeof saved === 'object') {
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
        if (currentUser.id === saved.id) {
          setCurrentUser(saved);
        }
      }
    } catch (err) {
      console.warn('Backend update user error:', err);
    }

    // 4. Sync Company Organization if updating a company admin
    if (updated.role === 'company_admin') {
      const compId = updated.companyId || updated.id;
      if (compId) {
        const orgPatch = {
          adminName: updated.name,
          adminEmail: updated.email,
          phone: updated.phone || '',
        };
        companyOrganizationApi
          .update(compId, orgPatch)
          .then((org) => {
            setCompanyAdminMetrics((prev) =>
              prev.map((c) => (c.companyAdminId === compId ? { ...c, ...org } : c))
            );
          })
          .catch(console.error);
      }
    }

    // 5. Sync Client Company if updating a client representative
    if (updated.role === 'client' && updated.companyId) {
      clientCompanyApi
        .update(updated.companyId, {
          clientName: updated.name,
          email: updated.email,
          phone: updated.phone || '',
        })
        .then((comp) => {
          setClientCompanies((prev) =>
            prev.map((c) => (c.id === updated.companyId ? { ...c, ...comp } : c))
          );
        })
        .catch(console.error);
    }

    // 6. Sync Product Admin account if updating a product admin
    if (updated.role === 'product_admin') {
      productAdminApi
        .update(updated.id, {
          name: updated.name,
          email: updated.email,
          password: updated.password,
          phone: updated.phone,
          designation: updated.designation,
          assignedCompanyAdminIds: updated.assignedCompanyAdminIds,
          status: updated.status,
        })
        .catch(console.error);
    }
  };

  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await userApi.delete(userId);
      try {
        const uCh = new BroadcastChannel('client_mgmt_batch_users');
        uCh.postMessage({ type: 'user_deleted', data: { id: userId } });
        uCh.close();
      } catch {}
    } catch (err) {
      console.warn('Backend delete user error:', err);
    }
    if (target && target.role === 'product_admin') {
      productAdminApi.delete(userId).catch(console.error);
    }
  };

  // Batches (Real-time and PostgreSQL synced)
  const addBatch = async (batch: Omit<Batch, 'id'>): Promise<Batch> => {
    const userCompanyId =
      currentUser?.companyId ||
      (currentUser?.role === 'company_admin' ? currentUser.id : 'comp_acme');
    const newBatch: Batch = {
      ...batch,
      id: `batch_${Date.now()}`,
      companyId: batch.companyId || userCompanyId,
      leadAdminId: batch.leadAdminId || currentUser?.id || '',
      clientCount: batch.clientCount || 0,
      workerCount: batch.workerCount || 0,
      startDate: batch.startDate || new Date().toISOString().split('T')[0],
      status: batch.status || 'active',
    };

    // 1. Immediate optimistic UI state update
    setBatches((prev) => [...prev, newBatch]);

    // 2. Automatically link new batch to current user's batchIds
    if (currentUser) {
      const currentBatchIds = currentUser.batchIds || [];
      if (!currentBatchIds.includes(newBatch.id)) {
        const updatedUser: User = {
          ...currentUser,
          batchIds: [...currentBatchIds, newBatch.id],
        };
        setCurrentUser(updatedUser);
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
        userApi.update(currentUser.id, { batchIds: updatedUser.batchIds }).catch(console.error);
      }
    }

    // 3. Persist to PostgreSQL backend via batchApi
    try {
      await batchApi.create(newBatch);
    } catch (err) {
      console.warn('Batch create API warning:', err);
    }

    // 4. Update company metrics totalBatches
    if (newBatch.companyId) {
      setCompanyAdminMetrics((prev) =>
        prev.map((c) =>
          c.companyAdminId === newBatch.companyId
            ? { ...c, totalBatches: (c.totalBatches || 0) + 1 }
            : c
        )
      );
    }

    // 5. Broadcast to all open tabs and windows in real time
    try {
      const ch = new BroadcastChannel('client_mgmt_batches');
      ch.postMessage({ type: 'batch_created', data: newBatch });
      ch.close();
    } catch {}

    return newBatch;
  };

  const deleteBatch = async (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    if (currentUser && currentUser.batchIds?.includes(batchId)) {
      const updatedUser: User = {
        ...currentUser,
        batchIds: currentUser.batchIds.filter((id) => id !== batchId),
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      userApi.update(currentUser.id, { batchIds: updatedUser.batchIds }).catch(console.error);
    }
    try {
      await batchApi.delete(batchId);
    } catch (err) {
      console.warn('Batch delete API warning:', err);
    }
    try {
      const ch = new BroadcastChannel('client_mgmt_batches');
      ch.postMessage({ type: 'batch_deleted', data: { id: batchId } });
      ch.close();
    } catch {}
  };

  // Meetings & Call Scheduling connected to PostgreSQL Database & Real-Time SSE
  const addMeeting = async (meeting: Omit<Meeting, 'id' | 'status'>): Promise<Meeting> => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const meetingPayload: Partial<Meeting> = {
      ...meeting,
      batchId: meeting.batchId || activeBatchId,
      companyId: meeting.companyId || userCompanyId,
      hostName: meeting.hostName || currentUser.name,
      hostId: currentUser.id,
      status: 'upcoming',
      aiSummary: {
        overview: `Scheduled checkpoint for batch '${meeting.batchId || activeBatchId}'.`,
        keyPoints: ['Initial agenda established by host', 'Live audio & video bridge configured'],
        actionItems: ['Prepare discussion points', 'Invite designated client stakeholders'],
      },
      transcript: [
        {
          speaker: meeting.hostName || currentUser.name,
          timestamp: '00:00',
          text: `Scheduled session '${meeting.title}' by ${meeting.hostName || currentUser.name}.`,
        },
      ],
    };

    try {
      const created = await meetingApi.createMeeting(meetingPayload);
      setMeetings((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
      return created;
    } catch (err) {
      console.error('Failed to create meeting on backend, using local fallback:', err);
      const fallbackMeeting: Meeting = {
        ...meetingPayload,
        id: `meet_${Date.now()}`,
      } as Meeting;
      setMeetings((prev) => [fallbackMeeting, ...prev]);
      return fallbackMeeting;
    }
  };

  const updateMeeting = async (meetingId: string, partial: Partial<Meeting>): Promise<Meeting> => {
    try {
      const updated = await meetingApi.updateMeeting(meetingId, partial);
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? updated : m)));
      return updated;
    } catch (err) {
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, ...partial } : m)));
      return { id: meetingId, ...partial } as Meeting;
    }
  };

  const deleteMeeting = async (meetingId: string): Promise<void> => {
    try {
      await meetingApi.deleteMeeting(meetingId);
    } catch (err) {
      console.error('Failed to delete meeting on backend:', err);
    }
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (activeLiveCall?.id === meetingId) {
      setActiveLiveCall(null);
    }
  };

  const startCall = async (meetingId: string): Promise<Meeting> => {
    try {
      const liveMeeting = await meetingApi.startCall(meetingId);
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? liveMeeting : m)));
      setActiveLiveCall(liveMeeting);
      return liveMeeting;
    } catch (err) {
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, status: 'in_progress' } : m)));
      const fallback = meetings.find((m) => m.id === meetingId) || ({ id: meetingId, status: 'in_progress' } as Meeting);
      setActiveLiveCall(fallback);
      return fallback;
    }
  };

  const endCall = async (
    meetingId: string,
    details?: { durationMinutes?: number; transcript?: any[]; aiSummary?: any; participants?: any[] }
  ): Promise<Meeting> => {
    try {
      const completedMeeting = await meetingApi.endCall(meetingId, details);
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? completedMeeting : m)));
      setActiveLiveCall(null);
      refreshAttendanceRecords();
      return completedMeeting;
    } catch (err) {
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, status: 'completed', durationMinutes: details?.durationMinutes || m.durationMinutes } : m)));
      setActiveLiveCall(null);
      return { id: meetingId, status: 'completed' } as Meeting;
    }
  };

  const startInstantCall = async (payload: {
    title?: string;
    batchId?: string;
    companyId?: string;
    hostName?: string;
    hostId?: string;
    meetingUrl?: string;
    durationMinutes?: number;
    description?: string;
  }): Promise<Meeting> => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const liveMeeting = await meetingApi.startInstantCall({
      ...payload,
      batchId: payload.batchId || activeBatchId,
      companyId: payload.companyId || userCompanyId,
      hostName: payload.hostName || currentUser.name,
      hostId: currentUser.id,
    });
    setMeetings((prev) => [liveMeeting, ...prev.filter((m) => m.id !== liveMeeting.id)]);
    setActiveLiveCall(liveMeeting);
    return liveMeeting;
  };

  const logAttendance = async (record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    try {
      const created = await meetingApi.createAttendance(record);
      setAttendanceRecords((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      return created;
    } catch {
      const fallback: AttendanceRecord = {
        id: `att_${Date.now()}`,
        meetingId: record.meetingId || '',
        batchId: record.batchId || activeBatchId,
        date: record.date || new Date().toISOString().slice(0, 10),
        userId: record.userId || currentUser.id,
        userName: record.userName || currentUser.name,
        userRole: record.userRole || (currentUser.role as any) || 'client',
        status: record.status || 'present',
        minutesPresent: record.minutesPresent || 45,
        totalMeetingMinutes: record.totalMeetingMinutes || 45,
        notes: record.notes || '',
      };
      setAttendanceRecords((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const bulkMarkAttendance = async (records: Partial<AttendanceRecord>[]): Promise<void> => {
    try {
      const res = await meetingApi.bulkMarkAttendance(records);
      if (res && res.records) {
        setAttendanceRecords((prev) => {
          const map = new Map(res.records.map((r) => [r.id, r]));
          const rest = prev.filter((a) => !map.has(a.id));
          return [...res.records, ...rest];
        });
      }
    } catch {
      // fallback
    }
  };

  // Community
  const addCommunityPost = async (
    title: string,
    content: string,
    tags?: string[],
    attachments?: PostAttachment[],
    links?: PostLink[]
  ) => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      batchId: activeBatchId,
      companyId: userCompanyId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      title,
      content,
      tags: tags && tags.length > 0 ? tags : ['General'],
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
      attachments: attachments || [],
      links: links || [],
    };
    setCommunityPosts((prev) => [newPost, ...prev]);

    try {
      const ch = new BroadcastChannel('client_mgmt_community_posts');
      ch.postMessage({ type: 'community_post_created', data: newPost });
      ch.close();
    } catch {}

    try {
      const created = await communityApi.createPost(newPost);
      if (created && created.id) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === newPost.id ? created : p)));
      }
    } catch (err) {
      console.warn('Error saving community post to database:', err);
    }
  };

  const editCommunityPost = async (postId: string, title: string, content: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, title, content } : p))
    );

    try {
      const ch = new BroadcastChannel('client_mgmt_community_posts');
      ch.postMessage({ type: 'community_post_updated', data: { id: postId, title, content } });
      ch.close();
    } catch {}

    try {
      await communityApi.updatePost(postId, { title, content });
    } catch (err) {
      console.warn('Error updating community post in database:', err);
    }
  };

  const deleteCommunityPost = async (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const ch = new BroadcastChannel('client_mgmt_community_posts');
      ch.postMessage({ type: 'community_post_deleted', data: { id: postId } });
      ch.close();
    } catch {}

    try {
      await communityApi.deletePost(postId);
    } catch (err) {
      console.warn('Error deleting community post from database:', err);
    }
  };

  const addCommunityReply = async (
    postId: string,
    content: string,
    parentReplyId?: string,
    replyToUserName?: string,
    attachments?: PostAttachment[]
  ) => {
    const newReply: CommunityReply = {
      id: `reply_${Date.now()}`,
      postId,
      parentReplyId,
      replyToUserName,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      attachments: attachments || [],
    };

    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedPost = {
            ...post,
            replies: [...post.replies, newReply],
          };
          try {
            const ch = new BroadcastChannel('client_mgmt_community_posts');
            ch.postMessage({ type: 'community_reply_added', data: { postId, reply: newReply, post: updatedPost } });
            ch.close();
          } catch {}
          return updatedPost;
        }
        return post;
      })
    );

    try {
      const updatedPost = await communityApi.addReply(postId, newReply);
      if (updatedPost && updatedPost.id) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.warn('Error saving community reply to database:', err);
    }
  };

  const deleteCommunityReply = async (postId: string, replyId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedPost = {
            ...post,
            replies: post.replies.filter((r) => r.id !== replyId),
          };
          try {
            const ch = new BroadcastChannel('client_mgmt_community_posts');
            ch.postMessage({ type: 'community_reply_deleted', data: { postId, replyId, post: updatedPost } });
            ch.close();
          } catch {}
          return updatedPost;
        }
        return post;
      })
    );

    try {
      const updatedPost = await communityApi.deleteReply(postId, replyId);
      if (updatedPost && updatedPost.id) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.warn('Error deleting community reply from database:', err);
    }
  };

  const toggleLikePost = async (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const likedBy = post.likedBy || [];
          const hasLiked = likedBy.includes(currentUser.id);
          const updatedPost = {
            ...post,
            likes: hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            likedBy: hasLiked
              ? likedBy.filter((id) => id !== currentUser.id)
              : [...likedBy, currentUser.id],
          };
          try {
            const ch = new BroadcastChannel('client_mgmt_community_posts');
            ch.postMessage({ type: 'community_post_liked', data: updatedPost });
            ch.close();
          } catch {}
          return updatedPost;
        }
        return post;
      })
    );

    try {
      const updatedPost = await communityApi.toggleLikePost(postId, currentUser.id);
      if (updatedPost && updatedPost.id) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.warn('Error toggling post like in database:', err);
    }
  };

  const toggleLikeReply = async (postId: string, replyId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedReplies = post.replies.map((reply) => {
            if (reply.id === replyId) {
              const likedBy = reply.likedBy || [];
              const hasLiked = likedBy.includes(currentUser.id);
              return {
                ...reply,
                likes: hasLiked ? Math.max(0, reply.likes - 1) : reply.likes + 1,
                likedBy: hasLiked
                  ? likedBy.filter((id) => id !== currentUser.id)
                  : [...likedBy, currentUser.id],
              };
            }
            return reply;
          });
          const updatedPost = { ...post, replies: updatedReplies };
          try {
            const ch = new BroadcastChannel('client_mgmt_community_posts');
            ch.postMessage({ type: 'community_reply_liked', data: { postId, replyId, post: updatedPost } });
            ch.close();
          } catch {}
          return updatedPost;
        }
        return post;
      })
    );

    try {
      const updatedPost = await communityApi.toggleLikeReply(postId, replyId, currentUser.id);
      if (updatedPost && updatedPost.id) {
        setCommunityPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.warn('Error toggling reply like in database:', err);
    }
  };

  // Chat
  const sendChatMessage = async (
    text: string,
    recipientId?: string,
    attachment?: ChatAttachment,
    attachments?: ChatAttachment[]
  ) => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const tempId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      batchId: activeBatchId,
      companyId: userCompanyId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId: recipientId || undefined,
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      attachment,
      attachments,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local state update
    setChatMessages((prev) => [...prev, newMsg]);

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_chat_messages');
      ch.postMessage({ type: 'chat_message_created', data: newMsg });
      ch.close();
    } catch {}

    // Persist to PostgreSQL backend database (which broadcasts via SSE)
    try {
      const created = await chatApi.createMessage(newMsg);
      if (created && created.id) {
        setChatMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
      }
    } catch (err) {
      console.warn('Error saving chat message to backend:', err);
    }
  };

  const markMessagesAsRead = async (messageIds?: string[], targetSenderId?: string) => {
    try {
      // Optimistic local update
      setChatMessages((prev) =>
        prev.map((m) => {
          if (messageIds && messageIds.length > 0) {
            if (messageIds.includes(m.id)) {
              return { ...m, status: 'read' as const };
            }
          } else if (m.batchId === activeBatchId && m.senderId !== currentUser.id) {
            if (!targetSenderId || m.senderId === targetSenderId) {
              return { ...m, status: 'read' as const };
            }
          }
          return m;
        })
      );

      // Broadcast to other tabs
      try {
        const ch = new BroadcastChannel('client_mgmt_chat_messages');
        ch.postMessage({
          type: 'chat_messages_read',
          data: {
            messageIds: messageIds && messageIds.length > 0 ? messageIds : [],
            readerId: currentUser.id,
            status: 'read',
          },
        });
        ch.close();
      } catch {}

      // Call PostgreSQL backend
      await chatApi.markAsRead({
        messageIds: messageIds && messageIds.length > 0 ? messageIds : undefined,
        readerId: currentUser.id,
        batchId: activeBatchId,
        senderId: targetSenderId,
      });
    } catch (err) {
      console.warn('Error marking chat messages as read:', err);
    }
  };

  const editChatMessage = async (messageId: string, newText: string) => {
    // Optimistic local update
    setChatMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, text: newText, isEdited: true } : m))
    );

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_chat_messages');
      ch.postMessage({
        type: 'chat_message_updated',
        data: { id: messageId, text: newText, isEdited: true },
      });
      ch.close();
    } catch {}

    // Persist to backend database (and trigger SSE broadcast)
    try {
      const updated = await chatApi.updateMessage(messageId, { text: newText, isEdited: true });
      if (updated && updated.id) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m))
        );
      }
    } catch (err) {
      console.warn('Backend edit chat message fallback to local:', err);
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    // Optimistic local update
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_chat_messages');
      ch.postMessage({ type: 'chat_message_deleted', data: { id: messageId } });
      ch.close();
    } catch {}

    // Persist to backend database (and trigger SSE broadcast)
    try {
      await chatApi.deleteMessage(messageId);
    } catch (err) {
      console.warn('Backend delete chat message fallback to local:', err);
    }
  };

  const deleteChatMessageForMe = async (messageId: string, userId: string) => {
    // Optimistic local update
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              deletedForUserIds: Array.from(new Set([...(m.deletedForUserIds || []), userId])),
            }
          : m
      )
    );

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_chat_messages');
      ch.postMessage({
        type: 'chat_message_deleted_for_me',
        data: { messageId, userId },
      });
      ch.close();
    } catch {}

    // Persist to backend database (triggers SSE broadcast of updated message)
    try {
      const updated = await chatApi.deleteForMe(messageId, userId);
      if (updated && updated.id) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m))
        );
      }
    } catch (err) {
      console.warn('Backend delete-for-me fallback to local:', err);
    }
  };

  // Resources & Deliverables (PostgreSQL & Real-Time)
  const addResource = async (
    title: string,
    description: string,
    fileType: string,
    fileSize: string,
    fileUrl?: string,
    fileName?: string,
    externalLink?: string
  ) => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const newResource: ResourceItem = {
      id: `res_${Date.now()}`,
      batchId: activeBatchId,
      companyId: userCompanyId,
      title,
      description,
      uploaderId: currentUser.id,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      fileType: fileType || 'PDF Document',
      fileSize: fileSize || '1.0 MB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileUrl: fileUrl || '#',
      fileName: fileName || '',
      externalLink: externalLink || '',
      reviews: [],
    };

    // Optimistic UI update
    setResources((prev) => [newResource, ...prev]);

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_resources');
      ch.postMessage({ type: 'resource_created', data: newResource });
      setTimeout(() => ch.close(), 100);
    } catch {
      // BroadcastChannel not available
    }

    // Persist to PostgreSQL backend
    try {
      const created = await resourceApi.createResource(newResource);
      if (created && created.id) {
        setResources((prev) => prev.map((r) => (r.id === newResource.id ? created : r)));
      }
    } catch (err) {
      console.warn('Backend resource creation error, local state retained:', err);
    }
  };

  const addResourceReview = async (resourceId: string, rating: number, feedback: string) => {
    const newReview: ResourceReview = {
      id: `rev_${Date.now()}`,
      resourceId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.role,
      rating,
      feedback,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    // Optimistic UI update
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          return {
            ...res,
            reviews: [newReview, ...(res.reviews || [])],
          };
        }
        return res;
      })
    );

    // Cross-tab broadcast
    try {
      const ch = new BroadcastChannel('client_mgmt_resources');
      ch.postMessage({
        type: 'resource_reviewed',
        data: {
          resourceId,
          review: newReview,
        },
      });
      setTimeout(() => ch.close(), 100);
    } catch {
      // BroadcastChannel not available
    }

    // Persist to backend
    try {
      const updatedResource = await resourceApi.addReview(resourceId, {
        rating,
        feedback,
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerRole: currentUser.role,
      });
      if (updatedResource) {
        setResources((prev) => prev.map((r) => (r.id === resourceId ? updatedResource : r)));
      }
    } catch (err) {
      console.warn('Backend resource review error, local state retained:', err);
    }
  };

  const deleteResource = async (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    try {
      const ch = new BroadcastChannel('client_mgmt_resources');
      ch.postMessage({ type: 'resource_deleted', data: { id: resourceId } });
      setTimeout(() => ch.close(), 100);
    } catch {}

    try {
      await resourceApi.deleteResource(resourceId);
    } catch (err) {
      console.warn('Backend delete resource error:', err);
    }
  };

  // Integrations & Settings
  const updateIntegrationSettings = async (newSettings: Partial<IntegrationSettings>) => {
    setIntegrationSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      const chan = new BroadcastChannel('client_mgmt_settings');
      chan.postMessage({ type: 'integration_settings_updated', data: newSettings });
      chan.close();
    } catch {
      // BroadcastChannel not available
    }

    try {
      await settingsApi.updateIntegrationSettings(newSettings);
    } catch (err) {
      console.warn('Backend update integration settings error:', err);
    }
  };

  const updateCompanySettings = async (newSettings: Partial<CompanySettings>, targetCompanyId?: string) => {
    const compId = targetCompanyId || currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);

    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
    try {
      const chan = new BroadcastChannel('client_mgmt_settings');
      chan.postMessage({ type: 'company_settings_updated', data: { ...newSettings, companyId: compId } });
      chan.close();
    } catch {
      // BroadcastChannel not available
    }

    try {
      const updated = await settingsApi.updateCompanySettings(newSettings, compId);
      if (updated && typeof updated === 'object') {
        setCompanySettings((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.warn('Backend update company settings error:', err);
    }

    // Also sync matching company organization metric in DB if alerts were toggled
    if (compId && (newSettings.whatsappAlertsEnabled !== undefined || newSettings.emailAlertsEnabled !== undefined)) {
      try {
        const patch: Partial<CompanyAdminMetric> = {};
        if (newSettings.whatsappAlertsEnabled !== undefined) {
          patch.whatsappEnabled = newSettings.whatsappAlertsEnabled;
        }
        if (newSettings.emailAlertsEnabled !== undefined) {
          patch.emailEnabled = newSettings.emailAlertsEnabled;
        }
        await companyOrganizationApi.update(compId, patch);
        setCompanyAdminMetrics((prev) =>
          prev.map((c) => (c.companyAdminId === compId ? { ...c, ...patch } : c))
        );
      } catch (err) {
        console.warn('Sync company organization alerts error:', err);
      }
    }
  };

  const toggleCompanyIntegration = async (companyId: string, type: 'whatsapp' | 'email', value: boolean) => {
    let updatedCompSettings: Record<string, { whatsappEnabled: boolean; emailEnabled: boolean }> = {};
    setIntegrationSettings((prev) => {
      const currentComp = prev.companySettings[companyId] || { whatsappEnabled: false, emailEnabled: false };
      updatedCompSettings = {
        ...prev.companySettings,
        [companyId]: {
          ...currentComp,
          [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
        },
      };
      return {
        ...prev,
        companySettings: updatedCompSettings,
      };
    });

    setCompanyAdminMetrics((prev) =>
      prev.map((metric) => {
        if (metric.companyAdminId === companyId || metric.companyName.toLowerCase().includes(companyId.toLowerCase())) {
          return {
            ...metric,
            [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
          };
        }
        return metric;
      })
    );

    try {
      const chan = new BroadcastChannel('client_mgmt_settings');
      chan.postMessage({
        type: 'integration_settings_updated',
        data: { companySettings: updatedCompSettings },
      });
      chan.close();
    } catch {
      // BroadcastChannel not available
    }

    try {
      await settingsApi.updateIntegrationSettings({ companySettings: updatedCompSettings });
    } catch (err) {
      console.warn('Backend toggle company integration error:', err);
    }

    try {
      const org = companyAdminMetrics.find((c) => c.companyAdminId === companyId);
      if (org) {
        await companyOrganizationApi.update(companyId, {
          [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
        });
      }
    } catch {
      // ignore
    }
  };

  const toggleClientIntegration = async (clientId: string, type: 'whatsapp' | 'email', value: boolean) => {
    let updatedClientSettings: Record<string, { whatsappEnabled: boolean; emailEnabled: boolean }> = {};
    setIntegrationSettings((prev) => {
      const currentClient = prev.clientSettings?.[clientId] || {
        whatsappEnabled: prev.whatsappEnabledGlobal,
        emailEnabled: prev.emailAlertsGlobal,
      };
      updatedClientSettings = {
        ...(prev.clientSettings || {}),
        [clientId]: {
          ...currentClient,
          [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
        },
      };
      return {
        ...prev,
        clientSettings: updatedClientSettings,
      };
    });

    try {
      const chan = new BroadcastChannel('client_mgmt_settings');
      chan.postMessage({
        type: 'integration_settings_updated',
        data: { clientSettings: updatedClientSettings },
      });
      chan.close();
    } catch {
      // BroadcastChannel not available
    }

    try {
      await settingsApi.updateIntegrationSettings({ clientSettings: updatedClientSettings });
    } catch (err) {
      console.warn('Backend toggle client integration error:', err);
    }
  };

  const createProductAdminAccount = (
    name: string,
    email: string,
    assignedCompanyIds: string[],
    password?: string,
    phone?: string,
    designation?: string,
    role?: 'product_admin' | 'product_super_admin'
  ) => {
    const finalRole = role || 'product_admin';
    const finalPassword = password || 'AdminPass#' + Math.floor(1000 + Math.random() * 9000);
    const newProdAdmin: User = {
      id: `user_padmin_${Date.now()}`,
      name,
      email,
      password: finalPassword,
      role: finalRole,
      batchIds: ['batch_alpha'],
      status: 'active',
      phone: phone || '+1 (555) 700-1122',
      designation: designation || (finalRole === 'product_super_admin' ? 'Product Super Admin' : 'Product Administrator'),
      joinedDate: new Date().toISOString().split('T')[0],
      assignedCompanyAdminIds: finalRole === 'product_super_admin' ? [] : assignedCompanyIds,
    };
    setUsers((prev) => [...prev, newProdAdmin]);

    // Persist to backend database in real time
    productAdminApi.create({
      name,
      email,
      password: finalPassword,
      role: finalRole,
      phone: phone || '+1 (555) 700-1122',
      designation: designation || (finalRole === 'product_super_admin' ? 'Product Super Admin' : 'Product Administrator'),
      assignedCompanyAdminIds: finalRole === 'product_super_admin' ? [] : assignedCompanyIds,
      status: 'active',
    }).then((created) => {
      setUsers((prev) => prev.map((u) => (u.id === newProdAdmin.id ? { ...u, id: created.id } : u)));
    }).catch((err) => {
      console.error('Failed to persist product admin to backend:', err);
    });
  };

  const addCompanyAdminMetric = (company: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    password?: string;
    phone?: string;
    website?: string;
    industry?: string;
    tier?: string;
    status?: 'active' | 'paused';
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    storageUsedMb?: number;
  }) => {
    // Only Product Super Admin has permission to provision new company organizations
    if (currentUser?.role !== 'product_super_admin') {
      console.warn('Unauthorized: Only Product Super Admin can create company organizations.');
      return;
    }

    const adminId = `user_comp_admin_${Date.now()}`;
    const generatedPass = company.password || ('OrgPass#' + Math.floor(1000 + Math.random() * 9000));
    const newMetric: CompanyAdminMetric = {
      companyAdminId: adminId,
      companyName: company.companyName,
      adminName: company.adminName,
      adminEmail: company.adminEmail,
      password: generatedPass,
      phone: company.phone || '+1 (555) 000-0000',
      website: company.website || 'https://example.com',
      industry: company.industry || 'Technology & Enterprise Services',
      tier: company.tier || 'Enterprise',
      status: company.status || 'active',
      totalClients: 0,
      totalUsers: 1,
      totalBatches: 0,
      activeMeetingsCount: 0,
      storageUsedMb: company.storageUsedMb || 50,
      whatsappEnabled: company.whatsappEnabled ?? true,
      emailEnabled: company.emailEnabled ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCompanyAdminMetrics((prev) => [newMetric, ...prev]);

    // Persist to PostgreSQL backend database
    companyOrganizationApi.create(newMetric).catch((err) => {
      console.error('Failed to save company organization to PostgreSQL backend:', err);
    });
    try {
      const chan = new BroadcastChannel('client_mgmt_company_orgs');
      chan.postMessage({ type: 'company_organization_created', data: newMetric });
      chan.close();
    } catch {}

    // Automatically create matching company_admin user so login/switching works
    const newAdminUser: User = {
      id: adminId,
      name: company.adminName,
      email: company.adminEmail,
      role: 'company_admin',
      companyId: adminId,
      companyName: company.companyName,
      batchIds: [],
      status: (company.status === 'paused' ? 'inactive' : 'active') as 'active' | 'inactive',
      phone: company.phone || '+1 (555) 000-0000',
      designation: 'Managing Director / Organization Admin',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newAdminUser]);
  };

  const updateCompanyAdminMetric = (updated: CompanyAdminMetric) => {
    setCompanyAdminMetrics((prev) =>
      prev.map((c) => (c.companyAdminId === updated.companyAdminId ? updated : c))
    );

    // Persist to PostgreSQL backend database
    companyOrganizationApi.update(updated.companyAdminId, updated).catch((err) => {
      console.error('Failed to update company organization in PostgreSQL backend:', err);
    });
    try {
      const chan = new BroadcastChannel('client_mgmt_company_orgs');
      chan.postMessage({ type: 'company_organization_updated', data: updated });
      chan.close();
    } catch {}

    // Also sync matching user
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === updated.companyAdminId || (u.role === 'company_admin' && u.email === updated.adminEmail)) {
          return {
            ...u,
            name: updated.adminName,
            email: updated.adminEmail,
            companyName: updated.companyName,
            phone: updated.phone || u.phone,
            status: updated.status === 'paused' ? 'inactive' : 'active',
          };
        }
        return u;
      })
    );
  };

  const deleteCompanyAdminMetric = (companyAdminId: string) => {
    setCompanyAdminMetrics((prev) => prev.filter((c) => c.companyAdminId !== companyAdminId));

    // Persist to PostgreSQL backend database
    companyOrganizationApi.delete(companyAdminId).catch((err) => {
      console.error('Failed to delete company organization from PostgreSQL backend:', err);
    });
    try {
      const chan = new BroadcastChannel('client_mgmt_company_orgs');
      chan.postMessage({ type: 'company_organization_deleted', data: { companyAdminId } });
      chan.close();
    } catch {}
  };

  const toggleCompanyStatus = (companyAdminId: string) => {
    setCompanyAdminMetrics((prev) =>
      prev.map((c) => {
        if (c.companyAdminId === companyAdminId) {
          const nextStatus: 'active' | 'paused' = c.status === 'paused' ? 'active' : 'paused';
          const updated: CompanyAdminMetric = { ...c, status: nextStatus };
          companyOrganizationApi.update(companyAdminId, updated).catch((err) => {
            console.error('Failed to toggle company status in backend:', err);
          });
          try {
            const chan = new BroadcastChannel('client_mgmt_company_orgs');
            chan.postMessage({ type: 'company_organization_updated', data: updated });
            chan.close();
          } catch {}
          return updated;
        }
        return c;
      })
    );
  };

  // Project MOUs CRUD
  const addProjectMOU = async (
    mouData: Omit<ProjectMOU, 'id'>,
    autoCreatePayment = true
  ) => {
    const compId = mouData.companyId || currentUser?.companyId || 'comp_acme';
    const tempId = `mou_${Date.now()}`;
    const newMou: ProjectMOU = {
      ...mouData,
      id: tempId,
      companyId: compId,
      status: mouData.status || 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setProjectMous((prev) => [newMou, ...prev]);

    // If auto create payment for current month
    if (autoCreatePayment && newMou.monthlyAmount > 0) {
      const curMonth = new Date().toISOString().slice(0, 7);
      const dueDay = newMou.billingDayOfMonth || 5;
      const dueDate = `${curMonth}-${String(dueDay).padStart(2, '0')}`;
      const tempPayId = `pay_${Date.now()}`;
      const newPay: PaymentRecord = {
        id: tempPayId,
        projectMouId: tempId,
        companyId: compId,
        clientCompanyId: newMou.clientCompanyId,
        clientName: newMou.clientName,
        clientEmail: newMou.clientEmail,
        title: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()} Retainer - ${newMou.projectTitle}`,
        invoiceNumber: `INV-${curMonth.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        billingMonth: curMonth,
        amount: newMou.monthlyAmount,
        currency: newMou.currency,
        currencySymbol: newMou.currencySymbol,
        dueDate,
        status: 'pending',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setPayments((prev) => [newPay, ...prev]);
    }

    try {
      const saved = await paymentApi.createProjectMOU({ ...newMou, autoCreatePayment });
      setProjectMous((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      refreshPayments();
      try {
        const ch = new BroadcastChannel('client_mgmt_project_mous');
        ch.postMessage({ type: 'project_mou_created', data: saved });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend Project MOU save fallback to local state:', err);
    }
  };

  const updateProjectMOU = async (mou: ProjectMOU) => {
    setProjectMous((prev) => prev.map((m) => (m.id === mou.id ? mou : m)));
    try {
      const updated = await paymentApi.updateProjectMOU(mou.id, mou);
      setProjectMous((prev) => prev.map((m) => (m.id === mou.id ? updated : m)));
      try {
        const ch = new BroadcastChannel('client_mgmt_project_mous');
        ch.postMessage({ type: 'project_mou_updated', data: updated });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend Project MOU update fallback to local state:', err);
    }
  };

  const deleteProjectMOU = async (mouId: string) => {
    setProjectMous((prev) => prev.filter((m) => m.id !== mouId));
    try {
      await paymentApi.deleteProjectMOU(mouId);
      try {
        const ch = new BroadcastChannel('client_mgmt_project_mous');
        ch.postMessage({ type: 'project_mou_deleted', data: { id: mouId } });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend Project MOU delete fallback:', err);
    }
  };

  // Payments CRUD
  const addPayment = async (payData: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const compId = payData.companyId || currentUser?.companyId || 'comp_acme';
    const tempId = `pay_${Date.now()}`;
    const newPay: PaymentRecord = {
      ...payData,
      id: tempId,
      companyId: compId,
      status: payData.status || 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setPayments((prev) => [newPay, ...prev]);

    try {
      const saved = await paymentApi.createPayment(newPay);
      setPayments((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
      try {
        const ch = new BroadcastChannel('client_mgmt_payments');
        ch.postMessage({ type: 'payment_created', data: saved });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend payment save fallback to local state:', err);
    }
  };

  const updatePayment = async (pay: PaymentRecord) => {
    setPayments((prev) => prev.map((p) => (p.id === pay.id ? pay : p)));
    try {
      const updated = await paymentApi.updatePayment(pay.id, pay);
      setPayments((prev) => prev.map((p) => (p.id === pay.id ? updated : p)));
      try {
        const ch = new BroadcastChannel('client_mgmt_payments');
        ch.postMessage({ type: 'payment_updated', data: updated });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend payment update fallback:', err);
    }
  };

  const markPaymentPaid = async (
    id: string,
    details: {
      paidDate?: string;
      paymentMethod?: string;
      transactionReference?: string;
      notes?: string;
    }
  ) => {
    const paidDate = details.paidDate || new Date().toISOString().split('T')[0];
    const method = details.paymentMethod || 'Bank Transfer (NEFT/RTGS)';
    const ref = details.transactionReference || `UTR-${Date.now()}`;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'paid',
              paidDate,
              paymentMethod: method,
              transactionReference: ref,
              notes: details.notes !== undefined ? details.notes : p.notes,
            }
          : p
      )
    );

    try {
      const res = await paymentApi.markPaid(id, details);
      if (res.payment) {
        setPayments((prev) => prev.map((p) => (p.id === id ? res.payment : p)));
      }
      try {
        const ch = new BroadcastChannel('client_mgmt_payments');
        ch.postMessage({ type: 'payment_updated', data: res.payment });
        ch.close();
      } catch {}
      return { success: true, message: res.message || 'Payment marked as completed.' };
    } catch {
      return { success: true, message: 'Payment marked as completed in local workspace.' };
    }
  };

  const sendPaymentReminder = async (id: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, reminderSent: true, reminderSentAt: nowStr } : p
      )
    );

    try {
      const res = await paymentApi.sendReminder(id);
      if (res.payment) {
        setPayments((prev) => prev.map((p) => (p.id === id ? res.payment : p)));
      }
      return res;
    } catch {
      return {
        success: true,
        message: 'Payment reminder simulated & queued successfully for client email.',
        emailDetails: {
          to: 'client@example.com',
          subject: 'Payment Reminder Notification',
          sentAt: nowStr,
          preview: 'Automated invoice payment reminder notification.',
        },
      };
    }
  };

  const deletePayment = async (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    try {
      await paymentApi.deletePayment(id);
      try {
        const ch = new BroadcastChannel('client_mgmt_payments');
        ch.postMessage({ type: 'payment_deleted', data: { id } });
        ch.close();
      } catch {}
    } catch (err) {
      console.warn('Backend payment delete fallback:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        activeBatchId,
        setActiveBatchId,
        activeTab,
        setActiveTab,
        quickSwitchRole,
        loginUser,
        logout,
        users,
        batches,
        clientCompanies,
        pricingPlans,
        selectedCurrency,
        setSelectedCurrency,
        demoRequests,
        meetings,
        attendanceRecords,
        communityPosts,
        chatMessages,
        resources,
        companyAdminMetrics,
        integrationSettings,
        companySettings,
        submitDemoRequest,
        createDummyCredential,
        toggleDummyCredentialStatus,
        deleteDemoRequest,
        refreshDemoRequests,
        refreshPricingPlans,
        refreshClientCompanies,
        refreshWorkspaceUsers,
        updatePricingPlan,
        addPricingPlan,
        deletePricingPlan,
        addClientCompany,
        updateClientCompany,
        deleteClientCompany,
        addUser,
        updateUser,
        deleteUser,
        addBatch,
        deleteBatch,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        startCall,
        endCall,
        startInstantCall,
        logAttendance,
        bulkMarkAttendance,
        refreshMeetings,
        refreshAttendanceRecords,
        activeLiveCall,
        setActiveLiveCall,
        addCommunityPost,
        editCommunityPost,
        deleteCommunityPost,
        addCommunityReply,
        deleteCommunityReply,
        toggleLikePost,
        toggleLikeReply,
        sendChatMessage,
        editChatMessage,
        deleteChatMessage,
        deleteChatMessageForMe,
        markMessagesAsRead,
        addResource,
        addResourceReview,
        deleteResource,
        refreshResources,
        refreshIntegrationSettings,
        refreshCompanySettings,
        updateIntegrationSettings,
        updateCompanySettings,
        toggleCompanyIntegration,
        toggleClientIntegration,
        createProductAdminAccount,
        addCompanyAdminMetric,
        updateCompanyAdminMetric,
        deleteCompanyAdminMetric,
        toggleCompanyStatus,
        projectMous,
        payments,
        refreshProjectMOUs,
        refreshPayments,
        refreshCommunityPosts,
        addProjectMOU,
        updateProjectMOU,
        deleteProjectMOU,
        addPayment,
        updatePayment,
        markPaymentPaid,
        sendPaymentReminder,
        deletePayment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
