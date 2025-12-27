'use client';

/**
 * Public API Documentation Page
 *
 * Accessible at /[locale]/docs
 * Provides public API documentation for developers.
 * Full Swagger UI is available in admin panel for authenticated admins.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Code,
  Copy,
  Shield,
  FileText,
  AlertTriangle,
  Key,
  Lock,
  Globe,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface EndpointProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth?: boolean;
  scopes?: string[];
}

const Endpoint = ({ method, path, description, auth = true, scopes }: EndpointProps) => {
  const [expanded, setExpanded] = useState(false);
  const methodColors = {
    GET: 'bg-blue-100 text-blue-800 border-blue-200',
    POST: 'bg-green-100 text-green-800 border-green-200',
    PATCH: 'bg-amber-100 text-amber-800 border-amber-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left bg-slate-50"
      >
        <Badge className={`${methodColors[method]} font-mono text-xs`}>
          {method}
        </Badge>
        <code className="flex-1 text-sm font-mono text-slate-700">{path}</code>
        {auth && <Lock className="h-4 w-4 text-slate-400" />}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-4 border-t bg-white">
          <p className="text-slate-600 mb-3">{description}</p>
          {scopes && scopes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Required scopes:</span>
              {scopes.map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs font-mono">
                  {scope}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CodeBlock = ({ code, language: _language = 'bash' }: { code: string; language?: string }) => {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 text-slate-400"
        onClick={copyCode}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function PublicDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              API v1
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ScamNemesis API Documentation
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Integrate fraud detection capabilities into your applications.
              Search reports, verify entities, and protect your users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600" asChild>
                <Link href="/auth/register">
                  <Key className="h-5 w-5 mr-2" />
                  Get API Key
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-slate-900 bg-white/90" asChild>
                <a href="/api/docs/openapi" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-5 w-5 mr-2" />
                  OpenAPI Spec
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Start</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">1. Get API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Create an account and generate an API key from your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">2. Make Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Include your API key in the X-API-Key header for all requests.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">3. Protect Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Search fraud reports and warn users about potential scams.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Authentication */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                The API supports three authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">API Key (Recommended for servers)</h4>
                <CodeBlock code={`curl -X GET "https://scamnemesis.com/api/v1/search?q=example" \\
  -H "X-API-Key: your-api-key"`} />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">Bearer Token (For authenticated users)</h4>
                <CodeBlock code={`curl -X GET "https://scamnemesis.com/api/v1/auth/me" \\
  -H "Authorization: Bearer your-jwt-token"`} />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">Cookie (For browser clients)</h4>
                <p className="text-sm text-slate-600">
                  HttpOnly cookies are automatically set during login and sent with
                  <code className="bg-slate-200 px-1 rounded mx-1">credentials: &apos;include&apos;</code>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                API rate limits to ensure fair usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-800">100</p>
                  <p className="text-sm text-slate-500">requests/hour</p>
                  <Badge variant="outline" className="mt-2">Standard</Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-800">1000</p>
                  <p className="text-sm text-slate-500">requests/hour</p>
                  <Badge variant="outline" className="mt-2">Admin</Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-800">20</p>
                  <p className="text-sm text-slate-500">requests/15min</p>
                  <Badge variant="outline" className="mt-2">Auth Endpoints</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>

          <Tabs defaultValue="public" className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="partner">Partner</TabsTrigger>
            </TabsList>

            <TabsContent value="public" className="space-y-3 mt-4">
              <Endpoint
                method="GET"
                path="/api/v1/health"
                description="Basic health check endpoint for monitoring."
                auth={false}
              />
              <Endpoint
                method="GET"
                path="/api/v1/stats"
                description="Public statistics about fraud reports."
                auth={false}
              />
              <Endpoint
                method="POST"
                path="/api/v1/contact"
                description="Submit a contact form message."
                auth={false}
              />
            </TabsContent>

            <TabsContent value="search" className="space-y-3 mt-4">
              <Endpoint
                method="GET"
                path="/api/v1/search"
                description="Search fraud reports with filters and pagination. Supports fuzzy, exact, and auto modes."
                auth={false}
              />
              <Endpoint
                method="POST"
                path="/api/v1/images/search"
                description="Reverse image search to find matching fraud reports."
                scopes={['search:read']}
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-3 mt-4">
              <Endpoint
                method="GET"
                path="/api/v1/reports"
                description="List published fraud reports with pagination."
                auth={false}
              />
              <Endpoint
                method="GET"
                path="/api/v1/reports/{id}"
                description="Get details of a specific fraud report."
                auth={false}
              />
              <Endpoint
                method="POST"
                path="/api/v1/reports"
                description="Submit a new fraud report."
                scopes={['reports:write']}
              />
              <Endpoint
                method="GET"
                path="/api/v1/reports/{id}/comments"
                description="Get comments on a specific report."
                auth={false}
              />
            </TabsContent>

            <TabsContent value="partner" className="space-y-3 mt-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Partner API Access</p>
                  <p className="text-sm text-blue-700">
                    Partner endpoints require API key authentication with appropriate scopes.
                    Contact us for partner access.
                  </p>
                </div>
              </div>
              <Endpoint
                method="GET"
                path="/api/v1/partner/reports"
                description="Paginated list of approved reports with masked sensitive data."
                scopes={['reports:read']}
              />
              <Endpoint
                method="GET"
                path="/api/v1/partner/search"
                description="Search reports with partner-specific filters."
                scopes={['search:read']}
              />
              <Endpoint
                method="GET"
                path="/api/v1/partner/stats"
                description="Statistics and analytics for partners."
                scopes={['stats:read']}
              />
            </TabsContent>
          </Tabs>

          {/* Error Handling */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>
                All errors follow RFC 7807 Problem Details format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="json"
                code={`{
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": {
    "email": "Invalid email format"
  },
  "status": 400
}`}
              />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded text-center">
                  <code className="text-lg font-bold text-slate-800">400</code>
                  <p className="text-xs text-slate-500 mt-1">Bad Request</p>
                </div>
                <div className="p-3 bg-slate-50 rounded text-center">
                  <code className="text-lg font-bold text-slate-800">401</code>
                  <p className="text-xs text-slate-500 mt-1">Unauthorized</p>
                </div>
                <div className="p-3 bg-slate-50 rounded text-center">
                  <code className="text-lg font-bold text-slate-800">403</code>
                  <p className="text-xs text-slate-500 mt-1">Forbidden</p>
                </div>
                <div className="p-3 bg-slate-50 rounded text-center">
                  <code className="text-lg font-bold text-slate-800">429</code>
                  <p className="text-xs text-slate-500 mt-1">Rate Limited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SDKs */}
          <Card>
            <CardHeader>
              <CardTitle>SDKs &amp; Tools</CardTitle>
              <CardDescription>
                Official libraries and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/developers"
                  className="p-4 border rounded-lg flex items-center gap-4 text-slate-700"
                >
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Code className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">JavaScript SDK</p>
                    <p className="text-sm text-slate-500">npm install @scamnemesis/sdk</p>
                  </div>
                </a>
                <a
                  href="/partners/widgets"
                  className="p-4 border rounded-lg flex items-center gap-4 text-slate-700"
                >
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Embeddable Widget</p>
                    <p className="text-sm text-slate-500">Add fraud checker to your site</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Check our full API reference or contact support for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 text-white" asChild>
              <Link href="/contact-us">
                Contact Support
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-900 bg-white" asChild>
              <a href="/api/docs/openapi.yaml" download>
                <FileText className="h-5 w-5 mr-2" />
                Download OpenAPI Spec
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
