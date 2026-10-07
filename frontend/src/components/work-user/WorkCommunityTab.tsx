import React from 'react';
import { CommunityPost, User, PostAttachment, PostLink } from '../../types';
import { TeamCommunityFeed } from '../common/TeamCommunityFeed';
import { useApp } from '../../context/AppContext';

interface WorkCommunityTabProps {
  batchPosts: CommunityPost[];
  currentUser: User;
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
}

export const WorkCommunityTab: React.FC<WorkCommunityTabProps> = (props) => {
  const { deleteCommunityReply } = useApp();
  return (
    <TeamCommunityFeed
      {...props}
      deleteCommunityReply={deleteCommunityReply}
    />
  );
};
