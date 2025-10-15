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
        {/** Total Applications */}
        <Card className="group touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium transition-colors duration-500 ease-in-out group-hover:text-blue-600">
              Total Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-neutral-500 transition-colors duration-500 ease-in-out group-hover:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold transition-all duration-700 ease-out group-hover:translate-y-[-3px]">
              {stats.totalApplications}
            </div>
            <p className="text-xs text-neutral-500 transition-colors duration-500 ease-in-out group-hover:text-neutral-700">
              All time applications
            </p>
          </CardContent>
        </Card>

        {/** Active Applications */}
        <Card className="group touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium transition-colors duration-500 ease-in-out group-hover:text-blue-600">
              Active Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold transition-all duration-700 ease-out group-hover:translate-y-[-3px]">
              {stats.activeApplications}
            </div>
            <p className="text-xs text-neutral-500 transition-colors duration-500 ease-in-out group-hover:text-neutral-700">
              In progress
            </p>
          </CardContent>
        </Card>

        {/** Interviews Scheduled */}
        <Card className="group touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium transition-colors duration-500 ease-in-out group-hover:text-yellow-600">
              Interviews Scheduled
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500 transition-colors duration-500 ease-in-out group-hover:text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold transition-all duration-700 ease-out group-hover:translate-y-[-3px]">
              {stats.interviews}
            </div>
            <p className="text-xs text-neutral-500 transition-colors duration-500 ease-in-out group-hover:text-neutral-700">
              Upcoming interviews
            </p>
          </CardContent>
        </Card>

        {/** Offers Received */}
        <Card className="group touch-manipulation bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium transition-colors duration-500 ease-in-out group-hover:text-green-600">
              Offers Received
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500 transition-colors duration-500 ease-in-out group-hover:text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold transition-all duration-700 ease-out group-hover:translate-y-[-3px]">
              {stats.offers}
            </div>
            <p className="text-xs text-neutral-500 transition-colors duration-500 ease-in-out group-hover:text-neutral-700">
              Job offers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/** Recent Applications */}
        <Card className="md:col-span-1 lg:col-span-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Software Engineer', company: 'Tech Company Inc.', status: 'Applied', color: 'blue' },
                { title: 'Frontend Developer', company: 'Startup XYZ', status: 'Interview', color: 'yellow' },
                { title: 'Full Stack Engineer', company: 'Enterprise Corp', status: 'Offer', color: 'green' },
              ].map((app, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-700 ease-in-out cursor-pointer"
                >
                  <div className="ml-4 space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{app.title}</p>
                    <p className="text-sm text-neutral-500 truncate">{app.company}</p>
                  </div>
                  <div className="ml-auto font-medium flex-shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-${app.color}-800 bg-${app.color}-100 transition-all duration-700 ease-in-out transform hover:scale-110`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/** Upcoming Interviews */}
        <Card className="md:col-span-1 lg:col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-700 ease-in-out rounded-lg hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Technical Interview', time: 'Tomorrow at 2:00 PM' },
                { title: 'HR Round', time: 'Friday at 10:00 AM' },
              ].map((interview, idx) => (
                <div
                  key={idx}
                  className="flex flex-col space-y-1 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-700 ease-in-out cursor-pointer"
                >
                  <p className="text-sm font-medium leading-none">{interview.title}</p>
                  <p className="text-sm text-neutral-500">{interview.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
