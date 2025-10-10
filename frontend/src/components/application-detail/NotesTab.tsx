"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Note, NoteType } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface NotesTabProps {
  notes: Note[];
  filteredNotes: Note[];
  noteFilter: NoteType | 'All';
  noteTypes: NoteType[];
  onFilterChange: (filter: NoteType | 'All') => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
}

export function NotesTab({ 
  notes,
  filteredNotes, 
  noteFilter, 
  noteTypes,
  onFilterChange, 
  onAddNote, 
  onEditNote, 
  onDeleteNote 
}: NotesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by type:</span>
          <Select value={noteFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {noteTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNote}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>
      
      {filteredNotes.length > 0 ? (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">{note.title}</CardTitle>
                    <Badge variant="outline">{note.noteType}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditNote(note)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.content }} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Created {formatDateTime(note.createdAt)}
                  {note.updatedAt && ` • Updated ${formatDateTime(note.updatedAt)}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes added yet</p>
            <Button className="mt-4" onClick={onAddNote}>
              Add Your First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
