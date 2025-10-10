'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Menu,
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

export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <div className="flex flex-col h-full bg-neutral-900 text-white">
            <SheetHeader className="px-6 py-6 border-b border-neutral-800">
              <SheetTitle className="text-left">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
                </Link>
              </SheetTitle>
            </SheetHeader>
            
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center p-3 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-white/10 hover:text-white active:scale-95',
                      'touch-manipulation min-h-[48px]',
                      pathname === route.href
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-400'
                    )}
                  >
                    <route.icon className={cn('h-5 w-5 mr-3 flex-shrink-0', route.color)} />
                    <span>{route.label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="px-6 py-4 border-t border-neutral-800">
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
