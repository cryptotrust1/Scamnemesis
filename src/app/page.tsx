'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardBody, Badge } from '@/components/ui';
import styles from './page.module.css';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Badge variant="primary" size="lg">🛡️ Chráňte seba aj ostatných</Badge>
          <h1 className={styles.heroTitle}>
            Spoločne proti <span className={styles.highlight}>podvodníkom</span>
          </h1>
          <p className={styles.heroDescription}>
            ScamNemesis je komunitná platforma na nahlasovanie a vyhľadávanie podvodníkov.
            Overte si osobu pred obchodom a chráňte sa pred podvodom.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Input
              type="text"
              placeholder="Zadajte meno, email, telefón alebo IBAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
            <Button type="submit" size="lg">
              Vyhľadať
            </Button>
          </form>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15,000+</span>
              <span className={styles.statLabel}>nahlásených podvodníkov</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50,000+</span>
              <span className={styles.statLabel}>vyhľadávaní mesačne</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>€2M+</span>
              <span className={styles.statLabel}>zachránených</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ako to funguje?</h2>
          <p className={styles.sectionDescription}>
            Tri jednoduché kroky k ochrane pred podvodníkmi
          </p>
        </div>

        <div className={styles.featureGrid}>
          <Card variant="outlined" hoverable className={styles.featureCard}>
            <CardBody>
              <div className={styles.featureIcon}>🔍</div>
              <h3 className={styles.featureTitle}>1. Vyhľadajte</h3>
              <p className={styles.featureDescription}>
                Pred akýmkoľvek obchodom si overte osobu v našej databáze.
                Stačí zadať meno, email, telefón alebo bankový účet.
              </p>
            </CardBody>
          </Card>

          <Card variant="outlined" hoverable className={styles.featureCard}>
            <CardBody>
              <div className={styles.featureIcon}>📝</div>
              <h3 className={styles.featureTitle}>2. Nahláste</h3>
              <p className={styles.featureDescription}>
                Ak ste sa stali obeťou podvodu, nahláste podvodníka.
                Vaše hlásenie pomôže chrániť ostatných.
              </p>
            </CardBody>
          </Card>

          <Card variant="outlined" hoverable className={styles.featureCard}>
            <CardBody>
              <div className={styles.featureIcon}>🤝</div>
              <h3 className={styles.featureTitle}>3. Zdieľajte</h3>
              <p className={styles.featureDescription}>
                Rozšírte povedomie o podvodníkoch. Čím viac ľudí vie,
                tým menej obetí podvodníci nájdu.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className={styles.recentReports}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Najnovšie hlásenia</h2>
          <Link href="/search" className={styles.viewAllLink}>
            Zobraziť všetky →
          </Link>
        </div>

        <div className={styles.reportGrid}>
          {/* Placeholder for recent reports - would be loaded from API */}
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="default" hoverable>
              <CardBody>
                <div className={styles.reportHeader}>
                  <Badge variant="danger">INVESTMENT_FRAUD</Badge>
                  <span className={styles.reportDate}>pred 2 hodinami</span>
                </div>
                <h4 className={styles.reportTitle}>J*** N***</h4>
                <p className={styles.reportSummary}>
                  Podvodník ponúkal investičné príležitosti s garantovaným výnosom...
                </p>
                <div className={styles.reportFooter}>
                  <span className={styles.reportLoss}>Strata: €5,000-€10,000</span>
                  <Link href={`/report/sample-${i}`} className={styles.reportLink}>
                    Detail →
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <Card variant="elevated" className={styles.ctaCard}>
          <CardBody>
            <h2 className={styles.ctaTitle}>Stali ste sa obeťou podvodu?</h2>
            <p className={styles.ctaDescription}>
              Nahláste podvodníka a pomôžte chrániť ostatných.
              Vaše hlásenie môže zabrániť ďalším obetiam.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/report">
                <Button size="lg">
                  Nahlásiť podvod
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Viac informácií
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
