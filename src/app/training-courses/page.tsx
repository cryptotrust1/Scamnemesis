'use client';

import Link from 'next/link';
import {
  Shield,
  GraduationCap,
  Users,
  Building,
  Play,
  Lock,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Baby,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const freeCourses = [
  { title: 'Recognizing scams', icon: AlertTriangle },
  { title: 'Response procedures after being scammed', icon: Shield },
  { title: 'Secure device setup (phone/computer)', icon: Smartphone },
  { title: 'Online safety guidelines', icon: Monitor },
  { title: 'Child protection in digital spaces', icon: Baby },
];

const professionalTargets = [
  'AML (Anti-Money Laundering) specialists',
  'Law enforcement professionals',
  'Accountants and auditors',
  'IT/Security personnel',
  'Private investigators',
  'Compliance officers',
];

const corporateFeatures = [
  'Staff training and systematic security methodology',
  'Policy implementation and incident response',
  'Roles and responsibilities clarification',
  'Risk reduction and faster response protocols',
  'Custom scenarios based on your industry',
  'Ongoing support and curriculum updates',
];

const differentiators = [
  {
    title: 'Live Threat Intelligence',
    description: 'We work on active crypto and investment fraud cases daily, keeping content current and practical.',
  },
  {
    title: 'Continuously Updated',
    description: 'Our curriculum evolves with new threats, ensuring you always have the latest protection knowledge.',
  },
  {
    title: 'Both Perspectives',
    description: 'Our expertise spans victim psychology and scammer tactics, providing comprehensive understanding.',
  },
];

export default function TrainingCoursesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-6 text-purple-600" />
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              Coming Soon
            </span>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Expert-Led Cybersecurity Training
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-8">
              Fraud prevention and cyber resilience training from experts who work on active cases daily. Practical knowledge that protects.
            </p>
            <Button size="lg" className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Get Notified When Available
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Play className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-3xl font-bold mb-4">Free Public Courses</h2>
              <p className="text-muted-foreground">
                Short, practical lessons to protect yourself and your family online.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeCourses.map((course) => {
                const Icon = course.icon;
                return (
                  <Card key={course.title}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="p-2 rounded-full bg-green-100">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">{course.title}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Videos Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Lock className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
              <h2 className="text-3xl font-bold mb-4">Professional Videos</h2>
              <p className="text-muted-foreground">
                Specialized content focused on OPSEC and cybersecurity professional skills development.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Designed For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {professionalTargets.map((target) => (
                    <div key={target} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-[#0E74FF]" />
                      <span>{target}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Corporate Training Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-amber-600" />
              <h2 className="text-3xl font-bold mb-4">Custom Corporate Training</h2>
              <p className="text-muted-foreground">
                Customized programs tailored to your organization&apos;s specific needs and industry.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {corporateFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Our Training Different</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {differentiators.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-2xl font-bold mb-4">Certified Experts</h2>
            <p className="text-muted-foreground mb-8">
              Our team holds certifications from leading security institutions and brings real-world experience in cybersecurity and fraud investigation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-16 bg-purple-50 dark:bg-purple-950/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-2xl font-bold mb-4">Interested in Custom Training?</h2>
            <p className="text-muted-foreground mb-6">
              Contact us to discuss your organization&apos;s training needs or to be notified when courses become available.
            </p>
            <p className="text-muted-foreground mb-6">
              Email us at{' '}
              <a href="mailto:info@scamnemesis.com" className="text-[#0E74FF] hover:underline">
                info@scamnemesis.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-[#0E74FF] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Be the First to Know
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Our training courses are launching soon. Get notified when they become available.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact-us">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
