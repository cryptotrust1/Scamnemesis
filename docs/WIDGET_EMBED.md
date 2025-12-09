# Widget & Embed Integration - Scamnemesis

## 1. Overview

Widget umožňuje integrovať Scamnemesis vyhľadávanie a report formulár do externých webstránok.

**Podporované integrácie:**
- iFrame embed
- JavaScript SDK
- WordPress shortcode
- API direct integration

## 2. iFrame Integration

### 2.1 Basic Search Widget

```html
<!-- Scamnemesis Search Widget -->
<iframe
  src="https://demo.scamnemesis.com/widget/search"
  width="100%"
  height="400"
  frameborder="0"
  allow="clipboard-write"
  loading="lazy"
  title="Scamnemesis Fraud Search"
></iframe>
```

### 2.2 Full Widget (Search + Report Button)

```html
<iframe
  src="https://demo.scamnemesis.com/widget/full"
  width="100%"
  height="500"
  frameborder="0"
  allow="clipboard-write"
  loading="lazy"
></iframe>
```

### 2.3 Report-Only Widget

```html
<iframe
  src="https://demo.scamnemesis.com/widget/report"
  width="100%"
  height="800"
  frameborder="0"
  allow="clipboard-write; camera"
  loading="lazy"
></iframe>
```

### 2.4 URL Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `theme` | `light` / `dark` / `auto` | `auto` |
| `lang` | Language code (sk, cs, en, de, ru, uk) | `en` |
| `color` | Primary color hex (without #) | `2563eb` |
| `compact` | `true` for compact mode | `false` |
| `hidelogo` | Hide Scamnemesis logo | `false` |
| `hidereport` | Hide report button | `false` |

**Example with parameters:**
```html
<iframe
  src="https://demo.scamnemesis.com/widget/search?theme=dark&lang=sk&color=dc2626&compact=true"
  width="100%"
  height="350"
  frameborder="0"
></iframe>
```

## 3. JavaScript SDK

### 3.1 Installation

```html
<!-- Add before closing </body> tag -->
<script src="https://demo.scamnemesis.com/sdk/v1/widget.js" async></script>
```

### 3.2 Initialization

```html
<div id="scamnemesis-widget"></div>

<script>
  window.ScamnemesisConfig = {
    container: '#scamnemesis-widget',
    apiKey: 'pk_widget_xxx',  // Public widget key
    type: 'search',           // 'search' | 'report' | 'full'
    theme: 'light',
    language: 'sk',
    primaryColor: '#2563eb',
    onResult: function(result) {
      console.log('Search result clicked:', result);
      // Redirect to detail page
      window.location.href = result.detailUrl;
    },
    onReportSubmit: function(reportId) {
      console.log('Report submitted:', reportId);
    }
  };
</script>
```

### 3.3 Programmatic Control

```javascript
// Initialize widget
const widget = ScamnemesisWidget.init({
  container: '#my-container',
  apiKey: 'pk_widget_xxx',
  type: 'search'
});

// Programmatic search
widget.search('Vladimir Gala');

// Clear results
widget.clear();

// Open report form
widget.openReportForm();

// Destroy widget
widget.destroy();

// Event listeners
widget.on('search', (query) => console.log('Searching:', query));
widget.on('results', (results) => console.log('Results:', results));
widget.on('error', (error) => console.error('Error:', error));
```

### 3.4 SDK Methods

```typescript
interface ScamnemesisWidget {
  // Initialization
  init(config: WidgetConfig): Widget;

  // Search
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  clearResults(): void;

  // Report
  openReportForm(prefilledData?: Partial<ReportData>): void;
  closeReportForm(): void;

  // Events
  on(event: WidgetEvent, callback: Function): void;
  off(event: WidgetEvent, callback: Function): void;

  // Lifecycle
  destroy(): void;
}

type WidgetEvent =
  | 'search'
  | 'results'
  | 'resultClick'
  | 'reportOpen'
  | 'reportSubmit'
  | 'error';
```

## 4. Cross-Origin Security

### 4.1 Domain Whitelist

Widget funguje len na povolených doménach. Konfigurácia v admin paneli:

```
Allowed Domains:
- demo.scamnemesis.com
- partner-site.com
- *.trusted-network.org
```

### 4.2 Security Headers

Widget endpoint vracia tieto headers:

```
Content-Security-Policy: frame-ancestors 'self' https://partner-site.com
X-Frame-Options: ALLOW-FROM https://partner-site.com
```

### 4.3 postMessage Communication

Pre komunikáciu medzi parent window a iframe:

```javascript
// Parent window - listen for widget messages
window.addEventListener('message', (event) => {
  // Verify origin
  if (event.origin !== 'https://demo.scamnemesis.com') return;

  const { type, data } = event.data;

  switch (type) {
    case 'WIDGET_READY':
      console.log('Widget initialized');
      break;
    case 'SEARCH_RESULTS':
      console.log('Results:', data.results);
      break;
    case 'RESULT_CLICK':
      console.log('Clicked:', data.reportId);
      // Handle navigation
      break;
    case 'REPORT_SUBMITTED':
      console.log('Report ID:', data.reportId);
      break;
    case 'RESIZE':
      // Auto-resize iframe
      document.querySelector('iframe').style.height = data.height + 'px';
      break;
  }
});

// Parent window - send commands to widget
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
  type: 'SEARCH',
  data: { query: 'John Smith' }
}, 'https://demo.scamnemesis.com');
```

## 5. WordPress Plugin Integration

### 5.1 Shortcode Usage

```php
// Basic search widget
[scamnemesis_search]

// With options
[scamnemesis_search theme="dark" lang="sk" compact="true"]

// Full widget
[scamnemesis_widget type="full" height="500"]

// Report form only
[scamnemesis_report prefill_country="SK"]
```

### 5.2 Shortcode Implementation

```php
// plugins/scamnemesis/includes/shortcodes.php

function scamnemesis_search_shortcode($atts) {
    $atts = shortcode_atts([
        'theme' => 'auto',
        'lang' => get_locale(),
        'color' => get_option('scamnemesis_primary_color', '2563eb'),
        'compact' => 'false',
        'height' => '400'
    ], $atts);

    $params = http_build_query([
        'theme' => $atts['theme'],
        'lang' => substr($atts['lang'], 0, 2),
        'color' => ltrim($atts['color'], '#'),
        'compact' => $atts['compact']
    ]);

    $api_url = get_option('scamnemesis_api_url', 'https://demo.scamnemesis.com');

    return sprintf(
        '<iframe
            src="%s/widget/search?%s"
            width="100%%"
            height="%s"
            frameborder="0"
            allow="clipboard-write"
            loading="lazy"
            class="scamnemesis-widget"
        ></iframe>',
        esc_url($api_url),
        esc_attr($params),
        esc_attr($atts['height'])
    );
}
add_shortcode('scamnemesis_search', 'scamnemesis_search_shortcode');
```

### 5.3 Gutenberg Block

```javascript
// plugins/scamnemesis/blocks/search-widget/index.js

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';

registerBlockType('scamnemesis/search-widget', {
    title: 'Scamnemesis Search',
    icon: 'search',
    category: 'widgets',
    attributes: {
        theme: { type: 'string', default: 'auto' },
        language: { type: 'string', default: 'en' },
        primaryColor: { type: 'string', default: '#2563eb' },
        compact: { type: 'boolean', default: false },
        height: { type: 'string', default: '400' }
    },

    edit: ({ attributes, setAttributes }) => {
        const { theme, language, primaryColor, compact, height } = attributes;

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Widget Settings">
                        <SelectControl
                            label="Theme"
                            value={theme}
                            options={[
                                { label: 'Auto', value: 'auto' },
                                { label: 'Light', value: 'light' },
                                { label: 'Dark', value: 'dark' }
                            ]}
                            onChange={(value) => setAttributes({ theme: value })}
                        />
                        <SelectControl
                            label="Language"
                            value={language}
                            options={[
                                { label: 'English', value: 'en' },
                                { label: 'Slovak', value: 'sk' },
                                { label: 'Czech', value: 'cs' },
                                { label: 'German', value: 'de' },
                                { label: 'Russian', value: 'ru' },
                                { label: 'Ukrainian', value: 'uk' }
                            ]}
                            onChange={(value) => setAttributes({ language: value })}
                        />
                        <TextControl
                            label="Primary Color"
                            value={primaryColor}
                            onChange={(value) => setAttributes({ primaryColor: value })}
                        />
                        <ToggleControl
                            label="Compact Mode"
                            checked={compact}
                            onChange={(value) => setAttributes({ compact: value })}
                        />
                        <TextControl
                            label="Height (px)"
                            value={height}
                            onChange={(value) => setAttributes({ height: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <div className="scamnemesis-block-preview">
                    <iframe
                        src={`https://demo.scamnemesis.com/widget/search?theme=${theme}&lang=${language}`}
                        width="100%"
                        height={height}
                        frameBorder="0"
                    />
                </div>
            </>
        );
    },

    save: ({ attributes }) => {
        const { theme, language, primaryColor, compact, height } = attributes;
        const params = new URLSearchParams({
            theme,
            lang: language,
            color: primaryColor.replace('#', ''),
            compact: compact.toString()
        });

        return (
            <iframe
                src={`https://demo.scamnemesis.com/widget/search?${params}`}
                width="100%"
                height={height}
                frameBorder="0"
                allow="clipboard-write"
                loading="lazy"
                className="scamnemesis-widget"
            />
        );
    }
});
```

## 6. Widget Backend Implementation

### 6.1 Widget Controller

```typescript
// src/api/controllers/widgetController.ts

@Controller('widget')
export class WidgetController {
  constructor(
    private searchService: SearchService,
    private configService: ConfigService
  ) {}

  @Get('search')
  @Header('X-Frame-Options', 'ALLOW-FROM https://allowed-domain.com')
  async renderSearchWidget(
    @Query('theme') theme: string = 'auto',
    @Query('lang') lang: string = 'en',
    @Query('color') color: string = '2563eb',
    @Query('compact') compact: boolean = false,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Validate referer domain
    const referer = req.headers.referer;
    if (referer && !this.isAllowedDomain(referer)) {
      return res.status(403).send('Domain not allowed');
    }

    // Set CSP header dynamically
    const allowedOrigins = await this.configService.getAllowedWidgetDomains();
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors 'self' ${allowedOrigins.join(' ')}`
    );

    // Render widget HTML
    return res.render('widget/search', {
      theme,
      lang,
      primaryColor: `#${color}`,
      compact,
      apiUrl: this.configService.get('API_URL')
    });
  }

  @Post('api/search')
  @UseGuards(WidgetApiGuard)
  async widgetSearch(
    @Body() body: { query: string; filters?: SearchFilters },
    @Req() req: Request
  ) {
    // Validate widget API key
    const apiKey = req.headers['x-widget-key'] as string;
    await this.validateWidgetKey(apiKey, req.headers.origin);

    // Execute search with Basic role masking
    const results = await this.searchService.search(
      body.query,
      body.filters,
      UserRole.BASIC  // Widget always uses Basic role
    );

    return {
      results: results.slice(0, 10),  // Limit widget results
      total: results.length,
      hasMore: results.length > 10
    };
  }

  private isAllowedDomain(referer: string): boolean {
    const allowedDomains = this.configService.get('WIDGET_ALLOWED_DOMAINS').split(',');
    const refererHost = new URL(referer).hostname;

    return allowedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2);
        return refererHost.endsWith(baseDomain);
      }
      return refererHost === domain;
    });
  }
}
```

### 6.2 Widget Frontend (Vue.js)

```vue
<!-- src/widget/SearchWidget.vue -->
<template>
  <div class="scamnemesis-widget" :class="[theme, { compact }]">
    <div class="widget-header" v-if="!compact">
      <img v-if="showLogo" src="/logo.svg" alt="Scamnemesis" class="logo" />
      <h3>{{ t('search.title') }}</h3>
    </div>

    <div class="search-box">
      <input
        type="text"
        v-model="query"
        :placeholder="t('search.placeholder')"
        @keyup.enter="search"
        class="search-input"
      />
      <button @click="search" class="search-btn" :style="{ backgroundColor: primaryColor }">
        <SearchIcon />
        {{ compact ? '' : t('search.button') }}
      </button>
    </div>

    <div class="search-mode" v-if="!compact">
      <label>
        <input type="radio" v-model="mode" value="fuzzy" /> {{ t('search.fuzzy') }}
      </label>
      <label>
        <input type="radio" v-model="mode" value="exact" /> {{ t('search.exact') }}
      </label>
    </div>

    <div class="results" v-if="results.length">
      <div
        v-for="result in results"
        :key="result.id"
        class="result-item"
        @click="openResult(result)"
      >
        <div class="result-type">{{ formatFraudType(result.fraud_type) }}</div>
        <div class="result-name" v-html="result.highlights?.name?.[0] || result.perpetrator.name"></div>
        <div class="result-meta">
          <span>{{ result.country }}</span>
          <span>{{ formatDate(result.incident_date) }}</span>
        </div>
      </div>

      <div v-if="hasMore" class="view-more">
        <a :href="fullSearchUrl" target="_blank">{{ t('search.viewMore') }}</a>
      </div>
    </div>

    <div class="no-results" v-else-if="searched && !loading">
      {{ t('search.noResults') }}
    </div>

    <div class="loading" v-if="loading">
      <Spinner />
    </div>

    <div class="widget-footer" v-if="showReportButton">
      <button @click="openReport" class="report-btn">
        {{ t('report.button') }}
      </button>
      <span class="powered-by">
        Powered by <a href="https://scamnemesis.com" target="_blank">Scamnemesis</a>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  theme: { type: String, default: 'light' },
  language: { type: String, default: 'en' },
  primaryColor: { type: String, default: '#2563eb' },
  compact: { type: Boolean, default: false },
  showLogo: { type: Boolean, default: true },
  showReportButton: { type: Boolean, default: true },
  apiKey: { type: String, required: true }
});

const { t, locale } = useI18n();
locale.value = props.language;

const query = ref('');
const mode = ref('fuzzy');
const results = ref([]);
const loading = ref(false);
const searched = ref(false);
const hasMore = ref(false);

const fullSearchUrl = computed(() =>
  `https://demo.scamnemesis.com/search?q=${encodeURIComponent(query.value)}`
);

async function search() {
  if (!query.value.trim()) return;

  loading.value = true;
  searched.value = true;

  try {
    const response = await fetch('/widget/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Key': props.apiKey
      },
      body: JSON.stringify({ query: query.value, mode: mode.value })
    });

    const data = await response.json();
    results.value = data.results;
    hasMore.value = data.hasMore;

    // Notify parent window
    notifyParent('SEARCH_RESULTS', { results: data.results, total: data.total });
  } catch (error) {
    notifyParent('ERROR', { message: error.message });
  } finally {
    loading.value = false;
  }
}

function openResult(result) {
  notifyParent('RESULT_CLICK', {
    reportId: result.id,
    detailUrl: `https://demo.scamnemesis.com/report/${result.id}`
  });

  // Open in new tab by default
  window.open(`https://demo.scamnemesis.com/report/${result.id}`, '_blank');
}

function openReport() {
  notifyParent('REPORT_OPEN', {});
  window.open('https://demo.scamnemesis.com/report/new', '_blank');
}

function notifyParent(type, data) {
  if (window.parent !== window) {
    window.parent.postMessage({ type, data }, '*');
  }
}

// Listen for commands from parent
window.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SEARCH':
      query.value = data.query;
      search();
      break;
    case 'CLEAR':
      query.value = '';
      results.value = [];
      searched.value = false;
      break;
  }
});

// Notify parent that widget is ready
notifyParent('WIDGET_READY', {});
</script>

<style scoped>
.scamnemesis-widget {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  border-radius: 8px;
  background: var(--bg-color, #ffffff);
  color: var(--text-color, #1f2937);
}

.scamnemesis-widget.dark {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  font-size: 16px;
}

.search-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.result-item {
  padding: 12px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  cursor: pointer;
}

.result-item:hover {
  background: var(--hover-bg, #f3f4f6);
}

.compact .search-input {
  padding: 8px 12px;
}

.compact .search-btn {
  padding: 8px 16px;
}
</style>
```

## 7. Security Considerations

### 7.1 Rate Limiting

```typescript
// Widget-specific rate limits
const widgetRateLimits = {
  search: {
    windowMs: 60 * 1000,  // 1 minute
    max: 30  // 30 searches per minute per IP
  },
  report: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 5  // 5 reports per hour per IP
  }
};
```

### 7.2 CAPTCHA Integration

Pre widget report form:

```html
<!-- Google reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<script>
  function submitReport(formData) {
    grecaptcha.execute('YOUR_SITE_KEY', { action: 'report' }).then(function(token) {
      formData.captchaToken = token;
      // Submit form
    });
  }
</script>
```

### 7.3 Input Sanitization

```typescript
function sanitizeWidgetInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[<>"']/g, '')   // Remove dangerous chars
    .slice(0, 500);           // Limit length
}
```

## 8. Analytics & Tracking

```typescript
// Widget analytics events
interface WidgetAnalytics {
  trackSearch(query: string, resultsCount: number): void;
  trackResultClick(reportId: string): void;
  trackReportStart(): void;
  trackReportSubmit(reportId: string): void;
  trackError(error: string): void;
}

// Implementation sends to backend
class WidgetAnalyticsService implements WidgetAnalytics {
  async trackSearch(query: string, resultsCount: number) {
    await fetch('/widget/analytics', {
      method: 'POST',
      body: JSON.stringify({
        event: 'search',
        data: { queryLength: query.length, resultsCount }
      })
    });
  }
}
```
