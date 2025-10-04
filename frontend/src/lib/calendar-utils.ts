import { Interview, ApplicationStatus } from './types';
import { EventInput } from '@fullcalendar/core';

/**
 * Get color based on application status
 */
export const getStatusColor = (status: ApplicationStatus): string => {
  const colors: Record<ApplicationStatus, string> = {
    Applied: '#3b82f6', // blue
    Interview: '#f59e0b', // amber
    Offer: '#10b981', // green
    Rejected: '#ef4444', // red
  };
  return colors[status] || '#6b7280'; // gray as fallback
};

/**
 * Convert Interview to FullCalendar Event
 */
export const interviewToEvent = (
  interview: Interview,
  application?: { companyName: string; position: string; status: ApplicationStatus }
): EventInput => {
  const status = application?.status || 'Applied';
  return {
    id: interview.id.toString(),
    title: application
      ? `${application.companyName} - ${interview.interviewType}`
      : `Interview - ${interview.interviewType}`,
    start: interview.interviewDate,
    end: interview.duration
      ? new Date(new Date(interview.interviewDate).getTime() + interview.duration * 60000).toISOString()
      : undefined,
    backgroundColor: getStatusColor(status),
    borderColor: getStatusColor(status),
    extendedProps: {
      interview,
      application,
    },
  };
};

/**
 * Export calendar to iCal format
 */
export const exportToICal = (interviews: Interview[]): string => {
  const icalHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Job Application Tracker//Interview Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ].join('\r\n');

  const icalEvents = interviews
    .map((interview) => {
      const startDate = new Date(interview.interviewDate);
      const endDate = interview.duration
        ? new Date(startDate.getTime() + interview.duration * 60000)
        : new Date(startDate.getTime() + 60 * 60000); // Default 1 hour

      return [
        'BEGIN:VEVENT',
        `UID:interview-${interview.id}@job-tracker`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${interview.interviewType} Interview`,
        interview.location ? `LOCATION:${interview.location}` : '',
        interview.notes ? `DESCRIPTION:${interview.notes.replace(/\n/g, '\\n')}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n');
    })
    .join('\r\n');

  const icalFooter = 'END:VCALENDAR';

  return [icalHeader, icalEvents, icalFooter].join('\r\n');
};

/**
 * Format date for iCal format (YYYYMMDDTHHMMSSZ)
 */
const formatICalDate = (date: Date): string => {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Download iCal file
 */
export const downloadICalFile = (content: string, filename: string = 'interviews.ics'): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarUrl = (interview: Interview, companyName?: string): string => {
  const startDate = new Date(interview.interviewDate);
  const endDate = interview.duration
    ? new Date(startDate.getTime() + interview.duration * 60000)
    : new Date(startDate.getTime() + 60 * 60000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${companyName ? companyName + ' - ' : ''}${interview.interviewType} Interview`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: interview.notes || '',
    location: interview.location || interview.meetingLink || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Format date for Google Calendar (YYYYMMDDTHHmmssZ)
 */
const formatGoogleDate = (date: Date): string => {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Check if interview is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if interview is upcoming (within next 7 days)
 */
export const isUpcoming = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return date >= now && date <= weekFromNow;
};
