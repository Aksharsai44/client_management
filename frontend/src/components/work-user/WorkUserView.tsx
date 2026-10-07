import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
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

  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
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

  // Dynamic attendance rate
  const workerRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (r) => r.userId === currentUser.id && r.batchId === activeBatchId
      ),
    [attendanceRecords, currentUser.id, activeBatchId]
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
        <WorkProfileTab currentUser={currentUser} batches={batches} />
      )}

      {/* UPLOAD MODAL */}
      <WorkResourceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(title, desc, fileType, fileSize) =>
          addResource(title, desc, fileType, fileSize)
        }
      />

      {/* ATTENDANCE REPORT MODAL */}
      {reportUser && (
        <AttendanceReportModal user={reportUser} onClose={() => setReportUser(null)} />
      )}
    </div>
  );
};
