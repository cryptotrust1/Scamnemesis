'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Domov', href: '/' },
  { name: 'Vyhľadávanie', href: '/search' },
  { name: 'Nahlásiť podvod', href: '/report/new' },
  { name: 'O projekte', href: '/about' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Scamnemesis</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex mx-6 flex-1 items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Vyhľadávanie</span>
            </Link>
          </Button>

          {/* User Menu / Login */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/auth/login">
              <User className="h-5 w-5" />
              <span className="sr-only">Účet</span>
            </Link>
          </Button>

          {/* Report Button */}
          <Button asChild className="hidden md:inline-flex">
            <Link href="/report/new">Nahlásiť podvod</Link>
          </Button>

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
