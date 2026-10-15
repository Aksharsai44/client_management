import { PricingPlan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const pricingPlanApi = {
  /**
   * Fetch all pricing plans from PostgreSQL database
   */
  async getAll(): Promise<PricingPlan[]> {
    const res = await fetch(`${API_BASE_URL}/pricing-plans/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch pricing plans: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new pricing plan
   */
  async create(plan: Omit<PricingPlan, 'id'> & { id?: string }): Promise<PricingPlan> {
    const res = await fetch(`${API_BASE_URL}/pricing-plans/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });
    if (!res.ok) {
      throw new Error(`Failed to create pricing plan: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update an existing pricing plan
   */
  async update(id: string, partial: Partial<PricingPlan>): Promise<PricingPlan> {
    const res = await fetch(`${API_BASE_URL}/pricing-plans/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      throw new Error(`Failed to update pricing plan: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Delete a pricing plan
   */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/pricing-plans/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete pricing plan: HTTP ${res.status}`);
    }
  },
};
