import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Webhook, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Activity 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export function WebhookStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastTest, setLastTest] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const webhookUrl = 'https://becoming-ferret-informally.ngrok-free.app/webhook-test/linkedin';

  const testWebhook = async () => {
    try {
      setLoading(true);
      await apiClient.testLinkedInWebhook();
      setStatus('connected');
      setLastTest(new Date());
      toast.success('LinkedIn webhook is working correctly');
    } catch (error) {
      setStatus('disconnected');
      toast.error('Failed to connect to LinkedIn webhook');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testWebhook();
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
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Webhook className="h-5 w-5" />
          <span>LinkedIn Webhook Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">Webhook Connection</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Endpoint URL:</span>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(webhookUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {lastTest && (
            <div className="text-sm text-muted-foreground">
              Last tested: {lastTest.toLocaleString()}
            </div>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This webhook receives LinkedIn events including connection requests, 
            acceptances, messages, and profile views. Make sure your LinkedIn 
            automation tool is configured to send events to this endpoint.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button 
            onClick={testWebhook} 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {status === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Webhook is active and ready to receive LinkedIn events
              </span>
            </div>
          </div>
        )}

        {status === 'disconnected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Unable to connect to webhook endpoint
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Make sure the backend server is running and the ngrok tunnel is active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}