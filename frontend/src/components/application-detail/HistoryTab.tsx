"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { StatusHistory } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface HistoryTabProps {
  statusHistory: StatusHistory[];
}

export function HistoryTab({ statusHistory }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Status History</h3>
      
      {statusHistory.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {statusHistory.map((history) => (
                <div key={history.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {history.oldStatus} → {history.newStatus}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(history.changedAt)}
                    </div>
                    {history.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {history.notes}
                      </div>
                    )}
                    {history.changedBy && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Changed by: {history.changedBy}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No status changes recorded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
