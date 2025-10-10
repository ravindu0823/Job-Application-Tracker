import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalApplications: 24,
    activeApplications: 18,
    interviews: 6,
    offers: 2,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-neutral-500">
          Track your job applications and interview progress
        </p>
      </div>

      {/* Stats Cards - Mobile optimized */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-neutral-500">
              All time applications
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Active Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.activeApplications}</div>
            <p className="text-xs text-neutral-500">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Interviews Scheduled
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.interviews}</div>
            <p className="text-xs text-neutral-500">
              Upcoming interviews
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Offers Received
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.offers}</div>
            <p className="text-xs text-neutral-500">
              Job offers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Cards - Mobile stacked */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    Software Engineer
                  </p>
                  <p className="text-sm text-neutral-500 truncate">
                    Tech Company Inc.
                  </p>
                </div>
                <div className="ml-auto font-medium flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Applied
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    Frontend Developer
                  </p>
                  <p className="text-sm text-neutral-500 truncate">
                    Startup XYZ
                  </p>
                </div>
                <div className="ml-auto font-medium flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Interview
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    Full Stack Engineer
                  </p>
                  <p className="text-sm text-neutral-500 truncate">
                    Enterprise Corp
                  </p>
                </div>
                <div className="ml-auto font-medium flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Offer
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Technical Interview
                </p>
                <p className="text-sm text-neutral-500">
                  Tomorrow at 2:00 PM
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  HR Round
                </p>
                <p className="text-sm text-neutral-500">
                  Friday at 10:00 AM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
