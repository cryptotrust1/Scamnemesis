'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchFiltersComponent, type SearchFilters } from '@/components/search/search-filters';
import { ReportList, type Report } from '@/components/search/report-list';
import { Button } from '@/components/ui/button';
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
import {
  Shield,
  Search,
  FileText,
  Users,
  Globe,
  Database,
  Lock,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Target,
  Link2,
  Mail,
  Phone,
  CreditCard,
  Building,
  User,
  Car,
  Bitcoin,
  ArrowRight,
  Fingerprint,
  Bug,
  Landmark,
  ShoppingBag,
  Briefcase,
  UserCog,
  TrendingDown,
} from 'lucide-react';

// JSON-LD Schemas
const jsonLdSchemas = {
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Scam Checker - Verify People, Websites & Businesses',
    applicationCategory: 'SecurityApplication',
    applicationSubCategory: 'Fraud Detection',
    url: 'https://scamnemesis.com/search',
    description: 'Free scam detection and verification tool. Search our database to verify people, websites, phone numbers, emails, bank accounts, and cryptocurrency wallets for scams and fraud.',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Phone number scam verification',
      'Email address fraud detection',
      'Website legitimacy checker',
      'Person/business verification',
      'Bank account scam lookup',
      'Cryptocurrency wallet verification',
      'Real-time scam database search',
      'Community-reported fraud alerts',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2547',
      bestRating: '5',
      worstRating: '1',
    },
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ScamNemesis',
    url: 'https://scamnemesis.com',
    logo: 'https://scamnemesis.com/images/logo.png',
    description: 'ScamNemesis is a free scam detection platform helping users verify and report fraudulent activities across multiple channels.',
    sameAs: [
      'https://www.facebook.com/scamnemesis',
      'https://twitter.com/scamnemesis',
      'https://www.linkedin.com/company/scamnemesis',
    ],
  },
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the scam checker work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our scam checker searches our comprehensive database of reported scams, fraudulent activities, and verified entities. Simply enter a phone number, email, website, name, bank account, or crypto wallet to check if it has been reported as a scam.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of scams can I check?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can verify phone numbers, email addresses, websites, people and businesses, bank accounts, and cryptocurrency wallets. Our database includes romance scams, phishing attempts, investment fraud, crypto scams, and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the scam checker really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our basic scam verification service is completely free. You can search our database unlimited times at no cost to protect yourself from fraud.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I report a scam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click the Report Scam button, select the scam type, provide details including contact information, description, and any evidence. Your report helps protect others in our community.',
        },
      },
    ],
  },
  howTo: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Verify if Someone is a Scammer',
    description: 'Step-by-step guide to check if a person, phone number, or business is involved in scams',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter Information',
        text: 'Enter the phone number, email, website, or name you want to verify in the search box',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Review Results',
        text: 'Check the database results for any reported scams, sorted by relevance',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Analyze Case Details',
        text: 'Open detailed reports and connect with other victims through secure comments',
        position: 3,
      },
    ],
    totalTime: 'PT2M',
  },
  breadcrumbList: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://scamnemesis.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Scam Checker',
        item: 'https://scamnemesis.com/search',
      },
    ],
  },
};

// Field Map data
const fieldMapData = [
  { field: 'Type of Fraud', required: true, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Incident Date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Transaction Date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Brief Summary', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Detailed Description', required: true, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Financial Loss (amount, currency)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Incident Location (street, city, postal code, country)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Full name (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Nickname / alias / username (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Approximate age (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Nationality (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Physical description (Suspect)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Phone (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Email (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Address (street, city, postal code, country) (Suspect)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Telegram', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'WhatsApp', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Signal', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Instagram', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Facebook (name/URL)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'TikTok', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'X (Twitter)', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Website URL', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Domain name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Domain creation date', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IP address', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'IP country', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'ISP (provider)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IP Abuse Score (0–100)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'IBAN', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Account holder name', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Account Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Bank Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Bank Country', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'SWIFT/BIC Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Routing Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'BSB Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Sort Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'IFSC Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'CNAPS Code', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Other Banking Details', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Wallet Address', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Blockchain', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Exchange/Wallet Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Transaction Hash', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'PayPal Account', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'YES', note: '' },
  { field: 'Company Name', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'VAT/Tax ID', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Company Address (street, city, postal code, country)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'FILTER', note: 'filter in the search bar' },
  { field: 'Vehicle Make (Brand)', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'Car Model', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Car Color', required: false, inReport: true, anonymization: 'PUBLIC', search: 'NO', note: '' },
  { field: 'License Plate', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'VIN Number', required: false, inReport: true, anonymization: 'PUBLIC', search: 'YES', note: '' },
  { field: 'Registered Owner', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Payment Evidence', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Fraudster Photos', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Screenshots', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Damage Documentation', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Crime Scene Photos', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Other Evidence', required: false, inReport: true, anonymization: 'ANONYMOUS', search: 'MEDIA', note: 'Photos, documents, etc.' },
  { field: 'Victim Name', required: true, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Email Address', required: true, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Phone Number', required: false, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
  { field: 'Victim Additional Information', required: false, inReport: false, anonymization: 'ANONYMOUS', search: 'NO', note: '' },
];

// Scam categories
const scamCategories = [
  {
    id: 'phishing',
    title: 'Phishing & Social Engineering',
    icon: Fingerprint,
    color: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    types: [
      { title: 'Phishing', slug: 'phishing', description: 'Deceptive emails or messages impersonating trusted brands to steal passwords and sensitive data. The most common online fraud globally.' },
      { title: 'Vishing', slug: 'vishing', description: 'Phone-based social engineering. Callers pose as bank staff, police, or IT support to pressure you into revealing credentials or approving payments.' },
      { title: 'Smishing', slug: 'smishing', description: 'Fraudulent SMS with links to fake login pages. Often spoof courier services, banks, or government offices to harvest one-time codes.' },
      { title: 'Romance Scam', slug: 'romance_scam', description: 'Criminals build trust through fake online relationships and then request money for fabricated emergencies. Typical losses reach tens of thousands.' },
      { title: 'Identity Spoofing', slug: 'identity_spoofing', description: 'Attackers impersonate celebrities, executives, or your contacts on social media to solicit money or push malicious links.' },
    ],
  },
  {
    id: 'investment',
    title: 'Investment & Online Financial Fraud',
    icon: TrendingDown,
    color: 'from-red-500 to-pink-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    types: [
      { title: 'Crypto Investment Scam', slug: 'crypto_investment', description: 'Fake platforms promise guaranteed returns. Once funds are deposited, access is blocked and "profits" are fabricated.' },
      { title: 'Forex/Stocks Fraud', slug: 'forex_stock', description: 'Unlicensed brokers and "advisors" lure victims into high-risk trading. Gains are fictitious; withdrawals are blocked.' },
      { title: 'Ponzi Scheme', slug: 'ponzi_scheme', description: 'Older investors are paid with funds from new ones. The scheme collapses when inflows slow down.' },
      { title: 'Pyramid Scheme', slug: 'pyramid_scheme', description: 'Illegal models where revenue depends on recruiting members, not selling real products. Most participants lose money.' },
    ],
  },
  {
    id: 'malware',
    title: 'Malware & Technical Scams',
    icon: Bug,
    color: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    types: [
      { title: 'Malware Fraud', slug: 'malware', description: 'Malicious apps and attachments steal data, track activity, or enable remote access without your consent.' },
      { title: 'Scareware / Ransomware', slug: 'ransomware', description: 'Ransomware encrypts files and demands payment. Scareware pushes fake virus alerts to sell useless software.' },
      { title: 'Tech Support Scam', slug: 'tech_support', description: 'Fake "technicians" pressure you to grant remote access or pay for fixing non-existent problems.' },
      { title: 'Deepfake Fraud', slug: 'deepfake', description: 'AI-generated audio/video convincingly imitates real people to endorse scams or manipulate decisions.' },
    ],
  },
  {
    id: 'banking',
    title: 'Banking & Financial Crime',
    icon: Landmark,
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    types: [
      { title: 'Credit Card Fraud', slug: 'credit_card_fraud', description: 'Unauthorized online purchases or cash withdrawals using stolen card details or compromised merchants.' },
      { title: 'Identity Theft', slug: 'identity_theft', description: 'Criminals use your personal data to open accounts, take loans, or commit crimes in your name.' },
      { title: 'Loan Scam', slug: 'loan_scam', description: '"Guaranteed" loans that demand upfront fees. After payment, the lender disappears and no loan is issued.' },
      { title: 'Grant/Subsidy Scam', slug: 'grant_scam', description: 'Fraudsters promise "government grants" if you pay administrative fees. Real grants never require advance payments.' },
    ],
  },
  {
    id: 'shopping',
    title: 'Online Sales & Purchase Fraud',
    icon: ShoppingBag,
    color: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    types: [
      { title: 'Online Purchase Scam', slug: 'online_purchase', description: 'You pay for goods that never arrive, or receive items far below the advertised quality—typically on unverified shops.' },
      { title: 'Fake E-shop', slug: 'fake_eshop', description: 'Professional-looking websites mimic well-known brands and offer extreme discounts, then disappear after taking payment.' },
      { title: 'Counterfeit / Low-Quality Goods', slug: 'fake_goods', description: 'Knock-offs or goods drastically worse than advertised, often sold via marketplaces or unregulated shops.' },
      { title: 'Marketplace Fraud', slug: 'online_marketplace', description: 'Scammers post non-existent items, ask for deposits, or send fake payment links. Prefer in-person verified exchanges.' },
    ],
  },
  {
    id: 'employment',
    title: 'Employment & Service-Related Fraud',
    icon: Briefcase,
    color: 'from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    types: [
      { title: 'Job Offer Scam', slug: 'job_offer', description: '"Dream job" offers require upfront training fees or harvest personal data via fake applications.' },
      { title: 'Fake Invoices', slug: 'fake_invoice', description: 'Invoices for services never ordered, often targeting SMEs and freelancers to slip into routine payments.' },
      { title: 'Wage Non-Payment', slug: 'wage_nonpayment', description: 'Employers exploit trial work or projects, then avoid paying. Keep contracts and evidence of work delivered.' },
    ],
  },
  {
    id: 'identity',
    title: 'Online Accounts & Identity',
    icon: UserCog,
    color: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    types: [
      { title: 'Account Verification Scam', slug: 'account_verification', description: 'Fake "Facebook/Instagram" messages urge you to log in to "verify" your account and steal credentials.' },
      { title: 'SIM Swap', slug: 'sim_swap', description: 'Attackers transfer your number to their SIM to intercept 2FA codes and hijack accounts.' },
    ],
  },
];

// Mock data removed - now using real API

// API Response types
interface SearchApiResponse {
  results: Array<{
    id: string;
    public_id: string;
    fraud_type: string;
    summary: string;
    description: string;
    incident_date: string;
    location: {
      country?: string;
      city?: string;
    };
    financial_loss?: {
      amount: number;
      currency: string;
    };
    status: string;
    created_at: string;
    perpetrator?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    match_score: number;
    similar_count?: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  facets?: {
    fraud_types: Array<{ value: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
    statuses: Array<{ value: string; count: number }>;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

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
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date-desc');
  const [totalResults, setTotalResults] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showFieldMap, setShowFieldMap] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy]);

  const handleSearch = async () => {
    // Require at least 2 characters for search
    if (filters.query && filters.query.length < 2) {
      setSearchError('Zadajte aspoň 2 znaky pre vyhľadávanie');
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.query) {
        params.set('q', filters.query);
      }

      // Set search mode
      params.set('mode', 'auto');

      // Pagination
      params.set('page', currentPage.toString());
      params.set('limit', '10');

      // Filters
      if (filters.fraudType && filters.fraudType !== 'all') {
        params.set('fraud_type', filters.fraudType);
      }
      if (filters.country && filters.country !== 'all') {
        params.set('country', filters.country);
      }
      if (filters.dateFrom) {
        params.set('date_from', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('date_to', filters.dateTo);
      }

      // Sorting
      if (sortBy === 'date-desc') {
        params.set('sort', 'created_at');
        params.set('order', 'desc');
      } else if (sortBy === 'date-asc') {
        params.set('sort', 'created_at');
        params.set('order', 'asc');
      } else if (sortBy === 'amount-desc') {
        params.set('sort', 'financial_loss');
        params.set('order', 'desc');
      } else if (sortBy === 'amount-asc') {
        params.set('sort', 'financial_loss');
        params.set('order', 'asc');
      } else if (sortBy === 'relevance') {
        params.set('sort', 'relevance');
        params.set('order', 'desc');
      }

      // Call the real API
      const response = await fetch(`/api/v1/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Chyba pri vyhľadávaní (${response.status})`);
      }

      const data: SearchApiResponse = await response.json();

      // Transform API response to Report format
      const transformedReports: Report[] = data.results.map((result) => ({
        id: result.public_id || result.id,
        title: result.summary || 'Bez názvu',
        description: result.description || '',
        fraudType: result.fraud_type as Report['fraudType'],
        country: result.location?.country || '',
        city: result.location?.city || '',
        amount: result.financial_loss?.amount,
        currency: result.financial_loss?.currency || 'EUR',
        status: result.status as Report['status'],
        createdAt: result.created_at,
        perpetratorName: result.perpetrator?.name,
        perpetratorPhone: result.perpetrator?.phone,
        perpetratorEmail: result.perpetrator?.email,
        similarReportsCount: result.similar_count,
      }));

      setReports(transformedReports);
      setTotalResults(data.pagination.total);
      setTotalPages(data.pagination.total_pages);

    } catch (error) {
      console.error('[Search] Error:', error);
      setSearchError(error instanceof Error ? error.message : 'Nastala chyba pri vyhľadávaní');
      // Fallback to empty results
      setReports([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.breadcrumbList) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0E74FF]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E74FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E74FF]/20 backdrop-blur-sm border border-[#0E74FF]/30 mb-8">
                <Shield className="h-4 w-4 text-[#0E74FF]" />
                <span className="text-sm font-semibold text-[#0E74FF]">Most Advanced Scam Detection Platform</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                Free Scam Checker — Verify People, Websites, Phone Numbers, Emails, Bank Accounts & Crypto + more
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                Welcome to the most advanced platform for scam detection and prevention. Paste a URL, phone number, email, bank account, wallet address, or a person&apos;s name to run a real-time check. Get results in seconds.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">130+</div>
                  <div className="text-xs md:text-sm text-slate-400">Data Sources</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">612M+</div>
                  <div className="text-xs md:text-sm text-slate-400">Records</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">38+</div>
                  <div className="text-xs md:text-sm text-slate-400">Search Types</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-xs md:text-sm text-slate-400">Real-time Updates</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-[#0E74FF] hover:bg-[#0E74FF]/90 text-white px-8 py-6 text-lg shadow-lg shadow-[#0E74FF]/30 hover:shadow-xl hover:shadow-[#0E74FF]/40 transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Start Free Search
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Community Access Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-3">
                    Community Access Required
                  </h2>
                  <p className="text-[#64748b] leading-relaxed mb-4">
                    To comply with GDPR regulations, you need to join our community before searching our database. This helps us maintain legal access to shared fraud information while protecting privacy rights.
                  </p>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Users className="mr-2 h-4 w-4" />
                    Join Community
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Description */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                    <Database className="h-4 w-4 text-[#0E74FF]" />
                    <span className="text-sm font-semibold text-[#0E74FF]">About Our Platform</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-6 leading-tight">
                    The First Platform of Its Kind
                  </h2>
                  <p className="text-[#64748b] leading-relaxed mb-6">
                    We&apos;re a platform that systematically collects and analyzes data on scams and scammers. As the first of its kind, we combine investigative work with modern technology to detect and prevent fraud.
                  </p>
                  <p className="text-[#64748b] leading-relaxed mb-6">
                    We tap into <strong className="text-[#1e293b]">130+ data sources</strong>, look for patterns, and link recurring schemes across cases. Anyone who&apos;s been scammed can report their case safely — even anonymously. That helps us connect victims to one another and to existing case files faster, moving investigations forward.
                  </p>
                  <p className="text-[#64748b] leading-relaxed">
                    We give you an easy way to vet partners, companies, websites, social profiles, phone numbers, bank accounts, and crypto wallets — before you commit to an investment, a deal, or a relationship. <strong className="text-[#1e293b]">Join us and help make the internet a safer place.</strong>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: 'Websites', desc: 'URL & Domain check' },
                    { icon: User, label: 'People', desc: 'Name verification' },
                    { icon: Phone, label: 'Phone', desc: 'Number lookup' },
                    { icon: Mail, label: 'Email', desc: 'Address search' },
                    { icon: CreditCard, label: 'Bank', desc: 'IBAN & Account' },
                    { icon: Bitcoin, label: 'Crypto', desc: 'Wallet address' },
                    { icon: Building, label: 'Company', desc: 'Business check' },
                    { icon: Car, label: 'Vehicle', desc: 'License plate' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="group p-5 bg-[#f8fafc] rounded-2xl border border-slate-200 hover:border-[#0E74FF]/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#0E74FF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-6 w-6 text-[#0E74FF]" />
                      </div>
                      <h3 className="font-bold text-[#1e293b] mb-1">{item.label}</h3>
                      <p className="text-sm text-[#64748b]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 mb-8 shadow-lg border border-[#0E74FF]/20">
                  <Target className="h-8 w-8 text-[#0E74FF]" />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                  How to Verify a Company, Person, or Domain Before You Trust
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden lg:block absolute top-8 left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-[#0E74FF] via-[#0E74FF] to-[#0E74FF] rounded-full" />

                <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <Search className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Search</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        Enter an identifier for the person or entity you want to check—such as a name, email, phone number, domain/URL, IBAN, social media handle, license plate number, etc. The more identifiers you try, the better your chances of finding a match.
                      </p>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 w-full">
                        <p className="font-semibold text-[#1e293b] text-sm mb-3 flex items-center gap-2">
                          <Filter className="h-4 w-4 text-[#0E74FF]" />
                          You can also filter by:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {['Date', 'Country', 'Case Type'].map((f) => (
                            <span key={f} className="px-3 py-1.5 bg-[#0E74FF]/5 text-[#0E74FF] rounded-lg text-xs font-medium border border-[#0E74FF]/20">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <FileText className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Results</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        If the system finds a match, it will show results sorted by how closely they match your query. The best matches appear at the top; similarity decreases as you scroll. We recommend reviewing several results, especially when you&apos;re dealing with common names or incomplete data.
                      </p>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 w-full">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-[#0E74FF] uppercase tracking-wide">Match Score</span>
                          <span className="text-lg font-bold text-[#0E74FF]">95%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#0E74FF] to-[#0a5ed4] rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4] text-white flex items-center justify-center font-bold text-2xl shadow-lg z-10 relative mb-6 hover:scale-110 transition-transform duration-300">
                        3
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0E74FF]/10 to-[#0E74FF]/20 flex items-center justify-center mb-6 border border-[#0E74FF]/20 shadow-md">
                        <Shield className="h-10 w-10 text-[#0E74FF]" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1e293b] mb-4 text-center">Case Details & Safe Communication</h3>
                      <p className="text-[#64748b] leading-relaxed text-center mb-6">
                        Clicking a result opens a report with all available information. Some sensitive fields may be blurred for legal and safety reasons. You can comment on a case and discuss it with other victims.
                      </p>
                      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 w-full">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-900 text-sm mb-1">Stay Anonymous</p>
                            <p className="text-amber-800 text-xs leading-relaxed">
                              Don&apos;t share your real name or phone number. Communicate only on the platform.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Link2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e293b] mb-2">Auto-Linked Cases</h4>
                    <p className="text-[#64748b] leading-relaxed">
                      Our system automatically links cases that share the same identifiers (e.g., email, name, phone number, domain). You can navigate those connections and explore related cases. <strong className="text-[#1e293b]">Security is in your hands.</strong> — ScamNemesis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="search-section" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Search Our Database</h2>
              <p className="text-[#64748b] max-w-2xl mx-auto">
                Browse reported scams and protect yourself from fraudsters
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Found <span className="font-semibold text-foreground">{reports.length}</span> of{' '}
                      <span className="font-semibold text-foreground">{totalResults}</span> results
                    </p>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest</SelectItem>
                        <SelectItem value="date-asc">Oldest</SelectItem>
                        <SelectItem value="amount-desc">Amount (desc)</SelectItem>
                        <SelectItem value="amount-asc">Amount (asc)</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Error Display */}
                {searchError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-red-700">{searchError}</p>
                    </div>
                  </div>
                )}

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
        </section>

        {/* Field Map & Rules Section */}
        <section className="w-full py-16 md:py-24 bg-[#f8fafc]">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                  <Database className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-semibold text-[#0E74FF]">More Information</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                  ScamNemesis – Field Map & Rules
                </h2>
                <p className="text-[#64748b] max-w-3xl mx-auto mb-6">
                  Overview of all fields in the system, their properties, and processing rules. Below you&apos;ll find an overview of the data we process, how it&apos;s organized, and which identifiers you can search for.
                </p>

                <button
                  onClick={() => setShowFieldMap(!showFieldMap)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#0E74FF]/30 transition-all duration-300"
                >
                  <span className="font-semibold text-[#1e293b]">
                    {showFieldMap ? 'Hide' : 'Show'} Field Map Table
                  </span>
                  <ChevronDown className={`h-5 w-5 text-[#64748b] transition-transform duration-300 ${showFieldMap ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Legend */}
              {showFieldMap && (
                <>
                  <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-slate-200">
                    <h3 className="font-bold text-[#1e293b] mb-4">Column Definitions & Legend</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Required</p>
                        <p className="text-xs text-[#64748b]">Indicates whether the field is mandatory when reporting a new case.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">In Report</p>
                        <p className="text-xs text-[#64748b]">Specifies whether this data appears in the generated case report.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Anonymization</p>
                        <p className="text-xs text-[#64748b]">Some sensitive data is automatically anonymized, but you can still search it.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b] mb-2">Search</p>
                        <p className="text-xs text-[#64748b]">Indicates which data can be searched directly vs. via filters.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" /> Yes
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" /> No
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                        <Filter className="h-3.5 w-3.5" /> Filter only
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        <Eye className="h-3.5 w-3.5" /> PUBLIC
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        <EyeOff className="h-3.5 w-3.5" /> ANONYMOUS
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Desktop Header */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-[#1e293b]">
                      <div className="col-span-4">Field</div>
                      <div className="col-span-1 text-center">Required</div>
                      <div className="col-span-1 text-center">In Report</div>
                      <div className="col-span-2 text-center">Anonymization</div>
                      <div className="col-span-2 text-center">Search</div>
                      <div className="col-span-2">Note</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                      {fieldMapData.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:px-6 hover:bg-slate-50 transition-colors"
                        >
                          {/* Field Name */}
                          <div className="lg:col-span-4">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Field</div>
                            <p className="font-medium text-[#1e293b] text-sm">{row.field}</p>
                          </div>

                          {/* Required */}
                          <div className="lg:col-span-1">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Required</div>
                            <div className="flex lg:justify-center">
                              {row.required ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                            </div>
                          </div>

                          {/* In Report */}
                          <div className="lg:col-span-1">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">In Report</div>
                            <div className="flex lg:justify-center">
                              {row.inReport ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Anonymization */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Anonymization</div>
                            <div className="flex lg:justify-center">
                              {row.anonymization === 'PUBLIC' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                  <Eye className="h-3 w-3" /> PUBLIC
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                  <EyeOff className="h-3 w-3" /> ANONYMOUS
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Search */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Search</div>
                            <div className="flex lg:justify-center">
                              {row.search === 'YES' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Yes
                                </span>
                              )}
                              {row.search === 'NO' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> No
                                </span>
                              )}
                              {row.search === 'FILTER' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  <Filter className="h-3 w-3" /> Filter
                                </span>
                              )}
                              {row.search === 'MEDIA' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  Media
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Note */}
                          <div className="lg:col-span-2">
                            <div className="lg:hidden text-xs font-medium text-[#64748b] mb-1">Note</div>
                            <p className="text-xs text-[#64748b]">{row.note || '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Scam Types Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E74FF]/10 border border-[#0E74FF]/20 mb-6">
                  <AlertTriangle className="h-4 w-4 text-[#0E74FF]" />
                  <span className="text-sm font-semibold text-[#0E74FF]">Scam Categories</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                  Most Common Types of Scams
                </h2>
                <p className="text-[#64748b] max-w-3xl mx-auto">
                  Here you&apos;ll find a list of the most common scams with brief explanations of how they work—so you can categorize cases and search more easily.
                </p>
              </div>

              {/* Categories Accordion */}
              <div className="space-y-4">
                {scamCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#0E74FF]/30 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${category.iconBg}`}>
                            <Icon className={`h-7 w-7 md:h-8 md:w-8 ${category.iconColor}`} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-[#1e293b] mb-1">
                              {category.title}
                            </h3>
                            <p className="text-sm md:text-base text-[#64748b]">
                              {category.types.length} scam types
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-6 w-6 text-[#64748b] transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-[#f8fafc]">
                          <div className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-4">
                              {category.types.map((type) => (
                                <div
                                  key={type.slug}
                                  className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#0E74FF]/50 hover:shadow-md transition-all duration-300"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${category.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                      <Icon className={`h-5 w-5 ${category.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-[#1e293b] mb-2 text-base group-hover:text-[#0E74FF] transition-colors duration-300">
                                        {type.title}
                                      </h4>
                                      <p className="text-sm text-[#64748b] leading-relaxed">
                                        {type.description}
                                      </p>
                                      <p className="mt-2 text-xs text-[#94a3b8] font-mono">
                                        slug: {type.slug}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#0E74FF] to-[#0a5ed4]">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Verify?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Start your free search now and protect yourself from scams. Join thousands of users who trust ScamNemesis for fraud detection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#0E74FF] hover:bg-white/90 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Start Free Search
                </Button>
                <Link href="/report">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Report a Scam
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
