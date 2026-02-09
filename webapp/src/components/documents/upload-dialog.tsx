// src/components/documents/upload-dialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadDocument } from '@/lib/api/documents';
import { DocumentCategory } from '@prisma/client';

interface UploadDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function UploadDialog({ caseId, open, onOpenChange, onComplete }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.CASE_FILE);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await uploadDocument(caseId, file, {
        title: title || file.name,
        category
      });

      toast.success('Document uploaded successfully');
      onOpenChange(false);
      onComplete();
      
      setFile(null);
      setTitle('');
      setCategory(DocumentCategory.CASE_FILE);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as DocumentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DocumentCategory.CASE_FILE}>Case File</SelectItem>
                <SelectItem value={DocumentCategory.ANNEXURE}>Annexure</SelectItem>
                <SelectItem value={DocumentCategory.ORDER}>Order</SelectItem>
                <SelectItem value={DocumentCategory.JUDGMENT}>Judgment</SelectItem>
                <SelectItem value={DocumentCategory.MISC}>Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}