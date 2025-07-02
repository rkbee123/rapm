const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getLinkedInTrends(timeframe: '7d' | '30d' | '90d' = '30d') {
    return this.request(`/analytics/linkedin/trends?timeframe=${timeframe}`);
  }

  async getEmailPerformance() {
    return this.request('/analytics/email/performance');
  }

  async generateAIInsights(type: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    return this.request('/analytics/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  // Data processing endpoints
  async processFileData(fileData: any[], campaignType: string, fileName: string) {
    return this.request('/data/process', {
      method: 'POST',
      body: JSON.stringify({ fileData, campaignType, fileName }),
    });
  }

  async getDatasets() {
    return this.request('/data/datasets');
  }

  async deleteDataset(id: string) {
    return this.request(`/data/datasets/${id}`, {
      method: 'DELETE',
    });
  }

  // Webhook endpoints
  async testLinkedInWebhook() {
    return this.request('/webhook/linkedin/test');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Hook for using API client in React components
export function useApi() {
  return apiClient;
}