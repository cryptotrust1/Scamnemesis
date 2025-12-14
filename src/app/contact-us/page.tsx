import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Contact us
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You can contact us by email. But if you want to report a scam, please use our reporting form — without it, we won&apos;t be able to help you effectively.
            </p>
          </div>

          {/* Company Description */}
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-700 leading-relaxed">
              We are a team dedicated to helping victims of crypto scams and investment fraud.
              Our expertise spans blockchain analysis, OSINT investigations, and legal coordination
              to provide comprehensive support in recovering from fraudulent schemes.
            </p>
          </div>

          {/* Email Contact */}
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-[#0E74FF] rounded-full">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <a
              href="mailto:info@scamnemesis.com"
              className="text-2xl font-semibold text-[#0E74FF] hover:underline"
            >
              info@scamnemesis.com
            </a>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              href="/report/new"
              className="inline-block bg-[#0E74FF] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0c5fd6] transition-colors"
            >
              Report scam
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
