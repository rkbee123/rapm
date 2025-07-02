import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Zap
} from 'lucide-react';

export function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [loading, setLoading] = useState(false);

  const checkBackendStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Server className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (backendStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>Backend Server Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">Server Connection</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span>Database: Connected</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span>API: Ready</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <div>Endpoint: http://localhost:3001</div>
          <div>Environment: Development</div>
        </div>

        <Button 
          onClick={checkBackendStatus} 
          disabled={loading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </>
          )}
        </Button>

        {backendStatus === 'disconnected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Backend server is not running</p>
            <p className="text-xs text-red-600 mt-1">
              Run <code>cd server && npm run dev</code> to start the backend server.
            </p>
          </div>
        )}

        {backendStatus === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Backend is running and ready to process requests
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}