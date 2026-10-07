import React from 'react';
import { CommunityPost, User, PostAttachment, PostLink } from '../../types';
import { TeamCommunityFeed } from '../common/TeamCommunityFeed';

interface CompanyCommunityTabProps {
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
  deleteCommunityReply: (postId: string, replyId: string) => void;
}

export const CompanyCommunityTab: React.FC<CompanyCommunityTabProps> = (props) => {
  return <TeamCommunityFeed {...props} />;
};
