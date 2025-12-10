/**
 * Scamnemesis JavaScript SDK
 *
 * Embeddable fraud search and report widget for any website.
 *
 * @version 1.0.0
 * @license MIT
 * @see https://scamnemesis.com/docs/sdk
 */

(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return factory(global); });
    } else {
        global.Scamnemesis = factory(global);
    }
})(typeof window !== 'undefined' ? window : this, function(window) {
    'use strict';

    const VERSION = '1.0.0';
    const DEFAULT_API_URL = 'https://api.scamnemesis.com';
    const DEFAULT_WIDGET_URL = 'https://widget.scamnemesis.com';

    /**
     * Default configuration
     */
    const defaultConfig = {
        apiKey: null,
        apiUrl: DEFAULT_API_URL,
        widgetUrl: DEFAULT_WIDGET_URL,
        theme: 'light',
        language: 'en',
        primaryColor: '#2563eb',
        borderRadius: 8,
        fontFamily: 'inherit',
        onReady: null,
        onError: null,
        onSearch: null,
        onReport: null,
        onVerify: null,
    };

    /**
     * Translations
     */
    const translations = {
        en: {
            search: 'Search',
            searching: 'Searching...',
            report: 'Report a Scam',
            verify: 'Verify',
            noResults: 'No results found',
            error: 'An error occurred',
            submit: 'Submit Report',
            placeholder: 'Enter email, phone, wallet, or domain...',
            reportPlaceholder: 'Describe the scam...',
            success: 'Report submitted successfully',
            required: 'This field is required',
            invalidEmail: 'Invalid email address',
            typeLabel: 'Type of identifier',
            identifierLabel: 'Scammer identifier',
            descriptionLabel: 'Description',
            amountLabel: 'Amount lost',
            safe: 'Not found in database',
            reported: 'Warning: This identifier has been reported',
        },
        sk: {
            search: 'Hľadať',
            searching: 'Hľadám...',
            report: 'Nahlásiť podvod',
            verify: 'Overiť',
            noResults: 'Žiadne výsledky',
            error: 'Vyskytla sa chyba',
            submit: 'Odoslať hlásenie',
            placeholder: 'Zadajte email, telefón, wallet alebo doménu...',
            reportPlaceholder: 'Popíšte podvod...',
            success: 'Hlásenie bolo úspešne odoslané',
            required: 'Toto pole je povinné',
            invalidEmail: 'Neplatná emailová adresa',
            typeLabel: 'Typ identifikátora',
            identifierLabel: 'Identifikátor podvodníka',
            descriptionLabel: 'Popis',
            amountLabel: 'Strata',
            safe: 'Nenájdené v databáze',
            reported: 'Varovanie: Tento identifikátor bol nahlásený',
        },
        cs: {
            search: 'Hledat',
            searching: 'Hledám...',
            report: 'Nahlásit podvod',
            verify: 'Ověřit',
            noResults: 'Žádné výsledky',
            error: 'Vyskytla se chyba',
            submit: 'Odeslat hlášení',
            placeholder: 'Zadejte email, telefon, wallet nebo doménu...',
            reportPlaceholder: 'Popište podvod...',
            success: 'Hlášení bylo úspěšně odesláno',
            required: 'Toto pole je povinné',
            invalidEmail: 'Neplatná emailová adresa',
            typeLabel: 'Typ identifikátoru',
            identifierLabel: 'Identifikátor podvodníka',
            descriptionLabel: 'Popis',
            amountLabel: 'Ztráta',
            safe: 'Nenalezeno v databázi',
            reported: 'Varování: Tento identifikátor byl nahlášen',
        },
        de: {
            search: 'Suchen',
            searching: 'Suche...',
            report: 'Betrug melden',
            verify: 'Überprüfen',
            noResults: 'Keine Ergebnisse',
            error: 'Ein Fehler ist aufgetreten',
            submit: 'Meldung senden',
            placeholder: 'E-Mail, Telefon, Wallet oder Domain eingeben...',
            reportPlaceholder: 'Beschreiben Sie den Betrug...',
            success: 'Meldung erfolgreich gesendet',
            required: 'Dieses Feld ist erforderlich',
            invalidEmail: 'Ungültige E-Mail-Adresse',
            typeLabel: 'Art der Kennung',
            identifierLabel: 'Betrüger-Kennung',
            descriptionLabel: 'Beschreibung',
            amountLabel: 'Verlorener Betrag',
            safe: 'Nicht in Datenbank gefunden',
            reported: 'Warnung: Diese Kennung wurde gemeldet',
        },
    };

    /**
     * CSS Styles
     */
    const getStyles = (config) => `
        .scamnemesis-widget {
            --sn-primary: ${config.primaryColor};
            --sn-primary-hover: ${adjustColor(config.primaryColor, -15)};
            --sn-text: ${config.theme === 'dark' ? '#f3f4f6' : '#1f2937'};
            --sn-text-muted: ${config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
            --sn-bg: ${config.theme === 'dark' ? '#1f2937' : '#ffffff'};
            --sn-bg-secondary: ${config.theme === 'dark' ? '#374151' : '#f9fafb'};
            --sn-border: ${config.theme === 'dark' ? '#4b5563' : '#e5e7eb'};
            --sn-success: #10b981;
            --sn-warning: #f59e0b;
            --sn-danger: #ef4444;
            --sn-radius: ${config.borderRadius}px;

            font-family: ${config.fontFamily === 'inherit' ? 'inherit' : config.fontFamily};
            font-size: 16px;
            line-height: 1.5;
            color: var(--sn-text);
            box-sizing: border-box;
        }

        .scamnemesis-widget *, .scamnemesis-widget *::before, .scamnemesis-widget *::after {
            box-sizing: border-box;
        }

        .scamnemesis-widget input,
        .scamnemesis-widget select,
        .scamnemesis-widget textarea,
        .scamnemesis-widget button {
            font-family: inherit;
            font-size: inherit;
        }

        .sn-container {
            max-width: 100%;
            padding: 1rem;
            background: var(--sn-bg);
            border: 1px solid var(--sn-border);
            border-radius: var(--sn-radius);
        }

        .sn-search-form {
            display: flex;
            gap: 0.5rem;
        }

        .sn-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid var(--sn-border);
            border-radius: var(--sn-radius);
            background: var(--sn-bg);
            color: var(--sn-text);
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sn-input:focus {
            border-color: var(--sn-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .sn-input::placeholder {
            color: var(--sn-text-muted);
        }

        .sn-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-weight: 500;
            color: #ffffff;
            background: var(--sn-primary);
            border: none;
            border-radius: var(--sn-radius);
            cursor: pointer;
            transition: background-color 0.2s;
            white-space: nowrap;
        }

        .sn-button:hover {
            background: var(--sn-primary-hover);
        }

        .sn-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .sn-button-secondary {
            background: var(--sn-bg-secondary);
            color: var(--sn-text);
            border: 1px solid var(--sn-border);
        }

        .sn-button-secondary:hover {
            background: var(--sn-border);
        }

        .sn-results {
            margin-top: 1rem;
            border: 1px solid var(--sn-border);
            border-radius: var(--sn-radius);
            overflow: hidden;
        }

        .sn-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: var(--sn-bg-secondary);
            border-bottom: 1px solid var(--sn-border);
            font-weight: 500;
        }

        .sn-results-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            line-height: 1;
            color: var(--sn-text-muted);
            cursor: pointer;
            padding: 0;
        }

        .sn-results-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .sn-result-item {
            padding: 1rem;
            border-bottom: 1px solid var(--sn-border);
        }

        .sn-result-item:last-child {
            border-bottom: none;
        }

        .sn-result-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .sn-result-identifier {
            font-weight: 600;
            word-break: break-all;
        }

        .sn-badge {
            display: inline-flex;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 9999px;
        }

        .sn-badge-danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--sn-danger);
        }

        .sn-badge-warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--sn-warning);
        }

        .sn-badge-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--sn-success);
        }

        .sn-result-description {
            font-size: 0.875rem;
            color: var(--sn-text-muted);
            margin-bottom: 0.5rem;
        }

        .sn-result-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: var(--sn-text-muted);
        }

        .sn-no-results,
        .sn-error {
            padding: 2rem;
            text-align: center;
            color: var(--sn-text-muted);
        }

        .sn-error {
            color: var(--sn-danger);
        }

        .sn-form-group {
            margin-bottom: 1rem;
        }

        .sn-label {
            display: block;
            margin-bottom: 0.375rem;
            font-weight: 500;
        }

        .sn-label .required {
            color: var(--sn-danger);
        }

        .sn-select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--sn-border);
            border-radius: var(--sn-radius);
            background: var(--sn-bg);
            color: var(--sn-text);
            cursor: pointer;
        }

        .sn-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--sn-border);
            border-radius: var(--sn-radius);
            background: var(--sn-bg);
            color: var(--sn-text);
            resize: vertical;
            min-height: 100px;
        }

        .sn-message {
            padding: 1rem;
            border-radius: var(--sn-radius);
            margin-top: 1rem;
        }

        .sn-message-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--sn-success);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .sn-message-error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--sn-danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .sn-verify-result {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: var(--sn-radius);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .sn-verify-safe {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .sn-verify-reported {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .sn-verify-icon {
            font-size: 1.5rem;
        }

        .sn-spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: sn-spin 0.75s linear infinite;
        }

        @keyframes sn-spin {
            to { transform: rotate(360deg); }
        }

        .sn-powered-by {
            margin-top: 0.75rem;
            text-align: center;
            font-size: 0.75rem;
            color: var(--sn-text-muted);
        }

        .sn-powered-by a {
            color: var(--sn-primary);
            text-decoration: none;
        }

        .sn-powered-by a:hover {
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .sn-search-form {
                flex-direction: column;
            }

            .sn-button {
                width: 100%;
            }
        }
    `;

    /**
     * Adjust color brightness
     */
    function adjustColor(color, amount) {
        const clamp = (num) => Math.min(255, Math.max(0, num));

        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        const num = parseInt(hex, 16);
        const r = clamp((num >> 16) + amount);
        const g = clamp(((num >> 8) & 0x00FF) + amount);
        const b = clamp((num & 0x0000FF) + amount);

        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return 'sn-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Main Scamnemesis class
     */
    class Scamnemesis {
        constructor(options = {}) {
            this.config = { ...defaultConfig, ...options };
            this.widgets = [];
            this.stylesInjected = false;

            if (!this.config.apiKey) {
                console.warn('Scamnemesis: API key not provided. Some features may be limited.');
            }
        }

        /**
         * Get translation
         */
        t(key) {
            const lang = this.config.language;
            return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
        }

        /**
         * Inject styles
         */
        injectStyles() {
            if (this.stylesInjected) return;

            const style = document.createElement('style');
            style.id = 'scamnemesis-styles';
            style.textContent = getStyles(this.config);
            document.head.appendChild(style);

            this.stylesInjected = true;
        }

        /**
         * Make API request
         */
        async request(method, endpoint, data = null) {
            const url = `${this.config.apiUrl}${endpoint}`;

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            };

            if (this.config.apiKey) {
                options.headers['X-API-Key'] = this.config.apiKey;
            }

            if (method === 'GET' && data) {
                const params = new URLSearchParams(data);
                return fetch(`${url}?${params}`, options).then(r => r.json());
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            return response.json();
        }

        /**
         * Search for reports
         */
        async search(query, type = 'all', page = 1, perPage = 10) {
            return this.request('GET', '/v1/search', {
                q: query,
                type,
                page,
                per_page: perPage,
            });
        }

        /**
         * Verify an identifier
         */
        async verify(identifier, type = 'auto') {
            return this.request('GET', '/v1/verify', {
                identifier,
                type,
            });
        }

        /**
         * Submit a report
         */
        async report(data) {
            return this.request('POST', '/v1/reports', data);
        }

        /**
         * Get statistics
         */
        async getStats() {
            return this.request('GET', '/v1/stats');
        }

        /**
         * Create search widget
         */
        createSearchWidget(container, options = {}) {
            this.injectStyles();

            const el = typeof container === 'string'
                ? document.querySelector(container)
                : container;

            if (!el) {
                console.error('Scamnemesis: Container not found');
                return null;
            }

            const widgetId = generateId();
            const widget = new SearchWidget(this, el, widgetId, options);
            this.widgets.push(widget);

            return widget;
        }

        /**
         * Create report widget
         */
        createReportWidget(container, options = {}) {
            this.injectStyles();

            const el = typeof container === 'string'
                ? document.querySelector(container)
                : container;

            if (!el) {
                console.error('Scamnemesis: Container not found');
                return null;
            }

            const widgetId = generateId();
            const widget = new ReportWidget(this, el, widgetId, options);
            this.widgets.push(widget);

            return widget;
        }

        /**
         * Create verify widget
         */
        createVerifyWidget(container, options = {}) {
            this.injectStyles();

            const el = typeof container === 'string'
                ? document.querySelector(container)
                : container;

            if (!el) {
                console.error('Scamnemesis: Container not found');
                return null;
            }

            const widgetId = generateId();
            const widget = new VerifyWidget(this, el, widgetId, options);
            this.widgets.push(widget);

            return widget;
        }

        /**
         * Destroy all widgets
         */
        destroy() {
            this.widgets.forEach(w => w.destroy());
            this.widgets = [];

            const style = document.getElementById('scamnemesis-styles');
            if (style) style.remove();

            this.stylesInjected = false;
        }
    }

    /**
     * Search Widget
     */
    class SearchWidget {
        constructor(sdk, container, id, options) {
            this.sdk = sdk;
            this.container = container;
            this.id = id;
            this.options = options;
            this.currentPage = 1;
            this.currentQuery = '';

            this.render();
            this.bindEvents();
        }

        render() {
            const t = (key) => this.sdk.t(key);

            this.container.innerHTML = `
                <div class="scamnemesis-widget" id="${this.id}">
                    <div class="sn-container">
                        <form class="sn-search-form" data-sn-form>
                            <input type="text" class="sn-input" data-sn-input
                                   placeholder="${escapeHtml(this.options.placeholder || t('placeholder'))}"
                                   aria-label="${t('search')}" required>
                            <button type="submit" class="sn-button" data-sn-button>
                                <span data-sn-button-text>${t('search')}</span>
                                <span class="sn-spinner" style="display:none" data-sn-spinner></span>
                            </button>
                        </form>
                        <div class="sn-results" style="display:none" data-sn-results>
                            <div class="sn-results-header">
                                <span data-sn-count></span>
                                <button class="sn-results-close" data-sn-close>&times;</button>
                            </div>
                            <div class="sn-results-list" data-sn-list></div>
                        </div>
                        <div class="sn-powered-by">
                            Powered by <a href="https://scamnemesis.com" target="_blank" rel="noopener">Scamnemesis</a>
                        </div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            const form = this.container.querySelector('[data-sn-form]');
            const closeBtn = this.container.querySelector('[data-sn-close]');

            form.addEventListener('submit', (e) => this.handleSearch(e));
            closeBtn.addEventListener('click', () => this.hideResults());
        }

        async handleSearch(e) {
            e.preventDefault();

            const input = this.container.querySelector('[data-sn-input]');
            const query = input.value.trim();

            if (!query) return;

            this.currentQuery = query;
            this.currentPage = 1;

            await this.search();
        }

        async search() {
            const t = (key) => this.sdk.t(key);
            const button = this.container.querySelector('[data-sn-button]');
            const buttonText = this.container.querySelector('[data-sn-button-text]');
            const spinner = this.container.querySelector('[data-sn-spinner]');

            button.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'inline-block';

            try {
                const response = await this.sdk.search(this.currentQuery, 'all', this.currentPage);
                this.renderResults(response);

                if (this.sdk.config.onSearch) {
                    this.sdk.config.onSearch(response);
                }
            } catch (error) {
                this.showError(t('error'));

                if (this.sdk.config.onError) {
                    this.sdk.config.onError(error);
                }
            } finally {
                button.disabled = false;
                buttonText.style.display = 'inline';
                spinner.style.display = 'none';
            }
        }

        renderResults(response) {
            const t = (key) => this.sdk.t(key);
            const results = this.container.querySelector('[data-sn-results]');
            const count = this.container.querySelector('[data-sn-count]');
            const list = this.container.querySelector('[data-sn-list]');

            const { data, total } = response;

            if (!data || data.length === 0) {
                count.textContent = '';
                list.innerHTML = `<div class="sn-no-results">${t('noResults')}</div>`;
            } else {
                count.textContent = `${total} result${total !== 1 ? 's' : ''} found`;
                list.innerHTML = data.map(item => this.renderResultItem(item)).join('');
            }

            results.style.display = 'block';
        }

        renderResultItem(item) {
            const riskClass = item.risk_level === 'high' ? 'danger' :
                             item.risk_level === 'medium' ? 'warning' : 'success';
            const riskLabel = item.risk_level === 'high' ? 'High Risk' :
                             item.risk_level === 'medium' ? 'Medium Risk' : 'Low Risk';

            return `
                <div class="sn-result-item">
                    <div class="sn-result-header">
                        <span class="sn-result-identifier">${escapeHtml(item.identifier || '')}</span>
                        <span class="sn-badge sn-badge-${riskClass}">${riskLabel}</span>
                    </div>
                    <div class="sn-result-description">${escapeHtml((item.description || '').substring(0, 150))}...</div>
                    <div class="sn-result-meta">
                        <span>Type: ${escapeHtml(item.type || 'Unknown')}</span>
                        <span>Reports: ${item.report_count || 1}</span>
                    </div>
                </div>
            `;
        }

        showError(message) {
            const results = this.container.querySelector('[data-sn-results]');
            const count = this.container.querySelector('[data-sn-count]');
            const list = this.container.querySelector('[data-sn-list]');

            count.textContent = '';
            list.innerHTML = `<div class="sn-error">${escapeHtml(message)}</div>`;
            results.style.display = 'block';
        }

        hideResults() {
            const results = this.container.querySelector('[data-sn-results]');
            results.style.display = 'none';
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    /**
     * Report Widget
     */
    class ReportWidget {
        constructor(sdk, container, id, options) {
            this.sdk = sdk;
            this.container = container;
            this.id = id;
            this.options = options;

            this.render();
            this.bindEvents();
        }

        render() {
            const t = (key) => this.sdk.t(key);

            this.container.innerHTML = `
                <div class="scamnemesis-widget" id="${this.id}">
                    <div class="sn-container">
                        <h3 style="margin:0 0 1rem;font-size:1.25rem;font-weight:600">${this.options.title || t('report')}</h3>
                        <form data-sn-form>
                            <div class="sn-form-group">
                                <label class="sn-label">${t('typeLabel')} <span class="required">*</span></label>
                                <select class="sn-select" name="type" required>
                                    <option value="">Select type...</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="wallet">Crypto Wallet</option>
                                    <option value="domain">Domain</option>
                                    <option value="social">Social Media</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="sn-form-group">
                                <label class="sn-label">${t('identifierLabel')} <span class="required">*</span></label>
                                <input type="text" class="sn-input" name="identifier" required
                                       placeholder="e.g., scammer@email.com">
                            </div>
                            <div class="sn-form-group">
                                <label class="sn-label">${t('descriptionLabel')} <span class="required">*</span></label>
                                <textarea class="sn-textarea" name="description" required
                                          placeholder="${t('reportPlaceholder')}"></textarea>
                            </div>
                            <div class="sn-form-group">
                                <label class="sn-label">${t('amountLabel')}</label>
                                <input type="number" class="sn-input" name="amount_lost"
                                       step="0.01" min="0" placeholder="0.00">
                            </div>
                            <button type="submit" class="sn-button" data-sn-button>
                                <span data-sn-button-text>${t('submit')}</span>
                                <span class="sn-spinner" style="display:none" data-sn-spinner></span>
                            </button>
                            <div class="sn-message" style="display:none" data-sn-message></div>
                        </form>
                        <div class="sn-powered-by">
                            Powered by <a href="https://scamnemesis.com" target="_blank" rel="noopener">Scamnemesis</a>
                        </div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            const form = this.container.querySelector('[data-sn-form]');
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        async handleSubmit(e) {
            e.preventDefault();

            const t = (key) => this.sdk.t(key);
            const form = e.target;
            const button = this.container.querySelector('[data-sn-button]');
            const buttonText = this.container.querySelector('[data-sn-button-text]');
            const spinner = this.container.querySelector('[data-sn-spinner]');
            const message = this.container.querySelector('[data-sn-message]');

            const data = {
                type: form.type.value,
                identifier: form.identifier.value,
                description: form.description.value,
                amount_lost: parseFloat(form.amount_lost.value) || null,
            };

            button.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'inline-block';
            message.style.display = 'none';

            try {
                const response = await this.sdk.report(data);

                message.className = 'sn-message sn-message-success';
                message.textContent = this.options.successMessage || t('success');
                message.style.display = 'block';

                form.reset();

                if (this.sdk.config.onReport) {
                    this.sdk.config.onReport(response);
                }
            } catch (error) {
                message.className = 'sn-message sn-message-error';
                message.textContent = error.message || t('error');
                message.style.display = 'block';

                if (this.sdk.config.onError) {
                    this.sdk.config.onError(error);
                }
            } finally {
                button.disabled = false;
                buttonText.style.display = 'inline';
                spinner.style.display = 'none';
            }
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    /**
     * Verify Widget
     */
    class VerifyWidget {
        constructor(sdk, container, id, options) {
            this.sdk = sdk;
            this.container = container;
            this.id = id;
            this.options = options;

            this.render();
            this.bindEvents();
        }

        render() {
            const t = (key) => this.sdk.t(key);

            this.container.innerHTML = `
                <div class="scamnemesis-widget" id="${this.id}">
                    <div class="sn-container">
                        <form class="sn-search-form" data-sn-form>
                            <input type="text" class="sn-input" data-sn-input
                                   placeholder="${escapeHtml(this.options.placeholder || t('placeholder'))}"
                                   aria-label="${t('verify')}" required>
                            <button type="submit" class="sn-button" data-sn-button>
                                <span data-sn-button-text>${t('verify')}</span>
                                <span class="sn-spinner" style="display:none" data-sn-spinner></span>
                            </button>
                        </form>
                        <div class="sn-verify-result" style="display:none" data-sn-result></div>
                        <div class="sn-powered-by">
                            Powered by <a href="https://scamnemesis.com" target="_blank" rel="noopener">Scamnemesis</a>
                        </div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            const form = this.container.querySelector('[data-sn-form]');
            form.addEventListener('submit', (e) => this.handleVerify(e));
        }

        async handleVerify(e) {
            e.preventDefault();

            const t = (key) => this.sdk.t(key);
            const input = this.container.querySelector('[data-sn-input]');
            const button = this.container.querySelector('[data-sn-button]');
            const buttonText = this.container.querySelector('[data-sn-button-text]');
            const spinner = this.container.querySelector('[data-sn-spinner]');
            const result = this.container.querySelector('[data-sn-result]');

            const identifier = input.value.trim();
            if (!identifier) return;

            button.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'inline-block';
            result.style.display = 'none';

            try {
                const response = await this.sdk.verify(identifier);

                if (response.is_reported) {
                    result.className = 'sn-verify-result sn-verify-reported';
                    result.innerHTML = `
                        <span class="sn-verify-icon">⚠️</span>
                        <span>${t('reported')} (${response.report_count || 1} times)</span>
                    `;
                } else {
                    result.className = 'sn-verify-result sn-verify-safe';
                    result.innerHTML = `
                        <span class="sn-verify-icon">✓</span>
                        <span>${t('safe')}</span>
                    `;
                }

                result.style.display = 'flex';

                if (this.sdk.config.onVerify) {
                    this.sdk.config.onVerify(response);
                }
            } catch (error) {
                result.className = 'sn-verify-result sn-message-error';
                result.innerHTML = `<span>${t('error')}</span>`;
                result.style.display = 'flex';

                if (this.sdk.config.onError) {
                    this.sdk.config.onError(error);
                }
            } finally {
                button.disabled = false;
                buttonText.style.display = 'inline';
                spinner.style.display = 'none';
            }
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    // Static version
    Scamnemesis.VERSION = VERSION;

    // Auto-init from data attributes
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            const autoInit = document.querySelectorAll('[data-scamnemesis-init]');

            autoInit.forEach(function(el) {
                const type = el.dataset.scamnemesisInit;
                const apiKey = el.dataset.apiKey;
                const theme = el.dataset.theme;
                const language = el.dataset.language;

                const sdk = new Scamnemesis({
                    apiKey,
                    theme: theme || 'light',
                    language: language || 'en',
                });

                switch (type) {
                    case 'search':
                        sdk.createSearchWidget(el);
                        break;
                    case 'report':
                        sdk.createReportWidget(el);
                        break;
                    case 'verify':
                        sdk.createVerifyWidget(el);
                        break;
                }
            });
        });
    }

    return Scamnemesis;
});
