import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm md:text-base text-neutral-500">
          Track your job search progress and insights
        </p>
      </div>

      {/* Stats Cards - Mobile optimized */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">33%</div>
            <p className="text-xs text-neutral-500">
              8 responses from 24 applications
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Interview Rate</CardTitle>
            <Target className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">25%</div>
            <p className="text-xs text-neutral-500">
              6 interviews from 24 applications
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Offer Rate</CardTitle>
            <Award className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">8%</div>
            <p className="text-xs text-neutral-500">
              2 offers from 24 applications
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Response Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">5 days</div>
            <p className="text-xs text-neutral-500">
              From application to response
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-base md:text-lg font-semibold mb-2 text-center">Detailed Analytics Coming Soon</h3>
          <p className="text-sm md:text-base text-neutral-500 text-center max-w-md px-4">
            Advanced charts and visualizations including timeline graphs, status distributions,
            and salary insights will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
