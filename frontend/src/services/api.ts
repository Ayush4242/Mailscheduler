import { ScheduledEmail, Campaign, User, SlackStatus } from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    signup: (email: string, password: string, name?: string) =>
      fetchApi<{ success: boolean; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      fetchApi<{ success: boolean; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () => fetchApi<{ user: User }>('/auth/me'),
    logout: () => fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },
  emails: {
    getScheduled: () => fetchApi<{ count: number; emails: ScheduledEmail[] }>('/emails/scheduled'),
    getSent: () => fetchApi<{ count: number; emails: ScheduledEmail[] }>('/emails/sent'),
    search: (query?: string, status?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (status) params.append('status', status);
      return fetchApi<{ count: number; emails: ScheduledEmail[] }>(`/emails/search?${params.toString()}`);
    },
    scheduleSingle: (payload: {
      recipient: string;
      subject: string;
      body: string;
      scheduledAt?: string;
      hourlyLimit?: number;
    }) =>
      fetchApi<{ success: boolean; email: ScheduledEmail }>('/emails/schedule', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  campaigns: {
    list: () => fetchApi<{ count: number; campaigns: Campaign[] }>('/campaigns'),
    schedule: (payload: {
      title: string;
      subject: string;
      body: string;
      recipients: string[];
      scheduledAt?: string;
      delayBetweenEmailsMs?: number;
      hourlyLimit?: number;
    }) =>
      fetchApi<{ success: boolean; campaign: Campaign; totalScheduled: number }>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  slack: {
    getStatus: () => fetchApi<SlackStatus>('/slack/status'),
    devConnect: () => fetchApi<{ success: boolean; integration: any }>('/slack/dev-connect', { method: 'POST' }),
    connectManual: (payload: { webhookUrl?: string; botToken?: string; channelName?: string; teamName?: string }) =>
      fetchApi<{ success: boolean; integration: any }>('/slack/connect-manual', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    sendTestMessage: () => fetchApi<{ success: boolean; message: string }>('/slack/test-message', { method: 'POST' }),
    disconnect: () => fetchApi<{ success: boolean }>('/slack/disconnect', { method: 'DELETE' }),
  },
};
