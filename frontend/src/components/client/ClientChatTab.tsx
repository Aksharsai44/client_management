import React from 'react';
import { User, Batch, ChatMessage } from '../../types';
import { WorkspaceChat } from '../common/WorkspaceChat';

interface ClientChatTabProps {
  currentBatch: Batch;
  batchUsers: User[];
  currentUser: User;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, recipientId?: string) => void;
  activeBatchId: string;
}

export const ClientChatTab: React.FC<ClientChatTabProps> = (props) => {
  return <WorkspaceChat {...props} />;
};
