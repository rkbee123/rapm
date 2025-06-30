import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { FilePreview } from '@/components/upload/FilePreview';
import { motion } from 'framer-motion';

export function DataUpload() {
  const [campaignType, setCampaignType] = useState<string>('linkedin');

  const handleUploadComplete = () => {
    // Refresh the file preview when upload completes
    window.location.reload();
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Upload & Management</h1>
          <p className="text-muted-foreground">
            Upload and manage your campaign datasets
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manage">Manage Datasets</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Campaign Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Select Campaign Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn Campaign</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="other">Other Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Field Requirements */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Required Fields for {campaignType} campaigns:</h4>
                <div className="text-sm text-muted-foreground">
                  {campaignType === 'linkedin' && (
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Required:</strong> name, company</li>
                      <li><strong>Optional:</strong> title, date_sent, status</li>
                    </ul>
                  )}
                  {campaignType === 'email' && (
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Required:</strong> name, email</li>
                      <li><strong>Optional:</strong> company, campaign_name, date_sent, opened, replied</li>
                    </ul>
                  )}
                  {campaignType === 'webinar' && (
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Required:</strong> name, email</li>
                      <li><strong>Optional:</strong> company, industry, invited_date, rsvp_status</li>
                    </ul>
                  )}
                  {campaignType === 'other' && (
                    <p>Any CSV/Excel file with headers will be accepted.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Zone */}
          <FileUploadZone 
            campaignType={campaignType} 
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <FilePreview />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}