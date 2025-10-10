"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, MapPin, Calendar, Columns, Rows } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Application, ApplicationStatus, Priority } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ApplicationForm } from '@/components/forms/application-form';
import { useCreateApplication } from '@/lib/mutations';
import { FormErrorBoundary } from '@/components/error-boundary';
import type { ApplicationFormData } from '@/lib/validation';

export default function ApplicationsPage() {
  // Mock data - will be replaced with real API calls
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      companyName: 'Tech Company Inc.',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      status: 'Applied',
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
      status: 'Rejected',
      priority: 'Low',
      applicationDate: '2025-02-20',
      createdAt: '2025-02-20T00:00:00Z',
      updatedAt: '2025-02-20T00:00:00Z',
    },
  ]);

  const createApplicationMutation = useCreateApplication();

  function handleAddApplication(data: ApplicationFormData) {
    // In production, this would call the API
    // For now, we'll use local state
    const newApplication: Application = {
      id: (applications.at(-1)?.id || 0) + 1,
      companyName: data.companyName,
      position: data.position,
      location: data.location,
      jobUrl: data.jobUrl,
      status: data.status,
      priority: data.priority,
      salary: data.salary,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      applicationDate: data.applicationDate,
      responseDate: data.responseDate,
      offerDate: data.offerDate,
      jobDescription: data.jobDescription,
      requirements: data.requirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setApplications((prev) => [newApplication, ...prev]);
    setIsAddOpen(false);
    
    // Uncomment this when API is connected:
    // createApplicationMutation.mutate(data, {
    //   onSuccess: () => {
    //     setIsAddOpen(false);
    //   },
    // });
  }

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      Applied: 'bg-blue-100 text-blue-800',
      Interview: 'bg-yellow-100 text-yellow-800',
      Offer: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-orange-100 text-orange-800',
      Low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) return applications;
    
    const term = searchTerm.toLowerCase();
    return applications.filter(app => 
      app.companyName.toLowerCase().includes(term) ||
      app.position.toLowerCase().includes(term) ||
      app.location?.toLowerCase().includes(term)
    );
  }, [applications, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-sm md:text-base text-neutral-500">
            Manage all your job applications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="Switch to list view"
              className="touch-manipulation min-h-[44px]"
            >
              <Rows className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">List</span>
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('kanban')}
              aria-pressed={viewMode === 'kanban'}
              aria-label="Switch to kanban view"
              className="touch-manipulation min-h-[44px]"
            >
              <Columns className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Kanban</span>
            </Button>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Add new job application" className="touch-manipulation min-h-[44px]">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Add Application</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Application</DialogTitle>
              </DialogHeader>
              <FormErrorBoundary>
                <ApplicationForm
                  onSubmit={handleAddApplication}
                  onCancel={() => setIsAddOpen(false)}
                  isLoading={createApplicationMutation.isPending}
                />
              </FormErrorBoundary>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter - Mobile optimized */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by company or position..."
            className="pl-8 touch-manipulation min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="touch-manipulation min-h-[44px]">Filter</Button>
      </div>

      {/* Applications Grid/Kanban - Mobile optimized */}
      {viewMode === 'list' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer touch-manipulation active:scale-[0.98]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">{app.companyName}</CardTitle>
                      <p className="text-sm font-medium text-neutral-700 truncate">
                        {app.position}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(app.priority)} variant="secondary">
                      {app.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-500">
                    <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-neutral-500">
                    <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span>Applied: {formatDate(app.applicationDate)}</span>
                  </div>
                  <div className="mt-4">
                    <Badge className={getStatusColor(app.status)} variant="secondary">
                      {app.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {(['Applied','Interview','Offer','Rejected'] as const).map((col) => (
            <Card key={col}>
              <CardHeader>
                <CardTitle className="text-sm">{col}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredApplications.filter((a) => a.status === col).map((app) => (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <div className="border rounded-md p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer touch-manipulation active:scale-[0.98]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate flex-1">{app.companyName}</span>
                        <Badge className={getPriorityColor(app.priority)} variant="secondary">{app.priority}</Badge>
                      </div>
                      <p className="text-xs text-neutral-600 truncate">{app.position}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
