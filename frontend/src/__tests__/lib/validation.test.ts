import { describe, it, expect } from 'vitest';
import {
  applicationSchema,
  interviewSchema,
  noteSchema,
  contactSchema,
  settingsSchema,
  searchFiltersSchema,
} from '../../lib/validation';

describe('Validation Schemas', () => {
  describe('applicationSchema', () => {
    it('should validate correct application data', () => {
      const validData = {
        companyName: 'Tech Corp',
        position: 'Software Engineer',
        location: 'San Francisco, CA',
        jobUrl: 'https://example.com/job',
        status: 'Applied' as const,
        priority: 'High' as const,
        salary: 120000,
        salaryMin: 110000,
        salaryMax: 130000,
        applicationDate: '2025-01-15',
        responseDate: '2025-01-20',
        offerDate: '',
        jobDescription: 'Great opportunity',
        requirements: 'React, TypeScript',
      };

      const result = applicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        companyName: '',
        position: 'Software Engineer',
        status: 'Applied' as const,
        priority: 'High' as const,
        applicationDate: '2025-01-15',
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            message: 'Company name is required',
            path: ['companyName'],
          })
        );
      }
    });

    it('should reject when company name exceeds max length', () => {
      const invalidData = {
        companyName: 'A'.repeat(101),
        position: 'Software Engineer',
        status: 'Applied' as const,
        priority: 'High' as const,
        applicationDate: '2025-01-15',
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters');
      }
    });

    it('should validate salary min/max relationship', () => {
      const invalidData = {
        companyName: 'Tech Corp',
        position: 'Software Engineer',
        status: 'Applied' as const,
        priority: 'High' as const,
        salaryMin: 150000,
        salaryMax: 100000, // Max less than min
        applicationDate: '2025-01-15',
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Minimum salary must be less than or equal to maximum salary'
        );
      }
    });

    it('should accept valid URL or empty string for jobUrl', () => {
      const validWithUrl = {
        companyName: 'Tech Corp',
        position: 'Software Engineer',
        status: 'Applied' as const,
        priority: 'High' as const,
        applicationDate: '2025-01-15',
        jobUrl: 'https://example.com/job',
      };

      const validWithEmpty = {
        ...validWithUrl,
        jobUrl: '',
      };

      expect(applicationSchema.safeParse(validWithUrl).success).toBe(true);
      expect(applicationSchema.safeParse(validWithEmpty).success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidData = {
        companyName: 'Tech Corp',
        position: 'Software Engineer',
        status: 'Applied' as const,
        priority: 'High' as const,
        applicationDate: '2025-01-15',
        jobUrl: 'not-a-valid-url',
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('interviewSchema', () => {
    it('should validate correct interview data', () => {
      const validData = {
        applicationId: 1,
        interviewDate: '2025-01-20T14:00:00',
        interviewType: 'Technical' as const,
        duration: 60,
        interviewerName: 'John Doe',
        interviewerPosition: 'Senior Engineer',
        location: 'Virtual',
        meetingLink: 'https://zoom.us/j/123456',
        notes: 'Prepare for coding challenge',
        outcome: 'Passed',
      };

      const result = interviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        applicationId: 1,
        interviewType: 'Technical' as const,
      };

      const result = interviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            message: 'Interview date is required',
          })
        );
      }
    });

    it('should validate duration constraints', () => {
      const tooLong = {
        applicationId: 1,
        interviewDate: '2025-01-20T14:00:00',
        interviewType: 'Technical' as const,
        duration: 500, // More than 8 hours (480 minutes)
      };

      const result = interviewSchema.safeParse(tooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 8 hours');
      }
    });

    it('should accept valid interview types', () => {
      const types: Array<'Phone' | 'Video' | 'Onsite' | 'Technical' | 'HR' | 'Final'> = ['Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Final'];
      
      types.forEach(type => {
        const data = {
          applicationId: 1,
          interviewDate: '2025-01-20T14:00:00',
          interviewType: type,
        };
        
        const result = interviewSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('noteSchema', () => {
    it('should validate correct note data', () => {
      const validData = {
        applicationId: 1,
        title: 'Company Research',
        content: 'This is a detailed note about the company.',
        noteType: 'Research' as const,
      };

      const result = noteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title or content', () => {
      const invalidData = {
        applicationId: 1,
        title: '',
        content: '',
        noteType: 'Research' as const,
      };

      const result = noteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should validate title length constraints', () => {
      const tooLong = {
        applicationId: 1,
        title: 'A'.repeat(201),
        content: 'Valid content',
        noteType: 'Research' as const,
      };

      const result = noteSchema.safeParse(tooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 200 characters');
      }
    });

    it('should validate content length constraints', () => {
      const tooLong = {
        applicationId: 1,
        title: 'Valid Title',
        content: 'A'.repeat(10001),
        noteType: 'Research' as const,
      };

      const result = noteSchema.safeParse(tooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 10000 characters');
      }
    });
  });

  describe('contactSchema', () => {
    it('should validate correct contact data', () => {
      const validData = {
        applicationId: 1,
        name: 'Jane Smith',
        position: 'HR Manager',
        email: 'jane@example.com',
        phone: '+1-555-0123',
        linkedin: 'https://linkedin.com/in/janesmith',
        notes: 'Very responsive',
        isPrimaryContact: true,
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const invalidData = {
        applicationId: 1,
        name: '',
        email: 'jane@example.com',
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
      const invalidEmail = {
        applicationId: 1,
        name: 'Jane Smith',
        email: 'not-an-email',
      };

      const result = contactSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('should accept empty string for optional email', () => {
      const validData = {
        applicationId: 1,
        name: 'Jane Smith',
        email: '',
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate LinkedIn URL', () => {
      const invalidUrl = {
        applicationId: 1,
        name: 'Jane Smith',
        linkedin: 'not-a-url',
      };

      const result = contactSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('settingsSchema', () => {
    it('should validate correct settings data', () => {
      const validData = {
        enableReminders: true,
        showSalaryFields: false,
        weeklySummaryEmail: true,
        browserNotifications: false,
        defaultApplicationStatus: 'Applied' as const,
        defaultPriority: 'Medium' as const,
        reminderDaysBefore: 1,
        theme: 'system' as const,
      };

      const result = settingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate reminderDaysBefore constraints', () => {
      const tooHigh = {
        enableReminders: true,
        showSalaryFields: false,
        weeklySummaryEmail: true,
        browserNotifications: false,
        defaultApplicationStatus: 'Applied' as const,
        defaultPriority: 'Medium' as const,
        reminderDaysBefore: 31,
        theme: 'system' as const,
      };

      const result = settingsSchema.safeParse(tooHigh);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('30 days or less');
      }
    });

    it('should reject negative reminderDaysBefore', () => {
      const negative = {
        enableReminders: true,
        showSalaryFields: false,
        weeklySummaryEmail: true,
        browserNotifications: false,
        defaultApplicationStatus: 'Applied' as const,
        defaultPriority: 'Medium' as const,
        reminderDaysBefore: -1,
        theme: 'system' as const,
      };

      const result = settingsSchema.safeParse(negative);
      expect(result.success).toBe(false);
    });
  });

  describe('searchFiltersSchema', () => {
    it('should validate correct filter data', () => {
      const validData = {
        search: 'engineer',
        status: ['Applied', 'Interview'] as const,
        priority: ['High'] as const,
        dateRange: {
          from: '2025-01-01',
          to: '2025-01-31',
        },
        salaryRange: {
          min: 100000,
          max: 150000,
        },
        location: ['San Francisco', 'Remote'],
        hasInterviews: true,
      };

      const result = searchFiltersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate date range', () => {
      const invalidDates = {
        search: '',
        status: [],
        priority: [],
        dateRange: {
          from: '2025-01-31',
          to: '2025-01-01', // End before start
        },
        salaryRange: {},
        location: [],
      };

      const result = searchFiltersSchema.safeParse(invalidDates);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Start date must be before');
      }
    });

    it('should validate salary range', () => {
      const invalidSalary = {
        search: '',
        status: [],
        priority: [],
        dateRange: {},
        salaryRange: {
          min: 150000,
          max: 100000, // Max less than min
        },
        location: [],
      };

      const result = searchFiltersSchema.safeParse(invalidSalary);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Minimum salary must be less than or equal to maximum salary'
        );
      }
    });

    it('should accept empty arrays and optional fields', () => {
      const minimalData = {
        search: '',
        status: [],
        priority: [],
        dateRange: {},
        salaryRange: {},
        location: [],
      };

      const result = searchFiltersSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });
});
