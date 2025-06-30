import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Dataset {
  id: string;
  name: string;
  type: string;
  upload_date: string;
  row_count: number;
  tags: string[];
  file_path: string;
  created_at: string;
}

interface FilePreviewProps {
  onDatasetSelect?: (dataset: Dataset) => void;
}

export function FilePreview({ onDatasetSelect }: FilePreviewProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDatasets(data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    onDatasetSelect?.(dataset);

    try {
      // Fetch sample data based on dataset type
      let data: any[] = [];
      let headers: string[] = [];

      switch (dataset.type) {
        case 'linkedin':
          const { data: linkedinData, error: linkedinError } = await supabase
            .from('linkedin_contacts')
            .select('*')
            .eq('dataset_id', dataset.id)
            .limit(10);

          if (linkedinError) throw linkedinError;
          
          data = linkedinData || [];
          headers = data.length > 0 ? Object.keys(data[0]) : [];
          break;

        case 'email':
          const { data: emailData, error: emailError } = await supabase
            .from('email_contacts')
            .select('*')
            .eq('dataset_id', dataset.id)
            .limit(10);

          if (emailError) throw emailError;
          
          data = emailData || [];
          headers = data.length > 0 ? Object.keys(data[0]) : [];
          break;

        case 'webinar':
          const { data: webinarData, error: webinarError } = await supabase
            .from('webinar_attendees')
            .select('*')
            .eq('dataset_id', dataset.id)
            .limit(10);

          if (webinarError) throw webinarError;
          
          data = webinarData || [];
          headers = data.length > 0 ? Object.keys(data[0]) : [];
          break;

        default:
          toast.info('Preview not available for this dataset type');
          return;
      }

      setPreviewData(data);
      setPreviewHeaders(headers);
    } catch (error) {
      console.error('Error fetching preview data:', error);
      toast.error('Failed to load preview data');
    }
  };

  const handleDelete = async (dataset: Dataset) => {
    if (!confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('datasets')
        .remove([dataset.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }

      // Delete dataset record
      const { error: dbError } = await supabase
        .from('datasets')
        .delete()
        .eq('id', dataset.id);

      if (dbError) {
        throw dbError;
      }

      // Remove from local state
      setDatasets(prev => prev.filter(d => d.id !== dataset.id));
      
      if (selectedDataset?.id === dataset.id) {
        setSelectedDataset(null);
        setPreviewData([]);
        setPreviewHeaders([]);
      }

      toast.success('Dataset deleted successfully');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Failed to delete dataset');
    }
  };

  const handleDownload = async (dataset: Dataset) => {
    try {
      const { data, error } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = dataset.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading datasets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Datasets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Uploaded Datasets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No datasets uploaded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell className="font-medium">{dataset.name}</TableCell>
                    <TableCell className="capitalize">{dataset.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(dataset.upload_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{dataset.row_count.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dataset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(dataset)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(dataset)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(dataset)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* File Preview */}
      {selectedDataset && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Preview: {selectedDataset.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewData.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data available for preview</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewHeaders.map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {previewHeaders.map((header) => (
                          <TableCell key={header} className="whitespace-nowrap">
                            {typeof row[header] === 'boolean' 
                              ? row[header] ? 'Yes' : 'No'
                              : row[header] || '-'
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}