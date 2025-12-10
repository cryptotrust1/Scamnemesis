# Scamnemesis JavaScript SDK

Embeddable fraud search, verification, and report widgets for any website.

## Installation

### CDN

```html
<script src="https://cdn.scamnemesis.com/sdk/v1/scamnemesis.min.js"></script>
```

### NPM

```bash
npm install @scamnemesis/sdk
```

## Quick Start

### Auto-initialization (No JavaScript required)

```html
<!-- Search widget -->
<div data-scamnemesis-init="search" data-api-key="YOUR_API_KEY"></div>

<!-- Report widget -->
<div data-scamnemesis-init="report" data-api-key="YOUR_API_KEY"></div>

<!-- Verify widget -->
<div data-scamnemesis-init="verify" data-api-key="YOUR_API_KEY"></div>

<script src="https://cdn.scamnemesis.com/sdk/v1/scamnemesis.min.js"></script>
```

### JavaScript API

```javascript
// Initialize SDK
const scamnemesis = new Scamnemesis({
    apiKey: 'YOUR_API_KEY',
    theme: 'light',
    language: 'en',
    primaryColor: '#2563eb',
});

// Create search widget
scamnemesis.createSearchWidget('#search-container', {
    placeholder: 'Search for scam reports...',
});

// Create report widget
scamnemesis.createReportWidget('#report-container', {
    title: 'Report a Scam',
    successMessage: 'Thank you for your report!',
});

// Create verify widget
scamnemesis.createVerifyWidget('#verify-container');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | null | Your Scamnemesis API key |
| `apiUrl` | string | `https://api.scamnemesis.com` | API endpoint URL |
| `theme` | string | `'light'` | Theme: `'light'`, `'dark'`, or `'auto'` |
| `language` | string | `'en'` | Language: `'en'`, `'sk'`, `'cs'`, `'de'` |
| `primaryColor` | string | `'#2563eb'` | Primary accent color |
| `borderRadius` | number | `8` | Border radius in pixels |
| `fontFamily` | string | `'inherit'` | Font family |
| `onReady` | function | null | Callback when SDK is ready |
| `onError` | function | null | Callback on errors |
| `onSearch` | function | null | Callback on search results |
| `onReport` | function | null | Callback on report submission |
| `onVerify` | function | null | Callback on verification |

## API Methods

### Search

```javascript
const results = await scamnemesis.search('scammer@email.com', 'email', 1, 10);
console.log(results.data); // Array of results
console.log(results.total); // Total count
```

### Verify

```javascript
const result = await scamnemesis.verify('suspicious@email.com');
if (result.is_reported) {
    console.log(`Warning! Reported ${result.report_count} times`);
} else {
    console.log('Not found in database');
}
```

### Report

```javascript
const response = await scamnemesis.report({
    type: 'email',
    identifier: 'scammer@email.com',
    description: 'This person tried to...',
    amount_lost: 500,
    currency: 'USD',
});
```

### Statistics

```javascript
const stats = await scamnemesis.getStats();
console.log(stats.total_reports);
console.log(stats.total_amount_lost);
```

## Styling

### CSS Variables

You can customize the widget appearance using CSS variables:

```css
.scamnemesis-widget {
    --sn-primary: #2563eb;
    --sn-primary-hover: #1d4ed8;
    --sn-text: #1f2937;
    --sn-text-muted: #6b7280;
    --sn-bg: #ffffff;
    --sn-bg-secondary: #f9fafb;
    --sn-border: #e5e7eb;
    --sn-success: #10b981;
    --sn-warning: #f59e0b;
    --sn-danger: #ef4444;
    --sn-radius: 8px;
}
```

### Dark Theme

```javascript
const scamnemesis = new Scamnemesis({
    apiKey: 'YOUR_API_KEY',
    theme: 'dark',
});
```

## Events

```javascript
const scamnemesis = new Scamnemesis({
    apiKey: 'YOUR_API_KEY',
    onSearch: (response) => {
        console.log('Search completed:', response);
        // Track analytics
    },
    onReport: (response) => {
        console.log('Report submitted:', response);
        // Show confirmation
    },
    onVerify: (response) => {
        console.log('Verification result:', response);
        // Update UI
    },
    onError: (error) => {
        console.error('Error:', error);
        // Handle error
    },
});
```

## TypeScript

TypeScript definitions are included:

```typescript
import Scamnemesis, { ScamnemesisConfig, SearchResponse } from '@scamnemesis/sdk';

const config: ScamnemesisConfig = {
    apiKey: 'YOUR_API_KEY',
    theme: 'light',
};

const sdk = new Scamnemesis(config);

const results: SearchResponse = await sdk.search('test@email.com');
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Documentation: https://scamnemesis.com/docs/sdk
- Issues: https://github.com/scamnemesis/sdk-js/issues
- Email: support@scamnemesis.com
