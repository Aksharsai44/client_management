import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ProductAdminPayload {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: 'product_admin' | 'product_super_admin';
  phone?: string;
  designation?: string;
  assignedCompanyAdminIds?: string[];
  status?: 'active' | 'paused' | 'inactive';
}

export const productAdminApi = {
  /**
   * Fetch all product administrators from database
   */
  async getAll(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/product-admins/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch product admins: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      role: item.role || 'product_admin',
      batchIds: ['batch_alpha'],
      status: item.status || 'active',
      assignedCompanyAdminIds: item.assignedCompanyAdminIds || [],
    }));
  },

  /**
   * Create a new scoped product administrator with credentials
   */
  async create(admin: ProductAdminPayload): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/product-admins/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(admin),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.email?.[0] || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      ...data,
      role: data.role || 'product_admin',
      batchIds: ['batch_alpha'],
      status: data.status || 'active',
      assignedCompanyAdminIds: data.assignedCompanyAdminIds || [],
    };
  },

  /**
   * Update an existing product administrator
   */
  async update(id: string, partial: Partial<ProductAdminPayload>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/product-admins/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      throw new Error(`Failed to update product admin: HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      ...data,
      role: data.role || 'product_admin',
      batchIds: ['batch_alpha'],
      status: data.status || 'active',
      assignedCompanyAdminIds: data.assignedCompanyAdminIds || [],
    };
  },

  /**
   * Delete a product administrator
   */
  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/product-admins/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete product admin: HTTP ${res.status}`);
    }
    return true;
  },
};
