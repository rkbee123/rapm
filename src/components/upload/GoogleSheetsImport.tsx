import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet, 
  Link, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { extractSpreadsheetId, isValidGoogleSheetsUrl } from '@/lib/googleSheets';
import { toast } from 'sonner';

interface GoogleSheetsImportProps {
  campaignType: string;
  onImportComplete?: (data: Record<string, any>[]) => void;
}

export function GoogleSheetsImport({ campaignType, onImportComplete }: GoogleSheetsImportProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

  const {
    isConnected,
    isLoading,
    connect,
    disconnect,
    readSheet,
    getSheetNames,
    error
  } = useGoogleSheets();

  const handleUrlChange = async (url: string) => {
    setSheetUrl(url);
    setSheetNames([]);
    setSelectedSheet('');
    setPreviewData([]);
    
    if (isValidGoogleSheetsUrl(url)) {
      const id = extractSpreadsheetId(url);
      setSpreadsheetId(id);
      
      if (id && isConnected) {
        const names = await getSheetNames(id);
        if (names) {
          setSheetNames(names);
        }
      }
    } else {
      setSpreadsheetId(null);
    }
  };

  const handleSheetSelect = async (sheetName: string) => {
    setSelectedSheet(sheetName);
    setPreviewData([]);
    
    if (spreadsheetId && sheetName) {
      const data = await readSheet(spreadsheetId, `${sheetName}!A:Z`);
      if (data) {
        setPreviewData(data.slice(0, 10)); // Show first 10 rows for preview
      }
    }
  };

  const handleImport = async () => {
    if (!spreadsheetId || !selectedSheet) {
      toast.error('Please select a sheet to import');
      return;
    }

    const data = await readSheet(spreadsheetId, `${selectedSheet}!A:Z`);
    if (data && data.length > 0) {
      onImportComplete?.(data);
      toast.success(`Successfully imported ${data.length} rows from Google Sheets`);
    }
  };

  const getPreviewHeaders = () => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  return (
    <div className="space-y-6">
      {/* Backend Implementation Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800">
                Backend Implementation Required
              </p>
              <p className="text-sm text-yellow-700">
                Google Sheets integration requires a backend server for secure authentication. 
                The current implementation is a frontend-only demo that shows the UI flow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sheet className="h-5 w-5" />
            <span>Google Sheets Connection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connected to Google Sheets</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Not connected to Google Sheets</span>
                </>
              )}
            </div>
            
            {isConnected ? (
              <Button variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={connect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect Google Sheets
                  </>
                )}
              </Button>
            )}
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Import */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Import from Google Sheets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the URL of your Google Sheets document
              </p>
            </div>

            {sheetNames.length > 0 && (
              <div>
                <Label>Select Sheet</Label>
                <Select value={selectedSheet} onValueChange={handleSheetSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sheet to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSheet && (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="capitalize">
                  {campaignType} Campaign
                </Badge>
                <Button onClick={handleImport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Data Preview</span>
              <Badge variant="secondary">{previewData.length} rows shown</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getPreviewHeaders().map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {getPreviewHeaders().map((header) => (
                        <TableCell key={header} className="whitespace-nowrap">
                          {row[header] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}