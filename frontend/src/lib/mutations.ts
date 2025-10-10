import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api';
import type { 
  Application, 
  Interview, 
  Note,
} from './types';
import { toast } from 'sonner';

// Query keys
export const queryKeys = {
  applications: ['applications'] as const,
  application: (id: number) => ['applications', id] as const,
  interviews: (applicationId?: number) => 
    applicationId ? ['interviews', applicationId] : ['interviews'] as const,
  notes: (applicationId: number) => ['notes', applicationId] as const,
  statistics: ['statistics'] as const,
};

// Application mutations
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createApplication(data),
    onMutate: async (newApplication) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.applications });

      // Snapshot previous value
      const previousApplications = queryClient.getQueryData<Application[]>(queryKeys.applications);

      // Optimistically update
      queryClient.setQueryData<Application[]>(queryKeys.applications, (old) => {
        const optimisticApp = {
          ...newApplication,
          id: Date.now(), // temporary ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return old ? [optimisticApp, ...old] : [optimisticApp];
      });

      return { previousApplications };
    },
    onError: (err, newApplication, context) => {
      // Rollback on error
      if (context?.previousApplications) {
        queryClient.setQueryData(queryKeys.applications, context.previousApplications);
      }
      toast.error('Failed to create application');
      console.error('Create application error:', err);
    },
    onSuccess: () => {
      toast.success('Application created successfully');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Application> }) =>
      apiService.updateApplication(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.application(id) });

      const previousApplication = queryClient.getQueryData<Application>(queryKeys.application(id));

      queryClient.setQueryData<Application>(queryKeys.application(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      return { previousApplication };
    },
    onError: (err, { id }, context) => {
      if (context?.previousApplication) {
        queryClient.setQueryData(queryKeys.application(id), context.previousApplication);
      }
      toast.error('Failed to update application');
      console.error('Update application error:', err);
    },
    onSuccess: () => {
      toast.success('Application updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.application(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteApplication(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.applications });

      const previousApplications = queryClient.getQueryData<Application[]>(queryKeys.applications);

      queryClient.setQueryData<Application[]>(queryKeys.applications, (old) => {
        return old ? old.filter((app) => app.id !== id) : old;
      });

      return { previousApplications };
    },
    onError: (err, id, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(queryKeys.applications, context.previousApplications);
      }
      toast.error('Failed to delete application');
      console.error('Delete application error:', err);
    },
    onSuccess: () => {
      toast.success('Application deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });
    },
  });
}

// Interview mutations
export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Interview, 'id' | 'createdAt'>) =>
      apiService.createInterview(data),
    onSuccess: (_, variables) => {
      toast.success('Interview scheduled successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews(variables.applicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews() });
    },
    onError: (err) => {
      toast.error('Failed to schedule interview');
      console.error('Create interview error:', err);
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Interview> }) =>
      apiService.updateInterview(id, data),
    onSuccess: () => {
      toast.success('Interview updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews() });
    },
    onError: (err) => {
      toast.error('Failed to update interview');
      console.error('Update interview error:', err);
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteInterview(id),
    onSuccess: () => {
      toast.success('Interview deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews() });
    },
    onError: (err) => {
      toast.error('Failed to delete interview');
      console.error('Delete interview error:', err);
    },
  });
}

// Note mutations
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createNote(data),
    onSuccess: (_, variables) => {
      toast.success('Note created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(variables.applicationId) });
    },
    onError: (err) => {
      toast.error('Failed to create note');
      console.error('Create note error:', err);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note>; applicationId: number }) =>
      apiService.updateNote(id, data),
    onSuccess: (_, variables) => {
      toast.success('Note updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(variables.applicationId) });
    },
    onError: (err) => {
      toast.error('Failed to update note');
      console.error('Update note error:', err);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; applicationId: number }) =>
      apiService.deleteNote(id),
    onSuccess: (_, variables) => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(variables.applicationId) });
    },
    onError: (err) => {
      toast.error('Failed to delete note');
      console.error('Delete note error:', err);
    },
  });
}
