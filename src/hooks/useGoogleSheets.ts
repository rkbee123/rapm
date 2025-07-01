import { useState, useCallback, useEffect } from 'react';
import { GoogleSheetsService, GoogleSheetsConfig, SheetData } from '@/lib/googleSheets';
import { toast } from 'sonner';

interface UseGoogleSheetsReturn {
  isConnected: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
  readSheet: (spreadsheetId: string, range?: string) => Promise<Record<string, any>[] | null>;
  getSheetNames: (spreadsheetId: string) => Promise<string[] | null>;
  error: string | null;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetsService, setSheetsService] = useState<GoogleSheetsService | null>(null);

  const config: GoogleSheetsConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/google/callback`,
  };

  const connect = useCallback(() => {
    if (!config.clientId) {
      setError('Google Client ID not configured');
      toast.error('Google Client ID not configured. Please check your environment variables.');
      return;
    }

    try {
      const service = new GoogleSheetsService(config);
      const authUrl = service.generateAuthUrl();
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open popup window');
      }

      // Listen for the authorization code
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check if we received the authorization code
          const code = localStorage.getItem('google_auth_code');
          if (code) {
            handleAuthCode(service, code);
            localStorage.removeItem('google_auth_code');
          } else {
            toast.error('Authorization was cancelled or failed');
          }
        }
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Google authentication';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [config]);

  const handleAuthCode = async (service: GoogleSheetsService, code: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, you would send the code to your backend
      // which would exchange it for tokens and return the access token
      // For now, we'll show a message about backend implementation needed
      toast.error('Backend implementation required for secure token exchange');
      setError('Backend implementation required for secure token exchange');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate with Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = useCallback(() => {
    localStorage.removeItem('google_tokens');
    setSheetsService(null);
    setIsConnected(false);
    setError(null);
    toast.success('Disconnected from Google Sheets');
  }, []);

  const readSheet = useCallback(async (
    spreadsheetId: string, 
    range: string = 'A:Z'
  ): Promise<Record<string, any>[] | null> => {
    if (!sheetsService) {
      setError('Not connected to Google Sheets');
      return null;
    }

    setIsLoading(true);
    try {
      const sheetData = await sheetsService.readSheet(spreadsheetId, range);
      const structuredData = sheetsService.convertToStructuredData(sheetData);
      setError(null);
      return structuredData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read sheet data';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sheetsService]);

  const getSheetNames = useCallback(async (
    spreadsheetId: string
  ): Promise<string[] | null> => {
    if (!sheetsService) {
      setError('Not connected to Google Sheets');
      return null;
    }

    setIsLoading(true);
    try {
      const sheetNames = await sheetsService.getSheetNames(spreadsheetId);
      setError(null);
      return sheetNames;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sheet names';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sheetsService]);

  // Initialize connection on mount if tokens exist
  useEffect(() => {
    const tokens = localStorage.getItem('google_tokens');
    if (tokens && config.clientId) {
      try {
        const service = new GoogleSheetsService(config);
        const parsedTokens = JSON.parse(tokens);
        if (parsedTokens.access_token) {
          service.setAccessToken(parsedTokens.access_token);
          setSheetsService(service);
          setIsConnected(true);
        }
      } catch (err) {
        localStorage.removeItem('google_tokens');
        console.error('Failed to restore Google Sheets connection:', err);
      }
    }
  }, [config]);

  return {
    isConnected,
    isLoading,
    connect,
    disconnect,
    readSheet,
    getSheetNames,
    error,
  };
};