import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeProvider';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { BackendStatus } from '@/components/backend/BackendStatus';
import { WebhookStatus } from '@/components/backend/WebhookStatus';
import { N8nStatus } from '@/components/backend/N8nStatus';
import {
  Settings as SettingsIcon,
  Key,
  Users,
  Bell,
  Save,
  Moon,
  Sun,
  Sheet,
  CheckCircle,
  AlertCircle,
  Info,
  Server,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { isConnected, connect, disconnect } = useGoogleSheets();

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Rapid Acceleration Partners" />
                </div>
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="admin@rap.com" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BackendStatus />
            <WebhookStatus />
            <N8nStatus />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Backend Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-url">Backend API URL</Label>
                  <Input
                    id="api-url"
                    defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The backend API endpoint for data processing and webhooks
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Install backend dependencies: <code className="bg-muted px-1 rounded">npm run backend:install</code></li>
                  <li>Copy <code className="bg-muted px-1 rounded">server/.env.example</code> to <code className="bg-muted px-1 rounded">server/.env</code></li>
                  <li>Configure your Supabase credentials in the server .env file</li>
                  <li>Start the backend server: <code className="bg-muted px-1 rounded">npm run backend</code></li>
                  <li>Or run both frontend and backend: <code className="bg-muted px-1 rounded">npm run start:all</code></li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800">
                      n8n Integration Available
                    </p>
                    <p className="text-xs text-blue-700">
                      The backend server includes an n8n endpoint at <code>/api/from-n8n</code> that can receive 
                      data from your n8n workflows. Use this URL in your n8n HTTP Request nodes to send data 
                      directly to your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    defaultValue="sk-xxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for AI-powered insights and summaries
                  </p>
                </div>
                <div>
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    defaultValue="https://rap-dashboard.supabase.co"
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-key">Supabase API Key</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    placeholder="eyJ..."
                    defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Google Sheets Integration</h3>
                
                {/* Backend Implementation Notice */}
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-yellow-800">
                          Backend Implementation Required
                        </p>
                        <p className="text-xs text-yellow-700">
                          For security reasons, Google Sheets integration requires a backend server to handle OAuth token exchange. 
                          The client secret should never be exposed in frontend code.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Sheet className="h-4 w-4" />
                      <Label>Google Sheets API Access</Label>
                      {isConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect your Google account to import data from Google Sheets
                    </p>
                  </div>
                  {isConnected ? (
                    <Button variant="outline" onClick={disconnect}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={connect}>
                      Connect Google Sheets
                    </Button>
                  )}
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Google OAuth Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label className="text-xs">Client ID</Label>
                      <p className="font-mono text-xs text-muted-foreground">
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID || 'Not configured'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Redirect URI</Label>
                      <p className="font-mono text-xs text-muted-foreground">
                        {window.location.origin}/auth/google/callback
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <p className="text-xs text-muted-foreground">
                        Frontend-only demo (backend required for production)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">LinkedIn Integration</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>LinkedIn API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect your LinkedIn account for automated outreach
                    </p>
                  </div>
                  <Button variant="outline">Connect LinkedIn</Button>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save API Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Team Members</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage who has access to your dashboard
                  </p>
                </div>
                <Button>Invite Member</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@rap.com</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      Admin
                    </span>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">jane@rap.com</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      Member
                    </span>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance reports via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Campaign Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when campaigns need attention
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive AI-generated insights and recommendations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Upload Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new datasets are uploaded
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>LinkedIn Webhook Events</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when LinkedIn webhook events are received
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>n8n Data Imports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when n8n workflows send data to the dashboard
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}