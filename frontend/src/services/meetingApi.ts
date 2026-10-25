import { Meeting, AttendanceRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const meetingApi = {
  /**
   * Fetch all meetings from backend, optionally filtered by batchId, companyId, or status
   */
  async getAllMeetings(params?: {
    batchId?: string;
    companyId?: string;
    status?: string;
  }): Promise<Meeting[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.status) query.set('status', params.status);

    const url = `${API_BASE_URL}/meetings/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch meetings: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Fetch single meeting by ID
   */
  async getMeeting(id: string): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/`);
    if (!res.ok) {
      throw new Error(`Failed to fetch meeting ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Schedule a new meeting/call in PostgreSQL database (triggers real-time SSE broadcast)
   */
  async createMeeting(meeting: Partial<Meeting>): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create meeting: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update meeting (e.g. details, time, status, duration, transcript)
   */
  async updateMeeting(id: string, partial: Partial<Meeting>): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update meeting: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Delete / cancel a scheduled meeting
   */
  async deleteMeeting(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete meeting: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Start a live meeting/call in real-time (sets status to 'in_progress', notifies all users via SSE)
   */
  async startCall(id: string): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/start-call/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to start call for meeting ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * End a live meeting/call in real-time (sets status to 'completed', updates transcript, AI summary, and attendance)
   */
  async endCall(
    id: string,
    details?: {
      durationMinutes?: number;
      transcript?: any[];
      aiSummary?: any;
      participants?: Array<{
        userId?: string;
        id?: string;
        userName?: string;
        name?: string;
        userRole?: string;
        role?: string;
        minutesPresent?: number;
      }>;
    }
  ): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/end-call/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details || {}),
    });
    if (!res.ok) {
      throw new Error(`Failed to end call for meeting ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Launch an instant call room in real-time
   */
  async startInstantCall(payload: {
    title?: string;
    batchId?: string;
    companyId?: string;
    hostName?: string;
    hostId?: string;
    meetingUrl?: string;
    durationMinutes?: number;
    description?: string;
  }): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/instant-call/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to start instant call: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * On-demand AI analysis (summary & transcript) using Gemini or built-in NLP engine
   */
  async analyzeMeeting(id: string, notes?: string): Promise<Meeting> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/analyze/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate AI analysis: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Ask interactive AI questions about a recorded meeting / transcript
   */
  async askAiQuestion(
    id: string,
    question: string
  ): Promise<{ answer: string; sender: string; meetingId: string; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/meetings/${id}/ai-chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      throw new Error(`Failed to query AI chat: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Fetch attendance records with optional filters
   */
  async getAllAttendance(params?: {
    meetingId?: string;
    batchId?: string;
    userId?: string;
    date?: string;
  }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params?.meetingId) query.set('meetingId', params.meetingId);
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.date) query.set('date', params.date);

    const url = `${API_BASE_URL}/attendance/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch attendance: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Create an attendance record
   */
  async createAttendance(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE_URL}/attendance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create attendance record: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Update attendance record (e.g. status, minutesPresent)
   */
  async updateAttendance(id: string, partial: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partial),
    });
    if (!res.ok) {
      throw new Error(`Failed to update attendance record ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete attendance record ${id}: HTTP ${res.status}`);
    }
    return await res.json();
  },

  /**
   * Bulk upsert attendance records
   */
  async bulkMarkAttendance(records: Partial<AttendanceRecord>[]): Promise<{
    success: boolean;
    count: number;
    records: AttendanceRecord[];
  }> {
    const res = await fetch(`${API_BASE_URL}/attendance/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to bulk mark attendance: ${JSON.stringify(err)}`);
    }
    return await res.json();
  },

  /**
   * Explicitly seed initial meetings if database is empty
   */
  async seedMeetings(): Promise<{ status: string; meetings_count: number; attendance_count: number }> {
    const res = await fetch(`${API_BASE_URL}/meetings/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to seed meetings: HTTP ${res.status}`);
    }
    return await res.json();
  },
};
