"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema, type SettingsFormData } from '@/lib/validation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsFormProps {
  settings?: SettingsFormData;
  onSubmit: (data: SettingsFormData) => void;
  isLoading?: boolean;
}

export function SettingsForm({ settings, onSubmit, isLoading }: SettingsFormProps) {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
      enableReminders: true,
      showSalaryFields: false,
      weeklySummaryEmail: true,
      browserNotifications: false,
      defaultApplicationStatus: 'Applied',
      defaultPriority: 'Medium',
      reminderDaysBefore: 1,
      theme: 'system',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure your job tracker preferences and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Reminders */}
            <FormField
              control={form.control}
              name="enableReminders"
              render={({ field }) => (
                <FormItem>
                  <label 
                    htmlFor="enableReminders"
                    className="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">Enable Reminders</FormLabel>
                      <FormDescription>
                        Receive reminders for upcoming interviews and follow-ups
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        id="enableReminders"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label="Enable reminders"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </FormControl>
                  </label>
                </FormItem>
              )}
            />

            {/* Reminder Days Before */}
            {form.watch('enableReminders') && (
              <FormField
                control={form.control}
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Days Before</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      How many days before an interview should we remind you?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Show Salary Fields */}
            <FormField
              control={form.control}
              name="showSalaryFields"
              render={({ field }) => (
                <FormItem>
                  <label 
                    htmlFor="showSalaryFields"
                    className="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">Show Salary Fields</FormLabel>
                      <FormDescription>
                        Display salary fields by default when creating applications
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        id="showSalaryFields"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label="Show salary fields by default"
                        className=" rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </FormControl>
                  </label>
                </FormItem>
              )}
            />

            {/* Default Application Status */}
            <FormField
              control={form.control}
              name="defaultApplicationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Application Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default status when creating new applications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default Priority */}
            <FormField
              control={form.control}
              name="defaultPriority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default priority when creating new applications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Theme */}
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred color theme
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Summary Email */}
            <FormField
              control={form.control}
              name="weeklySummaryEmail"
              render={({ field }) => (
                <FormItem>
                  <label 
                    htmlFor="weeklySummaryEmail"
                    className="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">Weekly Summary Email</FormLabel>
                      <FormDescription>
                        Receive a weekly summary of your applications and interviews
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        id="weeklySummaryEmail"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label="Enable weekly summary email"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </FormControl>
                  </label>
                </FormItem>
              )}
            />

            {/* Browser Notifications */}
            <FormField
              control={form.control}
              name="browserNotifications"
              render={({ field }) => (
                <FormItem>
                  <label 
                    htmlFor="browserNotifications"
                    className="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">Browser Notifications</FormLabel>
                      <FormDescription>
                        Get browser notifications for important updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        id="browserNotifications"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        aria-label="Enable browser notifications"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </FormControl>
                  </label>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
