import { ResourceItem, ResourceReview } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const resourceApi = {
  /**
   * Fetch all deliverable resources, optionally filtered by batchId or companyId
   */
  async getAllResources(params?: { batchId?: string; companyId?: string }): Promise<ResourceItem[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.companyId) query.set('companyId', params.companyId);

    const url = `${API_BASE_URL}/resources/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch resources: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Fetch single deliverable resource by ID
   */
  async getResource(id: string): Promise<ResourceItem> {
    const res = await fetch(`${API_BASE_URL}/resources/${id}/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch resource ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create a new deliverable resource in PostgreSQL database
   */
  async createResource(resource: Partial<ResourceItem>): Promise<ResourceItem> {
    const res = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create resource: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update an existing deliverable resource
   */
  async updateResource(id: string, partial: Partial<ResourceItem>): Promise<ResourceItem> {
    const res = await fetch(`${API_BASE_URL}/resources/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update resource: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete a deliverable resource
   */
  async deleteResource(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/resources/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete resource ${id}: HTTP ${res.status}`);
    }
  },

  /**
   * Submit client rating & feedback review for a deliverable resource
   */
  async addReview(
    resourceId: string,
    review: {
      rating: number;
      feedback: string;
      reviewerId?: string;
      reviewerName?: string;
      reviewerRole?: string;
    }
  ): Promise<ResourceItem> {
    const res = await fetch(`${API_BASE_URL}/resources/${resourceId}/review/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to submit review: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Upload actual file (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, ZIP, Images, etc.)
   * Returns uploaded fileName, fileUrl, fileSize, and detected fileType.
   */
  async uploadFile(file: File): Promise<{
    fileName: string;
    fileUrl: string;
    fileSize: string;
    fileType: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/resources/upload/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to upload file: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Seed initial deliverable resources
   */
  async seedResources(): Promise<void> {
    await fetch(`${API_BASE_URL}/resources/seed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },
};
