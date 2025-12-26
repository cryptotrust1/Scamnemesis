'use client';

import { useState } from 'react';
import { Copy, Check, Code, Database, Shield, Zap, ExternalLink, Key, FileJson } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';

export default function DevelopersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { t } = useTranslation();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyCode(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">{t('pages.developers.badge')}</Badge>
        <h1 className="text-4xl font-bold mb-4">{t('pages.developers.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pages.developers.description')}
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader>
            <Database className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('pages.developers.features.fraudData.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('pages.developers.features.fraudData.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('pages.developers.features.secureApi.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('pages.developers.features.secureApi.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('pages.developers.features.fastResponses.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('pages.developers.features.fastResponses.description')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Code className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('pages.developers.features.restfulJson.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('pages.developers.features.restfulJson.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('pages.developers.quickStart.title')}
          </CardTitle>
          <CardDescription>
            {t('pages.developers.quickStart.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t('pages.developers.quickStart.step1.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('pages.developers.quickStart.step1.description')} <a href="mailto:partners@scamnemesis.com" className="text-primary hover:underline">partners@scamnemesis.com</a> {t('pages.developers.quickStart.step1.descriptionEnd')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('pages.developers.quickStart.step2.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('pages.developers.quickStart.step2.description')} <code className="bg-muted px-1 rounded">X-API-Key</code>:
            </p>
            <CodeBlock
              id="auth"
              language="bash"
              code={`curl -X GET "https://scamnemesis.com/api/v1/partner/reports" \\
  -H "X-API-Key: sk_live_your_api_key_here"`}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('pages.developers.quickStart.step3.title')}</h3>
            <CodeBlock
              id="first-request"
              language="javascript"
              code={`${t('pages.developers.quickStart.codeComment')}
const response = await fetch('https://scamnemesis.com/api/v1/partner/reports', {
  headers: {
    'X-API-Key': 'sk_live_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data); ${t('pages.developers.quickStart.arrayComment')}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {t('pages.developers.apiReference.title')}
          </CardTitle>
          <CardDescription>
            {t('pages.developers.apiReference.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reports">
            <TabsList className="mb-4">
              <TabsTrigger value="reports">{t('pages.developers.apiReference.tabs.reports')}</TabsTrigger>
              <TabsTrigger value="search">{t('pages.developers.apiReference.tabs.search')}</TabsTrigger>
              <TabsTrigger value="stats">{t('pages.developers.apiReference.tabs.stats')}</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/v1/partner/reports</code>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('pages.developers.apiReference.reports.description')}
                </p>

                <h4 className="font-semibold mb-2">{t('pages.developers.apiReference.reports.queryParams')}</h4>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.parameter')}</th>
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.type')}</th>
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.description')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>limit</code></td>
                      <td className="py-2">number</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.limit')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>offset</code></td>
                      <td className="py-2">number</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.offset')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>fraud_type</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.fraudType')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>country</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.country')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>date_from</code></td>
                      <td className="py-2">datetime</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.dateFrom')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>date_to</code></td>
                      <td className="py-2">datetime</td>
                      <td className="py-2">{t('pages.developers.apiReference.reports.params.dateTo')}</td>
                    </tr>
                  </tbody>
                </table>

                <h4 className="font-semibold mb-2">{t('pages.developers.apiReference.reports.exampleResponse')}</h4>
                <CodeBlock
                  id="reports-response"
                  language="json"
                  code={`{
  "data": [
    {
      "id": "REP-2024-001234",
      "fraud_type": "INVESTMENT",
      "status": "APPROVED",
      "country": "SK",
      "financial_loss": 5000,
      "perpetrator": {
        "name": "J*** D***",
        "email": "s***@example.com",
        "phone": "+421***123",
        "iban": "SK89***5678",
        "website": "https://fake-investment.com"
      },
      "created_at": "2024-12-20T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "meta": {
    "data_masked": true
  }
}`}
                />
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/v1/partner/search</code>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('pages.developers.apiReference.search.description')}
                </p>

                <h4 className="font-semibold mb-2">{t('pages.developers.apiReference.search.queryParams')}</h4>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.parameter')}</th>
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.type')}</th>
                      <th className="text-left py-2">{t('pages.developers.apiReference.reports.columns.description')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2"><code>q</code> <Badge variant="destructive" className="ml-1 text-xs">{t('pages.developers.apiReference.search.params.qRequired')}</Badge></td>
                      <td className="py-2">string</td>
                      <td className="py-2">{t('pages.developers.apiReference.search.params.q')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2"><code>field</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">{t('pages.developers.apiReference.search.params.field')}</td>
                    </tr>
                  </tbody>
                </table>

                <h4 className="font-semibold mb-2">{t('pages.developers.apiReference.search.example')}</h4>
                <CodeBlock
                  id="search-example"
                  language="bash"
                  code={`curl -X GET "https://scamnemesis.com/api/v1/partner/search?q=scam@example.com&field=email" \\
  -H "X-API-Key: sk_live_your_api_key_here"`}
                />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/v1/partner/stats</code>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t('pages.developers.apiReference.stats.description')}
                </p>

                <h4 className="font-semibold mb-2">{t('pages.developers.apiReference.stats.exampleResponse')}</h4>
                <CodeBlock
                  id="stats-response"
                  language="json"
                  code={`{
  "overview": {
    "total_reports": 12345,
    "reports_last_30_days": 234,
    "reports_with_financial_data": 8901
  },
  "financial_impact": {
    "total_loss": 15678900,
    "average_loss": 1762,
    "highest_loss": 500000,
    "currency": "EUR"
  },
  "by_fraud_type": [
    { "fraud_type": "INVESTMENT", "count": 3456, "percentage": 28.0 },
    { "fraud_type": "PHISHING", "count": 2345, "percentage": 19.0 }
  ],
  "by_country": [
    { "country": "SK", "count": 4567 },
    { "country": "CZ", "count": 3456 }
  ],
  "monthly_trend": [
    { "month": "2024-12", "count": 234 },
    { "month": "2024-11", "count": 198 }
  ]
}`}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rate Limits & Errors */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.developers.rateLimiting.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('pages.developers.rateLimiting.description')}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{t('pages.developers.rateLimiting.columns.endpoint')}</th>
                  <th className="text-left py-2">{t('pages.developers.rateLimiting.columns.limit')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">/partner/reports</td>
                  <td className="py-2">{t('pages.developers.rateLimiting.limits.reports')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">/partner/search</td>
                  <td className="py-2">{t('pages.developers.rateLimiting.limits.search')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">/partner/stats</td>
                  <td className="py-2">{t('pages.developers.rateLimiting.limits.stats')}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground">
              {t('pages.developers.rateLimiting.note')} <code>X-RateLimit-*</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages.developers.errors.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{t('pages.developers.errors.columns.code')}</th>
                  <th className="text-left py-2">{t('pages.developers.errors.columns.description')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2"><Badge variant="outline">400</Badge></td>
                  <td className="py-2">{t('pages.developers.errors.codes.400')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2"><Badge variant="outline">401</Badge></td>
                  <td className="py-2">{t('pages.developers.errors.codes.401')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2"><Badge variant="outline">403</Badge></td>
                  <td className="py-2">{t('pages.developers.errors.codes.403')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2"><Badge variant="outline">429</Badge></td>
                  <td className="py-2">{t('pages.developers.errors.codes.429')}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2"><Badge variant="outline">500</Badge></td>
                  <td className="py-2">{t('pages.developers.errors.codes.500')}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('pages.developers.cta.title')}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('pages.developers.cta.description')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="mailto:partners@scamnemesis.com">
                {t('pages.developers.cta.contactButton')}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/docs`}>
                {t('pages.developers.cta.swaggerButton')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
