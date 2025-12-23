'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Shield,
  Lock,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Car,
  Coins,
  CreditCard,
  FileText,
  Scale,
  GraduationCap,
  Briefcase,
  Target,
  FileSearch,
  Network,
  Calendar,
  ArrowRight,
  ChevronDown,
  Sparkles,
  BookOpen,
  Filter,
  X,
  Loader2,
  MapPin,
  ExternalLink,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fraud type options for filter
const fraudTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'INVESTMENT_FRAUD', label: 'Investment Fraud' },
  { value: 'ROMANCE_SCAM', label: 'Romance Scam' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'IDENTITY_THEFT', label: 'Identity Theft' },
  { value: 'ONLINE_SHOPPING_FRAUD', label: 'E-commerce Fraud' },
  { value: 'CRYPTOCURRENCY_SCAM', label: 'Crypto Scam' },
  { value: 'EMPLOYMENT_SCAM', label: 'Employment Scam' },
  { value: 'RENTAL_SCAM', label: 'Rental Scam' },
  { value: 'ADVANCE_FEE_FRAUD', label: 'Advance Fee Fraud' },
  { value: 'FAKE_CHARITY', label: 'Fake Charity' },
  { value: 'TECH_SUPPORT_SCAM', label: 'Tech Support Scam' },
  { value: 'LOTTERY_PRIZE_SCAM', label: 'Lottery Scam' },
  { value: 'PYRAMID_MLM_SCHEME', label: 'Pyramid/MLM' },
  { value: 'PONZI_SCHEME', label: 'Ponzi Scheme' },
  { value: 'OTHER', label: 'Other' },
];

// Country options for filter
const countryOptions = [
  { value: '', label: 'All Countries' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'AT', label: 'Austria' },
  { value: 'PL', label: 'Poland' },
  { value: 'HU', label: 'Hungary' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'RU', label: 'Russia' },
  { value: 'CN', label: 'China' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'IN', label: 'India' },
];

// Search result interface
interface SearchResult {
  id: string;
  score: number;
  source: string;
  perpetrator: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  fraud_type: string;
  country?: string;
  incident_date?: string;
}

// Fraud type label mapping
const fraudTypeLabels: Record<string, string> = {
  investment_fraud: 'Investment Fraud',
  romance_scam: 'Romance Scam',
  phishing: 'Phishing',
  identity_theft: 'Identity Theft',
  online_shopping_fraud: 'E-commerce Fraud',
  cryptocurrency_scam: 'Crypto Scam',
  employment_scam: 'Employment Scam',
  rental_scam: 'Rental Scam',
  advance_fee_fraud: 'Advance Fee Fraud',
  fake_charity: 'Fake Charity',
  tech_support_scam: 'Tech Support Scam',
  lottery_prize_scam: 'Lottery Scam',
  pyramid_mlm_scheme: 'Pyramid/MLM',
  ponzi_scheme: 'Ponzi Scheme',
  other: 'Other',
};

// Fraud type colors
const fraudTypeColors: Record<string, { bg: string; text: string }> = {
  investment_fraud: { bg: 'bg-red-500/20', text: 'text-red-300' },
  romance_scam: { bg: 'bg-pink-500/20', text: 'text-pink-300' },
  phishing: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  identity_theft: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  online_shopping_fraud: { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
  cryptocurrency_scam: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  employment_scam: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  rental_scam: { bg: 'bg-green-500/20', text: 'text-green-300' },
  advance_fee_fraud: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  fake_charity: { bg: 'bg-rose-500/20', text: 'text-rose-300' },
  tech_support_scam: { bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  lottery_prize_scam: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  pyramid_mlm_scheme: { bg: 'bg-violet-500/20', text: 'text-violet-300' },
  ponzi_scheme: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300' },
  other: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
};

// JSON-LD Schemas
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  logo: 'https://scamnemesis.com/logo.png',
  description: 'Fraud prevention platform with 640M+ records from 130+ trusted sources',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@scamnemesis.com',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://twitter.com/scamnemesis',
    'https://linkedin.com/company/scamnemesis',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ScamNemesis',
  url: 'https://scamnemesis.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://scamnemesis.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is this platform for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ScamNemesis is for people who want to verify a person, company, phone number, email, or website. It also helps those who have been scammed to report their case and connect with other victims.',
      },
    },
    {
      '@type': 'Question',
      name: 'What problem are we solving?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online fraud grew 2,300% between 2019-2024 with losses reaching USD 1.03 trillion. ScamNemesis consolidates reports into coordinated cases, links victims with similar patterns, and provides preventive verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I use ScamNemesis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the search bar to enter names, emails, phone numbers, and other identifiers. Click Report Scam to file a case. The more identifiers you include, the higher the chance of matching with other victims.',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Fraud Recovery Services',
  provider: {
    '@type': 'Organization',
    name: 'ScamNemesis',
  },
  description: 'Recovery of funds lost to fraud through digital forensics, OSINT, and legal coordination.',
  offers: {
    '@type': 'Offer',
    price: '600',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
};

// FAQ sections data
const faqSections = [
  {
    id: '1',
    title: '1. Who is this platform for?',
    content: `ScamNemesis is for people who want to verify a person, company, phone number, email, or website The list can be found here. It's also for people who have already been scammed and want to report their case and connect with other victims of the same perpetrator. The platform helps both everyday users and professionals — police, journalists, lawyers, analysts, banks, and exchanges. Reported cases can be sent to partners via API who can pause payments to protect your money (service in preparation). All reports are manually reviewed by experts before publication.

Distinguishing a scam from a legitimate service is hard today — anyone can be fooled. If it happened to you, you're not alone; we're here to help.`,
    icon: Users,
    color: 'blue',
  },
  {
    id: '2',
    title: '2. What problem are we solving?',
    content: `There is no single "global" number, but data shows that online fraud grew by roughly 2,300% between 2019 and 2024; in 2024, estimated losses reached USD 1.03 trillion. In practice, one scammer can create 10–100 cases per month, which fragments evidence and severely overloads the police, making effective case resolution difficult.

ScamNemesis brings order to this chaos: it consolidates reports and evidence into a single coordinated case, automatically links victims with similar patterns, saves investigators time, and accelerates investigations. It also works preventively — anyone can verify a person, company, domain, phone number, and 38 additional identifiers associated with scams. The tool is free and available to everyone.`,
    icon: AlertTriangle,
    color: 'amber',
  },
  {
    id: '3',
    title: '3. How to use ScamNemesis?',
    content: `Search:

At the top, you'll find the search bar where you can enter a name, email, phone number, and other identifiers list is here. Results are shown by match score — the lower an item appears, the weaker the match, so we recommend checking more cases. Clicking a Case opens a report with all information provided by the reporter. Some data is anonymized for safety and legal reasons. Reports may include photos, documents, and comments from others; you can also add your own comment. The "Find similar cases" feature shows records with the highest similarity and explains exactly what matched and to what degree (e.g., the same phone number).

Reporting:

If you've been scammed, click Report scam. A form will open — most fields are optional, but we recommend adding as many details as possible. Reporter data is kept strictly anonymous and not shared; we don't require a real name or primary email (you can use a separate address just for this). Keep your access details safe. You will receive instructions and a link by email to manage your case — add, edit, or delete it from the database.

Interpreting matches:

Remember that the same name ≠ the same person. If you search "John Smith" in the USA and find a "John Smith" in the UK for a different type of scam, it's likely just a namesake. Evaluate the context (country, scam type, time, other identifiers). The most reliable signals are unique data such as email, phone number, bank account/IBAN, or a crypto address. Don't jump to conclusions — stay cautious.`,
    icon: Search,
    color: 'cyan',
  },
  {
    id: '4',
    title: '4. Why is this important?',
    content: `Every unreported scam helps scammers reach more victims, causes more ruined lives, and creates more suffering for victims and their families. We want to stop that.

When communities share data across countries, patterns emerge: the same "investment opportunity" pops up in dozens of states, the identical profile photo runs across dozens of fake accounts, and the same crypto wallet links to known scam networks. Shared intelligence breaks their biggest advantage — isolation. One person's warning becomes protection for everyone.

ScamNemesis unifies, cleans, and evaluates these signals so investigative teams can prioritize what matters. That's why we build simple integrations — API, widget, and forensic tools — so data can be used immediately in external systems to deliver real prevention and a faster response.`,
    icon: Shield,
    color: 'emerald',
  },
  {
    id: '5',
    title: '5. Why did we create this project?',
    content: `The project was born out of anger and frustration with ineffective police methods. We ourselves became victims of fraud, and the police could not help because they were overwhelmed and lacked the tools and expertise to tackle modern types of scams. When someone loses all their money, it is devastating for them and their family. This has to stop!

Police units that are expected to "help" in the hardest moments and be reliable often cannot assist, while modern scam crime is growing at an alarming scale.

It is time to act, so we decided to use our knowledge of OSINT, hacking, and intelligence to help people and investigative teams with prevention and detection of fraud.`,
    icon: Target,
    color: 'rose',
  },
  {
    id: '6',
    title: '6. What is ScamNemesis?',
    content: `A community-driven verification and intelligence platform that combines a reported-scam database, blockchain tracing, monitoring across 130+ data sources, phone and email verification, face recognition, document forensics (OCR + metadata analysis), and relationship mapping. For example, you can enter a phone number, crypto wallet, or a person's name and instantly see whether it's flagged, who/what it is linked to, and which behavior pattern it matches.

We are also building forensic tools used by investigators and integrating them into our platform to be even more effective. We share signals with law-enforcement authorities, partner banks, and other high-risk platforms to maximize your chances of recovering funds if you become a victim.`,
    icon: Database,
    color: 'indigo',
  },
  {
    id: '7',
    title: '7. What will you find here?',
    content: `A search system for more than 38 identifiers (e.g., name, email, phone, etc.) that helps you determine whether you're dealing with a scammer and protect your assets. You'll find the exact list of supported identifiers and a guide on how to search in our system.

When there's a match, a report appears with all available details about the suspect and relevant case information to help you minimize risk. You can also report an incident and find other victims of the same perpetrator — through coordination and information sharing, the chances of exposure and prosecution rise significantly.`,
    icon: FileSearch,
    color: 'purple',
  },
  {
    id: '8',
    title: '8. Who is behind this project?',
    content: `An international team of investigators and ethical hackers from three continents and more than five countries — experts in cybersecurity, data analytics, and professionals with training and experience in intelligence tradecraft.

Our goal is to remain free forever. Because pure self-funding is not sustainable long term, part of the project will include advertising, and we will seek additional support through grants and donations from the public (if you'd like to help, you can donate here). All methodology, data sources, and funding will be publicly documented. We build on transparency because trust must be earned — not merely declared.`,
    icon: Users,
    color: 'teal',
  },
  {
    id: '9',
    title: '9. What are we planning for the future?',
    content: `Below, you can view a table that shows exactly what we are building next and what we have already shipped. ScamNemesis aims to become the most effective and widely adopted tool for active fraud disruption, prevention, and detection. The concept has been in development for over a year. We believe that with ScamNemesis, we can significantly reduce fraud.`,
    icon: Sparkles,
    color: 'orange',
  },
];

// Roadmap features
const roadmapFeatures = [
  { name: 'API: dispatch data to three parties', status: 'development', progress: 80, description: 'With a single call we send relevant information to the bank/payment gateway and to authorities — this speeds up blocking transactions and escalation.' },
  { name: 'Scam search (38+ identifiers)', status: 'functional', progress: 100, description: 'Search by email, phone, name, IBAN, domain, IP, crypto wallet, etc., across our database and external sources.' },
  { name: 'Case linking (similarities)', status: 'functional', progress: 100, description: 'Automatically links related cases by matching indicators and patterns (email, phone, domain, wallet…).' },
  { name: 'Media processing + OCR', status: 'functional', progress: 80, description: 'Upload screenshots, chats, and documents → OCR extracts the text and saves it to the database for further searching.' },
  { name: 'Website widget (reporting + search)', status: 'development', progress: 24, description: 'Simple embed for partner sites — people can report and search directly on their own website.' },
  { name: 'Blockchain analysis', status: 'development', progress: 56, description: 'Mapping the flow of cryptocurrencies flagged on-chain as stolen or linked to criminal activity.' },
  { name: 'CTI (Cyber Threat Intelligence)', status: 'development', progress: 52, description: 'Cyber threat intelligence; the goal is broad visibility and current trends for prevention, detection, and response — without vendor lock-in.' },
  { name: 'AI/NLP tool for OSINT collection', status: 'development', progress: 50, description: 'Continuously monitors dozens of online sources and automatically builds a clean news feed; NLP removes duplicates, classifies content by scam type, and prepares short reports. Watchlists with keywords and entities instantly alert on new matches and trigger alerts on spikes in mentions.' },
  { name: 'AI image and video detection (deepfake)', status: 'development', progress: 69, description: 'Detects AI-generated content and manipulations; explains signals and assigns a risk score.' },
  { name: 'Graph database (nodes & relationships)', status: 'development', progress: 61, description: 'Network views of links between people, companies, accounts, and cases; quick "who with whom" and "money to where".' },
  { name: 'Data enrichment from 130+ external sources', status: 'development', progress: 0, description: 'Integrations for OSINT, reputation, and security feeds for emails, phones, IPs, domains, and blockchain.' },
  { name: 'Email verification (existence/registrations/age*)', status: 'planned', progress: 50, description: 'Checks deliverability, where the email is used/registered, and where possible, signals of account age*.' },
  { name: 'People & company search', status: 'development', progress: 68, description: 'With a single query searches open registers, gazettes, and available court decisions; returns a summary with sources.' },
  { name: 'Reverse face search', status: 'planned', progress: 58, description: 'Upload a photo and the system finds matches in the internal database and social networks (with spoof protection).' },
  { name: 'Similar face matching (upload)', status: 'planned', progress: 52, description: 'Compares and ranks the most similar faces; supports batch queries.' },
  { name: 'Media forensics: geolocation & edits', status: 'planned', progress: 57, description: 'EXIF/metadata, ELA, manipulation detection, geo-cues, audio-video inconsistencies.' },
  { name: 'AI bot "Is this a scam?"', status: 'planned', progress: 0, description: 'A chat assistant that quickly advises based on signals: what to watch for, what to verify, and which steps to take.' },
  { name: 'Domain score & reputation', status: 'development', progress: 59, description: 'WHOIS, DNS, SSL/TLS, blacklists, hosting, technology — resulting in a domain risk score.' },
  { name: 'Media forensics — advanced modules', status: 'planned', progress: 53, description: 'Advanced tools for image, video, and audio (manipulation localization, liveness, chain of custody).' },
];

// Training topics
const trainingTopics = [
  'How to prevent fraud in business',
  'Identity protection insurance',
  'Experian Identity Theft Protection',
  'Safety on the internet',
  '10 ways to prevent cybercrime',
  'How to recognize a scam',
  'Scammer helpline',
  'Report cybercrime to the police',
];

// Database categories
const databaseCategories = [
  {
    title: 'Cryptocurrency Fraud',
    icon: Coins,
    color: 'orange',
    stats: [
      { label: 'Crypto Addresses', value: '50,000+' },
      { label: 'Scam Projects', value: '9,221+' },
      { label: 'Ransomware Wallets', value: '11,186+' },
      { label: 'Blockchain Chains', value: '16+' },
    ],
    sources: 'Chainabuse, CryptoScamDB, ScamSniffer, OpenSanctions Ransomwhere',
  },
  {
    title: 'Emails & Domains',
    icon: Mail,
    color: 'blue',
    stats: [
      { label: 'Phishing URLs', value: '9M+' },
      { label: 'Malicious Domains', value: '2.29M+' },
      { label: 'Discord Scam Links', value: '30,000+' },
      { label: 'Spam Domains', value: 'Billions' },
    ],
    sources: 'PhishTank, URLhaus, OpenPhish, Google Safe Browsing, Spamhaus',
  },
  {
    title: 'Phone Numbers',
    icon: Phone,
    color: 'purple',
    stats: [
      { label: 'Scam Calls (US)', value: '2M+' },
      { label: 'Robocall Reports', value: '1.2M+' },
      { label: 'Known Scammers', value: '4M+' },
      { label: 'Daily Updates', value: '✓' },
    ],
    sources: 'FTC DNC API, ScamSearch.io, Community databases',
  },
  {
    title: 'IP Addresses',
    icon: Network,
    color: 'green',
    stats: [
      { label: 'Malicious IPs', value: '612M+' },
      { label: 'Tor Exit Nodes', value: '2,000+' },
      { label: 'Threat Indicators', value: 'Millions' },
      { label: 'Network Blocks', value: 'Hundreds' },
    ],
    sources: 'AbuseIPDB, ThreatFox, FireHOL, AlienVault OTX, Spamhaus',
  },
  {
    title: 'Sanctions & Lists',
    icon: AlertTriangle,
    color: 'red',
    stats: [
      { label: 'OFAC SDN Entities', value: '12,000+' },
      { label: 'FBI Most Wanted', value: '1,000+' },
      { label: 'UN Individuals', value: '669' },
      { label: 'Global Sources', value: '130+' },
    ],
    sources: 'OFAC, FBI, UN, EU, UK OFSI, OpenSanctions',
  },
  {
    title: 'Social Media',
    icon: Users,
    color: 'indigo',
    stats: [
      { label: 'Telegram Channels', value: '120,979' },
      { label: 'Twitter Bot Accounts', value: '50,538+' },
      { label: 'Instagram Fakes', value: '3,600+' },
      { label: 'LinkedIn Profiles', value: '3,600+' },
    ],
    sources: 'TGDataset, TwiBot-20, Discord AntiScam, InstaFake',
  },
  {
    title: 'Financial Fraud',
    icon: CreditCard,
    color: 'cyan',
    stats: [
      { label: 'CFPB Complaints', value: '3M+' },
      { label: 'IC3 Reports (2024)', value: '859,000' },
      { label: 'Australia Reports', value: '494,000' },
      { label: 'Dissolved Companies', value: '6.7M+' },
    ],
    sources: 'CFPB, FBI IC3, Scamwatch AU, Companies House UK',
  },
  {
    title: 'Stolen Vehicles',
    icon: Car,
    color: 'slate',
    stats: [
      { label: 'Interpol Database', value: '12M+' },
      { label: 'US Coverage', value: '87%' },
      { label: 'NICB VINCheck', value: '5 Years' },
      { label: 'Real-time Updates', value: '✓' },
    ],
    sources: 'Interpol SMV, NICB VINCheck, NMVTIS',
  },
];

// Service features data
const recoveryFeatures = [
  { icon: FileSearch, text: 'Case analysis', desc: 'Assessment of the real chance of recovery, evidence collection and evaluation.' },
  { icon: Database, text: 'Digital forensics', desc: 'Blockchain tracing, OSINT, communication and metadata analysis.' },
  { icon: Lock, text: 'Asset freezing', desc: 'Contacting banks and exchanges, preparing and sending Freezing Letters.' },
  { icon: Scale, text: 'Legal coordination', desc: 'Drafting orders and filings, coordination with attorneys and authorities.' },
  { icon: FileText, text: 'Preparation of recovery documentation', desc: 'Arbitration, litigation, out-of-court settlement.' },
  { icon: Users, text: 'Victim support', desc: 'Reporting, ongoing communication, recommendations and prevention.' },
];

const dueDiligenceFeatures = [
  { icon: Building, text: 'Entity and UBO identification', desc: 'KYB/KYC, verification of registrations, ownership structure, PEP and sanctions checks.' },
  { icon: Scale, text: 'Reputational and legal screening', desc: 'adverse media, litigation, insolvency registers, regulatory actions.' },
  { icon: CreditCard, text: 'Financial and operational indicators', desc: 'baseline financial health, affiliations, red flags (debt, tax arrears).' },
  { icon: Lock, text: 'Technical and security footprint', desc: 'domains, infrastructure, emails, data leaks, digital footprints of key people.' },
  { icon: Network, text: 'Business ties and conflicts of interest', desc: 'network mapping of partners, risky connections, political exposure.' },
  { icon: FileText, text: 'Deliverables', desc: 'risk summary (RAG), detailed report with evidence, red flags, and recommended actions (monitoring, contractual clauses).' },
];

const investigationFeatures = [
  { icon: Target, text: 'Scoping & preservation', desc: 'rapid hypotheses, evidence preservation.' },
  { icon: Database, text: 'Digital forensics', desc: 'devices, email, logs, cloud.' },
  { icon: Search, text: 'OSINT & reputational analysis', desc: 'mapping people/companies, links, adverse media.' },
  { icon: CreditCard, text: 'Financial investigation', desc: 'flows (bank/crypto), fake invoices, kickbacks.' },
  { icon: AlertTriangle, text: 'Incident response', desc: 'BEC/ransomware/insider, damage mitigation.' },
  { icon: Scale, text: 'Legal coordination', desc: 'filings, communication with authorities.' },
];

const trainingFeatures = [
  { icon: GraduationCap, text: 'Security awareness & anti-fraud program', desc: 'role-based, for finance/CS/support.' },
  { icon: Mail, text: 'Phishing/smishing simulations', desc: '+ quick "fix-it" micro-lessons.' },
  { icon: Target, text: 'Incident response tabletop exercises', desc: 'BEC, ransomware, data breach.' },
  { icon: Lock, text: 'OSINT & privacy hygiene', desc: 'safe searching, identity and metadata protection.' },
  { icon: BookOpen, text: 'Policy and playbook development', desc: 'IR runbooks, reporting flows, chain of custody.' },
  { icon: Briefcase, text: 'Process consulting', desc: 'TPRM/AML/KYB and preparation of audit evidence.' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Search filters state - visible by default for better UX
  const [showFilters, setShowFilters] = useState(true);
  const [fraudType, setFraudType] = useState('');
  const [country, setCountry] = useState('');
  const [searchMode, setSearchMode] = useState<'auto' | 'fuzzy' | 'exact'>('auto');

  // Search results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Perform search
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() && !fraudType && !country) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (fraudType) params.set('fraud_type', fraudType);
      if (country) params.set('country', country);
      params.set('mode', searchMode);
      params.set('limit', '10');

      const response = await fetch(`/api/v1/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setTotalResults(data.total || 0);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, fraudType, country, searchMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFraudType('');
    setCountry('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  };

  const hasActiveFilters = fraudType || country;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-cyan-500' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', gradient: 'from-cyan-500 to-blue-500' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-500' },
      rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-500' },
      indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-purple-500' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-indigo-500' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-500 to-cyan-500' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-500 to-amber-500' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', gradient: 'from-green-500 to-emerald-500' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', gradient: 'from-red-500 to-rose-500' },
      slate: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', gradient: 'from-slate-500 to-gray-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
            <div className="text-center space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">Fraud Prevention Platform</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                  <span className="text-white">Is It a Scam? Check Any </span>
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Website, Person, Company, Phone or Email
                  </span>
                  <span className="text-white"> Instantly</span>
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                  Check scams instantly 🔎 — verify <strong className="text-white">people</strong>, <strong className="text-white">websites</strong>, <strong className="text-white">companies</strong>, <strong className="text-white">job offers</strong>, <strong className="text-white">emails</strong>, <strong className="text-white">phone numbers</strong>, <strong className="text-white">dating profiles</strong>, and much more. Enjoy <strong className="text-white">free real-time protection</strong> 🛡️. Found a scam or got scammed? ⚠️ <strong className="text-white">Report it now</strong> — your warning could <strong className="text-white">protect others</strong>. Explore our <strong className="text-white">security services</strong> 🔐.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-4xl mx-auto pt-6">
                <form onSubmit={handleSearch} className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300" />

                  {/* Search Container */}
                  <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                    {/* Main Search Row */}
                    <div className="flex items-center gap-2">
                      <Search className="w-6 h-6 text-blue-300 ml-4 flex-shrink-0" />
                      <Input
                        type="text"
                        placeholder="Search by name, email, phone, website, IBAN, crypto wallet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-0 text-white placeholder-blue-300/50 outline-none text-base sm:text-lg py-4 focus:ring-0 focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${showFilters || hasActiveFilters ? 'text-blue-400 bg-blue-500/10' : ''}`}
                      >
                        <Filter className="w-5 h-5" />
                        {hasActiveFilters && (
                          <span className="ml-1 w-2 h-2 bg-blue-400 rounded-full" />
                        )}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSearching}
                        className="px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSearching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">Search</span>
                            <Search className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        {/* Search Mode Toggle */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-slate-400 mr-2">Search Mode:</span>
                          <div className="flex rounded-lg bg-slate-800/50 p-1">
                            {(['auto', 'fuzzy', 'exact'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setSearchMode(mode)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                  searchMode === mode
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                              >
                                {mode === 'auto' ? 'Auto' : mode === 'fuzzy' ? 'Fuzzy' : 'Exact'}
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 ml-2">
                            {searchMode === 'auto' && 'Tries exact match first, then fuzzy'}
                            {searchMode === 'fuzzy' && 'Finds similar matches (names, typos)'}
                            {searchMode === 'exact' && 'Only exact matches (email, phone, IBAN)'}
                          </span>
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex flex-wrap gap-3">
                          {/* Fraud Type Filter */}
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-xs text-slate-400 mb-1 block">Fraud Type</label>
                            <select
                              value={fraudType}
                              onChange={(e) => setFraudType(e.target.value)}
                              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              {fraudTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-800">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Country Filter */}
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-xs text-slate-400 mb-1 block">Country</label>
                            <select
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              {countryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-800">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Active Filters & Clear */}
                        {hasActiveFilters && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">Active filters:</span>
                            {fraudType && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                {fraudTypeOptions.find(o => o.value === fraudType)?.label}
                                <button
                                  type="button"
                                  onClick={() => setFraudType('')}
                                  className="hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                            {country && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs">
                                {countryOptions.find(o => o.value === country)?.label}
                                <button
                                  type="button"
                                  onClick={() => setCountry('')}
                                  className="hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={clearSearch}
                              className="text-xs text-slate-400 hover:text-white underline ml-2"
                            >
                              Clear all
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>640M+ Records</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>130+ Sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Always Free</span>
                  </div>
                </div>

                {/* Search Results Section */}
                {(hasSearched || isSearching) && (
                  <div className="mt-10 bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        {isSearching ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Searching...
                          </span>
                        ) : (
                          <>
                            {totalResults > 0 ? (
                              <>Found {totalResults} result{totalResults !== 1 ? 's' : ''}</>
                            ) : (
                              'No results found'
                            )}
                          </>
                        )}
                      </h3>
                      {hasSearched && !isSearching && totalResults > 10 && (
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}${fraudType ? `&fraud_type=${fraudType}` : ''}${country ? `&country=${country}` : ''}&mode=${searchMode}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          View all results
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    {/* Error Message */}
                    {searchError && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4 text-red-300">
                        {searchError}
                      </div>
                    )}

                    {/* Results List */}
                    {!isSearching && searchResults.length > 0 && (
                      <div className="space-y-4">
                        {searchResults.map((result) => {
                          const typeColors = fraudTypeColors[result.fraud_type] || fraudTypeColors.other;
                          const typeLabel = fraudTypeLabels[result.fraud_type] || result.fraud_type;

                          return (
                            <Link
                              key={result.id}
                              href={`/reports/${result.id}`}
                              className="block group"
                            >
                              <div className="bg-slate-800/50 hover:bg-slate-800/80 border border-white/5 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-200">
                                <div className="flex flex-wrap items-start gap-3 mb-3">
                                  {/* Fraud Type Badge */}
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColors.bg} ${typeColors.text}`}>
                                    {typeLabel}
                                  </span>

                                  {/* Match Score */}
                                  {result.score < 1 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400">
                                      {Math.round(result.score * 100)}% match
                                    </span>
                                  )}

                                  {/* Country */}
                                  {result.country && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-auto">
                                      <MapPin className="w-3 h-3" />
                                      {result.country}
                                    </span>
                                  )}
                                </div>

                                {/* Perpetrator Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  {result.perpetrator.name && (
                                    <div className="flex items-center gap-2 text-white">
                                      <User className="w-4 h-4 text-slate-400" />
                                      <span className="font-medium">{result.perpetrator.name}</span>
                                    </div>
                                  )}
                                  {result.perpetrator.phone && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Phone className="w-4 h-4" />
                                      <span className="font-mono text-xs">{result.perpetrator.phone}</span>
                                    </div>
                                  )}
                                  {result.perpetrator.email && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Mail className="w-4 h-4" />
                                      <span className="font-mono text-xs">{result.perpetrator.email}</span>
                                    </div>
                                  )}
                                  {result.incident_date && (
                                    <div className="flex items-center gap-2 text-slate-400 ml-auto">
                                      <Calendar className="w-4 h-4" />
                                      <span className="text-xs">{result.incident_date}</span>
                                    </div>
                                  )}
                                </div>

                                {/* View Link */}
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-xs text-slate-500">
                                    ID: {result.id.substring(0, 8)}...
                                  </span>
                                  <span className="text-blue-400 group-hover:text-blue-300 text-sm flex items-center gap-1">
                                    View details
                                    <ExternalLink className="w-4 h-4" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}

                        {/* View More Link */}
                        {totalResults > 10 && (
                          <div className="text-center pt-4">
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery)}${fraudType ? `&fraud_type=${fraudType}` : ''}${country ? `&country=${country}` : ''}&mode=${searchMode}`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                            >
                              View all {totalResults} results
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Results Message */}
                    {!isSearching && hasSearched && searchResults.length === 0 && !searchError && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-2">No matching reports found</p>
                        <p className="text-slate-500 text-sm mb-4">
                          Try different search terms or adjust filters
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {searchMode === 'exact' && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchMode('fuzzy');
                                setTimeout(performSearch, 100);
                              }}
                              className="text-sm border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              Try fuzzy search
                            </Button>
                          )}
                          <Link
                            href="/reports/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Report a scam
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DATABASE STATS SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
                <Database className="w-4 h-4" />
                Real-time Data
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8">
                Our Database in Numbers
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Real-time access to over 640 million verified fraud records from 130+ trusted global sources including FBI, OFAC, Interpol, and international law enforcement agencies
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
                (Some data sources are still being integrated) Updates every 5 minutes
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {[
                { value: '612M+', label: 'Malicious IP Addresses' },
                { value: '12M+', label: 'Stolen Vehicles Database' },
                { value: '9M+', label: 'Verified Phishing URLs' },
                { value: '6.7M+', label: 'Dissolved Companies' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-3 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Category Header */}
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Comprehensive Fraud Database Categories
            </h3>

            {/* Category Tables Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
              {databaseCategories.map((category) => {
                const Icon = category.icon;
                const colors = getColorClasses(category.color);
                return (
                  <div
                    key={category.title}
                    className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-sm">
                        {category.title}
                      </h4>
                    </div>

                    <div className="space-y-4 mb-6">
                      {category.stats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                          <span className="text-lg font-light text-slate-900 dark:text-white">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                      Sources: {category.sources}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total Database Coverage */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 sm:p-14 shadow-2xl">
              {/* Background Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-10 uppercase tracking-wider">
                  Total Database Coverage
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
                  {[
                    { value: '640M+', label: 'Total Records' },
                    { value: '130+', label: 'Data Sources' },
                    { value: '8', label: 'Categories' },
                    { value: '24/7', label: 'Real-time Access' },
                    { value: '5 min', label: 'Update Frequency' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sources Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-5xl mx-auto leading-relaxed">
                Verified data sources include FBI Most Wanted API, OFAC SDN List, Chainabuse, CryptoScamDB, URLhaus, PhishTank, AbuseIPDB, CFPB Consumer Complaints, Companies House UK, Interpol Stolen Motor Vehicles, FTC Do Not Call, Canadian Anti-Fraud Centre, and 120+ additional verified global databases from law enforcement and consumer protection agencies worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== FAQ SECTIONS ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="space-y-8">
              {faqSections.map((section) => {
                const Icon = section.icon;
                const colors = getColorClasses(section.color);
                const isExpanded = expandedFaq === section.id;

                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? 'border-blue-300 dark:border-blue-700 shadow-xl'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg'
                    } bg-white dark:bg-slate-900`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : section.id)}
                      className="w-full p-8 sm:p-10 text-left flex items-start gap-6"
                    >
                      <div className={`flex-shrink-0 p-4 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-7 w-7 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`flex-shrink-0 w-6 h-6 text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-8 sm:px-10 pb-10 pt-0">
                        <div className="pl-[76px] sm:pl-[88px]">
                          <div className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== ROADMAP SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                List of Features and Services We&apos;re Building
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                For each item we list its status, completion percentage, and a brief note on what it&apos;s for.
              </p>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-white uppercase tracking-wider">Complete</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">What it&apos;s for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {roadmapFeatures.map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900/50'
                      } hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors`}
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-900 dark:text-white">
                        {feature.name}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                            feature.status === 'functional'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : feature.status === 'development'
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {feature.status === 'functional'
                            ? 'Functional'
                            : feature.status === 'development'
                            ? 'In development'
                            : 'Planned'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                            feature.progress === 100
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : feature.progress === 0
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {feature.progress}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status Legend */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Functional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">In development</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Planned</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SERVICES SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Other Services
              </h2>
            </div>

            {/* Service Cards */}
            <div className="space-y-16">
              {/* Fraud Recovery Services */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-rose-600 to-red-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    Fraud Recovery Services
                  </h3>
                  <p className="text-lg text-rose-100 leading-relaxed max-w-3xl">
                    Recovery of funds lost to fraud. We combine digital forensics, OSINT, and legal coordination to trace, freeze, and recover your money—fast, ethically, and defensibly.
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">What the service includes</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {recoveryFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                            <Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-slate-900 dark:bg-slate-800">
                    <h4 className="text-lg font-bold text-white mb-4">When this service is suitable</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>If you became a victim of fraudulent transfers (crypto/fiat), phishing, "romance," and investment schemes.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>If you experienced account takeover and suspicious withdrawals via an exchange or bank.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>If you need to quickly block assets and provide defensible evidence.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-center">
                    <div className="mb-6">
                      <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">€600</span>
                      <p className="text-slate-400 mt-2">5 hours of investigator work</p>
                    </div>
                    <p className="text-sm text-slate-400 mb-8 max-w-2xl mx-auto">
                      We offer this service in response to companies that charge €3,500–€10,000 and often only report the case to a financial institution. We consider such practices fraudulent and unethical.
                    </p>
                    <Link
                      href="/money-recovery"
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-lg font-semibold shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Start Money Recovery
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Due Diligence Services */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    DUE DILIGENCE SERVICES
                  </h3>
                  <p className="text-lg text-blue-100 leading-relaxed max-w-3xl">
                    Independent screening of partners, clients, and investments. We combine OSINT, AML/KYB procedures, and a legal perspective so you can make decisions based on verifiable facts—fast, discreet, and defensible.
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">What&apos;s included</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {dueDiligenceFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">When this service is appropriate</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Onboarding a new client/vendor or third-party risk management (TPRM).</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>M&A, joint venture, investor entry, franchise/licensing.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Suspected links to fraud, sanctioned entities, or money laundering.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Meeting AML/CTF obligations or requirements from a bank, investor, or internal compliance audit.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/verify-serviceproduct"
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg font-semibold shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Start Due Diligence
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Corporate Investigations */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    CORPORATE INVESTIGATIONS
                  </h3>
                  <p className="text-lg text-purple-100 leading-relaxed max-w-3xl">
                    Internal and external investigations for companies. We combine OSINT, digital forensics, and financial analytics with the ScamNemesis platform (evidence management, chain of custody)—discreet, lawful, and defensible.
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">What&apos;s included</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {investigationFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-purple-50 dark:bg-purple-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">When this service is appropriate</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Suspected internal fraud or conflict of interest.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Data breach, compromised accounts, ransomware/BEC.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Invoice fraud, "ghost" vendors, collusion.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Brand/IP abuse: cloned websites, fake profiles.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Pre-litigation or compliance phase when you need defensible evidence for the board, bank, or auditor.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/scammer-removal"
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg font-semibold shadow-xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Start Investigation
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Security Training & Consulting */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-10 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    SECURITY TRAINING & CONSULTING
                  </h3>
                  <p className="text-lg text-emerald-100 leading-relaxed max-w-3xl">
                    Security training and consulting for teams and management. We use real scenarios from ScamNemesis (OSINT, fraud, incident response) to make procedures practical, measurable, and defensible.
                  </p>
                </div>
                <div className="p-10 sm:p-12">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-8">What&apos;s included</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {trainingFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.text} className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{feature.text}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-10 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">When this service is appropriate</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>When onboarding new hires or scaling teams with access to money/data.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>After an incident to reduce repeat risk and shorten response time.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Before an audit or investment, or when onboarding a major client (TPRM/AML requirements).</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>If you face phishing, brand abuse, or fraudulent orders.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>When you need practical playbooks for the board, finance, and frontline teams.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/training-courses"
                      className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-semibold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Explore Training & Courses
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== BOOK CONSULTATION SECTION ==================== */}
        <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {/* Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-10">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Free Consultation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              BOOK A FREE CONSULTATION NOW
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              We would love to learn more about your company&apos;s individual needs. That&apos;s why we offer a 15-minute consultation call.
            </p>

            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-3 px-12 py-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white text-xl font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 hover:scale-105"
            >
              Book a free consultation
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ==================== FREE TRAINING SECTION ==================== */}
        <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
                <GraduationCap className="w-4 h-4" />
                Learn & Protect
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Free Security Training & Courses — Learn to Spot Scams
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Free, practical lessons and checklists to identify phishing, crypto/investment fraud, fake online shops, and social-media scams. Learn to verify websites, people, and IBANs; protect your identity and credit score; and report cybercrime safely—step by step.
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Most Popular Topics:
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trainingTopics.map((topic) => (
                  <div
                    key={topic}
                    className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/training-courses"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-semibold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                Start Free Training
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== CERTIFICATIONS SECTION ==================== */}
        <section className="py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <p className="text-center text-slate-600 dark:text-slate-400 mb-10">
              Years of experience and certifications from leading institutions — professionals on your side.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Image
                  key={num}
                  src={`/images/cert-${num}.png`}
                  alt={`Certification ${num}`}
                  width={100}
                  height={50}
                  className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
