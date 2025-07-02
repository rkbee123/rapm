import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Workflow, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Copy,
  ExternalLink,
  Activity,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export function N8nStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [recentImports, setRecentImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const n8nEndpoint = 'http://localhost:3001/api/from-n8n';

  const checkN8nStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setStatus('connected');
        await fetchRecentImports();
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentImports = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recent-imports?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentImports(data.imports || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent imports:', error);
    }
  };

  const copyEndpointUrl = () => {
    navigator.clipboard.writeText(n8nEndpoint);
    toast.success('Endpoint URL copied to clipboard');
  };

  useEffect(() => {
    checkN8nStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkN8nStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
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
          <Workflow className="h-5 w-5" />
          <span>n8n Integration Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">n8n Endpoint</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Endpoint URL:</span>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                {n8nEndpoint}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyEndpointUrl}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Use this endpoint in your n8n HTTP Request node to send data to your dashboard. 
            Supports LinkedIn contacts, email contacts, webinar attendees, and campaign metrics.
          </AlertDescription>
        </Alert>

        {status === 'connected' && recentImports.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Imports</h4>
            <div className="space-y-1">
              {recentImports.map((import_, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                  <span>{import_.event_type}</span>
                  <span className="text-muted-foreground">
                    {new Date(import_.processed_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={checkN8nStatus} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open('https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            n8n Docs
          </Button>
        </div>

        {status === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                n8n endpoint is ready to receive data
              </span>
            </div>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Backend server is not running
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Start the backend server to enable n8n integration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}