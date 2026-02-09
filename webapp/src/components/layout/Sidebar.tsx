// src/components/layout/Sidebar.tsx
'use client';

import { usePathname } from 'next/navigation'; // Add this import
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Calendar,
  Settings,
  Target 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname(); // Add this line

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard'
    },
    {
      name: 'Cases',
      href: '/dashboard/cases',
      icon: FolderOpen,
      current: pathname.startsWith('/dashboard/cases')
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
      current: pathname.startsWith('/dashboard/documents')
    },
    {
      name: 'Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
      current: pathname.startsWith('/dashboard/calendar')
    },
    {
      name: 'Case Prep',
      href: '/dashboard/case-prep',
      icon: Target,
      current: pathname.startsWith('/dashboard/case-prep')
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      current: pathname.startsWith('/dashboard/settings')
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">LawMate</h1>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
