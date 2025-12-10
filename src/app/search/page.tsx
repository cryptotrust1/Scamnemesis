'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardBody, Badge, Alert } from '@/components/ui';
import styles from './page.module.css';

interface SearchResult {
  id: string;
  public_id: string;
  fraud_type: string;
  severity: string;
  summary: string;
  perpetrator: {
    full_name: string | null;
    nickname: string | null;
  } | null;
  location: {
    country: string | null;
    city: string | null;
  } | null;
  financial_loss: {
    amount: string | number;
    currency: string;
  } | null;
  created_at: string;
}

const FRAUD_TYPES = [
  { value: '', label: 'Všetky typy' },
  { value: 'INVESTMENT_FRAUD', label: 'Investičný podvod' },
  { value: 'ROMANCE_SCAM', label: 'Romantický podvod' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'FAKE_ESHOP', label: 'Falošný e-shop' },
  { value: 'ADVANCE_FEE', label: 'Záloha vopred' },
  { value: 'TECH_SUPPORT', label: 'Tech support' },
  { value: 'CRYPTO_SCAM', label: 'Krypto podvod' },
  { value: 'JOB_SCAM', label: 'Pracovný podvod' },
  { value: 'OTHER', label: 'Iné' },
];

const SEVERITY_COLORS: Record<string, 'default' | 'warning' | 'danger' | 'info'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [fraudType, setFraudType] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, []);

  const performSearch = async () => {
    if (!query.trim()) {
      setError('Zadajte vyhľadávací výraz');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (fraudType) {
        params.append('fraud_type', fraudType);
      }

      const response = await fetch(`/api/v1/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Chyba pri vyhľadávaní');
      }

      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();

    // Update URL without reload
    const params = new URLSearchParams();
    params.set('q', query);
    if (fraudType) {
      params.set('type', fraudType);
    }
    window.history.pushState({}, '', `/search?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getFraudTypeLabel = (type: string) => {
    const found = FRAUD_TYPES.find((t) => t.value === type.toUpperCase());
    return found ? found.label : type;
  };

  return (
    <div className={styles.page}>
      {/* Search Header */}
      <section className={styles.searchHeader}>
        <h1 className={styles.title}>Vyhľadávanie</h1>
        <p className={styles.subtitle}>
          Vyhľadajte v databáze nahlásených podvodníkov
        </p>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchInputs}>
            <Input
              type="text"
              placeholder="Meno, email, telefón, IBAN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
            <select
              value={fraudType}
              onChange={(e) => setFraudType(e.target.value)}
              className={styles.typeSelect}
            >
              {FRAUD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <Button type="submit" isLoading={isLoading}>
              Vyhľadať
            </Button>
          </div>
        </form>
      </section>

      {/* Results Section */}
      <section className={styles.results}>
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Vyhľadávam...</p>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>Žiadne výsledky</h3>
            <p>
              Pre výraz &quot;{query}&quot; sme nenašli žiadne záznamy.
            </p>
            <p className={styles.noResultsHint}>
              Skúste iný vyhľadávací výraz alebo{' '}
              <Link href="/report">nahláste nový podvod</Link>.
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                Nájdených <strong>{results.length}</strong> záznamov
              </span>
            </div>

            <div className={styles.resultsList}>
              {results.map((result) => (
                <Card key={result.id} variant="default" hoverable className={styles.resultCard}>
                  <CardBody>
                    <div className={styles.resultHeader}>
                      <div className={styles.resultBadges}>
                        <Badge variant="danger">
                          {getFraudTypeLabel(result.fraud_type)}
                        </Badge>
                        {result.severity && (
                          <Badge variant={SEVERITY_COLORS[result.severity] || 'default'}>
                            {result.severity.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <span className={styles.resultDate}>
                        {formatDate(result.created_at)}
                      </span>
                    </div>

                    <h3 className={styles.resultName}>
                      {result.perpetrator?.full_name || result.perpetrator?.nickname || 'Neznámy'}
                    </h3>

                    <p className={styles.resultSummary}>{result.summary}</p>

                    <div className={styles.resultMeta}>
                      {result.location?.country && (
                        <span className={styles.resultLocation}>
                          📍 {result.location.city ? `${result.location.city}, ` : ''}{result.location.country}
                        </span>
                      )}
                      {result.financial_loss && (
                        <span className={styles.resultLoss}>
                          💰 Strata: {result.financial_loss.amount} {result.financial_loss.currency}
                        </span>
                      )}
                    </div>

                    <div className={styles.resultFooter}>
                      <Link href={`/report/${result.public_id}`} className={styles.resultLink}>
                        <Button variant="outline" size="sm">
                          Zobraziť detail
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}

        {!hasSearched && (
          <div className={styles.instructions}>
            <div className={styles.instructionsIcon}>💡</div>
            <h3>Tipy na vyhľadávanie</h3>
            <ul className={styles.instructionsList}>
              <li>Zadajte <strong>celé meno</strong> pre presnejšie výsledky</li>
              <li>Vyhľadajte podľa <strong>emailu</strong> alebo <strong>telefónneho čísla</strong></li>
              <li>Zadajte <strong>IBAN</strong> alebo <strong>číslo účtu</strong></li>
              <li>Vyhľadajte podľa <strong>krypto adresy</strong> (Bitcoin, Ethereum...)</li>
              <li>Použite <strong>filter typu podvodu</strong> pre zúženie výsledkov</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
