/**
 * Sitemap Route Handler
 * Generates dynamic sitemap for SEO
 */

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/vyhladavanie`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nahlasit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/o-projekte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ochrana-osobnych-udajov`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/podmienky-pouzivania`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic pages - approved reports
  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: 'APPROVED',
        publishedAt: { not: null },
      },
      select: {
        publicId: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 10000, // Limit to prevent huge sitemaps
    });

    reportPages = reports.map((report) => ({
      url: `${baseUrl}/podvod/${report.publicId}`,
      lastModified: report.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching reports for sitemap:', error);
  }

  // Dynamic pages - CMS pages
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        path: true,
        updatedAt: true,
      },
    });

    cmsPages = pages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching CMS pages for sitemap:', error);
  }

  // Fraud type category pages
  const fraudTypes = [
    'investicny-podvod',
    'romance-scam',
    'phishing',
    'kradez-identity',
    'e-commerce-podvod',
    'crypto-podvod',
    'pracovny-podvod',
    'podvod-s-prenajmom',
    'podvod-s-pozickou',
    'falosna-charita',
    'tech-support-scam',
    'loteria-podvod',
  ];

  const categoryPages: MetadataRoute.Sitemap = fraudTypes.map((type) => ({
    url: `${baseUrl}/kategoria/${type}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...reportPages, ...cmsPages];
}
