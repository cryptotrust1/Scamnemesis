'use client';

import Link from 'next/link';
import {
  Heart,
  Shield,
  Users,
  BookOpen,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const fund1Features = [
  'Development of fraud detection systems',
  'Marketing and awareness campaigns',
  'Legal services to create safe environments',
  'Research and technology improvements',
];

const fund2Features = [
  'Retraining and educational programs for released prisoners',
  'Financial support for job placement',
  'Basic needs assistance during reintegration',
  'Family support services',
];

const cryptoAddresses = [
  {
    fund: 'Public Protection Fund',
    network: 'USDT/ERC20',
    address: '0x0d17e5E07e1115D7C001245922f8e30C98781a8C',
  },
  {
    fund: 'Second Chance Fund',
    network: 'USDT/TRC20',
    address: 'TCgCfp1Ve5vKpmuaK8M7btt9BSCUKqzXQR',
  },
];

export default function SupportUsPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-pink-500" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Support Our Mission
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              Justice and safety should not be reserved only for those who can afford them financially. We offer services free to fraud victims while maintaining sustainability through your support.
            </p>
          </div>
        </div>
      </section>

      {/* Two Funds Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Fund 1: Public Protection */}
            <Card className="border-2 border-[#0E74FF]">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
                <CardTitle className="text-xl">Public Protection & Fighting Fraudsters</CardTitle>
                <CardDescription>
                  Help us develop better tools and reach more potential victims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {fund1Features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#0E74FF] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
                  <Link href="/contact-us">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Donate with Card
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Fund 2: Second Chance */}
            <Card className="border-2 border-green-500">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle className="text-xl">Second Chance for Former Offenders</CardTitle>
                <CardDescription>
                  Support rehabilitation and reintegration programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {fund2Features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/contact-us">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Donate with Card
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Crypto Donations Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Cryptocurrency Donations</h2>
            <div className="space-y-4">
              {cryptoAddresses.map((crypto) => (
                <Card key={crypto.address}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{crypto.fund}</p>
                        <p className="text-sm text-muted-foreground">{crypto.network}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                          {crypto.address}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(crypto.address)}
                        >
                          {copiedAddress === crypto.address ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
            <p className="text-muted-foreground mb-8">
              Your contribution — no matter how big or small — means more than you can imagine. Together, we can protect more people from fraud and give second chances to those seeking redemption.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-[#0E74FF] mb-2">Free</p>
                <p className="text-sm text-muted-foreground">Services for fraud victims</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-[#0E74FF] mb-2">24/7</p>
                <p className="text-sm text-muted-foreground">Support availability</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-[#0E74FF] mb-2">100%</p>
                <p className="text-sm text-muted-foreground">Goes to our mission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Support Us Today
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Become part of the change. Every contribution helps us protect more people and give more second chances.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact-us">
                Contact Us to Donate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
