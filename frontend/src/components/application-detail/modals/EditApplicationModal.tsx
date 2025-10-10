"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ApplicationStatus, Priority } from '@/lib/types';

interface EditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  position: string;
  location: string;
  jobUrl: string;
  status: ApplicationStatus;
  priority: Priority;
  salaryMin: string;
  salaryMax: string;
  applicationDate: string;
  responseDate: string;
  jobDescription: string;
  requirements: string;
  applicationStatuses: ApplicationStatus[];
  priorities: Priority[];
  onCompanyNameChange: (name: string) => void;
  onPositionChange: (position: string) => void;
  onLocationChange: (location: string) => void;
  onJobUrlChange: (url: string) => void;
  onStatusChange: (status: ApplicationStatus) => void;
  onPriorityChange: (priority: Priority) => void;
  onSalaryMinChange: (min: string) => void;
  onSalaryMaxChange: (max: string) => void;
  onApplicationDateChange: (date: string) => void;
  onResponseDateChange: (date: string) => void;
  onJobDescriptionChange: (description: string) => void;
  onRequirementsChange: (requirements: string) => void;
  onSave: () => void;
}

export function EditApplicationModal({
  isOpen,
  onClose,
  companyName,
  position,
  location,
  jobUrl,
  status,
  priority,
  salaryMin,
  salaryMax,
  applicationDate,
  responseDate,
  jobDescription,
  requirements,
  applicationStatuses,
  priorities,
  onCompanyNameChange,
  onPositionChange,
  onLocationChange,
  onJobUrlChange,
  onStatusChange,
  onPriorityChange,
  onSalaryMinChange,
  onSalaryMaxChange,
  onApplicationDateChange,
  onResponseDateChange,
  onJobDescriptionChange,
  onRequirementsChange,
  onSave,
}: EditApplicationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update application details and information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Company Name *</label>
              <Input
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Position *</label>
              <Input
                value={position}
                onChange={(e) => onPositionChange(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Job URL</label>
              <Input
                type="url"
                value={jobUrl}
                onChange={(e) => onJobUrlChange(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {applicationStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={onPriorityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Application Date</label>
              <Input
                type="date"
                value={applicationDate}
                onChange={(e) => onApplicationDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Salary Min</label>
              <Input
                type="number"
                placeholder="80000"
                value={salaryMin}
                onChange={(e) => onSalaryMinChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Salary Max</label>
              <Input
                type="number"
                placeholder="120000"
                value={salaryMax}
                onChange={(e) => onSalaryMaxChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Response Date</label>
            <Input
              type="date"
              value={responseDate}
              onChange={(e) => onResponseDateChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Job Description</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md resize-none"
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Requirements</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md resize-none"
              value={requirements}
              onChange={(e) => onRequirementsChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
