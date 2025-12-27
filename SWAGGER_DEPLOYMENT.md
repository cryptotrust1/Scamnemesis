# Swagger UI Deployment Plan

**Dátum:** 2024-12-26
**Verzia:** 1.0.0
**Projekt:** ScamNemesis

---

## Executive Summary

Tento dokument popisuje dve možnosti nasadenia Swagger UI pre ScamNemesis API, vrátane bezpečnostných požiadaviek, verzionovania a odporúčanej implementácie.

---

## Možnosť A: Statický Swagger UI (CDN/S3)

### Popis
Swagger UI hostovaný ako statické súbory na CDN alebo S3, s OpenAPI spec súborom.

### Architektúra

```
┌─────────────────────────────────────────────────────┐
│                    CloudFlare CDN                    │
├─────────────────────────────────────────────────────┤
│  /docs/                                             │
│  ├── index.html        (Swagger UI)                 │
│  ├── swagger-ui.css                                 │
│  ├── swagger-ui-bundle.js                           │
│  └── openapi.yaml      (API Spec)                   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              ScamNemesis API Server                  │
│              api.scamnemesis.com                     │
└─────────────────────────────────────────────────────┘
```

### Súbory na vytvorenie

```
/public/docs/
├── index.html
├── openapi.yaml
└── oauth2-redirect.html
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScamNemesis API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #1a1a2e; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    const ui = SwaggerUIBundle({
      url: '/docs/openapi.yaml',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: 'StandaloneLayout',
      // PRODUCTION: Disable "Try it out"
      supportedSubmitMethods: window.location.hostname === 'localhost'
        ? ['get', 'post', 'put', 'delete', 'patch']
        : [],
      persistAuthorization: true,
      withCredentials: true,
    });
    window.ui = ui;
  </script>
</body>
</html>
```

### Výhody
- ✅ Jednoduchá implementácia
- ✅ Rýchle načítanie (CDN cache)
- ✅ Nezávislé od aplikácie
- ✅ Nízke náklady

### Nevýhody
- ❌ Manuálna synchronizácia openapi.yaml
- ❌ Žiadna dynamická autentifikácia
- ❌ Ťažšie verzionovanie

### Bezpečnostné nastavenia

```nginx
# nginx.conf pre /docs/
location /docs/ {
    # Len internal sieť alebo VPN
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny all;

    # Alebo basic auth
    auth_basic "API Documentation";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## Možnosť B: Next.js Route Handler (Odporúčaná)

### Popis
Swagger UI servovaný cez Next.js route s feature flag kontrolou a autentifikáciou.

### Architektúra

```
┌─────────────────────────────────────────────────────┐
│                 Next.js Application                  │
├─────────────────────────────────────────────────────┤
│  /app/                                              │
│  ├── docs/                                          │
│  │   ├── page.tsx           (Swagger UI page)       │
│  │   └── layout.tsx         (Auth wrapper)          │
│  └── api/                                           │
│      └── docs/                                      │
│          └── openapi/                               │
│              └── route.ts   (OpenAPI JSON endpoint) │
└─────────────────────────────────────────────────────┘
```

### Súbory na vytvorenie

#### 1. Feature Flag Configuration

```typescript
// src/lib/config/features.ts
export const FEATURES = {
  SWAGGER_UI: {
    enabled: process.env.ENABLE_SWAGGER_UI === 'true',
    requireAuth: process.env.SWAGGER_REQUIRE_AUTH !== 'false',
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    tryItOutEnabled: process.env.NODE_ENV === 'development',
  },
} as const;
```

#### 2. OpenAPI Endpoint

```typescript
// src/app/api/docs/openapi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { FEATURES } from '@/lib/config/features';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  // Check if Swagger is enabled
  if (!FEATURES.SWAGGER_UI.enabled) {
    return NextResponse.json(
      { error: 'not_found', message: 'API documentation is disabled' },
      { status: 404 }
    );
  }

  // Require admin auth if configured
  if (FEATURES.SWAGGER_UI.requireAuth) {
    const authResult = await requireAuth(request, ['admin:read']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  }

  try {
    // Read and parse OpenAPI spec
    const specPath = join(process.cwd(), 'openapi.yaml');
    const specContent = readFileSync(specPath, 'utf-8');
    const spec = yaml.load(specContent);

    // Add server URL dynamically
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    (spec as any).servers = [
      {
        url: `${protocol}://${host}/api/v1`,
        description: 'Current environment',
      },
    ];

    return NextResponse.json(spec, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 min cache
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to load OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to load API specification' },
      { status: 500 }
    );
  }
}
```

#### 3. Swagger UI Page

```typescript
// src/app/docs/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FEATURES } from '@/lib/config/features';
import SwaggerUI from './SwaggerUI';

export const metadata: Metadata = {
  title: 'API Documentation | ScamNemesis',
  description: 'ScamNemesis REST API Documentation',
  robots: 'noindex, nofollow', // Don't index docs
};

export default async function DocsPage() {
  // Check if feature is enabled
  if (!FEATURES.SWAGGER_UI.enabled) {
    redirect('/404');
  }

  // Check authentication if required
  if (FEATURES.SWAGGER_UI.requireAuth) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect('/auth/login?callbackUrl=/docs');
    }

    const userRole = session.user.role;
    if (!FEATURES.SWAGGER_UI.allowedRoles.includes(userRole)) {
      redirect('/403');
    }
  }

  return (
    <div className="swagger-container">
      <SwaggerUI
        url="/api/docs/openapi"
        tryItOutEnabled={FEATURES.SWAGGER_UI.tryItOutEnabled}
      />
    </div>
  );
}
```

#### 4. Swagger UI Client Component

```typescript
// src/app/docs/SwaggerUI.tsx
'use client';

import { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';

interface SwaggerUIProps {
  url: string;
  tryItOutEnabled: boolean;
}

export default function SwaggerUI({ url, tryItOutEnabled }: SwaggerUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ui = SwaggerUIBundle({
      url,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset,
      ],
      layout: 'StandaloneLayout',
      supportedSubmitMethods: tryItOutEnabled
        ? ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']
        : [],
      persistAuthorization: true,
      withCredentials: true,
      requestInterceptor: (req: any) => {
        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          req.headers['X-CSRF-Token'] = csrfToken;
        }
        return req;
      },
    });

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, tryItOutEnabled]);

  return (
    <div
      id="swagger-ui"
      ref={containerRef}
      style={{ minHeight: '100vh' }}
    />
  );
}
```

#### 5. CSS Customization

```css
/* src/app/docs/swagger.css */
.swagger-ui {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.swagger-ui .topbar {
  display: none;
}

.swagger-ui .info {
  margin: 30px 0;
}

.swagger-ui .info .title {
  font-size: 2.5rem;
  color: #1a1a2e;
}

.swagger-ui .opblock.opblock-get {
  border-color: #61affe;
  background: rgba(97, 175, 254, 0.1);
}

.swagger-ui .opblock.opblock-post {
  border-color: #49cc90;
  background: rgba(73, 204, 144, 0.1);
}

.swagger-ui .opblock.opblock-delete {
  border-color: #f93e3e;
  background: rgba(249, 62, 62, 0.1);
}

/* Hide "Try it out" button in production */
.swagger-ui .try-out__btn {
  display: var(--swagger-try-out-display, block);
}
```

### Výhody
- ✅ Integrovaná autentifikácia
- ✅ Feature flag kontrola
- ✅ Dynamický server URL
- ✅ Automatická synchronizácia so spec
- ✅ Konzistentný styling s aplikáciou

### Nevýhody
- ❌ Väčšia bundle size
- ❌ Závislosť na aplikácii
- ❌ Komplexnejšia implementácia

---

## Bezpečnostné požiadavky

### 1. Autentifikácia

| Prostredie | Požiadavka |
|------------|------------|
| Development | Žiadna (voliteľná) |
| Staging | Admin autentifikácia |
| Production | Admin autentifikácia + IP whitelist |

### 2. Rate Limiting

```typescript
// Rate limit pre docs endpoint
export async function GET(request: NextRequest) {
  const rateLimitError = await requireRateLimit(request, 30); // 30/min
  if (rateLimitError) return rateLimitError;
  // ...
}
```

### 3. "Try it out" kontrola

| Prostredie | Try it out |
|------------|------------|
| localhost | ✅ Enabled |
| staging | ✅ Enabled (pre testing) |
| production | ❌ Disabled |

### 4. Robots.txt

```txt
# robots.txt
User-agent: *
Disallow: /docs/
Disallow: /api/docs/
```

### 5. Security Headers

```typescript
// next.config.js
{
  source: '/docs/:path*',
  headers: [
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    { key: 'Cache-Control', value: 'private, no-cache' },
  ],
}
```

---

## Verzionovanie

### URL štruktúra

```
/docs/v1/     → OpenAPI spec v1
/docs/v2/     → OpenAPI spec v2 (budúce)
/docs/latest/ → Redirect na aktuálnu verziu
```

### Implementácia

```typescript
// src/app/docs/[version]/page.tsx
import { notFound } from 'next/navigation';

const SUPPORTED_VERSIONS = ['v1'];
const LATEST_VERSION = 'v1';

export default function VersionedDocsPage({
  params
}: {
  params: { version: string }
}) {
  const { version } = params;

  if (version === 'latest') {
    redirect(`/docs/${LATEST_VERSION}`);
  }

  if (!SUPPORTED_VERSIONS.includes(version)) {
    notFound();
  }

  return <SwaggerUI url={`/api/docs/openapi/${version}`} />;
}
```

### Changelog

```typescript
// src/app/docs/changelog/page.tsx
export default function ChangelogPage() {
  return (
    <div className="changelog">
      <h1>API Changelog</h1>

      <section>
        <h2>v1.0.0 (2024-12-26)</h2>
        <ul>
          <li>Initial release</li>
          <li>60 endpoints documented</li>
          <li>Full OpenAPI 3.1 compliance</li>
        </ul>
      </section>
    </div>
  );
}
```

---

## Odporúčaná implementácia

### Odporúčanie: Možnosť B (Next.js Route Handler)

**Dôvody:**
1. Lepšia integrácia s existujúcou autentifikáciou
2. Feature flag pre kontrolu prístupu
3. Dynamická konfigurácia server URL
4. Konzistentný UX s aplikáciou
5. Jednoduchšie verzionovanie

### Implementačný plán

#### Fáza 1: Základná implementácia (1-2 dni)
1. Vytvoriť `/src/lib/config/features.ts`
2. Vytvoriť `/src/app/api/docs/openapi/route.ts`
3. Vytvoriť `/src/app/docs/page.tsx`
4. Vytvoriť `/src/app/docs/SwaggerUI.tsx`
5. Pridať `swagger-ui-dist` dependency

#### Fáza 2: Bezpečnosť (1 deň)
1. Implementovať admin autentifikáciu
2. Pridať rate limiting
3. Konfigurovať security headers
4. Aktualizovať robots.txt

#### Fáza 3: Verzionovanie (1 deň)
1. Vytvoriť verzionovanú štruktúru
2. Implementovať changelog page
3. Pridať version selector do UI

### Environment Variables

```bash
# .env.local
ENABLE_SWAGGER_UI=true
SWAGGER_REQUIRE_AUTH=true

# .env.production
ENABLE_SWAGGER_UI=true
SWAGGER_REQUIRE_AUTH=true
```

### Package Dependencies

```bash
npm install swagger-ui-dist js-yaml
npm install -D @types/js-yaml
```

---

## Zhrnutie

| Aspekt | Možnosť A (Static) | Možnosť B (Next.js) |
|--------|---------------------|---------------------|
| Komplexita | Nízka | Stredná |
| Bezpečnosť | Manuálna | Integrovaná |
| Verzionovanie | Manuálne | Automatické |
| Údržba | Ručná sync | Automatická |
| Try it out kontrola | Statická | Dynamická |
| **Odporúčanie** | Dev/testing | **Production** |

---

## Prílohy

- `openapi.yaml` - OpenAPI 3.1 špecifikácia
- `API_AUDIT_REPORT.md` - Kompletný API audit
