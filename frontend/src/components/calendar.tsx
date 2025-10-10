"use client";

import { useState, useRef, useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { EventInput, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Download, Filter, Plus, X } from 'lucide-react';
import type { Interview, Application, ApplicationStatus, InterviewType } from '@/lib/types';
import type { InterviewFormData } from '@/lib/validation';
import { InterviewForm } from '@/components/forms/interview-form';
import { FormErrorBoundary } from '@/components/error-boundary';
import { toast } from 'sonner';

interface CalendarProps {
  interviews: Interview[];
  applications: Application[];
  onCreateInterview: (data: InterviewFormData) => void;
  onUpdateInterview: (id: number, data: Partial<Interview>) => void;
  onDeleteInterview: (id: number) => void;
  isLoading?: boolean;
}

// Color mapping for application statuses
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: '#3b82f6',      // blue
  Interview: '#f59e0b',    // amber
  Offer: '#10b981',        // green
  Rejected: '#ef4444',     // red
};

// Interview type icons/labels
const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  Phone: '📞',
  Video: '🎥',
  Onsite: '🏢',
  Technical: '💻',
  HR: '👥',
  Final: '⭐',
};

export function Calendar({
  interviews,
  applications,
  onCreateInterview,
  onUpdateInterview,
  onDeleteInterview,
  isLoading = false,
}: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Interview | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<InterviewType | 'all'>('all');
  const [viewType, setViewType] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');

  // Create a map of applications for quick lookup
  const applicationsMap = useMemo(() => {
    const map = new Map<number, Application>();
    applications.forEach(app => map.set(app.id, app));
    return map;
  }, [applications]);

  // Filter interviews based on selected filters
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const application = applicationsMap.get(interview.applicationId);
      if (!application) return false;

      if (filterStatus !== 'all' && application.status !== filterStatus) {
        return false;
      }

      if (filterType !== 'all' && interview.interviewType !== filterType) {
        return false;
      }

      return true;
    });
  }, [interviews, applicationsMap, filterStatus, filterType]);

  // Transform interviews into FullCalendar events
  const events: EventInput[] = useMemo(() => {
    return filteredInterviews.map(interview => {
      const application = applicationsMap.get(interview.applicationId);
      const statusColor = application ? STATUS_COLORS[application.status] : '#6b7280';
      const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType];

      return {
        id: interview.id.toString(),
        title: `${typeLabel} ${application?.companyName || 'Unknown'} - ${application?.position || ''}`,
        start: interview.interviewDate,
        end: interview.duration 
          ? new Date(new Date(interview.interviewDate).getTime() + interview.duration * 60000).toISOString()
          : interview.interviewDate,
        backgroundColor: statusColor,
        borderColor: statusColor,
        extendedProps: {
          interview,
          application,
        },
      };
    });
  }, [filteredInterviews, applicationsMap]);

  // Handle event click - show event details
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const interview = clickInfo.event.extendedProps.interview as Interview;
    setSelectedEvent(interview);
    setIsEventDetailOpen(true);
  }, []);

  // Handle date select - open add interview dialog
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear selection
    
    // Open the add interview dialog
    setIsAddInterviewOpen(true);
  }, []);

  // Handle event drop (drag and drop rescheduling)
  const handleEventDrop = useCallback((dropInfo: EventDropArg) => {
    const interview = dropInfo.event.extendedProps.interview as Interview;
    const newDate = dropInfo.event.startStr;

    // Update the interview with new date
    onUpdateInterview(interview.id, {
      interviewDate: newDate,
    });

    toast.success('Interview rescheduled successfully');
  }, [onUpdateInterview]);

  // Export to iCal
  const handleExport = useCallback(() => {
    const icsContent = generateICS(filteredInterviews, applicationsMap);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `interviews-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Calendar exported successfully');
  }, [filteredInterviews, applicationsMap]);

  // Navigate to today
  const handleToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  }, []);

  // Navigate to previous period
  const handlePrev = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  }, []);

  // Navigate to next period
  const handleNext = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  }, []);

  // Change view type
  const handleViewChange = useCallback((view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setViewType(view as 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek');
    }
  }, []);

  // Handle interview form submission
  const handleInterviewSubmit = useCallback((data: InterviewFormData) => {
    onCreateInterview(data);
    setIsAddInterviewOpen(false);
  }, [onCreateInterview]);

  // Handle interview deletion
  const handleDeleteInterview = useCallback(() => {
    if (selectedEvent) {
      const confirmed = window.confirm('Are you sure you want to delete this interview?');
      if (confirmed) {
        onDeleteInterview(selectedEvent.id);
        setIsEventDetailOpen(false);
        setSelectedEvent(null);
      }
    }
  }, [selectedEvent, onDeleteInterview]);

  const selectedApplication = selectedEvent 
    ? applicationsMap.get(selectedEvent.applicationId)
    : null;

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Interview Calendar
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {/* View Selector */}
              <Select value={viewType} onValueChange={handleViewChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                  <SelectItem value="timeGridDay">Day</SelectItem>
                  <SelectItem value="listWeek">List</SelectItem>
                </SelectContent>
              </Select>

              {/* Navigation Buttons */}
              <Button variant="outline" size="sm" onClick={handlePrev}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                Next
              </Button>

              {/* Export Button */}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Add Interview Button */}
              <Dialog open={isAddInterviewOpen} onOpenChange={setIsAddInterviewOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                  </DialogHeader>
                  <FormErrorBoundary>
                    <InterviewForm
                      applicationId={0} // Will be selected in the form
                      onSubmit={handleInterviewSubmit}
                      onCancel={() => setIsAddInterviewOpen(false)}
                      isLoading={isLoading}
                    />
                  </FormErrorBoundary>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters:
            </span>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ApplicationStatus | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as InterviewType | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
              </SelectContent>
            </Select>

            {(filterStatus !== 'all' || filterType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}

            <span className="text-sm text-neutral-500 ml-auto">
              {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b">
            <span className="text-sm font-medium">Status Colors:</span>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{status}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={viewType}
              headerToolbar={false} // We're using custom controls
              events={events}
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              nowIndicator={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailOpen} onOpenChange={setIsEventDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {INTERVIEW_TYPE_LABELS[selectedEvent.interviewType]} {selectedEvent.interviewType} Interview
                </h3>
                <p className="text-sm text-neutral-600">
                  {selectedApplication.companyName} - {selectedApplication.position}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: STATUS_COLORS[selectedApplication.status],
                      color: 'white'
                    }}
                  >
                    {selectedApplication.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Date & Time:</span>
                  <span className="text-sm">
                    {format(new Date(selectedEvent.interviewDate), 'PPp')}
                  </span>
                </div>

                {selectedEvent.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{selectedEvent.duration} minutes</span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm text-right">{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.interviewerName && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Interviewer:</span>
                    <span className="text-sm text-right">
                      {selectedEvent.interviewerName}
                      {selectedEvent.interviewerPosition && ` (${selectedEvent.interviewerPosition})`}
                    </span>
                  </div>
                )}

                {selectedEvent.meetingLink && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Meeting Link:</span>
                    <a 
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                {selectedEvent.notes && (
                  <div>
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-sm text-neutral-700 mt-1">{selectedEvent.notes}</p>
                  </div>
                )}

                {selectedEvent.outcome && (
                  <div>
                    <span className="text-sm font-medium">Outcome:</span>
                    <p className="text-sm text-neutral-700 mt-1">{selectedEvent.outcome}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEventDetailOpen(false)}>
                  Close
                </Button>
                <Button variant="destructive" onClick={handleDeleteInterview}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Generate ICS file content for calendar export
function generateICS(interviews: Interview[], applicationsMap: Map<number, Application>): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Job Application Tracker//Interview Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Job Interviews',
    'X-WR-TIMEZONE:UTC',
  ];

  interviews.forEach(interview => {
    const application = applicationsMap.get(interview.applicationId);
    if (!application) return;

    const startDate = new Date(interview.interviewDate);
    const endDate = interview.duration
      ? new Date(startDate.getTime() + interview.duration * 60000)
      : new Date(startDate.getTime() + 3600000); // Default 1 hour

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType];
    const summary = `${typeLabel} ${interview.interviewType} - ${application.companyName}`;
    const descriptionParts: string[] = [
      `Position: ${application.position}`,
    ];
    
    if (interview.interviewerName) {
      descriptionParts.push(`Interviewer: ${interview.interviewerName}`);
    }
    if (interview.location) {
      descriptionParts.push(`Location: ${interview.location}`);
    }
    if (interview.notes) {
      descriptionParts.push(`Notes: ${interview.notes}`);
    }
    
    const description = descriptionParts.join('\\n');

    const eventLines: string[] = [
      'BEGIN:VEVENT',
      `UID:interview-${interview.id}@job-tracker`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
    ];

    if (interview.location) {
      eventLines.push(`LOCATION:${interview.location}`);
    }
    if (interview.meetingLink) {
      eventLines.push(`URL:${interview.meetingLink}`);
    }

    eventLines.push('STATUS:CONFIRMED', 'END:VEVENT');
    lines.push(...eventLines);
  });

  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

