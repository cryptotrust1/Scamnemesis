'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Shield, TrendingUp, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    name: 'Celkový počet hlásení',
    value: '12,543',
    icon: Shield,
    change: '+12.5%',
    changeType: 'increase',
  },
  {
    name: 'Aktívnych používateľov',
    value: '3,241',
    icon: Users,
    change: '+8.2%',
    changeType: 'increase',
  },
  {
    name: 'Odhalených podvodov',
    value: '8,932',
    icon: AlertTriangle,
    change: '+23.1%',
    changeType: 'increase',
  },
  {
    name: 'Detekcia duplikátov',
    value: '94.2%',
    icon: TrendingUp,
    change: '+2.4%',
    changeType: 'increase',
  },
];

const recentReports = [
  {
    id: '1',
    title: 'Investičný podvod s kryptomenami',
    type: 'INVESTMENT_FRAUD',
    amount: 15000,
    currency: 'EUR',
    country: 'Slovensko',
    date: '2025-12-09',
    status: 'APPROVED',
  },
  {
    id: '2',
    title: 'Romance scam cez dating aplikáciu',
    type: 'ROMANCE_SCAM',
    amount: 8500,
    currency: 'EUR',
    country: 'Česká republika',
    date: '2025-12-08',
    status: 'APPROVED',
  },
  {
    id: '3',
    title: 'Phishing útok - podvrhnutý email od banky',
    type: 'PHISHING',
    amount: 0,
    currency: 'EUR',
    country: 'Slovensko',
    date: '2025-12-08',
    status: 'PENDING',
  },
];

const fraudTypes = [
  { name: 'Investičné podvody', count: 3421, color: 'bg-red-500' },
  { name: 'Romance scam', count: 2156, color: 'bg-pink-500' },
  { name: 'Phishing', count: 1987, color: 'bg-orange-500' },
  { name: 'Krádež identity', count: 1654, color: 'bg-purple-500' },
  { name: 'E-commerce podvody', count: 1432, color: 'bg-cyan-500' },
  { name: 'Krypto podvody', count: 1893, color: 'bg-amber-500' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Chráňte sa pred podvodmi
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Vyhľadávajte v databáze hlásených podvodov, nahlasujte podozrivé aktivity a pomôžte ochraňovať ostatných.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl space-y-2">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Vyhľadajte meno, telefón, email, IBAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12 text-base"
                />
                <Button type="submit" size="lg" className="h-12 px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Hľadať
                </Button>
              </form>
              <p className="text-sm text-muted-foreground">
                Vyhľadávanie v{' '}
                <span className="font-semibold text-foreground">12,543 hláseniach</span> od{' '}
                <span className="font-semibold text-foreground">3,241 používateľov</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/report/new">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Nahlásiť podvod
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/search">
                  Pokročilé vyhľadávanie
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>{' '}
                      za posledný mesiac
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="w-full py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter">Najnovšie hlásenia</h2>
              <p className="text-muted-foreground mt-2">Nedávno overené a schválené reporty</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/search">
                Zobraziť všetky
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant={report.status === 'APPROVED' ? 'success' : 'warning'}>
                      {report.status === 'APPROVED' ? 'Overené' : 'Čaká na overenie'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{report.date}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{report.title}</CardTitle>
                  <CardDescription className="flex items-center justify-between mt-2">
                    <span>{report.country}</span>
                    {report.amount > 0 && (
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat('sk-SK', {
                          style: 'currency',
                          currency: report.currency,
                        }).format(report.amount)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href={`/reports/${report.id}`}>
                      Zobraziť detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fraud Types Section */}
      <section className="w-full py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tighter">Typy podvodov</h2>
            <p className="text-muted-foreground mt-2">Najčastejšie hlásené kategórie</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fraudTypes.map((type) => (
              <Card key={type.name} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <div>
                      <p className="font-semibold">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.count} hlásení</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/search?type=${type.name}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Pomôžte ochraňovať ostatných
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/90 md:text-xl">
                Každé hlásenie pomáha vytvoriť bezpečnejšie prostredie. Nahlás' podozrivú aktivitu a chráň ostatných pred
                podvodníkmi.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/report/new">
                Nahlásiť podvod teraz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
