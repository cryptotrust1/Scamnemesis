'use client';

/**
 * Partner Widgets Documentation Page
 *
 * Public documentation page explaining how to use ScamNemesis embeddable widgets.
 * Accessible at /partners/widgets
 */

import Link from 'next/link';
import {
  Code,
  Palette,
  Settings,
  Shield,
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const embedExample = `<iframe
  src="https://scamnemesis.com/en/embed/widget/YOUR_WIDGET_ID"
  width="100%"
  height="400"
  style="border: none; border-radius: 8px;"
  title="ScamNemesis Fraud Checker"
></iframe>
<script src="https://scamnemesis.com/embed/widget-resize.js"></script>`;

const features = [
  {
    icon: Palette,
    title: 'Customizable Appearance',
    description: 'Match your brand with custom colors, themes (light/dark), and border radius.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Available in English, Slovak, Czech, and German with automatic translations.',
  },
  {
    icon: Zap,
    title: 'Auto-Resize',
    description: 'Widget automatically adjusts height to fit content. No fixed dimensions needed.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'All searches are secure. No user data is stored or tracked by the widget.',
  },
  {
    icon: Settings,
    title: 'Configurable Behavior',
    description: 'Control search modes, filter visibility, and report button display.',
  },
  {
    icon: Shield,
    title: 'SEO Friendly',
    description: 'Widget pages are noindex to avoid duplicate content. Your site stays clean.',
  },
];

const steps = [
  {
    number: 1,
    title: 'Create an Account',
    description: 'Sign up for a free ScamNemesis account if you don\'t have one.',
    action: { label: 'Sign Up', href: '/auth/register' },
  },
  {
    number: 2,
    title: 'Access Widget Generator',
    description: 'Go to your dashboard and navigate to the Widgets section.',
    action: { label: 'Go to Dashboard', href: '/dashboard/widgets' },
  },
  {
    number: 3,
    title: 'Create & Customize',
    description: 'Create a new widget and customize its appearance and behavior.',
  },
  {
    number: 4,
    title: 'Copy Embed Code',
    description: 'Copy the generated embed code and paste it into your website.',
  },
];

export default function PartnersWidgetsPage() {
  const copyCode = () => {
    navigator.clipboard.writeText(embedExample);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              For Partners
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Embeddable Fraud Checker Widget
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-8">
              Add ScamNemesis fraud detection capabilities directly to your website.
              Help your users verify potential scams with a seamless, branded experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/widgets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-white text-indigo-600 rounded-lg"
              >
                <Code className="h-5 w-5" />
                Create Widget
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-transparent border-2 border-white text-white rounded-lg"
              >
                See Demo
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Widget Features</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our embeddable widget provides all the power of ScamNemesis fraud detection
            in a lightweight, customizable package.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Get Started</h2>
            <p className="text-slate-600">
              Setting up a widget takes just a few minutes.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-indigo-200 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-slate-600 mb-3">{step.description}</p>
                    {step.action && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={step.action.href}>
                          {step.action.label}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div id="demo" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Embed Code Example</h2>
          <p className="text-slate-600">
            Here is a sample embed code. Replace YOUR_WIDGET_ID with your actual widget ID.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 rounded"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 overflow-x-auto text-sm">
              <code>{embedExample}</code>
            </pre>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Auto-Resize Script</p>
              <p className="text-sm text-blue-700">
                Include the widget-resize.js script to enable automatic height adjustment.
                This ensures the widget always fits its content without scrollbars.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Customization Options</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Each widget can be customized to match your website design.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="appearance">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Customization</CardTitle>
                    <CardDescription>
                      Customize colors and styling to match your brand.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Primary Color</p>
                          <p className="text-sm text-slate-500">Button and accent color</p>
                        </div>
                        <div className="w-8 h-8 rounded bg-indigo-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Background Color</p>
                          <p className="text-sm text-slate-500">Widget background</p>
                        </div>
                        <div className="w-8 h-8 rounded bg-white border" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Text Color</p>
                          <p className="text-sm text-slate-500">Labels and content</p>
                        </div>
                        <div className="w-8 h-8 rounded bg-slate-800" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Theme</p>
                          <p className="text-sm text-slate-500">Light or Dark mode</p>
                        </div>
                        <Badge>Light / Dark</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Border Radius</p>
                          <p className="text-sm text-slate-500">Rounded corners (0-32px)</p>
                        </div>
                        <Badge variant="outline">8px</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavior" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Behavior Settings</CardTitle>
                    <CardDescription>
                      Control how the widget functions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Default Search Mode</p>
                          <p className="text-sm text-slate-500">Auto, Fuzzy, or Exact matching</p>
                        </div>
                        <Badge variant="outline">Auto</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Show Report Button</p>
                          <p className="text-sm text-slate-500">Link to report a new scam</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Advanced Filters</p>
                          <p className="text-sm text-slate-500">Show expanded by default</p>
                        </div>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="language" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Language Options</CardTitle>
                    <CardDescription>
                      Select the widget language to match your audience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-2xl mb-2 block">EN</span>
                        <p className="font-medium">English</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-2xl mb-2 block">SK</span>
                        <p className="font-medium">Slovak</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-2xl mb-2 block">CS</span>
                        <p className="font-medium">Czech</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-2xl mb-2 block">DE</span>
                        <p className="font-medium">German</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Create your first widget in minutes and help your users stay safe from scams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/widgets"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-white text-indigo-600 rounded-lg"
            >
              Create Your Widget
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-transparent border-2 border-white text-white rounded-lg"
            >
              Developers API
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
