"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Contact } from '@/lib/types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingContact: Contact | null;
  contactName: string;
  contactPosition: string;
  contactEmail: string;
  contactPhone: string;
  contactLinkedin: string;
  contactNotes: string;
  isPrimaryContact: boolean;
  onNameChange: (name: string) => void;
  onPositionChange: (position: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onLinkedinChange: (linkedin: string) => void;
  onNotesChange: (notes: string) => void;
  onPrimaryContactChange: (isPrimary: boolean) => void;
  onSave: () => void;
}

export function ContactModal({
  isOpen,
  onClose,
  editingContact,
  contactName,
  contactPosition,
  contactEmail,
  contactPhone,
  contactLinkedin,
  contactNotes,
  isPrimaryContact,
  onNameChange,
  onPositionChange,
  onEmailChange,
  onPhoneChange,
  onLinkedinChange,
  onNotesChange,
  onPrimaryContactChange,
  onSave,
}: ContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>
            Add recruiter or hiring manager contact information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="John Doe"
                value={contactName}
                onChange={(e) => onNameChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input
                placeholder="Senior Engineer"
                value={contactPosition}
                onChange={(e) => onPositionChange(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={contactEmail}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={contactPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn Profile</label>
            <Input
              placeholder="https://linkedin.com/in/johndoe"
              value={contactLinkedin}
              onChange={(e) => onLinkedinChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full min-h-[80px] p-2 border rounded-md resize-none"
              placeholder="Additional notes about this contact..."
              value={contactNotes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="primary-contact"
              checked={isPrimaryContact}
              onChange={(e) => onPrimaryContactChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="primary-contact" className="text-sm font-medium">
              Primary contact for this application
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>{editingContact ? 'Save Changes' : 'Add Contact'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
