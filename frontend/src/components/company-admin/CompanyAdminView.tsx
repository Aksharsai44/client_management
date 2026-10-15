import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, ClientCompany, Batch } from '../../types';
import { Sparkles, Building, Video, Users, FileText } from 'lucide-react';
import { AttendanceReportModal } from '../common/AttendanceReportModal';
import { CompanyAdminHeader } from './CompanyAdminHeader';
import { CompanyDashboardTab } from './CompanyDashboardTab';
import { ClientsAndUsersTab } from './ClientsAndUsersTab';
import { CompanyCommunityTab } from './CompanyCommunityTab';
import { CompanyChatTab } from './CompanyChatTab';
import { CompanySchedulingTab } from './CompanySchedulingTab';
import { CompanyAiTranscriptsTab } from './CompanyAiTranscriptsTab';
import { CompanyCalendarTab } from './CompanyCalendarTab';
import { CompanyResourcesTab } from './CompanyResourcesTab';
import { CompanySettingsTab } from './CompanySettingsTab';
import { CompanyProfileTab } from './CompanyProfileTab';
import { AddClientCompanyModal } from './modals/AddClientCompanyModal';
import { EditClientCompanyModal } from './modals/EditClientCompanyModal';
import { AddUserModal } from './modals/AddUserModal';
import { ViewUserDetailsModal } from './modals/ViewUserDetailsModal';
import { EditUserModal } from './modals/EditUserModal';
import { ScheduleMeetingModal } from './modals/ScheduleMeetingModal';
import { CompanyResourceModal } from './modals/CompanyResourceModal';

export const CompanyAdminView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeBatchId,
    setActiveBatchId,
    batches,
    meetings,
    addMeeting,
    clientCompanies,
    addClientCompany,
    updateClientCompany,
    deleteClientCompany,
    users,
    addUser,
    updateUser,
    deleteUser,
    communityPosts,
    addCommunityPost,
    editCommunityPost,
    deleteCommunityPost,
    addCommunityReply,
    deleteCommunityReply,
    chatMessages,
    sendChatMessage,
    resources,
    addResource,
    attendanceRecords,
    currentUser,
    companySettings,
    updateCompanySettings,
  } = useApp();

  // Filter batches scoped to current company organization
  const scopedBatches = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'product_super_admin' || currentUser.role === 'product_admin') {
      return batches;
    }
    const filtered = batches.filter((b) => {
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

    if (filtered.length === 0) {
      const primaryBatchId = currentUser.companyId ? `batch_${currentUser.companyId}` : 'batch_primary';
      return [
        {
          id: primaryBatchId,
          name: currentUser.companyName ? `${currentUser.companyName} - Primary Cohort` : 'Primary Cohort',
          code: 'BAT-01',
          companyId: currentUser.companyId || '',
          description: 'Primary onboarding cohort for clients and team members.',
          clientCount: 0,
          workerCount: 0,
          startDate: new Date().toISOString().split('T')[0],
          status: 'active' as const,
          leadAdminId: currentUser.id,
        },
      ];
    }
    return filtered;
  }, [batches, currentUser]);

  const defaultEmptyBatch: Batch = useMemo(
    () => ({
      id: currentUser?.companyId ? `batch_${currentUser.companyId}` : 'batch_primary',
      name: currentUser?.companyName ? `${currentUser.companyName} (Primary Cohort)` : 'Primary Cohort',
      code: 'BAT-01',
      companyId: currentUser?.companyId || '',
      description: 'Primary onboarding cohort for clients and team members.',
      clientCount: 0,
      workerCount: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      leadAdminId: currentUser?.id || '',
    }),
    [currentUser]
  );

  const currentBatch = scopedBatches.find((b) => b.id === activeBatchId) || scopedBatches[0] || defaultEmptyBatch;

  // Sync activeBatchId if scoped batches change
  useEffect(() => {
    if (scopedBatches.length > 0 && !scopedBatches.some((b) => b.id === activeBatchId)) {
      setActiveBatchId(scopedBatches[0].id);
    }
  }, [scopedBatches, activeBatchId, setActiveBatchId]);

  // Scoped batch data: strictly isolate to activeBatchId when it belongs to scoped batches
  const isBatchActiveInScope = Boolean(activeBatchId && scopedBatches.some((b) => b.id === activeBatchId));

  const batchMeetings = useMemo(
    () =>
      isBatchActiveInScope
        ? meetings.filter(
            (m) =>
              m.batchId === activeBatchId ||
              (currentUser?.companyId && m.companyId === currentUser.companyId)
          )
        : [],
    [meetings, activeBatchId, isBatchActiveInScope, currentUser]
  );
  const batchUsers = useMemo(() => {
    if (isBatchActiveInScope) {
      return users.filter(
        (u) =>
          u.batchIds?.includes(activeBatchId) ||
          (currentUser?.companyId && u.companyId === currentUser.companyId && u.role !== 'company_admin')
      );
    }
    if (currentUser?.companyId) {
      return users.filter((u) => u.companyId === currentUser.companyId && u.role !== 'company_admin');
    }
    return [];
  }, [users, activeBatchId, isBatchActiveInScope, currentUser]);

  const batchCompanies = useMemo(() => {
    if (isBatchActiveInScope) {
      return clientCompanies.filter(
        (c) =>
          c.batchId === activeBatchId ||
          (currentUser?.companyId && c.companyId === currentUser.companyId)
      );
    }
    if (currentUser?.companyId) {
      return clientCompanies.filter((c) => c.companyId === currentUser.companyId);
    }
    return [];
  }, [clientCompanies, activeBatchId, isBatchActiveInScope, currentUser]);
  const batchPosts = useMemo(
    () =>
      isBatchActiveInScope
        ? communityPosts.filter(
            (p) =>
              p.batchId === activeBatchId ||
              (currentUser?.companyId && p.companyId === currentUser.companyId)
          )
        : [],
    [communityPosts, activeBatchId, isBatchActiveInScope, currentUser]
  );
  const batchResources = useMemo(
    () =>
      isBatchActiveInScope
        ? resources.filter(
            (r) =>
              r.batchId === activeBatchId ||
              (currentUser?.companyId && r.companyId === currentUser.companyId)
          )
        : [],
    [resources, activeBatchId, isBatchActiveInScope, currentUser]
  );

  // Attendance report modal user
  const [reportUser, setReportUser] = useState<User | null>(null);

  // Modal triggers
  const [isAddClientModal, setIsAddClientModal] = useState(false);
  const [editingClientCompany, setEditingClientCompany] = useState<ClientCompany | null>(null);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isScheduleModal, setIsScheduleModal] = useState(false);
  const [isUploadResourceModal, setIsUploadResourceModal] = useState(false);
  const [csvUploadSuccess, setCsvUploadSuccess] = useState<string | null>(null);

  // Selected meeting for AI transcripts
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    batchMeetings[0]?.id || ''
  );
  const selectedMeeting =
    batchMeetings.find((m) => m.id === selectedMeetingId) || batchMeetings[0];

  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: 'Hello Marcus! I am your AI Meeting Assistant. Ask me anything about the transcript, decisions, or action items for this call.',
    },
  ]);

  // Calendar selected date
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-10-04');

  // Handle AI Transcript Question
  const handleAiQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || !selectedMeeting) return;

    const userQ = aiChatQuery.trim();
    setAiChatHistory((prev) => [...prev, { sender: 'user', text: userQ }]);
    setAiChatQuery('');

    setTimeout(() => {
      let aiResponse = '';
      const lowerQ = userQ.toLowerCase();

      if (lowerQ.includes('action') || lowerQ.includes('next step') || lowerQ.includes('who will')) {
        const items =
          selectedMeeting.aiSummary?.actionItems?.join('; ') || 'Follow up with stakeholders.';
        aiResponse = `According to the session transcript, here are the assigned action items: ${items}`;
      } else if (lowerQ.includes('summary') || lowerQ.includes('what happened') || lowerQ.includes('overview')) {
        aiResponse =
          selectedMeeting.aiSummary?.overview ||
          'The team reviewed key architecture milestones and approved Sprint 24 deliverables.';
      } else if (lowerQ.includes('sarah') || lowerQ.includes('globex')) {
        aiResponse =
          'Sarah Jenkins confirmed the demo speed exceeded expectations and validated that the attendance calculations match internal ERP requirements.';
      } else if (lowerQ.includes('alex') || lowerQ.includes('database') || lowerQ.includes('latency')) {
        aiResponse =
          'Alex Rivera confirmed latency reduced from 420ms to 68ms with regional edge caching, and 250k webhook test calls completed with zero errors.';
      } else {
        aiResponse = `Based on the call transcript for "${selectedMeeting.title}", ${
          selectedMeeting.aiSummary?.overview || 'the session objectives were successfully met'
        }. Key highlight: ${
          selectedMeeting.aiSummary?.keyPoints?.[0] || 'Unanimous team alignment.'
        }`;
      }

      setAiChatHistory((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  // Handle CSV file upload simulation
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsedSampleUsers = [
      {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@enterprise.org',
        role: 'client' as const,
        designation: 'Logistics Manager',
        phone: '+1 (555) 781-9922',
        batchIds: [activeBatchId],
        status: 'active' as const,
      },
      {
        name: 'Rachel Foster',
        email: 'rachel.foster@internal.io',
        role: 'work_user' as const,
        designation: 'DevOps Specialist',
        phone: '+1 (555) 341-8899',
        batchIds: [activeBatchId],
        status: 'active' as const,
      },
    ];

    parsedSampleUsers.forEach((u) => addUser(u));
    setCsvUploadSuccess(
      `Imported 2 users successfully from "${file.name}" with default password "${companySettings.universalDefaultPassword}"`
    );
    setTimeout(() => setCsvUploadSuccess(null), 5000);
  };

  return (
    <div
      className={
        activeTab === 'chat'
          ? 'p-3 sm:p-4 h-full flex flex-col min-h-0 overflow-hidden'
          : 'p-6 max-w-7xl mx-auto space-y-6'
      }
    >
      {/* Isolated Workspace Welcome Banner for Fresh Organizations */}
      {scopedBatches.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Isolated Tenant Workspace &bull; {currentUser?.companyName || 'Organization Admin'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Welcome! This organization is fully isolated with 0 pre-populated records. All workspace data starts completely clean and dedicated to your company.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddClientModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5 self-start sm:self-center"
          >
            <span>+ Add First Client</span>
          </button>
        </div>
      )}

      {/* Batch Header Bar - Only visible on Dashboard tab */}
      {activeTab === 'dashboard' && (
        <CompanyAdminHeader
          currentBatch={currentBatch}
          batches={scopedBatches}
          activeBatchId={activeBatchId}
          setActiveBatchId={setActiveBatchId}
        />
      )}

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <CompanyDashboardTab
          batchUsers={batchUsers}
          batchMeetings={batchMeetings}
          batchResources={batchResources}
          attendanceRecords={attendanceRecords}
          activeBatchId={activeBatchId}
          selectedCalendarDate={selectedCalendarDate}
          setSelectedCalendarDate={setSelectedCalendarDate}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 2. CLIENTS & USERS TAB */}
      {activeTab === 'clients_users' && (
        <ClientsAndUsersTab
          companySettings={companySettings}
          batchCompanies={batchCompanies}
          batchUsers={batchUsers}
          currentBatchName={currentBatch.name}
          onOpenAddClient={() => setIsAddClientModal(true)}
          onOpenAddUser={() => setIsAddUserModal(true)}
          onViewReport={(user) => setReportUser(user)}
          onViewUser={(user) => setViewingUser(user)}
          onEditUser={(user) => setEditingUser(user)}
          onDeleteUser={(userId) => deleteUser(userId)}
          onCsvUpload={handleCsvUpload}
          csvUploadSuccess={csvUploadSuccess}
          onEditClient={(company) => setEditingClientCompany(company)}
          onDeleteClient={(companyId) => deleteClientCompany(companyId)}
          onToggleClientStatus={(company) =>
            updateClientCompany({
              ...company,
              status: company.status === 'active' ? 'paused' : 'active',
            })
          }
        />
      )}

      {/* 3. COMMUNITY TAB */}
      {activeTab === 'community' && (
        <CompanyCommunityTab
          batchPosts={batchPosts}
          currentUser={currentUser}
          addCommunityPost={addCommunityPost}
          editCommunityPost={editCommunityPost}
          deleteCommunityPost={deleteCommunityPost}
          addCommunityReply={addCommunityReply}
          deleteCommunityReply={deleteCommunityReply}
        />
      )}

      {/* 4. CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="flex-1 min-h-0 h-full">
          <CompanyChatTab
            currentBatch={currentBatch}
            batchUsers={batchUsers}
            currentUser={currentUser}
            chatMessages={chatMessages}
            sendChatMessage={sendChatMessage}
            activeBatchId={activeBatchId}
          />
        </div>
      )}

      {/* 5. SCHEDULING TAB */}
      {activeTab === 'scheduling' && (
        <CompanySchedulingTab
          batchMeetings={batchMeetings}
          onOpenScheduleModal={() => setIsScheduleModal(true)}
          onInspectTranscript={(meetId) => {
            setSelectedMeetingId(meetId);
            setActiveTab('ai_transcripts');
          }}
        />
      )}

      {/* 6. AI TRANSCRIPTS TAB */}
      {activeTab === 'ai_transcripts' && (
        <CompanyAiTranscriptsTab
          batchMeetings={batchMeetings}
          selectedMeetingId={selectedMeetingId}
          setSelectedMeetingId={setSelectedMeetingId}
          selectedMeeting={selectedMeeting}
          aiChatHistory={aiChatHistory}
          aiChatQuery={aiChatQuery}
          setAiChatQuery={setAiChatQuery}
          handleAiQuestionSubmit={handleAiQuestionSubmit}
        />
      )}

      {/* 7. CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <CompanyCalendarTab
          currentBatch={currentBatch}
          activeBatchId={activeBatchId}
          batchUsers={batchUsers}
          attendanceRecords={attendanceRecords}
          selectedCalendarDate={selectedCalendarDate}
          setSelectedCalendarDate={setSelectedCalendarDate}
          onViewReport={(user) => setReportUser(user)}
        />
      )}

      {/* 8. RESOURCES TAB */}
      {activeTab === 'resources' && (
        <CompanyResourcesTab
          batchResources={batchResources}
          onOpenUploadModal={() => setIsUploadResourceModal(true)}
        />
      )}

      {/* 9. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <CompanySettingsTab
          companySettings={companySettings}
          updateCompanySettings={updateCompanySettings}
        />
      )}

      {/* 10. PROFILE TAB */}
      {activeTab === 'profile' && (
        <CompanyProfileTab currentUser={currentUser} batches={batches} />
      )}

      {/* ================= MODALS ================= */}
      <AddClientCompanyModal
        isOpen={isAddClientModal}
        onClose={() => setIsAddClientModal(false)}
        onAdd={(clientCompany) => addClientCompany(clientCompany)}
        activeBatchId={activeBatchId || currentBatch.id}
      />

      {editingClientCompany && (
        <EditClientCompanyModal
          isOpen={!!editingClientCompany}
          company={editingClientCompany}
          onClose={() => setEditingClientCompany(null)}
          onUpdate={(updated) => updateClientCompany(updated)}
        />
      )}

      <AddUserModal
        isOpen={isAddUserModal}
        onClose={() => setIsAddUserModal(false)}
        onAdd={(u) => addUser(u)}
        activeBatchId={activeBatchId || currentBatch.id}
        companySettings={companySettings}
        clientCompanies={batchCompanies}
      />

      <ViewUserDetailsModal
        viewingUser={viewingUser}
        onClose={() => setViewingUser(null)}
        currentBatchName={currentBatch.name}
        onOpenReport={(u) => setReportUser(u)}
        onOpenEdit={(u) => setEditingUser(u)}
      />

      <EditUserModal
        editingUser={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdate={(u) => updateUser(u)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleModal}
        onClose={() => setIsScheduleModal(false)}
        onAdd={(m) => addMeeting(m)}
        activeBatchId={activeBatchId}
        hostName={currentUser.name}
      />

      <CompanyResourceModal
        isOpen={isUploadResourceModal}
        onClose={() => setIsUploadResourceModal(false)}
        onUpload={(title, desc, fileType, fileSize) =>
          addResource(title, desc, fileType, fileSize)
        }
      />

      {reportUser && (
        <AttendanceReportModal
          user={reportUser}
          onClose={() => setReportUser(null)}
        />
      )}
    </div>
  );
};
