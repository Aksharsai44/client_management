import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Batch } from '../../types';
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

  // 1. Scoped batches for this client organization
  const scopedBatches = useMemo(() => {
    const matching = batches.filter((b) => {
      if (currentUser.batchIds && currentUser.batchIds.includes(b.id)) return true;
      if (currentUser.companyId && b.companyId === currentUser.companyId) return true;
      if (
        currentUser.companyName &&
        b.name &&
        b.name.toLowerCase().includes(currentUser.companyName.toLowerCase())
      ) {
        return true;
      }
      return false;
    });

    if (matching.length > 0) return matching;

    const primaryBatchId =
      currentUser.batchIds?.[0] ||
      (currentUser.companyId ? `batch_${currentUser.companyId}` : 'batch_primary');

    return [
      {
        id: primaryBatchId,
        name: currentUser.companyName
          ? `${currentUser.companyName} - Client Group`
          : 'Client Group',
        code: 'BAT-01',
        companyId: currentUser.companyId || '',
        description: `Dedicated client group workspace for ${currentUser.companyName || 'your organization'}.`,
        clientCount: 1,
        workerCount: 0,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        leadAdminId: currentUser.companyId || currentUser.id,
      },
    ];
  }, [batches, currentUser]);

  // Current active batch (strictly guaranteed to be within scopedBatches!)
  const currentBatch = useMemo(() => {
    return (
      scopedBatches.find((b) => b.id === activeBatchId) ||
      scopedBatches[0]
    );
  }, [scopedBatches, activeBatchId]);

  // Sync activeBatchId to client's own batch
  useEffect(() => {
    if (currentBatch && activeBatchId !== currentBatch.id) {
      setActiveBatchId(currentBatch.id);
    }
  }, [currentBatch, activeBatchId, setActiveBatchId]);

  const userBatches = scopedBatches;

  // 2. Real Batch Users: ONLY real users added to this organization/batch manually
  const batchUsers = useMemo(() => {
    return users.filter((u) => {
      // Never show platform product admins
      if (u.role === 'product_super_admin' || u.role === 'product_admin') return false;

      // Match by companyId or companyName or batch
      const matchesCompany =
        currentUser.companyId && u.companyId === currentUser.companyId;
      const matchesCompanyName =
        currentUser.companyName &&
        u.companyName &&
        currentUser.companyName.toLowerCase().trim() === u.companyName.toLowerCase().trim();
      const matchesBatch =
        currentBatch.id && u.batchIds?.includes(currentBatch.id);

      return Boolean(matchesCompany || matchesCompanyName || matchesBatch);
    });
  }, [users, currentUser, currentBatch.id]);

  // 3. Real Meetings: ONLY meetings scheduled for this batch or organization
  const batchMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (m.batchId === currentBatch.id) return true;
      if (currentUser.companyId && m.companyId === currentUser.companyId) return true;
      return false;
    });
  }, [meetings, currentBatch.id, currentUser.companyId]);

  // 4. Real Community Posts: ONLY posts created for this batch or by company members
  const batchPosts = useMemo(() => {
    const allowedUserIds = new Set(batchUsers.map((u) => u.id));
    allowedUserIds.add(currentUser.id);
    if (currentUser.companyId) allowedUserIds.add(currentUser.companyId);

    return communityPosts.filter((p) => {
      if (p.batchId === currentBatch.id) return true;
      if (allowedUserIds.has(p.authorId)) return true;
      return false;
    });
  }, [communityPosts, currentBatch.id, batchUsers, currentUser]);

  // 5. Real Resources: ONLY resources uploaded for this batch or by company members
  const batchResources = useMemo(() => {
    const allowedUserIds = new Set(batchUsers.map((u) => u.id));
    allowedUserIds.add(currentUser.id);
    if (currentUser.companyId) allowedUserIds.add(currentUser.companyId);

    return resources.filter((r) => {
      if (r.batchId === currentBatch.id) return true;
      if (r.uploaderId && allowedUserIds.has(r.uploaderId)) return true;
      return false;
    });
  }, [resources, currentBatch.id, batchUsers, currentUser]);

  // 6. Real Attendance Records
  const clientRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (r) => r.userId === currentUser.id && r.batchId === currentBatch.id
      ),
    [attendanceRecords, currentUser.id, currentBatch.id]
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
        <ClientProfileTab currentUser={currentUser} batches={userBatches} />
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
