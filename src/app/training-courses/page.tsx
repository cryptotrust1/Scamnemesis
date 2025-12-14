'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  GraduationCap,
  Building,
  Play,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Baby,
  Smartphone,
  Target,
  Users,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    icon: Target,
  },
  {
    title: 'Continuously Updated',
    description: 'Our curriculum evolves with new threats, ensuring you always have the latest protection knowledge.',
    icon: BookOpen,
  },
  {
    title: 'Both Perspectives',
    description: 'Our expertise spans victim psychology and scammer tactics, providing comprehensive understanding.',
    icon: Users,
  },
  {
    title: 'Real-World Experience',
    description: 'Learn from practitioners who actively investigate and prevent fraud, not just theory from textbooks.',
    icon: Shield,
  },
];

export default function TrainingCoursesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-5">
                World-class, expert-led cybersecurity training from the world&apos;s top security professionals.
              </h1>
              <p className="text-base text-[#64748b] md:text-lg mb-6 leading-relaxed">
                Prevent fraud and attacks with comprehensive training designed to protect individuals and organizations from evolving cyber threats.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Coming Soon
                </p>
                <p className="text-sm text-amber-700">
                  Our training courses are currently in development. Contact us at{' '}
                  <a href="mailto:info@scamnemesis.com" className="text-[#0E74FF] hover:underline">
                    info@scamnemesis.com
                  </a>{' '}
                  to be notified when they launch.
                </p>
              </div>
            </div>
            <div className="relative h-[350px] md:h-[400px] rounded-lg overflow-hidden border border-[#e8e8e8]">
              <Image
                src="/images/pages/training-courses.jpg"
                alt="Cybersecurity Training"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity Courses Description */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-6 text-[#0E74FF]" />
            <h2 className="text-3xl font-bold mb-4">Comprehensive Cybersecurity Training</h2>
            <p className="text-lg text-muted-foreground">
              Our courses cover everything from basic online safety to advanced security methodologies.
              Whether you&apos;re an individual looking to protect yourself, a professional seeking specialized
              knowledge, or an organization needing custom training, we have solutions tailored to your needs.
            </p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {differentiators.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="text-center">
                  <CardHeader>
                    <Icon className="h-10 w-10 mx-auto mb-3 text-[#0E74FF]" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-[#0E74FF]" />
            <h2 className="text-2xl font-bold mb-4">Certified Experts</h2>
            <p className="text-muted-foreground mb-12">
              Our team holds certifications from leading security institutions and brings real-world experience in cybersecurity and fraud investigation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-70">
              {/* Certification Logos Placeholders */}
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">CISSP</div>
              </div>
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">CEH</div>
              </div>
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">CISM</div>
              </div>
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">Security+</div>
              </div>
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">OSCP</div>
              </div>
              <div className="flex items-center justify-center h-20 bg-muted rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground text-center">CFE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-5 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl">
              Ready to Strengthen Your Security?
            </h2>
            <p className="text-[#64748b] leading-relaxed">
              Contact us to discuss your training needs or learn more about our upcoming courses.
            </p>
            <Button className="bg-[#0E74FF] hover:bg-[#0E74FF]/90" asChild>
              <Link href="/contact-us">
                Book a Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
