import Link from 'next/link';
import { Shield, Github, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Vyhľadávanie', href: '/search' },
    { name: 'Nahlásiť podvod', href: '/report/new' },
    { name: 'Štatistiky', href: '/stats' },
    { name: 'API', href: '/api-docs' },
  ],
  company: [
    { name: 'O nás', href: '/about' },
    { name: 'Kontakt', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Ochrana osobných údajov', href: '/privacy' },
    { name: 'Podmienky používania', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
  ],
  support: [
    { name: 'Často kladené otázky', href: '/faq' },
    { name: 'Návody', href: '/guides' },
    { name: 'Podpora', href: '/support' },
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
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Scamnemesis</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Platforma na hlásenie a sledovanie podvodov s využitím umelej inteligencie a pokročilých algoritmov
              detekcie duplikátov.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://github.com/cryptotrust1/Scamnemesis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="mailto:info@scamnemesis.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produkt</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Spoločnosť</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Podpora</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
            © {new Date().getFullYear()} Scamnemesis. Všetky práva vyhradené.
          </p>
          <div className="flex space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
