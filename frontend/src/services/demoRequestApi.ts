import { DemoRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const demoRequestApi = {
  /**
   * Fetch all demo requests from the PostgreSQL database
   */
  async getAll(): Promise<DemoRequest[]> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch demo requests: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new demo request and persist to database
   */
  async create(
    data: Omit<DemoRequest, 'id' | 'submittedAt' | 'status'> & { id?: string; submittedAt?: string }
  ): Promise<DemoRequest> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to create demo request: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update fields of a demo request
   */
  async update(id: string, partial: Partial<DemoRequest>): Promise<DemoRequest> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      throw new Error(`Failed to update demo request: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create temporary dummy credentials for a demo request
   */
  async createCredential(
    id: string,
    temporaryPassword?: string,
    durationDays: number = 14
  ): Promise<DemoRequest> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/${id}/credential/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        temporaryPassword,
        durationDays,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to create credentials: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Toggle active state of existing dummy credentials
   */
  async toggleCredentialStatus(id: string, isActive: boolean): Promise<DemoRequest> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/${id}/credential/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'toggle',
        isActive,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to toggle credential status: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Delete a demo request from database
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/demo-requests/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete demo request: HTTP ${res.status}`);
    }
  },

  /**
   * Subscribe to real-time updates via Server-Sent Events (SSE)
   */
  subscribeToEvents(
    onEvent: (event: { type: string; data: any; timestamp?: number }) => void,
    onError?: (err: any) => void
  ): () => void {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    try {
      eventSource = new EventSource(`${API_BASE_URL}/demo-requests/events/`);

      eventSource.addEventListener('demo_event', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent(parsed);
        } catch (err) {
          console.error('Failed to parse demo SSE event:', err);
        }
      });

      eventSource.onerror = (err) => {
        if (!isCancelled && onError) {
          onError(err);
        }
      };
    } catch (err) {
      if (onError) onError(err);
    }

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
      }
    };
  },
};
