"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Download, 
  Edit3, 
  Trash2, 
  Star
} from 'lucide-react';
import Link from 'next/link';
import type { Application, ApplicationStatus, Priority } from '@/lib/types';

interface ApplicationHeaderProps {
  application: Application;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onExport: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApplicationHeader({
  application,
  isFavorite,
  onToggleFavorite,
  onShare,
  onExport,
  onEdit,
  onDelete,
}: ApplicationHeaderProps) {
  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Interview: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Link href="/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {application.companyName}
            </h2>
            <p className="text-muted-foreground">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className={isFavorite ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status and Priority Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className={getStatusColor(application.status)} variant="secondary">
          {application.status}
        </Badge>
        <Badge className={getPriorityColor(application.priority)} variant="secondary">
          {application.priority} Priority
        </Badge>
        {isFavorite && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Star className="h-3 w-3 mr-1" />
            Favorite
          </Badge>
        )}
      </div>
    </>
  );
}
