# Translation System Documentation

## Overview

ScamNemesis uses a centralized translation system for internationalization (i18n). This document provides guidelines for AI developers and human developers on how to properly work with translations.

## Supported Languages

- **sk** - Slovak (default)
- **en** - English
- **cs** - Czech
- **de** - German

## Translation Files Location

**SINGLE SOURCE OF TRUTH:**
```
/src/lib/i18n/locales/
├── en.json    # English translations
├── sk.json    # Slovak translations
├── cs.json    # Czech translations
└── de.json    # German translations
```

## How to Use Translations

### In Client Components ('use client')

```tsx
import { useTranslation } from '@/lib/i18n/context';

export function MyComponent() {
  const { t, tv } = useTranslation();

  // For simple strings:
  const title = t('pages.myPage.title');

  // For arrays or objects (use tv = "translation value"):
  const items = tv<string[]>('pages.myPage.items');
  const config = tv<{ name: string; value: number }>('pages.myPage.config');

  return <h1>{title}</h1>;
}
```

### Translation Functions

| Function | Returns | Use Case |
|----------|---------|----------|
| `t(key)` | `string` | Simple text strings |
| `tv<T>(key)` | `T` | Arrays, objects, or any typed value |

## JSON Structure

Translations are organized hierarchically:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "pages": {
    "about": {
      "hero": {
        "title": "About ScamNemesis"
      }
    }
  },
  "components": {
    "navbar": {
      "home": "Home"
    }
  }
}
```

### Key Naming Convention

- Use **camelCase** for keys: `heroTitle`, `submitButton`
- Use **dot notation** for nested keys: `pages.about.hero.title`
- Group by feature/page: `pages.about`, `components.navbar`, `report.step1`

## Adding New Translations

### Step 1: Add to ALL language files

When adding a new translation, you MUST add it to ALL 4 files:
- `/src/lib/i18n/locales/en.json`
- `/src/lib/i18n/locales/sk.json`
- `/src/lib/i18n/locales/cs.json`
- `/src/lib/i18n/locales/de.json`

### Step 2: Maintain consistent structure

All language files MUST have the same structure. TypeScript will fail if structures differ.

### Step 3: Use the translation in your component

```tsx
// Add to JSON files first:
// "pages": { "newPage": { "title": "My New Page" } }

// Then use in component:
const title = t('pages.newPage.title');
```

## DO NOT DO

### 1. Never create inline translations

```tsx
// ❌ BAD - DO NOT DO THIS
const getTranslations = (locale: string) => ({
  en: { title: 'About Us' },
  sk: { title: 'O nás' }
});
const t = getTranslations(locale);
return <h1>{t.title}</h1>;

// ✅ GOOD - Use centralized translations
const { t } = useTranslation();
return <h1>{t('pages.about.title')}</h1>;
```

### 2. Never hardcode text in components

```tsx
// ❌ BAD
return <button>Submit</button>;

// ✅ GOOD
return <button>{t('common.submit')}</button>;
```

### 3. Never create duplicate translation files

The ONLY translation files should be in `/src/lib/i18n/locales/`. Do not create:
- `/src/i18n/dictionaries/` (deleted - was duplicate)
- Translation objects inside components
- Separate translation files per page

## Migration Notes (Legacy Code)

Some pages still use inline `getTranslations()` functions. These should be migrated to the centralized system when modified:

### Pages with inline translations (need migration):
- `/src/app/[locale]/contact-us/page.tsx`
- `/src/app/[locale]/verify-serviceproduct/page.tsx`
- `/src/app/[locale]/money-recovery/page.tsx`
- `/src/app/[locale]/page.tsx` (homepage)
- `/src/app/[locale]/privacy/page.tsx`
- `/src/app/[locale]/search/page.tsx`
- `/src/app/[locale]/terms/page.tsx`

### Pages already migrated:
- `/src/app/[locale]/about/page.tsx` ✅

### How to migrate a page:

1. Copy the inline translations to the JSON files under `pages.{pageName}`
2. Replace `getTranslations()` with `useTranslation()` hook
3. Replace `t.xxx` with `t('pages.{pageName}.xxx')`
4. Replace array accesses with `tv<Type[]>('pages.{pageName}.array')`
5. Delete the `getTranslations` function
6. Run `npm run type-check` to verify

## Folder Structure Reference

```
/src/lib/i18n/
├── index.ts          # Main exports (locales, getTranslation, etc.)
├── context.tsx       # TranslationProvider and useTranslation hook
└── locales/
    ├── en.json       # English
    ├── sk.json       # Slovak (default)
    ├── cs.json       # Czech
    └── de.json       # German

/src/i18n/
└── config.ts         # Re-exports for backwards compatibility (DO NOT ADD HERE)
```

## TypeScript Types

The translation system is fully typed. If you add a new key, TypeScript will ensure it exists in all language files.

```tsx
// Type-safe translation access
const items = tv<Array<{ title: string; description: string }>>('pages.about.values.items');

// This will fail TypeScript if the key doesn't exist
const title = t('non.existent.key'); // TS Error
```

## Testing Translations

After adding translations:

1. Run `npm run type-check` - ensures all JSON files have matching structure
2. Run `npm run lint` - checks for any syntax errors
3. Run `npm run test` - runs all tests
4. Manually test in browser for each locale: `/en/page`, `/sk/page`, `/cs/page`, `/de/page`

## Summary for AI Developers

When working on this codebase:

1. **Always use** `/src/lib/i18n/locales/*.json` for translations
2. **Always use** `useTranslation()` from `@/lib/i18n/context`
3. **Never create** inline translation functions or objects
4. **Always add** translations to ALL 4 language files
5. **Always run** `npm run type-check` after adding translations
