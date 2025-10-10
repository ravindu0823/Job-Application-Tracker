"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users2, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle
} from 'lucide-react';
import type { Interview } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface InterviewsTabProps {
  interviews: Interview[];
  onAddInterview: () => void;
  onEditInterview: (interview: Interview) => void;
  onDeleteInterview: (id: number) => void;
}

export function InterviewsTab({ 
  interviews, 
  onAddInterview, 
  onEditInterview, 
  onDeleteInterview 
}: InterviewsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Interview Schedule</h3>
        <Button onClick={onAddInterview}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>
      
      {interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{interview.interviewType} Interview</CardTitle>
                    {interview.reminderSent && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reminder Sent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditInterview(interview)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteInterview(interview.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDateTime(interview.interviewDate)}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {interview.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Users2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    {interview.interviewerName}
                  </div>
                  {interview.interviewerPosition && (
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground">{interview.interviewerPosition}</span>
                    </div>
                  )}
                </div>
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    Join Meeting
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
                {interview.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm">{interview.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No interviews scheduled yet</p>
            <Button className="mt-4" onClick={onAddInterview}>
              Schedule Your First Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
