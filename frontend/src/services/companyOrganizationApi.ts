import { CompanyAdminMetric } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const companyOrganizationApi = {
  /**
   * Fetch all company organizations from PostgreSQL database
   */
  async getAll(): Promise<CompanyAdminMetric[]> {
    const res = await fetch(`${API_BASE_URL}/company-organizations/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch company organizations: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new company organization with credentials
   */
  async create(data: Partial<CompanyAdminMetric>): Promise<CompanyAdminMetric> {
    const res = await fetch(`${API_BASE_URL}/company-organizations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to create company organization: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update an existing company organization
   */
  async update(id: string, partial: Partial<CompanyAdminMetric>): Promise<CompanyAdminMetric> {
    const res = await fetch(`${API_BASE_URL}/company-organizations/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      throw new Error(`Failed to update company organization: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Alias for update
   */
  async updateCompany(id: string, partial: Partial<CompanyAdminMetric>): Promise<CompanyAdminMetric> {
    return this.update(id, partial);
  },

  /**
   * Delete a company organization from database
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/company-organizations/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete company organization: HTTP ${res.status}`);
    }
  },
};
