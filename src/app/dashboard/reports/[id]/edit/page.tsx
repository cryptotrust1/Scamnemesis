'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  publicId: string;
  summary: string;
  description: string;
  fraudType: string;
  status: string;
}

const fraudTypes = [
  { value: 'INVESTMENT_FRAUD', label: 'Investment Fraud' },
  { value: 'ROMANCE_SCAM', label: 'Romance Scam' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'IDENTITY_THEFT', label: 'Identity Theft' },
  { value: 'ONLINE_SHOPPING_FRAUD', label: 'Online Shopping Fraud' },
  { value: 'CRYPTOCURRENCY_SCAM', label: 'Cryptocurrency Scam' },
  { value: 'EMPLOYMENT_SCAM', label: 'Employment Scam' },
  { value: 'TECH_SUPPORT_SCAM', label: 'Tech Support Scam' },
  { value: 'LOTTERY_SCAM', label: 'Lottery Scam' },
  { value: 'ADVANCE_FEE_FRAUD', label: 'Advance Fee Fraud' },
  { value: 'CHARITY_SCAM', label: 'Charity Scam' },
  { value: 'RENTAL_SCAM', label: 'Rental Scam' },
  { value: 'PYRAMID_SCHEME', label: 'Pyramid Scheme' },
  { value: 'OTHER', label: 'Other' },
];

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [fraudType, setFraudType] = useState('');

  // Fetch report data
  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/reports/${reportId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Report not found');
          return;
        }
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();

      // Check if user can edit this report
      if (!['pending', 'approved'].includes(data.status)) {
        setError('This report cannot be edited in its current status');
        return;
      }

      setReport({
        id: data.id,
        publicId: data.public_id,
        summary: data.summary || '',
        description: data.description || '',
        fraudType: data.fraud_type?.toUpperCase() || '',
        status: data.status,
      });

      // Initialize form state
      setSummary(data.summary || '');
      setDescription(data.description || '');
      setFraudType(data.fraud_type?.toUpperCase() || '');
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary.trim() || summary.length < 10) {
      toast.error('Summary must be at least 10 characters');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/v1/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          summary: summary.trim(),
          description: description.trim(),
          fraud_type: fraudType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update report');
      }

      toast.success('Report updated successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error updating report:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update report');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Report</h1>
          <p className="text-muted-foreground">
            Update your report details. Changes will be reviewed by moderators.
          </p>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Report ID: {report.publicId || report.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Summary */}
              <div className="space-y-2">
                <label htmlFor="summary" className="text-sm font-medium">
                  Summary *
                </label>
                <input
                  id="summary"
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of the scam"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={10}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {summary.length}/500 characters
                </p>
              </div>

              {/* Fraud Type */}
              <div className="space-y-2">
                <label htmlFor="fraudType" className="text-sm font-medium">
                  Fraud Type
                </label>
                <select
                  id="fraudType"
                  value={fraudType}
                  onChange={(e) => setFraudType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select fraud type</option>
                  {fraudTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of what happened..."
                  rows={6}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/5000 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
