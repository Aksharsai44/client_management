import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, ClientCompany } from '../../types';
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

  // Active batch object
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0];

  // Attendance report modal user
  const [reportUser, setReportUser] = useState<User | null>(null);

  // Filtered batch data
  const batchMeetings = useMemo(
    () => meetings.filter((m) => m.batchId === activeBatchId),
    [meetings, activeBatchId]
  );
  const batchUsers = useMemo(
    () => users.filter((u) => u.batchIds?.includes(activeBatchId)),
    [users, activeBatchId]
  );
  const batchCompanies = useMemo(
    () => clientCompanies.filter((c) => c.batchId === activeBatchId),
    [clientCompanies, activeBatchId]
  );
  const batchPosts = useMemo(
    () => communityPosts.filter((p) => p.batchId === activeBatchId),
    [communityPosts, activeBatchId]
  );
  const batchResources = useMemo(
    () => resources.filter((r) => r.batchId === activeBatchId),
    [resources, activeBatchId]
  );

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
      {/* Batch Header Bar - Only visible on Dashboard tab */}
      {activeTab === 'dashboard' && (
        <CompanyAdminHeader
          currentBatch={currentBatch}
          batches={batches}
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
        activeBatchId={activeBatchId}
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
        activeBatchId={activeBatchId}
        companySettings={companySettings}
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
