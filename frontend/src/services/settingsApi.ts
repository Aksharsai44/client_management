import { IntegrationSettings, CompanySettings } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const settingsApi = {
  /**
   * Fetch system integration settings from PostgreSQL database
   */
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    const res = await fetch(`${API_BASE_URL}/settings/integrations/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch integration settings: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update system integration settings (AI provider, API keys, WhatsApp routing, company/client toggles)
   */
  async updateIntegrationSettings(
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    const res = await fetch(`${API_BASE_URL}/settings/integrations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update integration settings: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Fetch company administration settings (communication flags, universal default password)
   */
  async getCompanySettings(companyId?: string): Promise<CompanySettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    const res = await fetch(`${API_BASE_URL}/settings/company/${query}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch company settings: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Update company administration settings in PostgreSQL database
   */
  async updateCompanySettings(
    settings: Partial<CompanySettings>,
    companyId?: string
  ): Promise<CompanySettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    const payload = companyId ? { ...settings, companyId } : settings;

    const res = await fetch(`${API_BASE_URL}/settings/company/${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update company settings: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },
};
