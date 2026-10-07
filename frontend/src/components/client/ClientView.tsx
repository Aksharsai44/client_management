import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { AttendanceReportModal } from '../common/AttendanceReportModal';
import { ClientHeader } from './ClientHeader';
import { ClientDashboardTab } from './ClientDashboardTab';
import { ClientGroupTab } from './ClientGroupTab';
import { ClientCommunityTab } from './ClientCommunityTab';
import { ClientChatTab } from './ClientChatTab';
import { ClientMeetingsTab } from './ClientMeetingsTab';
import { ClientAiTranscriptsTab } from './ClientAiTranscriptsTab';
import { ClientCalendarTab } from './ClientCalendarTab';
import { ClientResourcesTab } from './ClientResourcesTab';
import { ClientProfileTab } from './ClientProfileTab';
import { ClientResourceUploadModal } from './modals/ClientResourceUploadModal';
import { ClientResourceReviewModal } from './modals/ClientResourceReviewModal';

export const ClientView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeBatchId,
    setActiveBatchId,
    batches,
    meetings,
    communityPosts,
    addCommunityPost,
    editCommunityPost,
    deleteCommunityPost,
    addCommunityReply,
    chatMessages,
    sendChatMessage,
    resources,
    addResource,
    addResourceReview,
    attendanceRecords,
    currentUser,
    users,
    companySettings,
  } = useApp();

  // Active batch
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0];

  // User client batches
  const userBatches = batches.filter((b) => currentUser.batchIds?.includes(b.id));

  // Batch-filtered datasets
  const batchMeetings = useMemo(
    () => meetings.filter((m) => m.batchId === activeBatchId),
    [meetings, activeBatchId]
  );
  const batchUsers = useMemo(
    () => users.filter((u) => u.batchIds?.includes(activeBatchId)),
    [users, activeBatchId]
  );
  const batchPosts = useMemo(
    () => communityPosts.filter((p) => p.batchId === activeBatchId),
    [communityPosts, activeBatchId]
  );
  const batchResources = useMemo(
    () => resources.filter((r) => r.batchId === activeBatchId),
    [resources, activeBatchId]
  );

  // Dynamic attendance index
  const clientRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (r) => r.userId === currentUser.id && r.batchId === activeBatchId
      ),
    [attendanceRecords, currentUser.id, activeBatchId]
  );
  const clientAttendedCount = clientRecords.filter((r) => r.status === 'present').length;
  const clientAttendanceRate =
    clientRecords.length > 0
      ? Math.round((clientAttendedCount / clientRecords.length) * 100)
      : 100;

  // Selected meeting for AI Transcripts
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    batchMeetings[0]?.id || ''
  );

  // Resource Upload & Review Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reviewTargetResId, setReviewTargetResId] = useState<string | null>(null);

  // Report modal
  const [reportUser, setReportUser] = useState<User | null>(null);

  return (
    <div
      className={
        activeTab === 'chat'
          ? 'p-3 sm:p-4 h-full flex flex-col min-h-0 overflow-hidden'
          : 'p-6 max-w-7xl mx-auto space-y-6'
      }
    >
      {/* Header with Batch Switcher - Only visible on Dashboard tab */}
      {activeTab === 'dashboard' && (
        <ClientHeader
          currentBatch={currentBatch}
          currentUser={currentUser}
          userBatches={userBatches}
          activeBatchId={activeBatchId}
          setActiveBatchId={setActiveBatchId}
        />
      )}

      {/* 1. CLIENT DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <ClientDashboardTab
          batchMeetings={batchMeetings}
          clientAttendanceRate={clientAttendanceRate}
          batchResources={batchResources}
          batchPosts={batchPosts}
          attendanceRecords={attendanceRecords}
          activeBatchId={activeBatchId}
          currentUser={currentUser}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 2. CLIENT GROUP TAB */}
      {activeTab === 'client_group' && (
        <ClientGroupTab
          currentBatch={currentBatch}
          batchUsers={batchUsers}
          onViewReport={(member) => setReportUser(member)}
        />
      )}

      {/* 3. TEAM COMMUNITY TAB */}
      {activeTab === 'community' && (
        <ClientCommunityTab
          batchPosts={batchPosts}
          currentUser={currentUser}
          addCommunityPost={addCommunityPost}
          editCommunityPost={editCommunityPost}
          deleteCommunityPost={deleteCommunityPost}
          addCommunityReply={addCommunityReply}
        />
      )}

      {/* 4. CHAT TAB */}
      {activeTab === 'chat' && companySettings.allowChatWithUsers && (
        <div className="flex-1 min-h-0 h-full">
          <ClientChatTab
            currentBatch={currentBatch}
            batchUsers={batchUsers}
            currentUser={currentUser}
            chatMessages={chatMessages}
            sendChatMessage={sendChatMessage}
            activeBatchId={activeBatchId}
          />
        </div>
      )}

      {/* 5. MEETINGS TAB */}
      {activeTab === 'meetings' && (
        <ClientMeetingsTab
          batchMeetings={batchMeetings}
          onInspectTranscript={(meetId) => {
            setSelectedMeetingId(meetId);
            setActiveTab('ai_transcripts');
          }}
        />
      )}

      {/* 6. AI TRANSCRIPTS TAB */}
      {activeTab === 'ai_transcripts' && (
        <ClientAiTranscriptsTab
          batchMeetings={batchMeetings}
          selectedMeetingId={selectedMeetingId}
          setSelectedMeetingId={setSelectedMeetingId}
          currentUser={currentUser}
        />
      )}

      {/* 7. CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <ClientCalendarTab
          batchMeetings={batchMeetings}
          attendanceRecords={attendanceRecords}
          activeBatchId={activeBatchId}
          currentUser={currentUser}
        />
      )}

      {/* 8. RESOURCES TAB */}
      {activeTab === 'resources' && (
        <ClientResourcesTab
          batchResources={batchResources}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenReview={(resId) => setReviewTargetResId(resId)}
        />
      )}

      {/* 9. CLIENT PROFILE TAB */}
      {activeTab === 'profile' && (
        <ClientProfileTab currentUser={currentUser} batches={batches} />
      )}

      {/* MODALS */}
      <ClientResourceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(title, desc, fileType, fileSize) =>
          addResource(title, desc, fileType, fileSize)
        }
      />

      <ClientResourceReviewModal
        targetResId={reviewTargetResId}
        onClose={() => setReviewTargetResId(null)}
        onSubmit={(resId, rating, feedback) =>
          addResourceReview(resId, rating, feedback)
        }
      />

      {reportUser && (
        <AttendanceReportModal user={reportUser} onClose={() => setReportUser(null)} />
      )}
    </div>
  );
};
