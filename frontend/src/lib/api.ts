import axios, { AxiosError, AxiosResponse } from 'axios';
import type { Application, Interview, Note, Statistics } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        // Unauthorized - redirect to login or clear token
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.error('Forbidden: You do not have permission to access this resource');
      } else if (error.response.status >= 500) {
        console.error('Server Error: Please try again later');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: Please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Applications
  getApplications: (): Promise<Application[]> => 
    api.get('/applications').then(res => res.data),
  
  getApplication: (id: number): Promise<Application> => 
    api.get(`/applications/${id}`).then(res => res.data),
  
  createApplication: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> => 
    api.post('/applications', data).then(res => res.data),
  
  updateApplication: (id: number, data: Partial<Application>): Promise<Application> => 
    api.put(`/applications/${id}`, data).then(res => res.data),
  
  deleteApplication: (id: number): Promise<void> => 
    api.delete(`/applications/${id}`).then(() => {}),
  
  // Interviews
  getInterviews: (applicationId?: number): Promise<Interview[]> => {
    const url = applicationId ? `/interviews?applicationId=${applicationId}` : '/interviews';
    return api.get(url).then(res => res.data);
  },
  
  getInterviewsByDateRange: (startDate: string, endDate: string): Promise<Interview[]> => 
    api.get(`/interviews?startDate=${startDate}&endDate=${endDate}`).then(res => res.data),
  
  createInterview: (data: Omit<Interview, 'id' | 'createdAt'>): Promise<Interview> => 
    api.post('/interviews', data).then(res => res.data),
  
  updateInterview: (id: number, data: Partial<Interview>): Promise<Interview> => 
    api.put(`/interviews/${id}`, data).then(res => res.data),
  
  deleteInterview: (id: number): Promise<void> => 
    api.delete(`/interviews/${id}`).then(() => {}),
  
  // Notes
  getNotes: (applicationId: number): Promise<Note[]> => 
    api.get(`/notes?applicationId=${applicationId}`).then(res => res.data),
  
  createNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => 
    api.post('/notes', data).then(res => res.data),
  
  updateNote: (id: number, data: Partial<Note>): Promise<Note> => 
    api.put(`/notes/${id}`, data).then(res => res.data),
  
  deleteNote: (id: number): Promise<void> => 
    api.delete(`/notes/${id}`).then(() => {}),
  
  // Statistics
  getStatistics: (): Promise<Statistics> => 
    api.get('/statistics').then(res => res.data),
};
