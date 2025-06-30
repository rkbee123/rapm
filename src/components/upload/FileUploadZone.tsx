import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload, UploadProgress } from '@/hooks/useFileUpload';

interface FileUploadZoneProps {
  campaignType: string;
  onUploadComplete?: () => void;
}

export function FileUploadZone({ campaignType, onUploadComplete }: FileUploadZoneProps) {
  const { uploadFiles, uploadProgress, isUploading, clearProgress } = useFileUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    await uploadFiles(selectedFiles, campaignType);
    setSelectedFiles([]);
    onUploadComplete?.();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Drop your files here or click to browse'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Supports CSV, Excel (XLSX/XLS), and JSON files up to 10MB
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button type="button" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <Badge variant="outline" className="capitalize">
                {campaignType} Campaign
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selected Files</h3>
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Progress</h3>
              {!isUploading && (
                <Button variant="ghost" size="sm" onClick={clearProgress}>
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {uploadProgress.map((progress, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(progress.status)}
                      <span className="font-medium">{progress.fileName}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          progress.status === 'completed' && 'border-green-500 text-green-700',
                          progress.status === 'error' && 'border-red-500 text-red-700'
                        )}
                      >
                        {progress.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {progress.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={progress.progress} 
                    className="h-2"
                  />
                  {progress.error && (
                    <p className="text-sm text-red-600 mt-1">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}