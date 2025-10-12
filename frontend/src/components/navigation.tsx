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
    <div className="space-y-4 py-4 flex flex-col h-full bg-neutral-900 text-white relative">
      <div className="flex items-center px-3 mb-6">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold">Job Tracker</h1>
        </Link>
      </div>

      <div className="space-y-1 flex-1 px-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
              pathname === route.href ? 'text-white bg-white/10' : 'text-neutral-400'
            )}
          >
            <div className="flex items-center flex-5">
              <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-5 right-5">
        <ThemeToggle />
      </div>
    </div>
  );
}
