/**
 * LifeOS Frontend API Client
 * FastAPI backend bilan aloqa uchun HTTP wrapper
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  status: number;
}

export interface EventCreate {
  user_id: string;
  event_type: string;
  event_category: string;
  title: string;
  description?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  source?: string;
}

export interface EventResponse {
  id: string;
  user_id: string;
  event_type: string;
  event_category: string;
  title: string;
  description: string | null;
  context: Record<string, any> | null;
  metadata: Record<string, any> | null;
  source: string;
  created_at: string;
}

export interface AnalyticsSummary {
  user_id: string;
  tasks_completed: number;
  habits: { completed: number; total: number };
  study_minutes: number;
  smart_suggestions: Array<{ id: string; title: string; priority: string; category: string }>;
}

export interface CoachResponse {
  reply: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: await response.text(),
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  // Event endpoints
  async createEvent(event: EventCreate): Promise<EventResponse> {
    return this.request<EventResponse>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getUserEvents(userId: string, days: number = 30): Promise<EventResponse[]> {
    return this.request<EventResponse[]>(`/api/events/${userId}?days=${days}`);
  }

  // Analytics endpoint
  async getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>(`/api/analytics/summary/${userId}`);
  }

  // AI Coach endpoint
  async askCoach(userId: string, message: string): Promise<CoachResponse> {
    return this.request<CoachResponse>('/api/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, message }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/');
  }
}

// Singleton instance
export const api = new ApiClient();

// Helper functions for specific modules
export const eventsApi = {
  create: (event: EventCreate) => api.createEvent(event),
  getByUser: (userId: string, days?: number) => api.getUserEvents(userId, days),
};

export const analyticsApi = {
  getSummary: (userId: string) => api.getAnalyticsSummary(userId),
};

export const coachApi = {
  chat: (userId: string, message: string) => api.askCoach(userId, message),
};

export const healthApi = {
  check: () => api.healthCheck(),
};