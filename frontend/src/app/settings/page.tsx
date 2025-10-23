"use client";

import { useState } from 'react';
import { SettingsForm } from '@/components/forms/settings-form';
import type { SettingsFormData } from '@/lib/validation';
import { toast } from 'sonner';
import { FormErrorBoundary } from '@/components/error-boundary';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Default settings - in production, fetch from API/localStorage
  const defaultSettings: SettingsFormData = {
    enableReminders: true,
    showSalaryFields: false,
    weeklySummaryEmail: true,
    browserNotifications: false,
    defaultApplicationStatus: 'Applied',
    defaultPriority: 'Medium',
    reminderDaysBefore: 1,
    theme: 'system',
  };

  const handleSaveSettings = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, save to API/localStorage
      localStorage.setItem('appSettings', JSON.stringify(data));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="p-6 md:p-10 lg:p-16 bg-gray-50 dark:bg-black min-h-screen transition-colors duration-500"
    >
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-gray-100 transition-colors duration-300">
          Settings
        </h1>
        <p className="mt-2 text-lg md:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
          Configure preferences for your job tracker to suit your workflow.
        </p>
      </div>

      {/* Form Container */}
      <FormErrorBoundary>
        <SettingsForm
          settings={defaultSettings}
          onSubmit={handleSaveSettings}
          isLoading={isLoading}
        />
      </FormErrorBoundary>

      {/* Footer/Extra Info */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        All changes are saved locally. Your settings are applied immediately.
      </div>
    </motion.div>
  );
}
