'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Interview, Application } from '@/lib/types';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Briefcase,
  ExternalLink,
  Download,
} from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/calendar-utils';

interface EventDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview;
  application?: Application;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EventDetailModal({
  open,
  onOpenChange,
  interview,
  application,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const handleExportToGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(interview, application?.companyName);
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Interview Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Info */}
          {application && (
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{application.companyName}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{application.position}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {application.status}
              </div>
            </div>
          )}

          {/* Interview Type */}
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-neutral-500 mt-0.5" />
            <div>
              <p className="text-sm text-neutral-500">Interview Type</p>
              <p className="font-medium">{interview.interviewType}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
            <div>
              <p className="text-sm text-neutral-500">Date & Time</p>
              <p className="font-medium">
                {format(new Date(interview.interviewDate), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {format(new Date(interview.interviewDate), 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Duration */}
          {interview.duration && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">Duration</p>
                <p className="font-medium">{interview.duration} minutes</p>
              </div>
            </div>
          )}

          {/* Location */}
          {interview.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">Location</p>
                <p className="font-medium">{interview.location}</p>
              </div>
            </div>
          )}

          {/* Meeting Link */}
          {interview.meetingLink && (
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Meeting Link</p>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  Join Meeting
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Interviewer */}
          {interview.interviewerName && (
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">Interviewer</p>
                <p className="font-medium">{interview.interviewerName}</p>
                {interview.interviewerPosition && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {interview.interviewerPosition}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div>
              <p className="text-sm text-neutral-500 mb-2">Notes</p>
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{interview.notes}</p>
              </div>
            </div>
          )}

          {/* Outcome */}
          {interview.outcome && (
            <div>
              <p className="text-sm text-neutral-500 mb-2">Outcome</p>
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{interview.outcome}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToGoogleCalendar}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Add to Google Calendar
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
