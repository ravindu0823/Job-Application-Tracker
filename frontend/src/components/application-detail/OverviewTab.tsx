"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import type { Application } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface OverviewTabProps {
  application: Application;
}

export function OverviewTab({ application }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {application.jobDescription}
            </p>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
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
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {application.requirements}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <p className="text-sm">{application.companyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Position</label>
              <p className="text-sm">{application.position}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Application Date</label>
              <p className="text-sm">{formatDate(application.applicationDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Response Date</label>
              <p className="text-sm">{application.responseDate ? formatDate(application.responseDate) : 'No response yet'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
