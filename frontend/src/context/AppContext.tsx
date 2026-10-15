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
  ResourceItem,
  ResourceReview,
  CompanyAdminMetric,
  IntegrationSettings,
  CompanySettings,
} from '../types';
import { demoRequestApi } from '../services/demoRequestApi';
import { pricingPlanApi } from '../services/pricingPlanApi';
import { companyOrganizationApi } from '../services/companyOrganizationApi';
import { productAdminApi } from '../services/productAdminApi';
import { clientCompanyApi } from '../services/clientCompanyApi';
import { userApi } from '../services/userApi';
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
  updatePricingPlan: (plan: PricingPlan) => Promise<void> | void;
  addPricingPlan: (plan: Omit<PricingPlan, 'id'>) => Promise<void> | void;
  deletePricingPlan: (planId: string) => Promise<void> | void;
  addClientCompany: (company: Omit<ClientCompany, 'id' | 'createdAt'>) => Promise<void> | void;
  updateClientCompany: (company: ClientCompany) => Promise<void> | void;
  deleteClientCompany: (companyId: string) => Promise<void> | void;
  addUser: (userData: Omit<User, 'id' | 'joinedDate'>) => Promise<void> | void;
  updateUser: (user: User) => Promise<void> | void;
  deleteUser: (userId: string) => Promise<void> | void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'status'>) => void;
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
  toggleLikeReply: (postId: string, replyId: string) => void;
  sendChatMessage: (text: string, recipientId?: string) => void;
  addResource: (title: string, description: string, fileType: string, fileSize: string) => void;
  addResourceReview: (resourceId: string, rating: number, feedback: string) => void;
  updateIntegrationSettings: (newSettings: Partial<IntegrationSettings>) => void;
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'omnisuite_data_';

function getInitialState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (saved && saved !== 'undefined' && saved !== 'null') {
      const parsed = JSON.parse(saved);
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(fallback) && (!Array.isArray(parsed) || parsed.length === 0)) {
          return fallback;
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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getInitialState('attendance', INITIAL_ATTENDANCE));
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => getInitialState('community_posts', INITIAL_COMMUNITY_POSTS));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getInitialState('chat_messages', INITIAL_CHAT_MESSAGES));
  const [resources, setResources] = useState<ResourceItem[]>(() => getInitialState('resources', INITIAL_RESOURCES));
  const [companyAdminMetrics, setCompanyAdminMetrics] = useState<CompanyAdminMetric[]>(() => getInitialState('company_metrics', INITIAL_COMPANY_ADMIN_METRICS));
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(() => getInitialState('integrations', INITIAL_INTEGRATION_SETTINGS));
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getInitialState('company_settings', INITIAL_COMPANY_SETTINGS));

  // Sync to local storage
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
        setUsers(data);
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

  useEffect(() => {
    // Initial fetch from PostgreSQL backend
    refreshDemoRequests();
    refreshPricingPlans();
    refreshCompanyOrganizations();
    refreshProductAdmins();
    refreshClientCompanies();
    refreshWorkspaceUsers();

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
      } else if (event.type === 'user_deleted' && event.data) {
        setUsers((prev) => prev.filter((u) => u.id !== event.data.id));
      }
    });

    // 2. Cross-tab real-time sync with BroadcastChannels
    let demoChannel: BroadcastChannel | null = null;
    let pricingChannel: BroadcastChannel | null = null;
    let orgChannel: BroadcastChannel | null = null;
    let clientChannel: BroadcastChannel | null = null;
    let userChannel: BroadcastChannel | null = null;
    try {
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
        } else if (type === 'user_deleted' && data) {
          setUsers((prev) => prev.filter((u) => u.id !== data.id));
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
    }, 5000);

    return () => {
      unsubscribeSSE();
      if (demoChannel) demoChannel.close();
      if (pricingChannel) pricingChannel.close();
      if (orgChannel) orgChannel.close();
      if (clientChannel) clientChannel.close();
      if (userChannel) userChannel.close();
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
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    try {
      const saved = await userApi.update(updated.id, updated);
      try {
        const uCh = new BroadcastChannel('client_mgmt_batch_users');
        uCh.postMessage({ type: 'user_updated', data: saved });
        uCh.close();
      } catch {}
    } catch (err) {
      console.warn('Backend update user error:', err);
    }

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

  // Batches
  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch: Batch = {
      ...batch,
      id: `batch_${Date.now()}`,
    };
    setBatches((prev) => [...prev, newBatch]);
  };

  // Meetings
  const addMeeting = (meeting: Omit<Meeting, 'id' | 'status'>) => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const newMeeting: Meeting = {
      ...meeting,
      id: `meet_${Date.now()}`,
      batchId: meeting.batchId || activeBatchId,
      companyId: meeting.companyId || userCompanyId,
      status: 'upcoming',
      aiSummary: {
        overview: 'Automated meeting sync scheduled for batch review.',
        keyPoints: ['Initial agenda established by host', 'Session ready for live audio logging'],
        actionItems: ['Prepare presentation slides', 'Invite designated client stakeholders'],
      },
      transcript: [
        {
          speaker: meeting.hostName,
          timestamp: '00:00',
          text: `Welcome everyone to ${meeting.title}. Let's begin the review session.`,
        },
      ],
    };
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  // Community
  const addCommunityPost = (
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
  };

  const editCommunityPost = (postId: string, title: string, content: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, title, content } : p))
    );
  };

  const deleteCommunityPost = (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const addCommunityReply = (
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
          return {
            ...post,
            replies: [...post.replies, newReply],
          };
        }
        return post;
      })
    );
  };

  const deleteCommunityReply = (postId: string, replyId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.filter((r) => r.id !== replyId),
          };
        }
        return post;
      })
    );
  };

  const toggleLikePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const likedBy = post.likedBy || [];
          const hasLiked = likedBy.includes(currentUser.id);
          return {
            ...post,
            likes: hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            likedBy: hasLiked
              ? likedBy.filter((id) => id !== currentUser.id)
              : [...likedBy, currentUser.id],
          };
        }
        return post;
      })
    );
  };

  const toggleLikeReply = (postId: string, replyId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.map((reply) => {
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
            }),
          };
        }
        return post;
      })
    );
  };

  // Chat
  const sendChatMessage = (text: string, recipientId?: string) => {
    const userCompanyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : undefined);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      batchId: activeBatchId,
      companyId: userCompanyId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Resources
  const addResource = (title: string, description: string, fileType: string, fileSize: string) => {
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
      fileType,
      fileSize,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileUrl: '#',
      reviews: [],
    };
    setResources((prev) => [newResource, ...prev]);
  };

  const addResourceReview = (resourceId: string, rating: number, feedback: string) => {
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
  };

  // Integrations & Settings
  const updateIntegrationSettings = (newSettings: Partial<IntegrationSettings>) => {
    setIntegrationSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleCompanyIntegration = (companyId: string, type: 'whatsapp' | 'email', value: boolean) => {
    setIntegrationSettings((prev) => {
      const currentComp = prev.companySettings[companyId] || { whatsappEnabled: false, emailEnabled: false };
      return {
        ...prev,
        companySettings: {
          ...prev.companySettings,
          [companyId]: {
            ...currentComp,
            [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
          },
        },
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
  };

  const toggleClientIntegration = (clientId: string, type: 'whatsapp' | 'email', value: boolean) => {
    setIntegrationSettings((prev) => {
      const currentClient = prev.clientSettings?.[clientId] || {
        whatsappEnabled: prev.whatsappEnabledGlobal,
        emailEnabled: prev.emailAlertsGlobal,
      };
      return {
        ...prev,
        clientSettings: {
          ...(prev.clientSettings || {}),
          [clientId]: {
            ...currentClient,
            [type === 'whatsapp' ? 'whatsappEnabled' : 'emailEnabled']: value,
          },
        },
      };
    });
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
        addMeeting,
        addCommunityPost,
        editCommunityPost,
        deleteCommunityPost,
        addCommunityReply,
        deleteCommunityReply,
        toggleLikePost,
        toggleLikeReply,
        sendChatMessage,
        addResource,
        addResourceReview,
        updateIntegrationSettings,
        updateCompanySettings,
        toggleCompanyIntegration,
        toggleClientIntegration,
        createProductAdminAccount,
        addCompanyAdminMetric,
        updateCompanyAdminMetric,
        deleteCompanyAdminMetric,
        toggleCompanyStatus,
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
