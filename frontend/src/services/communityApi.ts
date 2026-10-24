import { CommunityPost, CommunityReply } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const communityApi = {
  /**
   * Fetch all community posts, optionally filtered by batchId or companyId
   */
  async getAllPosts(params?: { batchId?: string; companyId?: string }): Promise<CommunityPost[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.companyId) query.set('companyId', params.companyId);

    const url = `${API_BASE_URL}/community-posts/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch community posts: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Fetch single community post by ID
   */
  async getPost(id: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${id}/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch community post ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new community post in PostgreSQL database
   */
  async createPost(post: Partial<CommunityPost>): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create community post: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing post (e.g. title, content, tags)
   */
  async updatePost(id: string, partial: Partial<CommunityPost>): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update community post: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a post from database
   */
  async deletePost(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete community post: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Toggle like on a community post
   */
  async toggleLikePost(postId: string, userId: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${postId}/like/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to toggle post like: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Add a threaded reply or nested reply to a community post
   */
  async addReply(postId: string, reply: Partial<CommunityReply>): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${postId}/replies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reply),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to add reply: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a reply from a community post
   */
  async deleteReply(postId: string, replyId: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${postId}/replies/${replyId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete reply: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Toggle like on a reply
   */
  async toggleLikeReply(postId: string, replyId: string, userId: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE_URL}/community-posts/${postId}/replies/${replyId}/like/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to toggle reply like: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Seed initial default community posts if database table is empty
   */
  async seedPosts(initialPosts: CommunityPost[]): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/community-posts/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialPosts),
    });
    if (!res.ok) {
      throw new Error(`Failed to seed community posts: HTTP ${res.status}`);
    }
    return await res.json();
  },
};
