import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const userApi = {
  /**
   * Fetch all workspace users from PostgreSQL database
   */
  async getAll(params?: { batchId?: string; companyId?: string; role?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.role) query.set('role', params.role);

    const url = `${API_BASE_URL}/users/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch workspace users: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new workspace user
   */
  async create(data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create workspace user: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing workspace user
   */
  async update(id: string, partial: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update workspace user: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a workspace user from database
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete workspace user: HTTP ${res.status}`);
    }
  },

  /**
   * Seed initial workspace users if backend database table is empty
   */
  async seed(initialList?: User[]): Promise<void> {
    await fetch(`${API_BASE_URL}/users/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialList || []),
    });
  },
};
