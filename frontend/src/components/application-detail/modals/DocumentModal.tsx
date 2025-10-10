"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

export function DocumentModal({ isOpen, onClose, onUpload }: DocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload resumes, cover letters, or other documents related to this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Drop files here or click to upload</p>
            <Button variant="outline" onClick={onUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, TXT (Max 10MB per file)
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled>Upload Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
