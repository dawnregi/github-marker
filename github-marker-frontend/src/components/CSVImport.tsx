import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useImportBookmarks } from '@/api/bookmarks/bookmarks.query';
import { toast } from 'sonner';
import type { ImportResult } from '@/api/bookmarks/bookmarks.type';
import { Input } from './ui/input';

export function CSVImport() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportBookmarks();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Import directly via backend
    importMutation.mutate(selectedFile, {
      onSuccess: (result) => {
        setImportResult(result);
        toast.success(`Successfully imported ${result.successful_imports} repositories`);
        if (result.failed_imports > 0) {
          toast.warning(`${result.failed_imports} repositories failed to import`);
        }
      },
      onError: (error) => {
        toast.error(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  };

  const handleReset = () => {
    setImportResult(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 gap-2">
      <h2 className="text-xl font-semibold mb-4">Import Repositories from CSV</h2>
      
      <div className="mb-4">
        <p className="text-sm text-primary mb-2">
          Upload a CSV file with with a <code className="bg-gray-100 dark:bg-black font-bold px-1 rounded">url</code> column containing GitHub repository URLs
        </p>
        
        
        <div className="flex gap-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={importMutation.isPending}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || importMutation.isPending}
          >
            Upload
          </Button>
          {importResult && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {importMutation.isPending && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Importing repositories...</span>
        </div>
      )}

      {importResult && !importMutation.isPending && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Processed</p>
                <p className="text-sm text-blue-700">{importResult.total_processed}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Successful</p>
                <p className="text-sm text-green-700">{importResult.successful_imports}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Failed</p>
                <p className="text-sm text-red-700">{importResult.failed_imports}</p>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded p-3 bg-red-50">
              <h3 className="font-semibold text-red-900 text-sm mb-2">Errors:</h3>
              <ul className="text-sm space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index} className="text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
