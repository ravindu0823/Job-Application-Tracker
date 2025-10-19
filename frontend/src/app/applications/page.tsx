"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin, Calendar, Columns, Rows, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Application, ApplicationStatus, Priority } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ApplicationForm } from "@/components/forms/application-form";
import { useCreateApplication } from "@/lib/mutations";
import { FormErrorBoundary } from "@/components/error-boundary";
import type { ApplicationFormData } from "@/lib/validation";
import { AnimatePresence, motion } from "framer-motion";

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Applied" | "Interview" | "Offer" | "Rejected"
  >("All");
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
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-orange-100 text-orange-800',
      Low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // ✅ Combined Search + Filter Logic
  const filteredApplications = useMemo(() => {
    let result = applications;

    if (filter !== "All") {
      result = result.filter((app) => app.status === filter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.companyName.toLowerCase().includes(term) ||
          app.position.toLowerCase().includes(term) ||
          app.location?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [applications, filter, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Applications
          </h2>
          <p className="text-sm md:text-base text-neutral-500">
            Manage all your job applications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="touch-manipulation min-h-[44px] transition-all duration-500 ease-in-out hover:scale-105 active:scale-95"
            >
              <Rows className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">List</span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="touch-manipulation min-h-[44px] transition-all duration-500 ease-in-out hover:scale-105 active:scale-95"
            >
              <Columns className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Kanban</span>
            </Button>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="touch-manipulation min-h-[44px] transition-all duration-500 ease-in-out hover:scale-105 active:scale-95">
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

      {/* ✅ Search + Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by company or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 w-full rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
          />
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "All"
                | "Applied"
                | "Interview"
                | "Offer"
                | "Rejected"
            )
          }
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        >
          <option value="All">All</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* ✅ Animated Application Cards */}
      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div
            key={filter + searchTerm}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredApplications.map((app) => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out rounded-lg hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 group-hover:translate-y-[-2px] transition-all duration-500 ease-in-out">
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg truncate group-hover:text-blue-600 transition-colors duration-500 ease-in-out">
                          {app.companyName}
                        </CardTitle>
                        <p className="text-sm font-medium text-neutral-700 truncate group-hover:text-neutral-900 transition-colors duration-500 ease-in-out">
                          {app.position}
                        </p>
                      </div>
                      <Badge
                        className={`${getPriorityColor(
                          app.priority
                        )} group-hover:scale-110 transition-all duration-500 ease-in-out`}
                        variant="secondary"
                      >
                        {app.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors duration-500 ease-in-out">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{app.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors duration-500 ease-in-out">
                      <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span>Applied: {formatDate(app.applicationDate)}</span>
                    </div>
                    <div className="mt-4">
                      <Badge
                        className={`${getStatusColor(
                          app.status
                        )} group-hover:scale-110 transition-all duration-500 ease-in-out`}
                        variant="secondary"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={filter + searchTerm + "-kanban"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
          >
            {(["Applied", "Interview", "Offer", "Rejected"] as const).map(
              (col) => (
                <Card
                  key={col}
                  className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-md shadow-lg rounded-lg hover:shadow-xl transition-all duration-500 ease-in-out"
                >
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      {col}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filteredApplications
                      .filter((a) => a.status === col)
                      .map((app) => (
                        <Link key={app.id} href={`/applications/${app.id}`}>
                          <div className="border rounded-md p-3 bg-white/50 dark:bg-gray-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 shadow-md transition-all duration-500 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate flex-1 hover:text-blue-600 transition-colors duration-500 ease-in-out">
                                {app.companyName}
                              </span>
                              <Badge
                                className={`${getPriorityColor(
                                  app.priority
                                )} hover:scale-110 transition-all duration-500 ease-in-out`}
                                variant="secondary"
                              >
                                {app.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-neutral-600 truncate hover:text-neutral-800 transition-colors duration-500 ease-in-out">
                              {app.position}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </CardContent>
                </Card>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
