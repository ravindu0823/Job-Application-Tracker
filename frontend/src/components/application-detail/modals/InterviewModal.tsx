"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Interview, InterviewType } from '@/lib/types';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingInterview: Interview | null;
  interviewDate: string;
  interviewType: InterviewType;
  interviewerName: string;
  interviewerPosition: string;
  interviewLocation: string;
  meetingLink: string;
  interviewNotes: string;
  interviewTypes: InterviewType[];
  onDateChange: (date: string) => void;
  onTypeChange: (type: InterviewType) => void;
  onInterviewerNameChange: (name: string) => void;
  onInterviewerPositionChange: (position: string) => void;
  onLocationChange: (location: string) => void;
  onMeetingLinkChange: (link: string) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function InterviewModal({
  isOpen,
  onClose,
  editingInterview,
  interviewDate,
  interviewType,
  interviewerName,
  interviewerPosition,
  interviewLocation,
  meetingLink,
  interviewNotes,
  interviewTypes,
  onDateChange,
  onTypeChange,
  onInterviewerNameChange,
  onInterviewerPositionChange,
  onLocationChange,
  onMeetingLinkChange,
  onNotesChange,
  onSave,
}: InterviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingInterview ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle>
          <DialogDescription>
            Add interview details including date, time, and interviewer information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Interview Date & Time</label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Interview Type</label>
              <Select value={interviewType} onValueChange={onTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Interviewer Name</label>
              <Input
                placeholder="John Doe"
                value={interviewerName}
                onChange={(e) => onInterviewerNameChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input
                placeholder="Senior Engineer"
                value={interviewerPosition}
                onChange={(e) => onInterviewerPositionChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              placeholder="Virtual, Office, etc."
              value={interviewLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Meeting Link</label>
            <Input
              placeholder="https://zoom.us/j/..."
              value={meetingLink}
              onChange={(e) => onMeetingLinkChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full min-h-[80px] p-2 border rounded-md resize-none"
              placeholder="Interview preparation notes, questions to ask, etc."
              value={interviewNotes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>{editingInterview ? 'Save Changes' : 'Schedule Interview'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
