'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-blue-500',
  },
  {
    label: 'Applications',
    icon: Briefcase,
    href: '/applications',
    color: 'text-violet-500',
  },
  {
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar',
    color: 'text-pink-700',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-orange-700',
  },
  {
    label: 'Templates',
    icon: FileText,
    href: '/templates',
    color: 'text-green-700',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-700',
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full relative bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-800">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Job Tracker
          </h1>
        </Link>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition hover:bg-black/5 hover:text-neutral-900 active:bg-black/10 active:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white dark:active:bg-white/20 dark:active:text-white',
                pathname === route.href
                  ? 'bg-black/5 text-neutral-900 dark:bg-white/10 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="absolute bottom-5 right-5">
        <ThemeToggle />
      </div>
    </div>
  );
}