'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Settings page - redirects to profile page
 * The profile page contains all user settings functionality
 */
export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page which contains all settings
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0E74FF]" />
        <p className="text-slate-600">Redirecting to profile...</p>
      </div>
    </div>
  );
}
