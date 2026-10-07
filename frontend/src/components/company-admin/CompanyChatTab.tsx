import React from 'react';
import { User, Batch, ChatMessage } from '../../types';
import { WorkspaceChat } from '../common/WorkspaceChat';

interface CompanyChatTabProps {
  currentBatch: Batch;
  batchUsers: User[];
  currentUser: User;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, recipientId?: string) => void;
  activeBatchId: string;
}

export const CompanyChatTab: React.FC<CompanyChatTabProps> = (props) => {
  return <WorkspaceChat {...props} />;
};
