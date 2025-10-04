'use client';

import '@fullcalendar/core/index.js';
import '@fullcalendar/daygrid/index.js';
import '@fullcalendar/timegrid/index.js';
import '@fullcalendar/list/index.js';

import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { useInterviews, useRescheduleInterview } from '@/lib/hooks/useInterviews';
import { interviewToEvent, downloadICalFile, exportToICal } from '@/lib/calendar-utils';
import { EventDetailModal } from './EventDetailModal';
import { Interview, Application, InterviewType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewCalendarProps {
  applications?: Application[];
  filterByStatus?: string[];
  filterByType?: InterviewType[];
}

export function InterviewCalendar({
  applications = [],
  filterByStatus,
  filterByType,
}: InterviewCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<{
    interview: Interview;
    application?: Application;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: interviews = [], isLoading, error } = useInterviews();
  const rescheduleInterview = useRescheduleInterview();

  // Convert interviews to calendar events with filtering
  const events = useMemo(() => {
    let filteredInterviews = interviews;

    // Filter by interview type
    if (filterByType && filterByType.length > 0) {
      filteredInterviews = filteredInterviews.filter((interview) =>
        filterByType.includes(interview.interviewType)
      );
    }

    // Filter by application status
    if (filterByStatus && filterByStatus.length > 0 && applications.length > 0) {
      filteredInterviews = filteredInterviews.filter((interview) => {
        const application = applications.find((app) => app.id === interview.applicationId);
        return application && filterByStatus.includes(application.status);
      });
    }

    return filteredInterviews.map((interview) => {
      const application = applications.find((app) => app.id === interview.applicationId);
      return interviewToEvent(interview, application);
    });
  }, [interviews, applications, filterByStatus, filterByType]);

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const interview = clickInfo.event.extendedProps.interview as Interview;
    const application = clickInfo.event.extendedProps.application as Application | undefined;

    setSelectedEvent({ interview, application });
    setIsModalOpen(true);
  };

  // Handle date select (for adding new interview)
  const handleDateSelect = () => {
    // TODO: Open Add Interview Modal with pre-filled date
    toast.info('Click "Add Interview" button to create a new interview');
  };

  // Handle event drop (drag and drop to reschedule)
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const interview = dropInfo.event.extendedProps.interview as Interview;
    const newDate = dropInfo.event.start?.toISOString();

    if (!newDate) return;

    try {
      await rescheduleInterview.mutateAsync({
        id: interview.id,
        newDate,
      });
      toast.success('Interview rescheduled successfully');
    } catch {
      toast.error('Failed to reschedule interview');
      dropInfo.revert();
    }
  };

  // Export to iCal
  const handleExportToICal = () => {
    const icalContent = exportToICal(interviews);
    downloadICalFile(icalContent, 'job-interviews.ics');
    toast.success('Calendar exported successfully');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="ml-3 text-neutral-500">Loading calendar...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-red-500 mb-4">Failed to load interviews</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interview Calendar</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportToICal}>
              <Download className="w-4 h-4 mr-2" />
              Export to iCal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={events}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short',
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short',
              }}
              nowIndicator={true}
              eventDisplay="block"
              displayEventTime={true}
              displayEventEnd={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          interview={selectedEvent.interview}
          application={selectedEvent.application}
          onEdit={() => {
            toast.info('Edit functionality coming soon');
          }}
          onDelete={() => {
            toast.info('Delete functionality coming soon');
          }}
        />
      )}

      <style jsx global>{`
        .calendar-wrapper {
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--accent));
        }

        .calendar-wrapper .fc-event {
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .calendar-wrapper .fc-event:hover {
          opacity: 0.8;
        }

        .calendar-wrapper .fc-daygrid-event {
          padding: 2px 4px;
          border-radius: 4px;
        }

        .calendar-wrapper .fc-list-event:hover td {
          background-color: hsl(var(--accent));
        }

        @media (max-width: 768px) {
          .calendar-wrapper .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .calendar-wrapper .fc .fc-toolbar-chunk {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </>
  );
}
