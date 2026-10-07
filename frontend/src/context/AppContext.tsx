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
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
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

  // Actions
  submitDemoRequest: (data: Omit<DemoRequest, 'id' | 'submittedAt' | 'status'>, targetWhatsappNumber?: string) => { whatsappUrl: string };
  createDummyCredential: (requestId: string, temporaryPassword?: string, durationDays?: number) => void;
  toggleDummyCredentialStatus: (requestId: string, active: boolean) => void;
  updatePricingPlan: (plan: PricingPlan) => void;
  addPricingPlan: (plan: Omit<PricingPlan, 'id'>) => void;
  deletePricingPlan: (planId: string) => void;
  addClientCompany: (company: Omit<ClientCompany, 'id' | 'createdAt'>) => void;
  updateClientCompany: (company: ClientCompany) => void;
  deleteClientCompany: (companyId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
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
  createProductAdminAccount: (name: string, email: string, assignedCompanyIds: string[]) => void;
  addCompanyAdminMetric: (company: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    phone?: string;
    website?: string;
    industry?: string;
    tier?: 'Starter' | 'Growth' | 'Enterprise';
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

  const quickSwitchRole = (role: UserRole, specificUserId?: string) => {
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

  const loginUser = (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    // Check standard users
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      if (matchedUser.batchIds && matchedUser.batchIds.length > 0) {
        setActiveBatchId(matchedUser.batchIds[0]);
      }
      setActiveTab('dashboard');
      setCurrentView('app');
      return { success: true, message: `Welcome back, ${matchedUser.name}!` };
    }

    // Check dummy demo request credentials
    const matchedDemo = demoRequests.find(
      (d) =>
        d.dummyCredential &&
        d.dummyCredential.username.toLowerCase() === trimmedEmail &&
        d.dummyCredential.isActive
    );

    if (matchedDemo && matchedDemo.dummyCredential) {
      if (password && matchedDemo.dummyCredential.temporaryPassword !== password) {
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

    return { success: false, message: 'No account found with this email. Please check your credentials or pick a demo persona below.' };
  };

  const logout = () => {
    setCurrentView('brochure');
  };

  // Demo requests
  const submitDemoRequest = (
    data: Omit<DemoRequest, 'id' | 'submittedAt' | 'status'>,
    targetWhatsappNumber: string = '15550192831'
  ) => {
    const newRequest: DemoRequest = {
      ...data,
      id: `demo_${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };
    setDemoRequests((prev) => [newRequest, ...prev]);

    // Format WhatsApp message
    const message = `Hello Client Management Team! 🚀\nI would like to request a demo of your platform.\n\n👤 *Name:* ${data.name}\n🏢 *Company:* ${data.companyName}\n📧 *Email:* ${data.email}\n📱 *Phone:* ${data.phone}\n👥 *Team Size:* ${data.teamSize}\n📝 *Requirements:* ${data.requirements || 'Looking forward to testing the product features!'}`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = targetWhatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    return { whatsappUrl };
  };

  const createDummyCredential = (requestId: string, temporaryPassword?: string, durationDays: number = 14) => {
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
  };

  const toggleDummyCredentialStatus = (requestId: string, active: boolean) => {
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
  };

  // Pricing
  const updatePricingPlan = (updated: PricingPlan) => {
    setPricingPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addPricingPlan = (plan: Omit<PricingPlan, 'id'>) => {
    const newPlan: PricingPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
    };
    setPricingPlans((prev) => [...prev, newPlan]);
  };

  const deletePricingPlan = (planId: string) => {
    setPricingPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  // Client Companies
  const addClientCompany = (company: Omit<ClientCompany, 'id' | 'createdAt'>) => {
    const newCompany: ClientCompany = {
      ...company,
      id: `client_comp_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClientCompanies((prev) => [newCompany, ...prev]);

    // Also auto-add primary contact user
    const newUser: User = {
      id: `user_cli_${Date.now()}`,
      name: company.clientName,
      email: company.email,
      role: 'client',
      companyName: company.name,
      batchIds: [company.batchId],
      status: 'active',
      phone: company.phone,
      designation: 'Client Representative',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateClientCompany = (company: ClientCompany) => {
    setClientCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? company : c))
    );
  };

  const deleteClientCompany = (companyId: string) => {
    setClientCompanies((prev) => prev.filter((c) => c.id !== companyId));
  };

  // Users
  const addUser = (userData: Omit<User, 'id' | 'joinedDate'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
    const newMeeting: Meeting = {
      ...meeting,
      id: `meet_${Date.now()}`,
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
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      batchId: activeBatchId,
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
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      batchId: activeBatchId,
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
    const newResource: ResourceItem = {
      id: `res_${Date.now()}`,
      batchId: activeBatchId,
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

  const createProductAdminAccount = (name: string, email: string, assignedCompanyIds: string[]) => {
    const newProdAdmin: User = {
      id: `user_padmin_${Date.now()}`,
      name,
      email,
      role: 'product_admin',
      batchIds: ['batch_alpha'],
      status: 'active',
      phone: '+1 (555) 700-1122',
      designation: 'Product Administrator',
      joinedDate: new Date().toISOString().split('T')[0],
      assignedCompanyAdminIds: assignedCompanyIds,
    };
    setUsers((prev) => [...prev, newProdAdmin]);
  };

  const addCompanyAdminMetric = (company: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    phone?: string;
    website?: string;
    industry?: string;
    tier?: 'Starter' | 'Growth' | 'Enterprise';
    status?: 'active' | 'paused';
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    storageUsedMb?: number;
  }) => {
    const adminId = `user_comp_admin_${Date.now()}`;
    const newMetric: CompanyAdminMetric = {
      companyAdminId: adminId,
      companyName: company.companyName,
      adminName: company.adminName,
      adminEmail: company.adminEmail,
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

    // Automatically create matching company_admin user so login/switching works
    const newAdminUser: User = {
      id: adminId,
      name: company.adminName,
      email: company.adminEmail,
      role: 'company_admin',
      companyId: `comp_${Date.now()}`,
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
  };

  const toggleCompanyStatus = (companyAdminId: string) => {
    setCompanyAdminMetrics((prev) =>
      prev.map((c) => {
        if (c.companyAdminId === companyAdminId) {
          const nextStatus = c.status === 'paused' ? 'active' : 'paused';
          return { ...c, status: nextStatus };
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
