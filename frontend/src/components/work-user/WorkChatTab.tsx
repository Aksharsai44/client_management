import React from 'react';
import { User, Batch, ChatMessage } from '../../types';
import { WorkspaceChat } from '../common/WorkspaceChat';

interface WorkChatTabProps {
  currentBatch: Batch;
  batchUsers: User[];
  currentUser: User;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, recipientId?: string) => void;
  activeBatchId: string;
}

export const WorkChatTab: React.FC<WorkChatTabProps> = (props) => {
  return <WorkspaceChat {...props} />;
};
