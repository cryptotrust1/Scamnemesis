/**
 * Scamnemesis Frontend JavaScript
 *
 * @package Scamnemesis
 */

(function($) {
    'use strict';

    // Configuration from WordPress
    const config = window.scamnemesisConfig || {};

    /**
     * Search Form Handler
     */
    class ScamnemesisSearch {
        constructor(container) {
            this.container = $(container);
            this.form = this.container.find('.scamnemesis-search-form');
            this.input = this.container.find('.scamnemesis-search-input');
            this.button = this.container.find('.scamnemesis-search-button');
            this.buttonText = this.button.find('.scamnemesis-search-button-text');
            this.spinner = this.button.find('.scamnemesis-search-spinner');
            this.results = this.container.find('.scamnemesis-search-results');
            this.resultsList = this.container.find('.scamnemesis-results-list');
            this.resultsCount = this.container.find('.scamnemesis-results-count');
            this.pagination = this.container.find('.scamnemesis-results-pagination');
            this.errorContainer = this.container.find('.scamnemesis-search-error');

            this.type = this.container.data('type') || 'all';
            this.perPage = this.container.data('per-page') || 10;
            this.currentPage = 1;
            this.currentQuery = '';

            this.init();
        }

        init() {
            this.form.on('submit', (e) => this.handleSubmit(e));
            this.container.find('input[name="scamnemesis_type"]').on('change', (e) => {
                this.type = $(e.target).val();
            });
            this.container.find('.scamnemesis-results-close').on('click', () => this.hideResults());
        }

        async handleSubmit(e) {
            e.preventDefault();

            const query = this.input.val().trim();
            if (!query) return;

            this.currentQuery = query;
            this.currentPage = 1;
            await this.search();
        }

        async search() {
            this.setLoading(true);
            this.hideError();

            try {
                const response = await $.ajax({
                    url: config.restUrl + '/search',
                    method: 'GET',
                    data: {
                        q: this.currentQuery,
                        type: this.type,
                        page: this.currentPage,
                        per_page: this.perPage
                    },
                    headers: {
                        'X-WP-Nonce': config.nonce
                    }
                });

                this.renderResults(response);
            } catch (error) {
                this.showError(error.responseJSON?.message || config.i18n?.error || 'An error occurred');
            } finally {
                this.setLoading(false);
            }
        }

        renderResults(response) {
            const { data, total, pages } = response;

            if (!data || data.length === 0) {
                this.resultsList.html(`<div class="scamnemesis-no-results">${config.i18n?.noResults || 'No results found'}</div>`);
                this.resultsCount.text('');
                this.pagination.empty();
            } else {
                this.resultsCount.text(`${total} result${total !== 1 ? 's' : ''} found`);

                const html = data.map(item => this.renderResultItem(item)).join('');
                this.resultsList.html(html);

                this.renderPagination(pages);
            }

            this.results.show();
        }

        renderResultItem(item) {
            const riskClass = item.risk_level === 'high' ? 'danger' :
                             item.risk_level === 'medium' ? 'warning' : 'success';
            const riskLabel = item.risk_level === 'high' ? 'High Risk' :
                             item.risk_level === 'medium' ? 'Medium Risk' : 'Low Risk';

            return `
                <div class="scamnemesis-result-item">
                    <div class="scamnemesis-result-header">
                        <span class="scamnemesis-result-identifier">${this.escapeHtml(item.identifier)}</span>
                        <span class="scamnemesis-result-badge ${riskClass}">${riskLabel}</span>
                    </div>
                    <div class="scamnemesis-result-description">${this.escapeHtml(item.description?.substring(0, 150) || '')}...</div>
                    <div class="scamnemesis-result-meta">
                        <span>Type: ${this.escapeHtml(item.type || 'Unknown')}</span>
                        <span>Reports: ${item.report_count || 1}</span>
                        ${item.amount_lost ? `<span>Lost: $${Number(item.amount_lost).toLocaleString()}</span>` : ''}
                    </div>
                </div>
            `;
        }

        renderPagination(totalPages) {
            if (totalPages <= 1) {
                this.pagination.empty();
                return;
            }

            let html = '';

            // Previous button
            html += `<button class="scamnemesis-pagination-button" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    html += `<button class="scamnemesis-pagination-button ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    html += '<span class="scamnemesis-pagination-ellipsis">...</span>';
                }
            }

            // Next button
            html += `<button class="scamnemesis-pagination-button" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;

            this.pagination.html(html);

            // Bind click events
            this.pagination.find('.scamnemesis-pagination-button').on('click', async (e) => {
                const page = $(e.target).data('page');
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    await this.search();
                }
            });
        }

        setLoading(loading) {
            this.button.prop('disabled', loading);
            this.buttonText.toggle(!loading);
            this.spinner.toggle(loading);
        }

        showError(message) {
            this.errorContainer.text(message).show();
            this.results.hide();
        }

        hideError() {
            this.errorContainer.hide();
        }

        hideResults() {
            this.results.hide();
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    /**
     * Report Form Handler
     */
    class ScamnemesisReport {
        constructor(container) {
            this.container = $(container);
            this.form = this.container.find('.scamnemesis-report-form');
            this.button = this.form.find('.scamnemesis-submit-button');
            this.buttonText = this.button.find('.scamnemesis-button-text');
            this.spinner = this.button.find('.scamnemesis-button-spinner');
            this.message = this.container.find('.scamnemesis-form-message');
            this.successMessage = this.form.data('success-message');

            this.init();
        }

        init() {
            this.form.on('submit', (e) => this.handleSubmit(e));
        }

        async handleSubmit(e) {
            e.preventDefault();

            this.setLoading(true);
            this.hideMessage();

            const formData = this.getFormData();

            try {
                const response = await $.ajax({
                    url: config.restUrl + '/report',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(formData),
                    headers: {
                        'X-WP-Nonce': config.nonce
                    }
                });

                this.showSuccess(this.successMessage || response.message);
                this.form[0].reset();
            } catch (error) {
                this.showError(error.responseJSON?.message || config.i18n?.error || 'An error occurred');
            } finally {
                this.setLoading(false);
            }
        }

        getFormData() {
            const data = {};

            // Get form fields
            data.type = this.form.find('[name="type"]').val();
            data.identifier = this.form.find('[name="identifier"]').val();
            data.description = this.form.find('[name="description"]').val();
            data.scam_type = this.form.find('[name="scam_type"]').val();
            data.amount_lost = parseFloat(this.form.find('[name="amount_lost"]').val()) || null;
            data.currency = this.form.find('[name="currency"]').val();
            data.contact_email = this.form.find('[name="contact_email"]').val();
            data.anonymous = this.form.find('[name="anonymous"]').is(':checked');

            // Parse evidence URLs
            const evidenceText = this.form.find('[name="evidence_urls"]').val();
            if (evidenceText) {
                data.evidence_urls = evidenceText.split('\n').map(url => url.trim()).filter(url => url);
            }

            return data;
        }

        setLoading(loading) {
            this.button.prop('disabled', loading);
            this.buttonText.toggle(!loading);
            this.spinner.toggle(loading);
        }

        showSuccess(message) {
            this.message.removeClass('error').addClass('success').text(message).show();
        }

        showError(message) {
            this.message.removeClass('success').addClass('error').text(message).show();
        }

        hideMessage() {
            this.message.hide();
        }
    }

    /**
     * Verify Widget Handler
     */
    class ScamnemesisVerify {
        constructor(container) {
            this.container = $(container);
            this.form = this.container.find('.scamnemesis-verify-form');
            this.input = this.container.find('.scamnemesis-verify-input');
            this.button = this.container.find('.scamnemesis-verify-button');
            this.result = this.container.find('.scamnemesis-verify-result');

            this.init();
        }

        init() {
            this.form.on('submit', (e) => this.handleSubmit(e));
        }

        async handleSubmit(e) {
            e.preventDefault();

            const identifier = this.input.val().trim();
            if (!identifier) return;

            this.button.prop('disabled', true);
            this.result.hide();

            try {
                const response = await $.ajax({
                    url: config.restUrl + '/verify',
                    method: 'GET',
                    data: { identifier },
                    headers: {
                        'X-WP-Nonce': config.nonce
                    }
                });

                this.showResult(response);
            } catch (error) {
                this.result
                    .removeClass('safe reported')
                    .addClass('error')
                    .html(`<strong>Error:</strong> ${error.responseJSON?.message || 'Unable to verify'}`)
                    .show();
            } finally {
                this.button.prop('disabled', false);
            }
        }

        showResult(response) {
            const isReported = response.is_reported;
            const reportCount = response.report_count || 0;

            if (isReported) {
                this.result
                    .removeClass('safe')
                    .addClass('reported')
                    .html(`
                        <strong>⚠️ Warning:</strong> This identifier has been reported ${reportCount} time${reportCount !== 1 ? 's' : ''}.
                        <br><small>Last reported: ${response.last_reported || 'Unknown'}</small>
                    `)
                    .show();
            } else {
                this.result
                    .removeClass('reported')
                    .addClass('safe')
                    .html(`<strong>✓ Not Found:</strong> No reports found for this identifier.`)
                    .show();
            }
        }
    }

    /**
     * Initialize all components
     */
    $(document).ready(function() {
        // Initialize search widgets
        $('.scamnemesis-search-container').each(function() {
            new ScamnemesisSearch(this);
        });

        // Initialize report forms
        $('.scamnemesis-report-container').each(function() {
            new ScamnemesisReport(this);
        });

        // Initialize verify widgets
        $('.scamnemesis-verify-container').each(function() {
            new ScamnemesisVerify(this);
        });
    });

})(jQuery);
