'use client';

import { useEffect, useState } from 'react';

/**
 * Format relative time (e.g., "2 hours ago")
 * This is a client-only function to avoid hydration mismatches
 */
function formatRelativeTimeInternal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'práve teraz';
  if (diffInSeconds < 3600) return `pred ${Math.floor(diffInSeconds / 60)} minútami`;
  if (diffInSeconds < 86400) return `pred ${Math.floor(diffInSeconds / 3600)} hodinami`;
  if (diffInSeconds < 604800) return `pred ${Math.floor(diffInSeconds / 86400)} dňami`;
  if (diffInSeconds < 2592000) return `pred ${Math.floor(diffInSeconds / 604800)} týždňami`;
  if (diffInSeconds < 31536000) return `pred ${Math.floor(diffInSeconds / 2592000)} mesiacmi`;
  return `pred ${Math.floor(diffInSeconds / 31536000)} rokmi`;
}

/**
 * Format date for server-side rendering (stable output)
 */
function formatDateStatic(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

/**
 * Client component that displays relative time without hydration mismatch.
 * Shows formatted date on server, then updates to relative time on client.
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On server and initial client render, show static date to avoid hydration mismatch
  // After mount, show relative time
  const displayText = mounted
    ? formatRelativeTimeInternal(date)
    : formatDateStatic(date);

  return (
    <span className={className} suppressHydrationWarning>
      {displayText}
    </span>
  );
}
