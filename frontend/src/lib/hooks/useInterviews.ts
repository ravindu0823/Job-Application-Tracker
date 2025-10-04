import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Interview } from '../types';

/**
 * Fetch all interviews
 */
export const useInterviews = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const response = await api.get<Interview[]>('/interviews');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch interviews for a specific application
 */
export const useApplicationInterviews = (applicationId: number) => {
  return useQuery({
    queryKey: ['interviews', 'application', applicationId],
    queryFn: async () => {
      const response = await api.get<Interview[]>(`/applications/${applicationId}/interviews`);
      return response.data;
    },
    enabled: !!applicationId,
  });
};

/**
 * Fetch single interview by ID
 */
export const useInterview = (interviewId: number) => {
  return useQuery({
    queryKey: ['interviews', interviewId],
    queryFn: async () => {
      const response = await api.get<Interview>(`/interviews/${interviewId}`);
      return response.data;
    },
    enabled: !!interviewId,
  });
};

/**
 * Create new interview
 */
export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Interview>) => {
      const response = await api.post<Interview>('/interviews', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch interviews
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

/**
 * Update interview
 */
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Interview> }) => {
      const response = await api.put<Interview>(`/interviews/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific interview and list
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

/**
 * Delete interview
 */
export const useDeleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/interviews/${id}`);
    },
    onSuccess: () => {
      // Invalidate interviews list
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

/**
 * Reschedule interview (update date/time)
 */
export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newDate }: { id: number; newDate: string }) => {
      const response = await api.patch<Interview>(`/interviews/${id}/reschedule`, {
        interviewDate: newDate,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};
