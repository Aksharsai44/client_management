import { Batch } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const batchApi = {
  /**
   * Fetch all workspace batches from PostgreSQL database
   */
  async getAll(params?: { companyId?: string; leadAdminId?: string }): Promise<Batch[]> {
    const query = new URLSearchParams();
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.leadAdminId) query.set('leadAdminId', params.leadAdminId);

    const url = `${API_BASE_URL}/batches/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch batches: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new workspace batch
   */
  async create(data: Partial<Batch>): Promise<Batch> {
    const res = await fetch(`${API_BASE_URL}/batches/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create batch: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing batch
   */
  async update(id: string, partial: Partial<Batch>): Promise<Batch> {
    const res = await fetch(`${API_BASE_URL}/batches/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update batch: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a batch from PostgreSQL database
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/batches/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete batch: HTTP ${res.status}`);
    }
  },

  /**
   * Seed initial batches in database
   */
  async seed(): Promise<{ status: string; total_batches: number; batches: Batch[] }> {
    const res = await fetch(`${API_BASE_URL}/batches/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to seed batches: HTTP ${res.status}`);
    }
    return await res.json();
  },
};
