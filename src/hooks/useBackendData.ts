import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardAnalytics {
  linkedin: {
    totalSent: number;
    accepted: number;
    pending: number;
    declined: number;
    acceptanceRate: number;
  };
  email: {
    totalSent: number;
    opened: number;
    replied: number;
    openRate: number;
    replyRate: number;
  };
  webinar: {
    totalInvited: number;
    confirmed: number;
    pending: number;
    declined: number;
    rsvpRate: number;
  };
  insights: any[];
  lastUpdated: string;
}

export function useDashboardAnalytics() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await apiClient.getDashboardAnalytics();
      setData(analytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useLinkedInTrends(timeframe: '7d' | '30d' | '90d' = '30d') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const trends = await apiClient.getLinkedInTrends(timeframe);
      setData(trends);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trends';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  return { data, loading, error, refetch: fetchData };
}

export function useEmailPerformance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const performance = await apiClient.getEmailPerformance();
      setData(performance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch email performance';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useAIInsights() {
  const [loading, setLoading] = useState(false);

  const generateInsights = async (type: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    try {
      setLoading(true);
      const insight = await apiClient.generateAIInsights(type);
      toast.success('AI insights generated successfully');
      return insight;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateInsights, loading };
}

export function useBackendDataProcessing() {
  const [loading, setLoading] = useState(false);

  const processData = async (fileData: any[], campaignType: string, fileName: string) => {
    try {
      setLoading(true);
      const result = await apiClient.processFileData(fileData, campaignType, fileName);
      toast.success(`Successfully processed ${result.processedRows} rows`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process data';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { processData, loading };
}