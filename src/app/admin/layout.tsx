'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Copy,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  History,
  Image,
  Search,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Hlásenia',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Používatelia',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Duplikáty',
    href: '/admin/duplicates',
    icon: Copy,
  },
  {
    title: 'Komentáre',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    title: 'Médiá',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Stránky',
    href: '/admin/pages',
    icon: FileEdit,
  },
  {
    title: 'SEO',
    href: '/admin/seo',
    icon: Search,
  },
  {
    title: 'Audit Log',
    href: '/admin/audit',
    icon: History,
  },
  {
    title: 'Nastavenia',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Admin</span>
            </Link>
          )}
          {collapsed && (
            <Shield className="h-6 w-6 text-primary mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-2">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Späť na web</span>}
          </Link>
        </div>

        {/* Collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-lg font-semibold">
            {sidebarItems.find((item) =>
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            )?.title || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              admin@scamnemesis.com
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
