import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

const footerLinks = {
  services: [
    { name: 'Scam Checker', href: '/search' },
    { name: 'Report Scam', href: '/report/new' },
    { name: 'Money Recovery', href: '/money-recovery' },
    { name: 'Verify Service/Product', href: '/verify-serviceproduct' },
  ],
  resources: [
    { name: 'I Was Scammed', href: '/i-was-scammed-need-help' },
    { name: 'Scam Prevention', href: '/scam-prevention' },
    { name: 'Training Courses', href: '/training-courses' },
    { name: 'Scammer Removal', href: '/scammer-removal' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Support Us', href: '/support-us' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/logo-scam-blue.png"
                alt="ScamNemesis"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-bold text-xl">ScamNemesis</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              We help victims of crypto scams and investment frauds. Our team of lawyers, forensic analysts, and ethical hackers provides rapid fraud assistance, scammer investigations, and money recovery support.
            </p>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href="mailto:info@scamnemesis.com"
                className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
              >
                info@scamnemesis.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScamNemesis. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-[#0E74FF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
