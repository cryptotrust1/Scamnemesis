'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type ContactReason = 'general' | 'report_issue' | 'data_request' | 'business' | 'other';

interface FormData {
  name: string;
  email: string;
  reason: ContactReason;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    reason: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const reasonLabels: Record<ContactReason, string> = {
    general: 'Vseobecna otazka',
    report_issue: 'Problem s hlasenim',
    data_request: 'Ziadost o osobne udaje (GDPR)',
    business: 'Obchodna spolupraca',
    other: 'Ine',
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // In production, this would send to an API endpoint
      // For now, simulate a submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        reason: 'general',
        subject: '',
        message: '',
      });
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 px-4">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Spat na hlavnu stranku
        </Button>
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kontaktujte nas</h1>
          <p className="text-muted-foreground">
            Mate otazku alebo potrebujete pomoc? Vyplnte formular a ozveme sa vam co najskor.
          </p>
        </div>

        {/* Quick contact info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@scamnemesis.com" className="text-primary hover:underline">
                info@scamnemesis.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ochrana osobnych udajov
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:privacy@scamnemesis.com" className="text-primary hover:underline">
                privacy@scamnemesis.com
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <Card>
          <CardHeader>
            <CardTitle>Kontaktny formular</CardTitle>
            <CardDescription>
              Vsetky polia oznacene * su povinne
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  Vasa sprava bola uspesne odoslana. Ozveme sa vam co najskor.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-red-800 dark:text-red-200">
                  Pri odosielani spravy nastala chyba. Skuste to prosim neskor alebo nas kontaktujte priamo emailom.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Meno *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vase meno"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vas@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Dovod kontaktu *</Label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Predmet *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="O com sa jedna"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Sprava *</Label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Napisite vasu spravu..."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[120px]"
                  required
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Odoslanim formulara suhlasite so spracovanim vasich osobnych udajov
                za ucelom odpovede na vas dopyt. Viac informacii najdete v nasich{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  zasadach ochrany osobnych udajov
                </Link>
                .
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                    Odosiela sa...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Odoslat spravu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Cas odozvy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Na vaase spravy odpovedame zvycajne do 2-3 pracovnych dni.
              V pripade nalehavych zalezitosti nas kontaktujte priamo emailom.
            </p>

            <h3 className="font-semibold mb-2">GDPR ziadosti</h3>
            <p className="text-sm text-muted-foreground">
              Ziadosti tykajuce sa vasich osobnych udajov (pristup, oprava, vymazanie)
              spracuvavame do 30 dni v sulade s legislativou GDPR.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
