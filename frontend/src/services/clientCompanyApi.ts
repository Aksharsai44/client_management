import { ClientCompany } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const clientCompanyApi = {
  /**
   * Fetch all client companies from PostgreSQL database
   */
  async getAll(params?: { batchId?: string; companyId?: string }): Promise<ClientCompany[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.companyId) query.set('companyId', params.companyId);

    const url = `${API_BASE_URL}/client-companies/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch client companies: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new client company
   */
  async create(data: Partial<ClientCompany>): Promise<ClientCompany> {
    const res = await fetch(`${API_BASE_URL}/client-companies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create client company: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing client company
   */
  async update(id: string, partial: Partial<ClientCompany>): Promise<ClientCompany> {
    const res = await fetch(`${API_BASE_URL}/client-companies/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update client company: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a client company from database
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/client-companies/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete client company: HTTP ${res.status}`);
    }
  },

  /**
   * Seed initial client companies if backend database table is empty
   */
  async seed(initialList?: ClientCompany[]): Promise<void> {
    await fetch(`${API_BASE_URL}/client-companies/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialList || []),
    });
  },
};
