import { PaymentRecord, ProjectMOU } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const paymentApi = {
  /**
   * Fetch all payment records with optional filters
   */
  async getAllPayments(params?: {
    companyId?: string;
    clientCompanyId?: string;
    billingMonth?: string;
    status?: string;
    projectMouId?: string;
  }): Promise<PaymentRecord[]> {
    const query = new URLSearchParams();
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.clientCompanyId) query.set('clientCompanyId', params.clientCompanyId);
    if (params?.billingMonth) query.set('billingMonth', params.billingMonth);
    if (params?.status) query.set('status', params.status);
    if (params?.projectMouId) query.set('projectMouId', params.projectMouId);

    const url = `${API_BASE_URL}/payments/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch payments: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new payment record / invoice
   */
  async createPayment(data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create payment: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing payment record
   */
  async updatePayment(id: string, partial: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update payment: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Mark a payment as paid with payment date, transaction ref, and payment method
   */
  async markPaid(
    id: string,
    details: {
      paidDate?: string;
      paymentMethod?: string;
      transactionReference?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; payment: PaymentRecord }> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/mark-paid/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to mark payment as paid: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Send an email reminder to client for outstanding/overdue payment
   */
  async sendReminder(id: string): Promise<{
    success: boolean;
    message: string;
    emailDetails: { to: string; subject: string; sentAt: string; preview: string };
    payment: PaymentRecord;
  }> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/send-reminder/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to send reminder: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a payment record
   */
  async deletePayment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete payment: HTTP ${res.status}`);
    }
  },

  /**
   * Fetch all Project MOUs / Contracts
   */
  async getAllProjectMOUs(params?: {
    companyId?: string;
    clientCompanyId?: string;
    status?: string;
  }): Promise<ProjectMOU[]> {
    const query = new URLSearchParams();
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.clientCompanyId) query.set('clientCompanyId', params.clientCompanyId);
    if (params?.status) query.set('status', params.status);

    const url = `${API_BASE_URL}/project-mous/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch project MOUs: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new Project MOU / Contract
   */
  async createProjectMOU(
    data: Partial<ProjectMOU> & { autoCreatePayment?: boolean }
  ): Promise<ProjectMOU> {
    const res = await fetch(`${API_BASE_URL}/project-mous/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create project MOU: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing Project MOU
   */
  async updateProjectMOU(id: string, partial: Partial<ProjectMOU>): Promise<ProjectMOU> {
    const res = await fetch(`${API_BASE_URL}/project-mous/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update project MOU: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a Project MOU
   */
  async deleteProjectMOU(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/project-mous/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete project MOU: HTTP ${res.status}`);
    }
  },

  /**
   * Seed initial payments & MOUs
   */
  async seed(): Promise<void> {
    await fetch(`${API_BASE_URL}/payments/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
