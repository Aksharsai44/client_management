import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Batch } from '../../types';
import { AttendanceReportModal } from '../common/AttendanceReportModal';
import { WorkUserHeader } from './WorkUserHeader';
import { WorkDashboardTab } from './WorkDashboardTab';
import { WorkGroupsTab } from './WorkGroupsTab';
import { WorkCommunityTab } from './WorkCommunityTab';
import { WorkChatTab } from './WorkChatTab';
import { WorkMeetingsTab } from './WorkMeetingsTab';
import { WorkAiTranscriptsTab } from './WorkAiTranscriptsTab';
import { WorkCalendarTab } from './WorkCalendarTab';
import { WorkResourcesTab } from './WorkResourcesTab';
import { WorkProfileTab } from './WorkProfileTab';
import { WorkResourceUploadModal } from './modals/WorkResourceUploadModal';

export const WorkUserView: React.FC = () => {
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
    attendanceRecords,
    currentUser,
    users,
  } = useApp();

  // 1. Scoped batches for this worker
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
          ? `${currentUser.companyName} - Team Workspace`
          : 'Team Workspace',
        code: 'BAT-01',
        companyId: currentUser.companyId || '',
        description: `Dedicated worker workspace for ${currentUser.companyName || 'your organization'}.`,
        clientCount: 0,
        workerCount: 1,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        leadAdminId: currentUser.companyId || currentUser.id,
      },
    ];
  }, [batches, currentUser]);

  const currentBatch = useMemo(() => {
    return (
      scopedBatches.find((b) => b.id === activeBatchId) ||
      scopedBatches[0]
    );
  }, [scopedBatches, activeBatchId]);

  useEffect(() => {
    if (currentBatch && activeBatchId !== currentBatch.id) {
      setActiveBatchId(currentBatch.id);
    }
  }, [currentBatch, activeBatchId, setActiveBatchId]);

  const userBatches = scopedBatches;

  // 2. Real Batch Users: ONLY real users added to this specific batch
  const batchUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role === 'product_super_admin' || u.role === 'product_admin') return false;
      const matchesCompany =
        !currentUser.companyId || u.companyId === currentUser.companyId;
      const matchesCompanyName =
        !currentUser.companyName ||
        !u.companyName ||
        currentUser.companyName.toLowerCase().trim() === u.companyName.toLowerCase().trim();
      if (!matchesCompany && !matchesCompanyName) return false;

      // Always include company admin so team members can communicate with their admin
      if (u.role === 'company_admin') return true;

      const matchesBatch = Boolean(
        (u.batchIds && u.batchIds.includes(currentBatch.id)) ||
        (u as any).batchId === currentBatch.id
      );
      return matchesBatch;
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
  const workerRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (r) => r.userId === currentUser.id && r.batchId === currentBatch.id
      ),
    [attendanceRecords, currentUser.id, currentBatch.id]
  );
  const workerAttendedCount = workerRecords.filter((r) => r.status === 'present').length;
  const workerAttendanceRate =
    workerRecords.length > 0
      ? Math.round((workerAttendedCount / workerRecords.length) * 100)
      : 100;

  // Selected meeting for AI Transcripts
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    batchMeetings[0]?.id || ''
  );

  // Resource Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Attendance report modal
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
        <WorkUserHeader
          currentBatch={currentBatch}
          currentUser={currentUser}
          userBatches={userBatches}
          activeBatchId={activeBatchId}
          setActiveBatchId={setActiveBatchId}
        />
      )}

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <WorkDashboardTab
          batchMeetings={batchMeetings}
          workerAttendanceRate={workerAttendanceRate}
          batchResources={batchResources}
          batchPosts={batchPosts}
          attendanceRecords={attendanceRecords}
          activeBatchId={activeBatchId}
          currentUser={currentUser}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 2. GROUPS TAB */}
      {activeTab === 'groups' && (
        <WorkGroupsTab
          currentBatch={currentBatch}
          batchUsers={batchUsers}
          onViewReport={(member) => setReportUser(member)}
        />
      )}

      {/* 3. TEAM COMMUNITY TAB */}
      {activeTab === 'community' && (
        <WorkCommunityTab
          batchPosts={batchPosts}
          currentUser={currentUser}
          addCommunityPost={addCommunityPost}
          editCommunityPost={editCommunityPost}
          deleteCommunityPost={deleteCommunityPost}
          addCommunityReply={addCommunityReply}
        />
      )}

      {/* 4. CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="flex-1 min-h-0 h-full">
          <WorkChatTab
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
        <WorkMeetingsTab
          batchMeetings={batchMeetings}
          onInspectTranscript={(meetId) => {
            setSelectedMeetingId(meetId);
            setActiveTab('ai_transcripts');
          }}
        />
      )}

      {/* 6. AI TRANSCRIPTS TAB */}
      {activeTab === 'ai_transcripts' && (
        <WorkAiTranscriptsTab
          batchMeetings={batchMeetings}
          selectedMeetingId={selectedMeetingId}
          setSelectedMeetingId={setSelectedMeetingId}
          currentUser={currentUser}
        />
      )}

      {/* 7. CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <WorkCalendarTab
          batchMeetings={batchMeetings}
          attendanceRecords={attendanceRecords}
          activeBatchId={activeBatchId}
          currentUser={currentUser}
        />
      )}

      {/* 8. RESOURCES / DELIVERABLES TAB */}
      {activeTab === 'resources' && (
        <WorkResourcesTab
          batchResources={batchResources}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      )}

      {/* 9. WORK USER PROFILE */}
      {activeTab === 'profile' && (
        <WorkProfileTab currentUser={currentUser} batches={userBatches} />
      )}

      {/* UPLOAD MODAL */}
      <WorkResourceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(title, desc, fileType, fileSize, fileUrl, fileName, externalLink) =>
          addResource(title, desc, fileType, fileSize, fileUrl, fileName, externalLink)
        }
      />

      {/* ATTENDANCE REPORT MODAL */}
      {reportUser && (
        <AttendanceReportModal user={reportUser} onClose={() => setReportUser(null)} />
      )}
    </div>
  );
};
