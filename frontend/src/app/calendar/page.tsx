'use client';

import { useState } from 'react';
import { InterviewCalendar } from '@/components/calendar/InterviewCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { ApplicationStatus, InterviewType } from '@/lib/types';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<InterviewType[]>([]);

  const handleAddInterview = () => {
    toast.info('Add interview functionality coming soon');
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      setStatusFilter([]);
    } else {
      setStatusFilter([value as ApplicationStatus]);
    }
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === 'all') {
      setTypeFilter([]);
    } else {
      setTypeFilter([value as InterviewType]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Interview Calendar</h2>
          <p className="text-neutral-500">
            View and manage all your scheduled interviews
          </p>
        </div>
        <Button onClick={handleAddInterview} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Interview
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex-1 flex flex-wrap gap-3">
              <Select onValueChange={handleStatusFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleTypeFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Type" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <InterviewCalendar
        filterByStatus={statusFilter.length > 0 ? statusFilter : undefined}
        filterByType={typeFilter.length > 0 ? typeFilter : undefined}
      />

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-3">Status Color Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">Applied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span className="text-sm">Interview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">Offer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">Rejected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-3">Tips</h3>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
            <li>• Click on any event to view detailed information</li>
            <li>• Drag and drop events to reschedule interviews</li>
            <li>• Use the view options (Month/Week/Day) to switch calendar views</li>
            <li>• Export your calendar to sync with Google Calendar or other apps</li>
            <li>• Filter by status or interview type to focus on specific interviews</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
