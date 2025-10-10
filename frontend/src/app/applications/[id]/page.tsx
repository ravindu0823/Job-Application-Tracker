"use client";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import type { 
  Note, 
  NoteType, 
  Application, 
  Interview, 
  ApplicationStatus, 
  Contact, 
  Document, 
  StatusHistory,
  Priority,
  InterviewType 
} from '@/lib/types';
import { toast } from 'sonner';
import {
  ApplicationHeader,
  ApplicationStats,
  OverviewTab,
  InterviewsTab,
  NotesTab,
  ContactsTab,
  DocumentsTab,
  HistoryTab,
  NoteModal,
  InterviewModal,
  ContactModal,
  DocumentModal,
  EditApplicationModal,
  DeleteConfirmModal,
} from '@/components/application-detail';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const applicationId = Number(params.id) || 0;
  
  // State management
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isEditApplicationModalOpen, setIsEditApplicationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [, setEditingApplication] = useState<Application | null>(null);

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('Research');
  const [noteFilter, setNoteFilter] = useState<NoteType | 'All'>('All');
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Interview form
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('Phone');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerPosition, setInterviewerPosition] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);

  // Application form
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const loadApplicationData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockApplication: Application = {
        id: applicationId,
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
        jobDescription: 'We are looking for a talented Software Engineer to join our team. You will be responsible for developing and maintaining our web applications using modern technologies.',
        requirements: '- 3+ years of experience\n- Proficient in React, Node.js\n- Strong problem-solving skills\n- Experience with TypeScript\n- Knowledge of cloud platforms',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  };

      const mockInterviews: Interview[] = [
    {
      id: 1,
          applicationId,
      interviewDate: '2025-03-10T14:00:00',
      interviewType: 'Technical',
      interviewerName: 'John Doe',
          interviewerPosition: 'Senior Engineer',
      location: 'Virtual',
      meetingLink: 'https://zoom.us/j/123456789',
          notes: 'Technical interview focusing on React and Node.js',
      reminderSent: false,
      createdAt: '2025-03-01T00:00:00Z',
    },
        {
          id: 2,
          applicationId,
          interviewDate: '2025-03-15T10:00:00',
          interviewType: 'HR',
          interviewerName: 'Jane Smith',
          interviewerPosition: 'HR Manager',
          location: 'Virtual',
          meetingLink: 'https://zoom.us/j/987654321',
          notes: 'HR interview to discuss company culture and benefits',
          reminderSent: true,
          createdAt: '2025-03-05T00:00:00Z',
        },
      ];

      const mockNotes: Note[] = [
    {
      id: 1,
          applicationId,
      title: 'Company Research',
          content: 'Tech Company Inc. is a fast-growing startup focused on <b>AI solutions</b> targeting healthcare. Market size ~ $20B. Competitors: A, B, C. Recent funding: Series B.',
      noteType: 'Research',
      createdAt: new Date('2025-03-01').toISOString(),
      updatedAt: new Date('2025-03-01').toISOString(),
    },
        {
          id: 2,
          applicationId,
          title: 'Interview Preparation',
          content: 'Prepare for technical questions on React hooks, state management, and performance optimization. Review company\'s tech stack and recent projects.',
          noteType: 'Interview',
          createdAt: new Date('2025-03-08').toISOString(),
          updatedAt: new Date('2025-03-08').toISOString(),
        },
      ];

      const mockContacts: Contact[] = [
        {
          id: 1,
          applicationId,
          name: 'John Doe',
          position: 'Senior Engineer',
          email: 'john.doe@techcompany.com',
          phone: '+1 (555) 123-4567',
          linkedin: 'https://linkedin.com/in/johndoe',
          notes: 'Main technical contact, very responsive',
          isPrimaryContact: true,
          createdAt: '2025-03-01T00:00:00Z',
        },
        {
          id: 2,
          applicationId,
          name: 'Jane Smith',
          position: 'HR Manager',
          email: 'jane.smith@techcompany.com',
          phone: '+1 (555) 987-6543',
          linkedin: 'https://linkedin.com/in/janesmith',
          notes: 'Handles all HR-related questions',
          isPrimaryContact: false,
          createdAt: '2025-03-01T00:00:00Z',
        },
      ];

      const mockDocuments: Document[] = [
        {
          id: 1,
          applicationId,
          name: 'Resume_v3.pdf',
          type: 'Resume',
          fileSize: 128000,
          fileUrl: '/documents/resume_v3.pdf',
          uploadedAt: '2025-03-02T00:00:00Z',
          description: 'Updated resume with latest experience',
        },
        {
          id: 2,
          applicationId,
          name: 'Cover_Letter_TechCompany.pdf',
          type: 'Cover Letter',
          fileSize: 45000,
          fileUrl: '/documents/cover_letter_techcompany.pdf',
          uploadedAt: '2025-03-02T00:00:00Z',
          description: 'Customized cover letter for this position',
        },
      ];

      const mockStatusHistory: StatusHistory[] = [
        {
          id: 1,
          applicationId,
          oldStatus: 'Applied',
          newStatus: 'Interview',
          changedAt: '2025-03-05T10:30:00Z',
          notes: 'Phone screen scheduled',
          changedBy: 'System',
        },
      ];

      setApplication(mockApplication);
      setInterviews(mockInterviews);
      setNotes(mockNotes);
      setContacts(mockContacts);
      setDocuments(mockDocuments);
      setStatusHistory(mockStatusHistory);
    } catch (error) {
      console.error('Error loading application data:', error);
      toast.error('Failed to load application data');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Load data on component mount
  useEffect(() => {
    loadApplicationData();
  }, [loadApplicationData]);

  // Constants
  const noteTypes: NoteType[] = useMemo(
    () => ['Research', 'Interview', 'Follow-up', 'General', 'Offer'],
    []
  );

  const interviewTypes: InterviewType[] = useMemo(
    () => ['Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Final'],
    []
  );

  const applicationStatuses: ApplicationStatus[] = useMemo(
    () => ['Applied', 'Interview', 'Offer', 'Rejected'],
    []
  );

  const priorities: Priority[] = useMemo(
    () => ['High', 'Medium', 'Low'],
    []
  );


  // Filtered data
  const filteredNotes = useMemo(
    () => (noteFilter === 'All' ? notes : notes.filter((n) => n.noteType === noteFilter)),
    [notes, noteFilter]
  );


  // CRUD Operations
  const handleSaveNote = () => {
    const content = editorRef.current?.innerHTML?.trim() || '';
    if (!noteTitle.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? { ...n, title: noteTitle.trim(), noteType, content, updatedAt: new Date().toISOString() }
              : n
          )
        );
        toast.success('Note updated successfully');
      } else {
        const newNote: Note = {
          id: (notes.at(-1)?.id || 0) + 1,
          applicationId,
          title: noteTitle.trim(),
          content,
          noteType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes((prev) => [newNote, ...prev]);
        toast.success('Note added successfully');
      }

      setIsNoteModalOpen(false);
      setEditingNote(null);
      setNoteTitle('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = (id: number) => {
    const ok = window.confirm('Delete this note? This cannot be undone.');
    if (!ok) return;
    
    try {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleSaveInterview = () => {
    if (!interviewDate || !interviewerName.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingInterview) {
        setInterviews((prev) =>
          prev.map((i) =>
            i.id === editingInterview.id
              ? {
                  ...i,
                  interviewDate,
                  interviewType,
                  interviewerName: interviewerName.trim(),
                  interviewerPosition: interviewerPosition.trim(),
                  location: interviewLocation.trim(),
                  meetingLink: meetingLink.trim(),
                  notes: interviewNotes.trim(),
                }
              : i
          )
        );
        toast.success('Interview updated successfully');
      } else {
        const newInterview: Interview = {
          id: (interviews.at(-1)?.id || 0) + 1,
          applicationId,
          interviewDate,
          interviewType,
          interviewerName: interviewerName.trim(),
          interviewerPosition: interviewerPosition.trim(),
          location: interviewLocation.trim(),
          meetingLink: meetingLink.trim(),
          notes: interviewNotes.trim(),
          reminderSent: false,
          createdAt: new Date().toISOString(),
        };
        setInterviews((prev) => [newInterview, ...prev]);
        toast.success('Interview added successfully');
      }

      setIsInterviewModalOpen(false);
      setEditingInterview(null);
      resetInterviewForm();
    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error('Failed to save interview');
    }
  };

  const handleDeleteInterview = (id: number) => {
    const ok = window.confirm('Delete this interview? This cannot be undone.');
    if (!ok) return;
    
    try {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      toast.success('Interview deleted successfully');
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    }
  };

  const handleSaveContact = () => {
    if (!contactName.trim()) {
      toast.error('Please fill in contact name');
      return;
    }

    try {
      if (editingContact) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === editingContact.id
              ? {
                  ...c,
                  name: contactName.trim(),
                  position: contactPosition.trim(),
                  email: contactEmail.trim(),
                  phone: contactPhone.trim(),
                  linkedin: contactLinkedin.trim(),
                  notes: contactNotes.trim(),
                  isPrimaryContact,
                }
              : c
          )
        );
        toast.success('Contact updated successfully');
      } else {
        const newContact: Contact = {
          id: (contacts.at(-1)?.id || 0) + 1,
          applicationId,
          name: contactName.trim(),
          position: contactPosition.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          linkedin: contactLinkedin.trim(),
          notes: contactNotes.trim(),
          isPrimaryContact,
          createdAt: new Date().toISOString(),
        };
        setContacts((prev) => [newContact, ...prev]);
        toast.success('Contact added successfully');
      }

      setIsContactModalOpen(false);
      setEditingContact(null);
      resetContactForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    }
  };

  const handleDeleteContact = (id: number) => {
    const ok = window.confirm('Delete this contact? This cannot be undone.');
    if (!ok) return;
    
    try {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handleDeleteApplication = async () => {
    try {
      // In a real app, you would call the API here
      // await apiService.deleteApplication(applicationId);
      toast.success('Application deleted successfully');
      // Redirect to applications list
      window.location.href = '/applications';
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const handleExportToPDF = () => {
    // In a real app, you would implement PDF generation here
    toast.success('PDF export feature coming soon');
  };

  const handleShareApplication = () => {
    if (navigator.share) {
      navigator.share({
        title: `${application?.companyName} - ${application?.position}`,
        text: `Check out this job application: ${application?.companyName} - ${application?.position}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Application link copied to clipboard');
    }
  };

  // Form reset functions
  const resetInterviewForm = () => {
    setInterviewDate('');
    setInterviewType('Phone');
    setInterviewerName('');
    setInterviewerPosition('');
    setInterviewLocation('');
    setMeetingLink('');
    setInterviewNotes('');
  };

  const resetContactForm = () => {
    setContactName('');
    setContactPosition('');
    setContactEmail('');
    setContactPhone('');
    setContactLinkedin('');
    setContactNotes('');
    setIsPrimaryContact(false);
  };

  // Modal open functions
  const openNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteType('Research');
    setIsNoteModalOpen(true);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = '';
    });
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteType(note.noteType);
    setIsNoteModalOpen(true);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content;
    });
  };

  const openNewInterview = () => {
    setEditingInterview(null);
    resetInterviewForm();
    setIsInterviewModalOpen(true);
  };

  const openEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setInterviewDate(interview.interviewDate);
    setInterviewType(interview.interviewType);
    setInterviewerName(interview.interviewerName || '');
    setInterviewerPosition(interview.interviewerPosition || '');
    setInterviewLocation(interview.location || '');
    setMeetingLink(interview.meetingLink || '');
    setInterviewNotes(interview.notes || '');
    setIsInterviewModalOpen(true);
  };

  const openNewContact = () => {
    setEditingContact(null);
    resetContactForm();
    setIsContactModalOpen(true);
  };

  const openEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPosition(contact.position || '');
    setContactEmail(contact.email || '');
    setContactPhone(contact.phone || '');
    setContactLinkedin(contact.linkedin || '');
    setContactNotes(contact.notes || '');
    setIsPrimaryContact(contact.isPrimaryContact);
    setIsContactModalOpen(true);
  };

  const openEditApplication = () => {
    if (!application) return;
    setEditingApplication(application);
    setCompanyName(application.companyName);
    setPosition(application.position);
    setLocation(application.location || '');
    setJobUrl(application.jobUrl || '');
    setStatus(application.status);
    setPriority(application.priority);
    setSalaryMin(application.salaryMin?.toString() || '');
    setSalaryMax(application.salaryMax?.toString() || '');
    setApplicationDate(application.applicationDate);
    setResponseDate(application.responseDate || '');
    setJobDescription(application.jobDescription || '');
    setRequirements(application.requirements || '');
    setIsEditApplicationModalOpen(true);
  };


  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Application not found</p>
        <Link href="/applications">
          <Button className="mt-4">Back to Applications</Button>
        </Link>
            </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationHeader
        application={application}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onShare={handleShareApplication}
        onExport={handleExportToPDF}
        onEdit={openEditApplication}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

      <ApplicationStats
        application={application}
        interviewCount={interviews.length}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab application={application} />
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <InterviewsTab
            interviews={interviews}
            onAddInterview={openNewInterview}
            onEditInterview={openEditInterview}
            onDeleteInterview={handleDeleteInterview}
          />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <NotesTab
            notes={notes}
            filteredNotes={filteredNotes}
            noteFilter={noteFilter}
            noteTypes={noteTypes}
            onFilterChange={(filter) => setNoteFilter(filter)}
            onAddNote={openNewNote}
            onEditNote={openEditNote}
            onDeleteNote={handleDeleteNote}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ContactsTab
            contacts={contacts}
            onAddContact={openNewContact}
            onEditContact={openEditContact}
            onDeleteContact={handleDeleteContact}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsTab
            documents={documents}
            onUploadDocument={() => setIsDocumentModalOpen(true)}
            onDownloadDocument={(document) => {
              // Handle download
              console.log('Download document:', document);
            }}
            onDeleteDocument={(id) => {
              // Handle delete
              console.log('Delete document:', id);
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoryTab statusHistory={statusHistory} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        editingNote={editingNote}
        noteTitle={noteTitle}
        noteType={noteType}
        noteTypes={noteTypes}
        onTitleChange={setNoteTitle}
        onTypeChange={setNoteType}
        onSave={handleSaveNote}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        editingInterview={editingInterview}
        interviewDate={interviewDate}
        interviewType={interviewType}
        interviewerName={interviewerName}
        interviewerPosition={interviewerPosition}
        interviewLocation={interviewLocation}
        meetingLink={meetingLink}
        interviewNotes={interviewNotes}
        interviewTypes={interviewTypes}
        onDateChange={setInterviewDate}
        onTypeChange={setInterviewType}
        onInterviewerNameChange={setInterviewerName}
        onInterviewerPositionChange={setInterviewerPosition}
        onLocationChange={setInterviewLocation}
        onMeetingLinkChange={setMeetingLink}
        onNotesChange={setInterviewNotes}
        onSave={handleSaveInterview}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        editingContact={editingContact}
        contactName={contactName}
        contactPosition={contactPosition}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        contactLinkedin={contactLinkedin}
        contactNotes={contactNotes}
        isPrimaryContact={isPrimaryContact}
        onNameChange={setContactName}
        onPositionChange={setContactPosition}
        onEmailChange={setContactEmail}
        onPhoneChange={setContactPhone}
        onLinkedinChange={setContactLinkedin}
        onNotesChange={setContactNotes}
        onPrimaryContactChange={setIsPrimaryContact}
        onSave={handleSaveContact}
      />

      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onUpload={() => {
          // Handle upload
          console.log('Upload document');
        }}
      />

      <EditApplicationModal
        isOpen={isEditApplicationModalOpen}
        onClose={() => setIsEditApplicationModalOpen(false)}
        companyName={companyName}
        position={position}
        location={location}
        jobUrl={jobUrl}
        status={status}
        priority={priority}
        salaryMin={salaryMin}
        salaryMax={salaryMax}
        applicationDate={applicationDate}
        responseDate={responseDate}
        jobDescription={jobDescription}
        requirements={requirements}
        applicationStatuses={applicationStatuses}
        priorities={priorities}
        onCompanyNameChange={setCompanyName}
        onPositionChange={setPosition}
        onLocationChange={setLocation}
        onJobUrlChange={setJobUrl}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSalaryMinChange={setSalaryMin}
        onSalaryMaxChange={setSalaryMax}
        onApplicationDateChange={setApplicationDate}
        onResponseDateChange={setResponseDate}
        onJobDescriptionChange={setJobDescription}
        onRequirementsChange={setRequirements}
        onSave={() => {
          // Handle save application
          toast.success('Application updated successfully');
          setIsEditApplicationModalOpen(false);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteApplication}
      />
    </div>
  );
}
