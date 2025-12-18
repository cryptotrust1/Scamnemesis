/**
 * robots.txt Route Handler
 * Controls search engine crawling behavior
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/static/',
          '/nahlasit/*', // Protect report submission pages from caching
          '/profil/',
          '/pripad/', // Protect case tracking from indexing
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Block OpenAI's web crawler
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/', // Block ChatGPT browsing
      },
      {
        userAgent: 'CCBot',
        disallow: '/', // Block Common Crawl
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
