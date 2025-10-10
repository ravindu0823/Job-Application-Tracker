"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, DollarSign, ExternalLink, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, use } from 'react';
import type { Note, NoteType, Application, Interview, ApplicationStatus } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { NoteForm } from '@/components/forms/note-form';
import { InterviewForm } from '@/components/forms/interview-form';
import { ContactForm } from '@/components/forms/contact-form';
import { useCreateNote, useUpdateNote, useDeleteNote, useCreateInterview } from '@/lib/mutations';
import { FormErrorBoundary } from '@/components/error-boundary';
import type { NoteFormData, InterviewFormData, ContactFormData } from '@/lib/validation';

function ApplicationDetail({ id }: { id: string }) {
  // Mock data - will be replaced with real API call
  const application: Application = {
    id: Number(id) || 0,
    companyName: 'Tech Company Inc.',
    position: 'Software Engineer',
    location: 'San Francisco, CA',
    jobUrl: 'https://example.com/job',
    status: 'Interview',
    priority: 'High',
    salary: 120000,
    salaryMin: 110000,
    salaryMax: 130000,
    applicationDate: '2025-03-01',
    responseDate: '2025-03-05',
    jobDescription: 'We are looking for a talented Software Engineer to join our team...',
    requirements: '- 3+ years of experience\n- Proficient in React, Node.js\n- Strong problem-solving skills',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  };

  const interviews: Interview[] = [
    {
      id: 1,
      applicationId: Number(id) || 0,
      interviewDate: '2025-03-10T14:00:00',
      interviewType: 'Technical',
      interviewerName: 'John Doe',
      location: 'Virtual',
      meetingLink: 'https://zoom.us/j/123456789',
      reminderSent: false,
      createdAt: '2025-03-01T00:00:00Z',
    },
  ];

  const initialNotes: Note[] = [
    {
      id: 1,
      applicationId: Number(id) || 0,
      title: 'Company Research',
      content:
        'Tech Company Inc. is a fast-growing startup focused on <b>AI solutions</b> targeting healthcare. Market size ~ $20B. Competitors: A, B, C. Recent funding: Series B.',
      noteType: 'Research',
      createdAt: new Date('2025-03-01').toISOString(),
      updatedAt: new Date('2025-03-01').toISOString(),
    },
  ];

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [noteFilter, setNoteFilter] = useState<NoteType | 'All'>('All');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  useDeleteNote(); // For future use
  const createInterviewMutation = useCreateInterview();

  const noteTypes: NoteType[] = useMemo(
    () => ['Research', 'Interview', 'Follow-up', 'General', 'Offer'],
    []
  );

  const filteredNotes = useMemo(
    () => (noteFilter === 'All' ? notes : notes.filter((n) => n.noteType === noteFilter)),
    [notes, noteFilter]
  );

  function handleSaveNote(data: NoteFormData & { content: string }) {
    if (editingNote) {
      // Update existing note
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...data, updatedAt: new Date().toISOString() }
            : n
        )
      );
      // Uncomment for API: updateNoteMutation.mutate({ id: editingNote.id, data, applicationId: Number(params.id) });
    } else {
      // Create new note
      const newNote: Note = {
        id: (notes.at(-1)?.id || 0) + 1,
        applicationId: Number(id) || 0,
        title: data.title,
        content: data.content,
        noteType: data.noteType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      // Uncomment for API: createNoteMutation.mutate(data);
    }

    setIsNoteModalOpen(false);
    setEditingNote(null);
  }

  function handleDeleteNote(id: number) {
    const ok = window.confirm('Delete this note? This cannot be undone.');
    if (!ok) return;
    
    setNotes((prev) => prev.filter((n) => n.id !== id));
    // Uncomment for API: deleteNoteMutation.mutate({ id, applicationId: Number(params.id) });
  }

  function handleCreateInterview(data: InterviewFormData) {
    // In production, call API
    console.log('Creating interview:', data);
    setIsInterviewModalOpen(false);
    // Uncomment for API: createInterviewMutation.mutate(data, { onSuccess: () => setIsInterviewModalOpen(false) });
  }

  function handleCreateContact(data: ContactFormData) {
    // In production, call API
    console.log('Creating contact:', data);
    setIsContactModalOpen(false);
  }

  const applicationId = Number(id) || 0;

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      Applied: 'bg-blue-100 text-blue-800',
      Interview: 'bg-yellow-100 text-yellow-800',
      Offer: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {application.companyName}
            </h2>
            <p className="text-neutral-500">{application.position}</p>
          </div>
        </div>
        <Badge className={getStatusColor(application.status)} variant="secondary">
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{application.location}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied On</CardTitle>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatDate(application.applicationDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Range</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              ${application.salaryMin?.toLocaleString()} - ${application.salaryMax?.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {application.jobDescription}
              </p>
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  View Job Posting
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {application.requirements}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
              <DialogTrigger asChild>
                <Button>Schedule Interview</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Interview</DialogTitle>
                </DialogHeader>
                <FormErrorBoundary>
                  <InterviewForm
                    applicationId={applicationId}
                    onSubmit={handleCreateInterview}
                    onCancel={() => setIsInterviewModalOpen(false)}
                    isLoading={createInterviewMutation.isPending}
                  />
                </FormErrorBoundary>
              </DialogContent>
            </Dialog>
          </div>
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <CardTitle>{interview.interviewType} Interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-neutral-500" />
                    {formatDateTime(interview.interviewDate)}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-neutral-500" />
                    {interview.location}
                  </div>
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:underline"
                    >
                      Join Meeting
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  <p className="text-sm text-neutral-700">
                    Interviewer: {interview.interviewerName}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-neutral-500">
                No interviews scheduled yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Filter</span>
              <Select value={noteFilter} onValueChange={(v) => setNoteFilter(v as (NoteType | 'All'))}>
                <SelectTrigger className="min-w-[10rem]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {noteTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}>Add Note</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
                </DialogHeader>
                <FormErrorBoundary>
                  <NoteForm
                    applicationId={applicationId}
                    note={editingNote || undefined}
                    onSubmit={handleSaveNote}
                    onCancel={() => setIsNoteModalOpen(false)}
                    isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
                  />
                </FormErrorBoundary>
              </DialogContent>
            </Dialog>
          </div>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{note.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{note.noteType}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingNote(note); setIsNoteModalOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-neutral-700 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.content }} />
                  <p className="mt-2 text-xs text-neutral-500">
                    Created {formatDateTime(note.createdAt)}
                    {note.updatedAt && ` • Updated ${formatDateTime(note.updatedAt)}`}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-neutral-500">
                No notes added yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">Upload resumes, cover letters, and related files</div>
            <Button>Upload Document</Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-neutral-500">
              Document upload integration coming soon
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {[{ id: 1, name: 'Resume_v3.pdf', type: 'Resume', size: '128 KB', uploadedAt: '2025-03-02' }].map((d) => (
              <Card key={d.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{d.name}</CardTitle>
                    <Badge variant="outline">{d.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">{d.size}</p>
                  <p className="text-xs text-neutral-500">Uploaded {formatDate(d.uploadedAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, oldStatus: 'Applied', newStatus: 'Interview', at: '2025-03-05', notes: 'Phone screen scheduled' },
                ].map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{h.oldStatus} → {h.newStatus}</div>
                      <div className="text-xs text-neutral-500">{formatDateTime(h.at)}</div>
                      <div className="text-sm text-neutral-700">{h.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600"><Users2 className="h-4 w-4" />
              <span className="text-sm">Recruiter / Hiring Contacts</span>
            </div>
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
              <DialogTrigger asChild>
                <Button>Add Contact</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Contact</DialogTitle>
                </DialogHeader>
                <FormErrorBoundary>
                  <ContactForm
                    applicationId={applicationId}
                    onSubmit={handleCreateContact}
                    onCancel={() => setIsContactModalOpen(false)}
                    isLoading={false}
                  />
                </FormErrorBoundary>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-neutral-500">
              Contacts UI coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ApplicationDetail id={id} />;
}
