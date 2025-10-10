"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import type { Document } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DocumentsTabProps {
  documents: Document[];
  onUploadDocument: () => void;
  onDownloadDocument: (document: Document) => void;
  onDeleteDocument: (id: number) => void;
}

export function DocumentsTab({ 
  documents, 
  onUploadDocument, 
  onDownloadDocument, 
  onDeleteDocument 
}: DocumentsTabProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Application Documents</h3>
        <Button onClick={onUploadDocument}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      {documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base truncate">{document.name}</CardTitle>
                  <Badge variant="outline">{document.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{formatFileSize(document.fileSize)}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded {formatDate(document.uploadedAt)}
                </p>
                {document.description && (
                  <p className="text-sm">{document.description}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onDownloadDocument(document)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDeleteDocument(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <Button className="mt-4" onClick={onUploadDocument}>
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
