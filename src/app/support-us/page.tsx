'use client';

import Link from 'next/link';
import { Heart, Shield, Users, CreditCard, Bitcoin } from 'lucide-react';

const program1Features = [
  'Advanced fraud detection systems and AI-powered scam identification',
  'Marketing campaigns to warn potential victims before they fall prey',
  'Legal advocacy and partnerships to create safer digital environments',
];

const program2Features = [
  'Educational programs and vocational training for skill development',
  'Job placement assistance and ongoing mentorship support',
  'Financial aid for basic needs during the critical reintegration period',
];

export default function SupportUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-[#1e293b] sm:text-3xl md:text-4xl mb-5">
              Support Our Mission – Help Us Bring Justice and Safety to Everyone
            </h1>
            <p className="text-base text-[#64748b] md:text-lg max-w-3xl mx-auto leading-relaxed">
              Justice and safety should not be reserved only for those who can afford them. We offer free services to fraud victims while sustaining our mission through community support. Your contribution helps us protect the vulnerable and give second chances to those seeking redemption.
            </p>
          </div>
        </div>
      </section>

      {/* Support Programs Section */}
      <section className="w-full py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Program 1: Public Protection */}
            <div className="border-2 border-[#0E74FF] rounded-lg p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-12 w-12 text-[#0E74FF] flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  Public Protection and Fighting Fraudsters
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                Help us develop cutting-edge tools and reach more potential victims before they fall prey to scammers. Your support enables us to stay ahead of fraudsters and protect communities worldwide.
              </p>
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Our Focus Areas:</h3>
                <ul className="space-y-3">
                  {program1Features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-[#0E74FF] flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic mb-6">
                Impact: Every dollar helps us prevent fraud, educate the public, and bring scammers to justice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://donate.stripe.com/your-stripe-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0E74FF] text-white font-medium rounded-lg hover:bg-[#0E74FF]/90 transition-colors"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay by Card
                </Link>
                <Link
                  href="https://trocador.app/anonpay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#0E74FF] text-[#0E74FF] font-medium rounded-lg hover:bg-[#0E74FF]/10 transition-colors"
                >
                  <Bitcoin className="mr-2 h-5 w-5" />
                  Pay with Crypto
                </Link>
              </div>
            </div>

            {/* Program 2: Second Chance */}
            <div className="border-2 border-green-500 rounded-lg p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-12 w-12 text-green-600 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  A Second Chance for People Who Want to Leave Crime Behind
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                Support rehabilitation and reintegration programs that help former offenders build new lives. Breaking the cycle of crime benefits everyone and creates safer communities for all.
              </p>
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Our Focus Areas:</h3>
                <ul className="space-y-3">
                  {program2Features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic mb-6">
                Impact: Your contribution gives hope and practical support to those committed to positive change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://donate.stripe.com/your-stripe-link-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay by Card
                </Link>
                <Link
                  href="https://trocador.app/anonpay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                >
                  <Bitcoin className="mr-2 h-5 w-5" />
                  Pay with Crypto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Clean minimal style */}
      <section className="w-full py-16 md:py-20 bg-[#f8fafc] border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-10 w-10 mx-auto mb-5 text-pink-500" />
            <h2 className="text-xl font-semibold text-[#1e293b] sm:text-2xl mb-4">
              Together We Make a Difference
            </h2>
            <p className="text-[#64748b] mb-6 leading-relaxed">
              Whether you choose to support fraud prevention or second-chance programs, your generosity creates real change. Thank you for being part of our mission to build a safer, more just world for everyone.
            </p>
            <p className="text-[#64748b] text-sm">
              Have questions? <Link href="/contact-us" className="text-[#0E74FF] hover:underline font-medium">Contact us</Link> to learn more about our work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
