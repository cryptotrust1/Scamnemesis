'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFiltersComponent, type SearchFilters } from '@/components/search/search-filters';
import { ReportList, type Report } from '@/components/search/report-list';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data - replace with actual API call
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Investičný podvod s kryptomenami - ponuka vysokých výnosov',
    description:
      'Bol som kontaktovaný cez Facebook s ponukou investície do Bitcoinu. Sľúbili 300% výnos za 3 mesiace. Po vložení 15,000 EUR prestali odpovedať.',
    fraudType: 'INVESTMENT_FRAUD',
    country: 'Slovensko',
    city: 'Bratislava',
    amount: 15000,
    currency: 'EUR',
    status: 'APPROVED',
    createdAt: '2025-12-09',
    perpetratorName: 'Mic***l Nov**',
    perpetratorPhone: '+421 9** *** 456',
    perpetratorEmail: 'm*****@email.com',
    similarReportsCount: 12,
  },
  {
    id: '2',
    title: 'Romance scam - zoznamka a požiadavka o peniaze',
    description:
      'Stretol som ženu na Tinderi, po mesiaci písania požiadala o 8,500 EUR na operáciu matky. Po zaslaní peňazí zmazala účet.',
    fraudType: 'ROMANCE_SCAM',
    country: 'Česká republika',
    city: 'Praha',
    amount: 8500,
    currency: 'EUR',
    status: 'APPROVED',
    createdAt: '2025-12-08',
    perpetratorName: 'Kat***a Dvořáková',
    perpetratorEmail: 'k*****@seznam.cz',
    similarReportsCount: 5,
  },
  {
    id: '3',
    title: 'Phishing email - podvrhnutá správa od Tatra banky',
    description:
      'Dostal som email údajne od Tatra banky s výzvou na overenie účtu. Link viedol na falošnú stránku kde som zadal prihlasovacie údaje.',
    fraudType: 'PHISHING',
    country: 'Slovensko',
    city: 'Košice',
    amount: 0,
    currency: 'EUR',
    status: 'APPROVED',
    createdAt: '2025-12-08',
    perpetratorEmail: 'info@tatrabank-verify.com',
    similarReportsCount: 23,
  },
  {
    id: '4',
    title: 'Podvod s prenájmom bytu - vopred zaplatená záloha',
    description:
      'Našiel som inzerát na prenájom bytu v centre Bratislavy za výhodnú cenu. Majiteľ požadoval zálohu 2,000 EUR. Po zaplatení prestal odpovedať a byt neexistoval.',
    fraudType: 'RENTAL_FRAUD',
    country: 'Slovensko',
    city: 'Bratislava',
    amount: 2000,
    currency: 'EUR',
    status: 'PENDING',
    createdAt: '2025-12-07',
    perpetratorName: 'Pet** Hor***',
    perpetratorPhone: '+421 9** *** 789',
  },
  {
    id: '5',
    title: 'Falošná charita - pomoc pre deti na Ukrajine',
    description:
      'Organizácia zbierala peniaze na pomoc deťom utečencom. Po vyzbieraní 45,000 EUR zmizli. Charita nikdy nebola registrovaná.',
    fraudType: 'FAKE_CHARITY',
    country: 'Slovensko',
    city: 'Žilina',
    amount: 45000,
    currency: 'EUR',
    status: 'APPROVED',
    createdAt: '2025-12-06',
    perpetratorName: 'Nadácia P***a deť**',
    similarReportsCount: 8,
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    fraudType: 'all',
    country: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [sortBy, setSortBy] = useState('date-desc');
  const [totalResults] = useState(243);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Filter mock data based on filters
      let filtered = [...mockReports];

      if (filters.query) {
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(filters.query.toLowerCase()) ||
            r.description.toLowerCase().includes(filters.query.toLowerCase()) ||
            r.perpetratorName?.toLowerCase().includes(filters.query.toLowerCase())
        );
      }

      if (filters.fraudType !== 'all') {
        filtered = filtered.filter((r) => r.fraudType === filters.fraudType);
      }

      if (filters.country !== 'all') {
        filtered = filtered.filter((r) => r.country === filters.country);
      }

      if (filters.status !== 'all') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      // Sort
      if (sortBy === 'date-desc') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'date-asc') {
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortBy === 'amount-desc') {
        filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      } else if (sortBy === 'amount-asc') {
        filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
      }

      setReports(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      fraudType: 'all',
      country: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Vyhľadávanie podvodov</h1>
        <p className="text-muted-foreground">
          Prehľadávajte databázu hlásených podvodov a chráňte sa pred podvodníkmi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Nájdených <span className="font-semibold text-foreground">{reports.length}</span> z{' '}
                <span className="font-semibold text-foreground">{totalResults}</span> výsledkov
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Zoradiť:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Najnovšie</SelectItem>
                  <SelectItem value="date-asc">Najstaršie</SelectItem>
                  <SelectItem value="amount-desc">Suma (zostupne)</SelectItem>
                  <SelectItem value="amount-asc">Suma (vzostupne)</SelectItem>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report List */}
          <ReportList reports={reports} isLoading={isLoading} />

          {/* Pagination */}
          {reports.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
