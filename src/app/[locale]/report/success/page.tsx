'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Search, FileText, ArrowRight, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ReportSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams?.get('id');
  const [copied, setCopied] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  // Redirect if no report ID
  useEffect(() => {
    if (!reportId) {
      router.push('/report/new');
    }
  }, [reportId, router]);

  // Set report URL on client side to prevent hydration mismatch
  useEffect(() => {
    if (reportId) {
      setReportUrl(`${window.location.origin}/reports/${reportId}`);
    }
  }, [reportId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      toast.success('Odkaz bol skopirovaný');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nepodarilo sa skopírovať odkaz');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hlásenie podvodu - Scamnemesis',
          text: 'Pozrite si toto hlásenie o podvode',
          url: reportUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  if (!reportId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
      <div className="container max-w-2xl py-16 px-4">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Hlásenie bolo odoslané!</h1>
          <p className="text-lg text-muted-foreground">
            Ďakujeme za váš príspevok k ochrane ostatných pred podvodníkmi.
          </p>
        </div>

        {/* Report Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4">Čo sa stane ďalej?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Kontrola hlásenia</p>
                  <p className="text-sm text-muted-foreground">
                    Administrátor skontroluje vaše hlásenie do 24-48 hodín
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Schválenie a zverejnenie</p>
                  <p className="text-sm text-muted-foreground">
                    Po schválení bude hlásenie zverejnené s maskovanými citlivými údajmi
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Varovanie ostatných</p>
                  <p className="text-sm text-muted-foreground">
                    Vaše hlásenie pomôže varovať ostatných pred podobným podvodom
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report ID and Share */}
        <Card className="mb-8 bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ID hlásenia</p>
                <p className="font-mono font-semibold">{reportId}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? 'Skopírované' : 'Kopírovať'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Zdieľať
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Domov
            </Button>
          </Link>

          <Link href="/search" className="block">
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Vyhľadávanie
            </Button>
          </Link>

          <Link href={`/reports/${reportId}`} className="block">
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Zobraziť hlásenie
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Ak ste zadali email, dostanete notifikáciu o stave vášho hlásenia.
          </p>
          <p className="mt-2">
            Máte otázky?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Kontaktujte nás
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
