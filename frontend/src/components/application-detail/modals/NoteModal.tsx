"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline, List } from 'lucide-react';
import { useRef } from 'react';
import type { Note, NoteType } from '@/lib/types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote: Note | null;
  noteTitle: string;
  noteType: NoteType;
  noteTypes: NoteType[];
  onTitleChange: (title: string) => void;
  onTypeChange: (type: NoteType) => void;
  onSave: () => void;
}

export function NoteModal({
  isOpen,
  onClose,
  editingNote,
  noteTitle,
  noteType,
  noteTypes,
  onTitleChange,
  onTypeChange,
  onSave,
}: NoteModalProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const execFormatting = (command: string) => {
    document.execCommand(command);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
          <DialogDescription>
            Add research, interview notes, or any other information about this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Select value={noteType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <div className="flex items-center gap-1 border-b p-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => execFormatting('bold')} aria-label="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => execFormatting('italic')} aria-label="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => execFormatting('underline')} aria-label="Underline">
                <Underline className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => execFormatting('insertUnorderedList')} aria-label="Bulleted list">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[200px] p-3 text-sm outline-none prose prose-sm max-w-none dark:prose-invert"
              aria-label="Note content editor"
              suppressContentEditableWarning
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>{editingNote ? 'Save Changes' : 'Add Note'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
