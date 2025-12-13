'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const primaryNav = [
  { name: 'Scam Checker', href: '/search' },
  { name: 'Report Scam', href: '/report/new' },
  { name: 'I was scammed', href: '/i-was-scammed-need-help' },
];

const secondaryNav = [
  { name: 'Verify service/product', href: '/verify-serviceproduct' },
  { name: 'Scam Prevention', href: '/scam-prevention' },
  { name: 'Scammer Removal', href: '/scammer-removal' },
  { name: 'Money Recovery', href: '/money-recovery' },
  { name: 'Training Courses', href: '/training-courses' },
  { name: 'Support us', href: '/support-us' },
  { name: 'Contact us', href: '/contact-us' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'sk', name: 'Slovenčina' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo-scam-blue.png"
            alt="ScamNemesis"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {/* Primary Nav */}
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-[#0E74FF] text-white'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Others Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOthersOpen(!othersOpen)}
              onBlur={() => setTimeout(() => setOthersOpen(false), 150)}
              className={cn(
                'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'text-foreground hover:bg-muted'
              )}
            >
              Others
              <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', othersOpen && 'rotate-180')} />
            </button>
            {othersOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-background border rounded-lg shadow-lg py-2 z-50">
                {secondaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block px-4 py-2 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-[#0E74FF] text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              onBlur={() => setTimeout(() => setLangOpen(false), 150)}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              {languages.find(l => l.code === currentLang)?.name}
              <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-background border rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setLangOpen(false);
                    }}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      currentLang === lang.code
                        ? 'bg-[#0E74FF] text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Report Button */}
          <Button asChild className="hidden md:inline-flex bg-[#0E74FF] hover:bg-[#0E74FF]/90">
            <Link href="/report/new">Report Scam</Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container py-4 space-y-1">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[#0E74FF] text-white'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t my-2" />
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[#0E74FF] text-white'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t my-2" />
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground mb-2">Language</p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      currentLang === lang.code
                        ? 'bg-[#0E74FF] text-white'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
