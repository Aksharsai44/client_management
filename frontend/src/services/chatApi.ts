import { ChatMessage, ChatAttachment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const chatApi = {
  /**
   * Fetch chat messages, optionally filtered by batchId, recipientId, senderId, or group
   */
  async getAllMessages(params?: {
    batchId?: string;
    recipientId?: string;
    senderId?: string;
    isGroup?: boolean;
  }): Promise<ChatMessage[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.recipientId) query.set('recipientId', params.recipientId);
    if (params?.senderId) query.set('senderId', params.senderId);
    if (params?.isGroup) query.set('isGroup', 'true');

    const url = `${API_BASE_URL}/chat-messages/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch chat messages: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Fetch single chat message by ID
   */
  async getMessage(id: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/${id}/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch message ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new chat message in PostgreSQL database (triggers real-time SSE broadcast)
   */
  async createMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create chat message: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update a chat message (e.g. status, reactions, text)
   */
  async updateMessage(id: string, partial: Partial<ChatMessage>): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update chat message: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a chat message from database (Delete for everyone)
   */
  async deleteMessage(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete message: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Delete / hide a chat message for specific user only (Delete for me)
   */
  async deleteForMe(id: string, userId: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/${id}/delete-for-me/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete message for user: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Mark messages as read for WhatsApp blue double ticks
   */
  async markAsRead(payload: {
    messageIds?: string[];
    readerId: string;
    batchId?: string;
    senderId?: string;
  }): Promise<{ success: boolean; updatedCount: number; messageIds: string[] }> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/mark-read/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to mark messages as read: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Upload multimedia attachment (photo, document, or video)
   * Supports standard File upload (multipart/form-data) or dataUrl payload
   */
  async uploadAttachment(
    source: File | { dataUrl: string; name: string; type: string; size?: string }
  ): Promise<ChatAttachment> {
    if (source instanceof File) {
      const formData = new FormData();
      formData.append('file', source);
      const res = await fetch(`${API_BASE_URL}/chat-messages/upload/`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Failed to upload file: HTTP ${res.status}`);
      }
      return await res.json();
    } else {
      const res = await fetch(`${API_BASE_URL}/chat-messages/upload/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(source),
      });
      if (!res.ok) {
        throw new Error(`Failed to upload attachment payload: HTTP ${res.status}`);
      }
      return await res.json();
    }
  },

  /**
   * Seed initial realistic chat messages if table is empty
   */
  async seedMessages(initialMessages?: ChatMessage[]): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/chat-messages/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialMessages || []),
    });
    if (!res.ok) {
      throw new Error(`Failed to seed chat messages: HTTP ${res.status}`);
    }
    return await res.json();
  },
};
