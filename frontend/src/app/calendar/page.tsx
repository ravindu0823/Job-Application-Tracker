"use client";

import { useState } from 'react';
import { Calendar } from '@/components/calendar';
import type { Interview, Application } from '@/lib/types';
import { useCreateInterview, useUpdateInterview, useDeleteInterview } from '@/lib/mutations';
import type { InterviewFormData } from '@/lib/validation';

export default function CalendarPage() {
  // Mock data - will be replaced with real API calls
  const [applications] = useState<Application[]>([
    {
      id: 1,
      companyName: 'Tech Company Inc.',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      status: 'Interview',
      priority: 'High',
      applicationDate: '2025-03-01',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    },
    {
      id: 2,
      companyName: 'Startup XYZ',
      position: 'Frontend Developer',
      location: 'Remote',
      status: 'Interview',
      priority: 'Medium',
      applicationDate: '2025-02-28',
      createdAt: '2025-02-28T00:00:00Z',
      updatedAt: '2025-02-28T00:00:00Z',
    },
    {
      id: 3,
      companyName: 'Enterprise Corp',
      position: 'Full Stack Engineer',
      location: 'New York, NY',
      status: 'Offer',
      priority: 'High',
      applicationDate: '2025-02-25',
      createdAt: '2025-02-25T00:00:00Z',
      updatedAt: '2025-02-25T00:00:00Z',
    },
    {
      id: 4,
      companyName: 'Innovation Labs',
      position: 'Backend Developer',
      location: 'Austin, TX',
      status: 'Applied',
      priority: 'Low',
      applicationDate: '2025-02-20',
      createdAt: '2025-02-20T00:00:00Z',
      updatedAt: '2025-02-20T00:00:00Z',
    },
  ]);

  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 1,
      applicationId: 1,
      interviewDate: '2025-10-15T14:00:00',
      interviewType: 'Technical',
      duration: 60,
      interviewerName: 'John Doe',
      interviewerPosition: 'Senior Engineer',
      location: 'Virtual',
      meetingLink: 'https://zoom.us/j/123456789',
      notes: 'Prepare coding challenges',
      reminderSent: false,
      createdAt: '2025-03-01T00:00:00Z',
    },
    {
      id: 2,
      applicationId: 2,
      interviewDate: '2025-10-18T10:00:00',
      interviewType: 'HR',
      duration: 30,
      interviewerName: 'Jane Smith',
      interviewerPosition: 'HR Manager',
      location: 'Virtual',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Behavioral questions',
      reminderSent: false,
      createdAt: '2025-03-02T00:00:00Z',
    },
    {
      id: 3,
      applicationId: 3,
      interviewDate: '2025-10-20T15:30:00',
      interviewType: 'Final',
      duration: 90,
      interviewerName: 'Bob Johnson',
      interviewerPosition: 'CTO',
      location: '123 Main St, New York, NY',
      notes: 'Final round with leadership team',
      outcome: 'Pending',
      reminderSent: false,
      createdAt: '2025-03-03T00:00:00Z',
    },
    {
      id: 4,
      applicationId: 1,
      interviewDate: '2025-10-12T09:00:00',
      interviewType: 'Phone',
      duration: 30,
      interviewerName: 'Alice Williams',
      interviewerPosition: 'Recruiter',
      location: 'Phone',
      notes: 'Initial screening',
      outcome: 'Passed',
      reminderSent: true,
      createdAt: '2025-03-01T00:00:00Z',
    },
  ]);

  const createInterviewMutation = useCreateInterview();
  const updateInterviewMutation = useUpdateInterview();
  const deleteInterviewMutation = useDeleteInterview();

  const handleCreateInterview = (data: InterviewFormData) => {
    // In production, this would call the API
    const newInterview: Interview = {
      id: (interviews.at(-1)?.id || 0) + 1,
      applicationId: data.applicationId,
      interviewDate: data.interviewDate,
      interviewType: data.interviewType,
      duration: data.duration,
      interviewerName: data.interviewerName,
      interviewerPosition: data.interviewerPosition,
      location: data.location,
      meetingLink: data.meetingLink,
      notes: data.notes,
      outcome: data.outcome,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    setInterviews((prev) => [...prev, newInterview]);

    // Uncomment for API integration:
    // createInterviewMutation.mutate(data);
  };

  const handleUpdateInterview = (id: number, data: Partial<Interview>) => {
    // In production, this would call the API
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, ...data } : interview
      )
    );

    // Uncomment for API integration:
    // updateInterviewMutation.mutate({ id, data });
  };

  const handleDeleteInterview = (id: number) => {
    // In production, this would call the API
    setInterviews((prev) => prev.filter((interview) => interview.id !== id));

    // Uncomment for API integration:
    // deleteInterviewMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <p className="text-neutral-500">
          View and manage all your scheduled interviews
        </p>
      </div>

      <Calendar
        interviews={interviews}
        applications={applications}
        onCreateInterview={handleCreateInterview}
        onUpdateInterview={handleUpdateInterview}
        onDeleteInterview={handleDeleteInterview}
        isLoading={
          createInterviewMutation.isPending ||
          updateInterviewMutation.isPending ||
          deleteInterviewMutation.isPending
        }
      />
    </div>
  );
}
