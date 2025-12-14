'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// FAQ sections content
const faqSections = [
  {
    id: '1',
    title: '1. Who is this platform for?',
    content: `ScamNemesis is for people who want to verify a person, company, phone number, email, or website. It's also for people who have already been scammed and want to report their case and connect with other victims of the same perpetrator. The platform helps both everyday users and professionals — police, journalists, lawyers, analysts, banks, and exchanges. Reported cases can be sent to partners via API who can pause payments to protect your money (service in preparation). All reports are manually reviewed by experts before publication.

Distinguishing a scam from a legitimate service is hard today — anyone can be fooled. If it happened to you, you're not alone; we're here to help.`,
  },
  {
    id: '2',
    title: '2. What problem are we solving?',
    content: `There is no single "global" number, but data shows that online fraud grew by roughly 2,300% between 2019 and 2024; in 2024, estimated losses reached USD 1.03 trillion. In practice, one scammer can create 10–100 cases per month, which fragments evidence and severely overloads the police, making effective case resolution difficult.

ScamNemesis brings order to this chaos: it consolidates reports and evidence into a single coordinated case, automatically links victims with similar patterns, saves investigators time, and accelerates investigations. It also works preventively — anyone can verify a person, company, domain, phone number, and 38 additional identifiers associated with scams. The tool is free and available to everyone.`,
    image: '/images/section-problem.jpg',
  },
  {
    id: '3',
    title: '3. How to use ScamNemesis?',
    content: `Search:
At the top, you'll find the search bar where you can enter a name, email, phone number, and other identifiers. Results are shown by match score — the lower an item appears, the weaker the match, so we recommend checking more cases. Clicking a Case opens a report with all information provided by the reporter. Some data is anonymized for safety and legal reasons. Reports may include photos, documents, and comments from others; you can also add your own comment. The "Find similar cases" feature shows records with shared identifiers. Cases matching your search may also match other frauds, which can help group victims or identify networks.

Report:
Click "Report Scam" and fill in the form. The more identifiers you include, the higher the chance someone else will find your case (and the greater the chance of stopping the fraud). Describe the situation in detail, but avoid personal data and private information about yourself. The database does not accept personal, private, or sensitive information about people that is not related to a scam.`,
    image: '/images/section-how.jpg',
  },
  {
    id: '4',
    title: '4. Why is this important?',
    content: `Fraudsters succeed because victims don't report; they exploit isolation and shame. Every unreported case helps scammers reach more victims. Reported cases trigger warnings that can prevent losses.

Collective intelligence beats individual defenses — a single report, once verified, protects thousands. Linked cases strengthen police dossiers and improve the chance of cross-border cooperation.`,
    image: '/images/section-important.jpg',
  },
  {
    id: '5',
    title: '5. Why did we create this project?',
    content: `We became fraud victims ourselves. The police lack tools, time, and capacity. Courts are slow. Chargebacks are rejected. We decided to build the tool we needed.

Our team combines investigators, ethical hackers, and fraud analysts who have handled real cases, tracked down money, and worked with law enforcement. Today, we help others do the same — and the service is free for victims.`,
    image: '/images/section-why.jpg',
  },
  {
    id: '6',
    title: '6. What is ScamNemesis?',
    content: `An intelligence platform that verifies identifiers and automatically connects fraud victims. We aggregate 130+ data sources — watchlists, blacklists, registries, and blockchain feeds — and layer them with community reports. The result: faster verification, better evidence, and shared intelligence across borders.`,
    image: '/images/section-what.jpg',
  },
  {
    id: '7',
    title: '7. What will you find here?',
    content: `• Scam Checker — search 38+ identifiers (phone, email, IBAN, domain, wallet, etc.)
• Report System — structured forms for multiple fraud types
• Case Linking — automatic connections between related incidents
• Victim Support — next steps, templates, and contact points
• Due Diligence — deep KYB/KYC screening for businesses
• Money Recovery — forensic and legal support (paid service)
• Training — free courses on recognizing and preventing scams`,
    image: '/images/section-find.png',
  },
  {
    id: '8',
    title: '8. Who is behind this project?',
    content: `An international team of certified investigators, OSINT analysts, and ethical hackers. We hold CFE, CAMS, OSCP, CISA, and CISM certifications. We've worked on cases involving crypto fraud, romance scams, fake investment platforms, and corporate malfeasance.

We stay independent: no paid rankings, no "verified badge" sales. Our goal is accurate information, not revenue from subjects we investigate.`,
    image: '/images/section-team.png',
  },
  {
    id: '9',
    title: '9. What are we planning for the future?',
    content: `• Deeper integration with payment providers (real-time fraud alerts)
• Browser extension for on-page warnings
• Graph-based network views (entity + transaction mapping)
• More AI modules (deepfake detection, NLP analysis of scam messages)
• Expanded OSINT feeds and local sanctions lists

Check the roadmap below for progress and timelines.`,
    image: '/images/section-future.png',
  },
];

// Roadmap features
const roadmapFeatures = [
  { name: 'API: dispatch data to third parties', status: 'development', progress: 80, description: 'With a single call we send relevant information to the bank/payment gateway and to authorities — this speeds up blocking transactions and escalation.' },
  { name: 'Scam search (38+ identifiers)', status: 'functional', progress: 100, description: 'Search by email, phone, name, IBAN, domain, IP, crypto wallet, etc., across our database and external sources.' },
  { name: 'Case linking (similarities)', status: 'functional', progress: 100, description: 'Automatically links related cases by matching indicators and patterns (email, phone, domain, wallet…).' },
  { name: 'Media processing + OCR', status: 'functional', progress: 80, description: 'Upload screenshots, chats, and documents → OCR extracts the text and saves it to the database for further searching.' },
  { name: 'Website widget (reporting + search)', status: 'development', progress: 24, description: 'Simple embed for partner sites — people can report and search directly on their own website.' },
  { name: 'Blockchain analysis', status: 'development', progress: 56, description: 'Mapping the flow of cryptocurrencies flagged on-chain as stolen or linked to criminal activity.' },
  { name: 'CTI (Cyber Threat Intelligence)', status: 'development', progress: 52, description: 'Cyber threat intelligence; the goal is broad visibility and current trends for prevention, detection, and response — without vendor lock-in.' },
  { name: 'AI/NLP tool for OSINT collection', status: 'development', progress: 50, description: 'Continuously monitors dozens of online sources and automatically builds a clean news feed; NLP removes duplicates, classifies content by scam type, and prepares short reports.' },
  { name: 'AI image and video detection (deepfake)', status: 'development', progress: 69, description: 'Detects AI-generated content and manipulations; explains signals and assigns a risk score.' },
  { name: 'Graph database (nodes & relationships)', status: 'development', progress: 61, description: 'Network views of links between people, companies, accounts, and cases; quick "who with whom" and "money to where".' },
  { name: 'Data enrichment from 130+ external sources', status: 'development', progress: 0, description: 'Integrations for OSINT, reputation, and security feeds for emails, phones, IPs, domains, and blockchain.' },
  { name: 'Email verification (existence/registrations/age)', status: 'planned', progress: 50, description: 'Checks deliverability, where the email is used/registered, and where possible, signals of account age.' },
  { name: 'People & company search', status: 'development', progress: 68, description: 'With a single query searches open registers, gazettes, and available court decisions; returns a summary with sources.' },
  { name: 'Reverse face search', status: 'planned', progress: 58, description: 'Upload a photo and the system finds matches in the internal database and social networks (with spoof protection).' },
  { name: 'Similar face matching (upload)', status: 'planned', progress: 52, description: 'Compares and ranks the most similar faces; supports batch queries.' },
  { name: 'Media forensics: geolocation & edits', status: 'planned', progress: 57, description: 'EXIF/metadata, ELA, manipulation detection, geo-cues, audio-video inconsistencies.' },
  { name: 'AI bot "Is this a scam?"', status: 'planned', progress: 0, description: 'A chat assistant that quickly advises based on signals: what to watch for, what to verify, and which steps to take.' },
  { name: 'Domain score & reputation', status: 'development', progress: 59, description: 'WHOIS, DNS, SSL/TLS, blacklists, hosting, technology — resulting in a domain risk score.' },
  { name: 'Media forensics — advanced modules', status: 'planned', progress: 53, description: 'Steganography, C2 image detection, advanced video analysis.' },
];

// Training topics
const trainingTopics = [
  'How to prevent fraud in business',
  'Identity protection insurance',
  'Safety on the internet',
  '10 ways to prevent cybercrime',
  'How to recognize a scam',
  'Report cybercrime to police',
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
      {/* Hero Section - Exact match to demo */}
      <section style={{ width: '100%', margin: 0, padding: '40px 0 0 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ fontSize: '14px', lineHeight: 1.1, margin: 0 }}>
            <strong>
              <span style={{ fontSize: '2.5em' }}>
                <span style={{ fontSize: '1.2em' }}>
                  Is It a Scam? Check Any Website, Person, Company, Phone or Email Instantly
                </span>
              </span>
            </strong>
          </h1>
          <br />
          <h2 style={{ fontSize: '10px', lineHeight: 1.35, margin: 0 }}>
            <span style={{ fontSize: '1.8em' }}>
              Check scams instantly 🔎 — verify <strong>people</strong>, <strong>websites</strong>, <strong>companies</strong>, <strong>job offers</strong>, <strong>emails</strong>, <strong>phone numbers</strong>, <strong>dating profiles</strong>, and much more.
              Enjoy <strong>free real-time protection</strong> 🛡️.
              Found a scam or got scammed? ⚠️ <strong>Report it now</strong> — your warning could <strong>protect others</strong>.
              Explore our <strong>security services</strong> 🔐.
            </span>
          </h2>
        </div>
      </section>

      {/* Search Bar */}
      <section className="w-full py-8">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Search for scams, phone numbers, emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-base px-4 border-[#e8e8e8] focus:border-[#0E74FF] focus:ring-[#0E74FF]"
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-[#0E74FF] hover:bg-[#0E74FF]/90">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Database Stats Section - Exact match to demo */}
      <section style={{ background: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <header style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 300, margin: '0 0 20px', lineHeight: 1.2, color: '#000', letterSpacing: '-1px' }}>
            Our Database in Numbers
          </h1>
          <p style={{ fontSize: '18px', color: '#666', margin: '0 auto', maxWidth: '700px' }}>
            Real-time access to over 640 million verified fraud records from 130+ trusted global sources including FBI, OFAC, Interpol, and international law enforcement agencies
          </p>
          <p style={{ fontSize: '14px', color: '#999', margin: '10px 0 0' }}>
            (Some data sources are still being integrated) Updates every 5 minutes
          </p>
        </header>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
          {/* Main Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 0, background: '#fff', marginBottom: '60px' }}>
            <div style={{ background: '#fff', padding: '40px 30px', textAlign: 'center', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '56px', fontWeight: 200, marginBottom: '12px', color: '#000', letterSpacing: '-2px' }}>612M+</div>
              <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#666' }}>Malicious IP Addresses</div>
            </div>
            <div style={{ background: '#fff', padding: '40px 30px', textAlign: 'center', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '56px', fontWeight: 200, marginBottom: '12px', color: '#000', letterSpacing: '-2px' }}>12M+</div>
              <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#666' }}>Stolen Vehicles Database</div>
            </div>
            <div style={{ background: '#fff', padding: '40px 30px', textAlign: 'center', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '56px', fontWeight: 200, marginBottom: '12px', color: '#000', letterSpacing: '-2px' }}>9M+</div>
              <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#666' }}>Verified Phishing URLs</div>
            </div>
            <div style={{ background: '#fff', padding: '40px 30px', textAlign: 'center', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '56px', fontWeight: 200, marginBottom: '12px', color: '#000', letterSpacing: '-2px' }}>6.7M+</div>
              <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#666' }}>Dissolved Companies</div>
            </div>
          </div>

          {/* Category Header */}
          <h2 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 30px', textAlign: 'center', color: '#000', letterSpacing: '-0.5px' }}>
            Comprehensive Fraud Database Categories
          </h2>

          {/* Category Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, background: '#fff' }}>
            {/* Cryptocurrency Fraud */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Cryptocurrency Fraud</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Crypto Addresses</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>50,000+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Scam Projects</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>9,221+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Ransomware Wallets</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>11,186+</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Blockchain Chains</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>16+</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: Chainabuse, CryptoScamDB, ScamSniffer, OpenSanctions Ransomwhere</p>
            </section>

            {/* Emails & Domains */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Emails & Domains</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Phishing URLs</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>9M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Malicious Domains</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>2.29M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Discord Scam Links</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>30,000+</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Spam Domains</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>Billions</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: PhishTank, URLhaus, OpenPhish, Google Safe Browsing, Spamhaus</p>
            </section>

            {/* Phone Numbers */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone Numbers</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Scam Calls (US)</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>2M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Robocall Reports</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>1.2M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Known Scammers</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>4M+</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Daily Updates</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>✓</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: FTC DNC API, ScamSearch.io, Community databases</p>
            </section>

            {/* IP Addresses */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>IP Addresses</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Malicious IPs</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>612M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Tor Exit Nodes</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>2,000+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Threat Indicators</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>Millions</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Network Blocks</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>Hundreds</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: AbuseIPDB, ThreatFox, FireHOL, AlienVault OTX, Spamhaus</p>
            </section>

            {/* Sanctions & Lists */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Sanctions & Lists</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>OFAC SDN Entities</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>12,000+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>FBI Most Wanted</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>1,000+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>UN Individuals</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>669</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Global Sources</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>130+</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: OFAC, FBI, UN, EU, UK OFSI, OpenSanctions</p>
            </section>

            {/* Social Media */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Social Media</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Telegram Channels</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>120,979</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Twitter Bot Accounts</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>50,538+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Instagram Fakes</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>3,600+</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>LinkedIn Profiles</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>3,600+</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: TGDataset, TwiBot-20, Discord AntiScam, InstaFake</p>
            </section>

            {/* Financial Fraud */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Financial Fraud</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>CFPB Complaints</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>3M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>IC3 Reports (2024)</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>859,000</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Australia Reports</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>494,000</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Dissolved Companies</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>6.7M+</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: CFPB, FBI IC3, Scamwatch AU, Companies House UK</p>
            </section>

            {/* Stolen Vehicles */}
            <section style={{ background: '#fff', padding: '35px 30px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Stolen Vehicles</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Interpol Database</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>12M+</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>US Coverage</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>87%</td></tr>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>NICB VINCheck</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>5 Years</td></tr>
                  <tr><td style={{ padding: '14px 0', fontSize: '14px', color: '#666' }}>Real-time Updates</td><td style={{ padding: '14px 0', textAlign: 'right', fontSize: '20px', fontWeight: 300, color: '#000' }}>✓</td></tr>
                </tbody>
              </table>
              <p style={{ margin: '15px 0 0', fontSize: '12px', color: '#999', lineHeight: 1.5 }}>Sources: Interpol SMV, NICB VINCheck, NMVTIS</p>
            </section>
          </div>

          {/* Total Database Coverage */}
          <section style={{ marginTop: '60px', background: '#fafafa', padding: '50px 40px', textAlign: 'center', borderTop: '1px solid #e8e8e8' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 35px', color: '#000', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Database Coverage</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
              <div><div style={{ fontSize: '44px', fontWeight: 200, marginBottom: '8px', color: '#000', letterSpacing: '-1px' }}>640M+</div><div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Total Records</div></div>
              <div><div style={{ fontSize: '44px', fontWeight: 200, marginBottom: '8px', color: '#000', letterSpacing: '-1px' }}>130+</div><div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Data Sources</div></div>
              <div><div style={{ fontSize: '44px', fontWeight: 200, marginBottom: '8px', color: '#000', letterSpacing: '-1px' }}>8</div><div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Categories</div></div>
              <div><div style={{ fontSize: '44px', fontWeight: 200, marginBottom: '8px', color: '#000', letterSpacing: '-1px' }}>24/7</div><div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Real-time Access</div></div>
              <div><div style={{ fontSize: '44px', fontWeight: 200, marginBottom: '8px', color: '#000', letterSpacing: '-1px' }}>5 min</div><div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>Update Frequency</div></div>
            </div>
          </section>

          {/* Sources Footer */}
          <footer style={{ marginTop: '40px', textAlign: 'center', padding: '0 20px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: 0, lineHeight: 1.8, fontWeight: 400 }}>
              Verified data sources include FBI Most Wanted API, OFAC SDN List, Chainabuse, CryptoScamDB, URLhaus, PhishTank, AbuseIPDB, CFPB Consumer Complaints, Companies House UK, Interpol Stolen Motor Vehicles, FTC Do Not Call, Canadian Anti-Fraud Centre, and 120+ additional verified global databases from law enforcement and consumer protection agencies worldwide.
            </p>
          </footer>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="w-full py-10" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {faqSections.map((section) => (
          <div key={section.id} style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: section.image ? '2fr 1fr' : '1fr',
                gap: '40px',
                alignItems: 'start',
              }}
            >
              <div>
                <h2 style={{ fontSize: '14px', margin: '0 0 20px' }}>
                  <strong>
                    <span style={{ fontSize: '2em' }}>
                      <span style={{ fontSize: '1.2em' }}>
                        {section.title}
                      </span>
                    </span>
                  </strong>
                </h2>
                <div style={{ fontSize: '18px', lineHeight: 1.7, color: '#333', whiteSpace: 'pre-line' }}>
                  {section.content}
                </div>
              </div>
              {section.image && (
                <div style={{ position: 'relative', height: '300px' }}>
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Roadmap Section */}
      <section style={{ background: '#fff', padding: '40px 5%', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', lineHeight: 1.6, maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
        <h2 style={{ color: '#c72e2e', margin: '0 0 15px 0', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, borderBottom: '3px solid #c72e2e', paddingBottom: '15px' }}>
          List of Features and Services We&apos;re Building
        </h2>
        <p style={{ color: '#4a4a4a', margin: '0 0 35px 0', fontSize: 'clamp(0.9375rem, 2vw, 1rem)' }}>
          For each item we list its status, completion percentage, and a brief note on what it&apos;s for.
        </p>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '30px' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #c72e2e 0%, #a32525 100%)', color: '#fff' }}>
                <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: 600, fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)', borderBottom: '2px solid #8b1e1e', width: '25%' }}>Feature</th>
                <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: 600, fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)', borderBottom: '2px solid #8b1e1e', whiteSpace: 'nowrap', width: '12%' }}>Status</th>
                <th style={{ padding: '18px 16px', textAlign: 'center', fontWeight: 600, fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)', borderBottom: '2px solid #8b1e1e', whiteSpace: 'nowrap', width: '10%' }}>Complete</th>
                <th style={{ padding: '18px 16px', textAlign: 'left', fontWeight: 600, fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)', borderBottom: '2px solid #8b1e1e', width: '53%' }}>What it&apos;s for</th>
              </tr>
            </thead>
            <tbody>
              {roadmapFeatures.map((feature, index) => (
                <tr key={feature.name} style={{ borderBottom: '1px solid #e8e8e8', background: index % 2 === 1 ? '#fafafa' : '#fff', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '18px 16px', fontWeight: 500, color: '#2c2c2c', fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)', verticalAlign: 'top' }}>{feature.name}</td>
                  <td style={{ padding: '18px 16px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)', verticalAlign: 'top' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      backgroundColor: feature.status === 'functional' ? '#d1fae5' : feature.status === 'development' ? '#fef3c7' : '#f3f4f6',
                      color: feature.status === 'functional' ? '#10b981' : feature.status === 'development' ? '#f59e0b' : '#6b7280',
                      borderRadius: '6px'
                    }}>
                      {feature.status === 'functional' ? 'Functional' : feature.status === 'development' ? 'In development' : 'Planned'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 16px', textAlign: 'center', fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)', verticalAlign: 'top' }}>
                    <div style={{
                      background: feature.progress === 100 ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : feature.progress === 0 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      borderRadius: '20px',
                      padding: '6px 16px',
                      display: 'inline-block',
                      fontWeight: 700,
                      color: feature.progress === 100 ? '#065f46' : feature.progress === 0 ? '#991b1b' : '#1e40af',
                      minWidth: '60px'
                    }}>
                      {feature.progress}%
                    </div>
                  </td>
                  <td style={{ padding: '18px 16px', color: '#4a4a4a', fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)', lineHeight: 1.7, verticalAlign: 'top' }}>{feature.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Services Section - Fraud Recovery */}
      <section style={{ background: '#fff', padding: '50px 5%', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
        <article style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '50px' }}>
          <div style={{ background: 'linear-gradient(135deg, #c72e2e 0%, #a52a2a 100%)', padding: '40px 6%', color: '#fff' }}>
            <h3 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, margin: '0 0 18px 0', letterSpacing: '-0.5px' }}>Fraud Recovery Services</h3>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', margin: 0, lineHeight: 1.7, opacity: 0.96 }}>
              Recovery of funds lost to fraud. We combine digital forensics, OSINT, and legal coordination to trace, freeze, and recover your money—fast, ethically, and defensibly.
            </p>
          </div>
          <div style={{ padding: '50px 6%' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '45px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '32px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.15)', marginBottom: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2.75rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1, marginBottom: '12px', background: 'linear-gradient(135deg, #ff6b6b, #c72e2e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>€600</div>
                <div style={{ fontSize: 'clamp(0.9375rem, 1.5vw, 1rem)', opacity: 0.9 }}>5 hours of investigator work</div>
              </div>
              <div style={{ textAlign: 'center', margin: '24px 0 28px' }}>
                <Link href="/money-recovery" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #c72e2e, #ff6b6b)', color: '#fff', padding: '21px 33px', borderRadius: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 3.6vw, 1.6875rem)', letterSpacing: '0.2px', boxShadow: '0 8px 22px rgba(199,46,46,0.28)', border: '1px solid rgba(255,255,255,0.18)', lineHeight: 1.1, textAlign: 'center', minWidth: '44px' }}>
                  Start Money Recovery
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Due Diligence */}
        <article style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '50px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', padding: '40px 6%', color: '#fff' }}>
            <h3 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, margin: '0 0 18px 0', letterSpacing: '-0.5px' }}>DUE DILIGENCE SERVICES</h3>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', margin: 0, lineHeight: 1.7, opacity: 0.96 }}>
              Independent screening of partners, clients, and investments. We combine OSINT, AML/KYB procedures, and a legal perspective so you can make decisions based on verifiable facts—fast, discreet, and defensible.
            </p>
          </div>
          <div style={{ padding: '50px 6%', textAlign: 'center' }}>
            <Link href="/verify-serviceproduct" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #0066cc, #0052a3)', color: '#fff', padding: '21px 33px', borderRadius: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 3.6vw, 1.6875rem)', letterSpacing: '0.2px', boxShadow: '0 8px 22px rgba(0,82,163,0.28)', border: '1px solid rgba(255,255,255,0.18)', lineHeight: 1.1, textAlign: 'center', minWidth: '44px' }}>
              Start Due Diligence →
            </Link>
          </div>
        </article>

        {/* Corporate Investigations */}
        <article style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '50px' }}>
          <div style={{ background: 'linear-gradient(135deg, #c72e2e 0%, #a52a2a 100%)', padding: '40px 6%', color: '#fff' }}>
            <h3 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, margin: '0 0 18px 0', letterSpacing: '-0.5px' }}>CORPORATE INVESTIGATIONS</h3>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', margin: 0, lineHeight: 1.7, opacity: 0.96 }}>
              Internal and external investigations for companies. We combine OSINT, digital forensics, and financial analytics with the ScamNemesis platform—discreet, lawful, and defensible.
            </p>
          </div>
          <div style={{ padding: '50px 6%', textAlign: 'center' }}>
            <Link href="/scammer-removal" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #c72e2e, #ff6b6b)', color: '#fff', padding: '21px 33px', borderRadius: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 3.6vw, 1.6875rem)', letterSpacing: '0.2px', boxShadow: '0 8px 22px rgba(199,46,46,0.28)', border: '1px solid rgba(255,255,255,0.18)', lineHeight: 1.1, textAlign: 'center', minWidth: '44px' }}>
              Start Investigation →
            </Link>
          </div>
        </article>

        {/* Security Training */}
        <article style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '50px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', padding: '40px 6%', color: '#fff' }}>
            <h3 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, margin: '0 0 18px 0', letterSpacing: '-0.5px' }}>SECURITY TRAINING & CONSULTING</h3>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', margin: 0, lineHeight: 1.7, opacity: 0.96 }}>
              Security training for teams with role-based training, phishing simulations, and incident response exercises.
            </p>
          </div>
          <div style={{ padding: '50px 6%', textAlign: 'center' }}>
            <Link href="/training-courses" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #0066cc, #0052a3)', color: '#fff', padding: '21px 33px', borderRadius: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 3.6vw, 1.6875rem)', letterSpacing: '0.2px', boxShadow: '0 8px 22px rgba(0,82,163,0.28)', border: '1px solid rgba(255,255,255,0.18)', lineHeight: 1.1, textAlign: 'center', minWidth: '44px' }}>
              View Training Options →
            </Link>
          </div>
        </article>
      </section>

      {/* Free Security Training Section */}
      <section style={{ background: '#f8f9fa', padding: '60px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 600, margin: '0 0 20px', color: '#1a1a1a' }}>Free Security Training</h2>
        <p style={{ fontSize: '18px', color: '#666', margin: '0 0 40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Learn how to protect yourself and your business with our free training resources.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto 40px' }}>
          {trainingTopics.map((topic) => (
            <div key={topic} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8', textAlign: 'left' }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#1a1a1a' }}>{topic}</span>
            </div>
          ))}
        </div>
        <Link href="/training-courses" style={{ display: 'inline-block', textDecoration: 'none', background: '#0E74FF', color: '#fff', padding: '16px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '16px' }}>
          Start Free Training →
        </Link>
      </section>

      {/* Certifications */}
      <section className="w-full py-10 border-t border-[#e8e8e8]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-10">
            <Image src="/images/cert-1.png" alt="Certification 1" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-2.png" alt="Certification 2" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-3.png" alt="Certification 3" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-4.png" alt="Certification 4" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-5.png" alt="Certification 5" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <Image src="/images/cert-6.png" alt="Certification 6" width={100} height={50} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </div>
      </section>

      {/* Book a Free Consultation CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '80px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Book a Free Consultation</h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Discuss your case with our experts. No obligation, no pressure.
        </p>
        <Link href="/contact-us" style={{ display: 'inline-block', textDecoration: 'none', background: '#0E74FF', color: '#fff', padding: '21px 42px', borderRadius: 0, fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', boxShadow: '0 8px 22px rgba(14,116,255,0.28)' }}>
          Contact Us Now
        </Link>
      </section>
    </div>
  );
}
