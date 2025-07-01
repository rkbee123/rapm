// Browser-compatible Google Sheets utilities
export interface GoogleSheetsConfig {
  clientId: string;
  redirectUri: string;
}

export interface SheetData {
  spreadsheetId: string;
  range: string;
  values: any[][];
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private accessToken: string | null = null;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  // Generate OAuth URL for user authorization (browser-compatible)
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Note: Token exchange must be done on the backend for security
  // This is a placeholder that would need backend implementation
  async getAccessToken(code: string): Promise<any> {
    // In a real implementation, this would call your backend API
    // which would exchange the code for tokens using the client secret
    throw new Error('Token exchange must be implemented on the backend for security reasons');
  }

  // Set access token for authenticated requests
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Read data from a specific range using the Sheets API directly
  async readSheet(spreadsheetId: string, range: string): Promise<SheetData> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        spreadsheetId,
        range,
        values: data.values || [],
      };
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw new Error('Failed to read sheet data');
    }
  }

  // Convert sheet data to structured format
  convertToStructuredData(sheetData: SheetData): Record<string, any>[] {
    if (!sheetData.values || sheetData.values.length === 0) {
      return [];
    }

    const [headers, ...rows] = sheetData.values;
    
    return rows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  // Get all sheets in a spreadsheet
  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.sheets.map((sheet: any) => sheet.properties.title);
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw new Error('Failed to get sheet names');
    }
  }
}

// Utility function to extract spreadsheet ID from URL
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Utility function to validate Google Sheets URL
export function isValidGoogleSheetsUrl(url: string): boolean {
  return /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url);
}