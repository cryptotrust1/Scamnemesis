<?php
/**
 * Scamnemesis Shortcodes
 *
 * Registers and handles all plugin shortcodes
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcodes Class
 */
class Scamnemesis_Shortcodes {

    /**
     * Constructor
     */
    public function __construct() {
        $this->register_shortcodes();
    }

    /**
     * Register all shortcodes
     */
    private function register_shortcodes(): void {
        add_shortcode('scamnemesis_search', [$this, 'search_shortcode']);
        add_shortcode('scamnemesis_report', [$this, 'report_shortcode']);
        add_shortcode('scamnemesis_widget', [$this, 'widget_shortcode']);
        add_shortcode('scamnemesis_verify', [$this, 'verify_shortcode']);
        add_shortcode('scamnemesis_stats', [$this, 'stats_shortcode']);
        add_shortcode('scamnemesis_recent', [$this, 'recent_shortcode']);
    }

    /**
     * Search form shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function search_shortcode(array $atts = []): string {
        $atts = shortcode_atts([
            'placeholder' => __('Enter email, phone, wallet address, or domain...', 'scamnemesis'),
            'button_text' => __('Search', 'scamnemesis'),
            'type' => 'all',
            'show_filters' => 'true',
            'results_per_page' => 10,
            'class' => '',
        ], $atts, 'scamnemesis_search');

        $show_filters = filter_var($atts['show_filters'], FILTER_VALIDATE_BOOLEAN);
        $class = sanitize_html_class($atts['class']);

        ob_start();
        ?>
        <div class="scamnemesis-search-container <?php echo esc_attr($class); ?>" data-type="<?php echo esc_attr($atts['type']); ?>" data-per-page="<?php echo esc_attr($atts['results_per_page']); ?>">
            <form class="scamnemesis-search-form" role="search">
                <div class="scamnemesis-search-input-wrapper">
                    <input
                        type="text"
                        class="scamnemesis-search-input"
                        placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
                        aria-label="<?php esc_attr_e('Search for scam reports', 'scamnemesis'); ?>"
                        required
                    >
                    <button type="submit" class="scamnemesis-search-button">
                        <span class="scamnemesis-search-button-text"><?php echo esc_html($atts['button_text']); ?></span>
                        <span class="scamnemesis-search-spinner" style="display: none;">
                            <svg class="scamnemesis-spinner" viewBox="0 0 24 24" width="20" height="20">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                                    <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        </span>
                    </button>
                </div>

                <?php if ($show_filters): ?>
                <div class="scamnemesis-search-filters">
                    <label class="scamnemesis-filter-label">
                        <input type="radio" name="scamnemesis_type" value="all" checked>
                        <?php esc_html_e('All', 'scamnemesis'); ?>
                    </label>
                    <label class="scamnemesis-filter-label">
                        <input type="radio" name="scamnemesis_type" value="email">
                        <?php esc_html_e('Email', 'scamnemesis'); ?>
                    </label>
                    <label class="scamnemesis-filter-label">
                        <input type="radio" name="scamnemesis_type" value="phone">
                        <?php esc_html_e('Phone', 'scamnemesis'); ?>
                    </label>
                    <label class="scamnemesis-filter-label">
                        <input type="radio" name="scamnemesis_type" value="wallet">
                        <?php esc_html_e('Crypto Wallet', 'scamnemesis'); ?>
                    </label>
                    <label class="scamnemesis-filter-label">
                        <input type="radio" name="scamnemesis_type" value="domain">
                        <?php esc_html_e('Domain', 'scamnemesis'); ?>
                    </label>
                </div>
                <?php endif; ?>
            </form>

            <div class="scamnemesis-search-results" style="display: none;">
                <div class="scamnemesis-results-header">
                    <span class="scamnemesis-results-count"></span>
                    <button type="button" class="scamnemesis-results-close">&times;</button>
                </div>
                <div class="scamnemesis-results-list"></div>
                <div class="scamnemesis-results-pagination"></div>
            </div>

            <div class="scamnemesis-search-error" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Report form shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function report_shortcode(array $atts = []): string {
        if (!get_option('scamnemesis_enable_report', true)) {
            return '';
        }

        $atts = shortcode_atts([
            'title' => __('Report a Scam', 'scamnemesis'),
            'show_title' => 'true',
            'success_message' => __('Thank you for your report. It will be reviewed by our team.', 'scamnemesis'),
            'class' => '',
        ], $atts, 'scamnemesis_report');

        $show_title = filter_var($atts['show_title'], FILTER_VALIDATE_BOOLEAN);
        $class = sanitize_html_class($atts['class']);

        ob_start();
        ?>
        <div class="scamnemesis-report-container <?php echo esc_attr($class); ?>">
            <?php if ($show_title): ?>
            <h3 class="scamnemesis-report-title"><?php echo esc_html($atts['title']); ?></h3>
            <?php endif; ?>

            <form class="scamnemesis-report-form" data-success-message="<?php echo esc_attr($atts['success_message']); ?>">
                <?php wp_nonce_field('scamnemesis_report', 'scamnemesis_nonce'); ?>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_type"><?php esc_html_e('Type of Identifier', 'scamnemesis'); ?> <span class="required">*</span></label>
                    <select id="scamnemesis_type" name="type" required>
                        <option value=""><?php esc_html_e('Select type...', 'scamnemesis'); ?></option>
                        <option value="email"><?php esc_html_e('Email Address', 'scamnemesis'); ?></option>
                        <option value="phone"><?php esc_html_e('Phone Number', 'scamnemesis'); ?></option>
                        <option value="wallet"><?php esc_html_e('Crypto Wallet', 'scamnemesis'); ?></option>
                        <option value="domain"><?php esc_html_e('Website/Domain', 'scamnemesis'); ?></option>
                        <option value="social"><?php esc_html_e('Social Media Profile', 'scamnemesis'); ?></option>
                        <option value="bank"><?php esc_html_e('Bank Account', 'scamnemesis'); ?></option>
                        <option value="other"><?php esc_html_e('Other', 'scamnemesis'); ?></option>
                    </select>
                </div>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_identifier"><?php esc_html_e('Identifier', 'scamnemesis'); ?> <span class="required">*</span></label>
                    <input type="text" id="scamnemesis_identifier" name="identifier" required placeholder="<?php esc_attr_e('e.g., scammer@email.com, +1234567890, 0x...', 'scamnemesis'); ?>">
                    <span class="scamnemesis-field-hint"><?php esc_html_e('Enter the email, phone, wallet address, or other identifier of the scammer', 'scamnemesis'); ?></span>
                </div>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_scam_type"><?php esc_html_e('Type of Scam', 'scamnemesis'); ?></label>
                    <select id="scamnemesis_scam_type" name="scam_type">
                        <option value=""><?php esc_html_e('Select scam type...', 'scamnemesis'); ?></option>
                        <option value="phishing"><?php esc_html_e('Phishing', 'scamnemesis'); ?></option>
                        <option value="investment"><?php esc_html_e('Investment Fraud', 'scamnemesis'); ?></option>
                        <option value="romance"><?php esc_html_e('Romance Scam', 'scamnemesis'); ?></option>
                        <option value="shopping"><?php esc_html_e('Online Shopping Fraud', 'scamnemesis'); ?></option>
                        <option value="impersonation"><?php esc_html_e('Impersonation', 'scamnemesis'); ?></option>
                        <option value="tech_support"><?php esc_html_e('Tech Support Scam', 'scamnemesis'); ?></option>
                        <option value="lottery"><?php esc_html_e('Lottery/Prize Scam', 'scamnemesis'); ?></option>
                        <option value="crypto"><?php esc_html_e('Cryptocurrency Scam', 'scamnemesis'); ?></option>
                        <option value="employment"><?php esc_html_e('Employment Scam', 'scamnemesis'); ?></option>
                        <option value="other"><?php esc_html_e('Other', 'scamnemesis'); ?></option>
                    </select>
                </div>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_description"><?php esc_html_e('Description', 'scamnemesis'); ?> <span class="required">*</span></label>
                    <textarea id="scamnemesis_description" name="description" rows="5" required placeholder="<?php esc_attr_e('Please describe the scam in detail. Include dates, methods used, and any relevant information...', 'scamnemesis'); ?>"></textarea>
                </div>

                <div class="scamnemesis-form-row">
                    <div class="scamnemesis-form-group scamnemesis-form-half">
                        <label for="scamnemesis_amount"><?php esc_html_e('Amount Lost', 'scamnemesis'); ?></label>
                        <input type="number" id="scamnemesis_amount" name="amount_lost" step="0.01" min="0" placeholder="0.00">
                    </div>
                    <div class="scamnemesis-form-group scamnemesis-form-half">
                        <label for="scamnemesis_currency"><?php esc_html_e('Currency', 'scamnemesis'); ?></label>
                        <select id="scamnemesis_currency" name="currency">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="USDT">USDT</option>
                        </select>
                    </div>
                </div>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_evidence"><?php esc_html_e('Evidence URLs', 'scamnemesis'); ?></label>
                    <textarea id="scamnemesis_evidence" name="evidence_urls" rows="3" placeholder="<?php esc_attr_e('Enter URLs to screenshots or evidence (one per line)', 'scamnemesis'); ?>"></textarea>
                    <span class="scamnemesis-field-hint"><?php esc_html_e('Links to screenshots, archived pages, or other evidence', 'scamnemesis'); ?></span>
                </div>

                <div class="scamnemesis-form-group">
                    <label for="scamnemesis_contact"><?php esc_html_e('Your Email (optional)', 'scamnemesis'); ?></label>
                    <input type="email" id="scamnemesis_contact" name="contact_email" placeholder="<?php esc_attr_e('For follow-up questions only', 'scamnemesis'); ?>">
                </div>

                <div class="scamnemesis-form-group">
                    <label class="scamnemesis-checkbox-label">
                        <input type="checkbox" name="anonymous" value="1">
                        <?php esc_html_e('Submit anonymously', 'scamnemesis'); ?>
                    </label>
                </div>

                <div class="scamnemesis-form-group">
                    <label class="scamnemesis-checkbox-label">
                        <input type="checkbox" name="terms" required>
                        <?php
                        printf(
                            esc_html__('I confirm this report is truthful and I agree to the %s', 'scamnemesis'),
                            '<a href="https://scamnemesis.com/terms" target="_blank" rel="noopener">' . esc_html__('Terms of Service', 'scamnemesis') . '</a>'
                        );
                        ?>
                    </label>
                </div>

                <div class="scamnemesis-form-actions">
                    <button type="submit" class="scamnemesis-submit-button">
                        <span class="scamnemesis-button-text"><?php esc_html_e('Submit Report', 'scamnemesis'); ?></span>
                        <span class="scamnemesis-button-spinner" style="display: none;">
                            <svg class="scamnemesis-spinner" viewBox="0 0 24 24" width="20" height="20">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                                    <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        </span>
                    </button>
                </div>

                <div class="scamnemesis-form-message" style="display: none;"></div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Embedded widget shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function widget_shortcode(array $atts = []): string {
        $atts = shortcode_atts([
            'type' => 'search', // search, report, combo
            'theme' => 'light', // light, dark, auto
            'width' => '100%',
            'height' => 'auto',
            'class' => '',
        ], $atts, 'scamnemesis_widget');

        $widget_key = get_option('scamnemesis_widget_key', '');
        $api_url = get_option('scamnemesis_api_url', 'https://api.scamnemesis.com');

        if (empty($widget_key)) {
            return '<p class="scamnemesis-error">' . esc_html__('Widget key not configured.', 'scamnemesis') . '</p>';
        }

        $class = sanitize_html_class($atts['class']);
        $style = sprintf('width: %s; height: %s;', esc_attr($atts['width']), esc_attr($atts['height']));

        ob_start();
        ?>
        <div class="scamnemesis-widget-container <?php echo esc_attr($class); ?>" style="<?php echo esc_attr($style); ?>">
            <iframe
                src="<?php echo esc_url($api_url . '/widget/' . $atts['type'] . '?key=' . $widget_key . '&theme=' . $atts['theme']); ?>"
                class="scamnemesis-widget-iframe"
                frameborder="0"
                allowtransparency="true"
                loading="lazy"
                title="<?php esc_attr_e('Scamnemesis Widget', 'scamnemesis'); ?>"
            ></iframe>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Quick verify shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function verify_shortcode(array $atts = []): string {
        $atts = shortcode_atts([
            'placeholder' => __('Enter identifier to verify...', 'scamnemesis'),
            'button_text' => __('Verify', 'scamnemesis'),
            'class' => '',
        ], $atts, 'scamnemesis_verify');

        $class = sanitize_html_class($atts['class']);

        ob_start();
        ?>
        <div class="scamnemesis-verify-container <?php echo esc_attr($class); ?>">
            <form class="scamnemesis-verify-form">
                <div class="scamnemesis-verify-input-wrapper">
                    <input
                        type="text"
                        class="scamnemesis-verify-input"
                        placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
                        required
                    >
                    <button type="submit" class="scamnemesis-verify-button">
                        <?php echo esc_html($atts['button_text']); ?>
                    </button>
                </div>
            </form>
            <div class="scamnemesis-verify-result" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Statistics shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function stats_shortcode(array $atts = []): string {
        $atts = shortcode_atts([
            'show' => 'all', // all, reports, amount, users
            'layout' => 'grid', // grid, inline
            'class' => '',
        ], $atts, 'scamnemesis_stats');

        $api = scamnemesis()->get_api();
        $stats = $api->get_stats();

        if (is_wp_error($stats)) {
            return '';
        }

        $class = sanitize_html_class($atts['class']);
        $layout_class = 'scamnemesis-stats-' . sanitize_html_class($atts['layout']);

        ob_start();
        ?>
        <div class="scamnemesis-stats-container <?php echo esc_attr($class . ' ' . $layout_class); ?>">
            <?php if (in_array($atts['show'], ['all', 'reports'])): ?>
            <div class="scamnemesis-stat-item">
                <span class="scamnemesis-stat-value"><?php echo esc_html(number_format_i18n($stats['total_reports'] ?? 0)); ?></span>
                <span class="scamnemesis-stat-label"><?php esc_html_e('Reports Filed', 'scamnemesis'); ?></span>
            </div>
            <?php endif; ?>

            <?php if (in_array($atts['show'], ['all', 'amount'])): ?>
            <div class="scamnemesis-stat-item">
                <span class="scamnemesis-stat-value">$<?php echo esc_html(number_format_i18n($stats['total_amount_lost'] ?? 0)); ?></span>
                <span class="scamnemesis-stat-label"><?php esc_html_e('Total Reported Losses', 'scamnemesis'); ?></span>
            </div>
            <?php endif; ?>

            <?php if (in_array($atts['show'], ['all', 'users'])): ?>
            <div class="scamnemesis-stat-item">
                <span class="scamnemesis-stat-value"><?php echo esc_html(number_format_i18n($stats['users_protected'] ?? 0)); ?></span>
                <span class="scamnemesis-stat-label"><?php esc_html_e('Users Protected', 'scamnemesis'); ?></span>
            </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Recent reports shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function recent_shortcode(array $atts = []): string {
        $atts = shortcode_atts([
            'limit' => 5,
            'show_date' => 'true',
            'show_type' => 'true',
            'class' => '',
        ], $atts, 'scamnemesis_recent');

        $api = scamnemesis()->get_api();
        $reports = $api->get_recent_reports((int) $atts['limit']);

        if (is_wp_error($reports) || empty($reports['data'])) {
            return '';
        }

        $show_date = filter_var($atts['show_date'], FILTER_VALIDATE_BOOLEAN);
        $show_type = filter_var($atts['show_type'], FILTER_VALIDATE_BOOLEAN);
        $class = sanitize_html_class($atts['class']);

        ob_start();
        ?>
        <div class="scamnemesis-recent-container <?php echo esc_attr($class); ?>">
            <ul class="scamnemesis-recent-list">
                <?php foreach ($reports['data'] as $report): ?>
                <li class="scamnemesis-recent-item">
                    <span class="scamnemesis-recent-identifier"><?php echo esc_html($this->mask_identifier($report['identifier'])); ?></span>
                    <?php if ($show_type && !empty($report['scam_type'])): ?>
                    <span class="scamnemesis-recent-type"><?php echo esc_html($report['scam_type']); ?></span>
                    <?php endif; ?>
                    <?php if ($show_date && !empty($report['created_at'])): ?>
                    <span class="scamnemesis-recent-date"><?php echo esc_html(human_time_diff(strtotime($report['created_at']))); ?> <?php esc_html_e('ago', 'scamnemesis'); ?></span>
                    <?php endif; ?>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Mask identifier for privacy
     *
     * @param string $identifier
     * @return string
     */
    private function mask_identifier(string $identifier): string {
        $length = strlen($identifier);

        if ($length <= 4) {
            return str_repeat('*', $length);
        }

        $visible = min(4, (int) floor($length / 3));
        $masked = $length - ($visible * 2);

        return substr($identifier, 0, $visible) . str_repeat('*', $masked) . substr($identifier, -$visible);
    }
}
