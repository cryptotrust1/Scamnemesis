<?php
/**
 * Scamnemesis Admin
 *
 * Admin functionality for the plugin
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Class
 */
class Scamnemesis_Admin {

    /**
     * Constructor
     */
    public function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks(): void {
        add_action('admin_menu', [$this, 'add_menu_pages']);
        add_action('admin_notices', [$this, 'admin_notices']);
        add_filter('plugin_action_links_' . SCAMNEMESIS_PLUGIN_BASENAME, [$this, 'plugin_action_links']);
        add_action('wp_ajax_scamnemesis_test_connection', [$this, 'ajax_test_connection']);
        add_action('wp_ajax_scamnemesis_clear_cache', [$this, 'ajax_clear_cache']);
    }

    /**
     * Add admin menu pages
     */
    public function add_menu_pages(): void {
        // Main menu
        add_menu_page(
            __('Scamnemesis', 'scamnemesis'),
            __('Scamnemesis', 'scamnemesis'),
            'manage_options',
            'scamnemesis',
            [$this, 'render_dashboard_page'],
            'dashicons-shield',
            30
        );

        // Dashboard submenu
        add_submenu_page(
            'scamnemesis',
            __('Dashboard', 'scamnemesis'),
            __('Dashboard', 'scamnemesis'),
            'manage_options',
            'scamnemesis',
            [$this, 'render_dashboard_page']
        );

        // Settings submenu
        add_submenu_page(
            'scamnemesis',
            __('Settings', 'scamnemesis'),
            __('Settings', 'scamnemesis'),
            'manage_options',
            'scamnemesis-settings',
            [$this, 'render_settings_page']
        );

        // Shortcodes reference
        add_submenu_page(
            'scamnemesis',
            __('Shortcodes', 'scamnemesis'),
            __('Shortcodes', 'scamnemesis'),
            'manage_options',
            'scamnemesis-shortcodes',
            [$this, 'render_shortcodes_page']
        );
    }

    /**
     * Render dashboard page
     */
    public function render_dashboard_page(): void {
        $api = scamnemesis()->get_api();
        $stats = $api->get_stats();
        $connection_status = $api->test_connection();
        ?>
        <div class="wrap scamnemesis-admin-wrap">
            <h1><?php esc_html_e('Scamnemesis Dashboard', 'scamnemesis'); ?></h1>

            <div class="scamnemesis-dashboard-grid">
                <!-- Connection Status -->
                <div class="scamnemesis-card">
                    <h2><?php esc_html_e('API Connection', 'scamnemesis'); ?></h2>
                    <?php if (is_wp_error($connection_status)): ?>
                        <div class="scamnemesis-status scamnemesis-status-error">
                            <span class="dashicons dashicons-warning"></span>
                            <?php esc_html_e('Connection Failed', 'scamnemesis'); ?>
                        </div>
                        <p class="description"><?php echo esc_html($connection_status->get_error_message()); ?></p>
                    <?php else: ?>
                        <div class="scamnemesis-status scamnemesis-status-success">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <?php esc_html_e('Connected', 'scamnemesis'); ?>
                        </div>
                    <?php endif; ?>
                    <p>
                        <button type="button" class="button" id="scamnemesis-test-connection">
                            <?php esc_html_e('Test Connection', 'scamnemesis'); ?>
                        </button>
                    </p>
                </div>

                <!-- Statistics -->
                <?php if (!is_wp_error($stats)): ?>
                <div class="scamnemesis-card">
                    <h2><?php esc_html_e('Global Statistics', 'scamnemesis'); ?></h2>
                    <div class="scamnemesis-stats-grid">
                        <div class="scamnemesis-stat">
                            <span class="scamnemesis-stat-number"><?php echo esc_html(number_format_i18n($stats['total_reports'] ?? 0)); ?></span>
                            <span class="scamnemesis-stat-label"><?php esc_html_e('Total Reports', 'scamnemesis'); ?></span>
                        </div>
                        <div class="scamnemesis-stat">
                            <span class="scamnemesis-stat-number">$<?php echo esc_html(number_format_i18n($stats['total_amount_lost'] ?? 0)); ?></span>
                            <span class="scamnemesis-stat-label"><?php esc_html_e('Amount Reported', 'scamnemesis'); ?></span>
                        </div>
                        <div class="scamnemesis-stat">
                            <span class="scamnemesis-stat-number"><?php echo esc_html(number_format_i18n($stats['users_protected'] ?? 0)); ?></span>
                            <span class="scamnemesis-stat-label"><?php esc_html_e('Users Protected', 'scamnemesis'); ?></span>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Quick Actions -->
                <div class="scamnemesis-card">
                    <h2><?php esc_html_e('Quick Actions', 'scamnemesis'); ?></h2>
                    <p>
                        <a href="<?php echo esc_url(admin_url('admin.php?page=scamnemesis-settings')); ?>" class="button button-primary">
                            <?php esc_html_e('Configure Settings', 'scamnemesis'); ?>
                        </a>
                    </p>
                    <p>
                        <button type="button" class="button" id="scamnemesis-clear-cache">
                            <?php esc_html_e('Clear Cache', 'scamnemesis'); ?>
                        </button>
                    </p>
                    <p>
                        <a href="<?php echo esc_url(admin_url('admin.php?page=scamnemesis-shortcodes')); ?>" class="button">
                            <?php esc_html_e('View Shortcodes', 'scamnemesis'); ?>
                        </a>
                    </p>
                </div>

                <!-- Help -->
                <div class="scamnemesis-card">
                    <h2><?php esc_html_e('Need Help?', 'scamnemesis'); ?></h2>
                    <p><?php esc_html_e('Visit our documentation for detailed setup instructions and usage guides.', 'scamnemesis'); ?></p>
                    <p>
                        <a href="https://scamnemesis.com/docs/wordpress" target="_blank" rel="noopener" class="button">
                            <?php esc_html_e('Documentation', 'scamnemesis'); ?>
                            <span class="dashicons dashicons-external"></span>
                        </a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render settings page
     */
    public function render_settings_page(): void {
        // Settings class handles rendering
        $settings = new Scamnemesis_Settings();
        $settings->render_page();
    }

    /**
     * Render shortcodes reference page
     */
    public function render_shortcodes_page(): void {
        ?>
        <div class="wrap scamnemesis-admin-wrap">
            <h1><?php esc_html_e('Shortcodes Reference', 'scamnemesis'); ?></h1>

            <div class="scamnemesis-shortcodes-list">
                <!-- Search Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_search]</code></h2>
                    <p><?php esc_html_e('Displays a search form to look up fraud reports.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Parameters:', 'scamnemesis'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Parameter', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Default', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Description', 'scamnemesis'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>placeholder</code></td>
                                <td><?php esc_html_e('Enter email, phone...', 'scamnemesis'); ?></td>
                                <td><?php esc_html_e('Search input placeholder text', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>button_text</code></td>
                                <td>Search</td>
                                <td><?php esc_html_e('Search button text', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>type</code></td>
                                <td>all</td>
                                <td><?php esc_html_e('Default search type: all, email, phone, wallet, domain', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>show_filters</code></td>
                                <td>true</td>
                                <td><?php esc_html_e('Show type filter buttons', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>results_per_page</code></td>
                                <td>10</td>
                                <td><?php esc_html_e('Number of results per page', 'scamnemesis'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_search show_filters="true" results_per_page="5"]</code>
                </div>

                <!-- Report Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_report]</code></h2>
                    <p><?php esc_html_e('Displays a form to submit fraud reports.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Parameters:', 'scamnemesis'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Parameter', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Default', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Description', 'scamnemesis'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>title</code></td>
                                <td>Report a Scam</td>
                                <td><?php esc_html_e('Form title', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>show_title</code></td>
                                <td>true</td>
                                <td><?php esc_html_e('Show/hide the title', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>success_message</code></td>
                                <td>Thank you...</td>
                                <td><?php esc_html_e('Message shown after successful submission', 'scamnemesis'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_report title="Report Fraud" show_title="true"]</code>
                </div>

                <!-- Verify Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_verify]</code></h2>
                    <p><?php esc_html_e('Quick verification widget to check if an identifier is reported.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_verify placeholder="Enter email or phone to verify"]</code>
                </div>

                <!-- Stats Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_stats]</code></h2>
                    <p><?php esc_html_e('Displays fraud statistics.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Parameters:', 'scamnemesis'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Parameter', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Default', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Description', 'scamnemesis'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>show</code></td>
                                <td>all</td>
                                <td><?php esc_html_e('Which stats to show: all, reports, amount, users', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>layout</code></td>
                                <td>grid</td>
                                <td><?php esc_html_e('Layout style: grid, inline', 'scamnemesis'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_stats show="all" layout="grid"]</code>
                </div>

                <!-- Recent Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_recent]</code></h2>
                    <p><?php esc_html_e('Displays recent fraud reports.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Parameters:', 'scamnemesis'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Parameter', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Default', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Description', 'scamnemesis'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>limit</code></td>
                                <td>5</td>
                                <td><?php esc_html_e('Number of reports to show', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>show_date</code></td>
                                <td>true</td>
                                <td><?php esc_html_e('Show report dates', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>show_type</code></td>
                                <td>true</td>
                                <td><?php esc_html_e('Show scam types', 'scamnemesis'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_recent limit="10" show_date="true"]</code>
                </div>

                <!-- Widget Shortcode -->
                <div class="scamnemesis-card">
                    <h2><code>[scamnemesis_widget]</code></h2>
                    <p><?php esc_html_e('Embeds the hosted Scamnemesis widget.', 'scamnemesis'); ?></p>
                    <h4><?php esc_html_e('Parameters:', 'scamnemesis'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Parameter', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Default', 'scamnemesis'); ?></th>
                                <th><?php esc_html_e('Description', 'scamnemesis'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>type</code></td>
                                <td>search</td>
                                <td><?php esc_html_e('Widget type: search, report, combo', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>theme</code></td>
                                <td>light</td>
                                <td><?php esc_html_e('Color theme: light, dark, auto', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>width</code></td>
                                <td>100%</td>
                                <td><?php esc_html_e('Widget width', 'scamnemesis'); ?></td>
                            </tr>
                            <tr>
                                <td><code>height</code></td>
                                <td>auto</td>
                                <td><?php esc_html_e('Widget height', 'scamnemesis'); ?></td>
                            </tr>
                        </tbody>
                    </table>
                    <h4><?php esc_html_e('Example:', 'scamnemesis'); ?></h4>
                    <code>[scamnemesis_widget type="combo" theme="auto"]</code>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Display admin notices
     */
    public function admin_notices(): void {
        // Check for missing API key
        $api_key = get_option('scamnemesis_api_key', '');
        $screen = get_current_screen();

        if (empty($api_key) && $screen && strpos($screen->id, 'scamnemesis') !== false) {
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong><?php esc_html_e('Scamnemesis:', 'scamnemesis'); ?></strong>
                    <?php
                    printf(
                        esc_html__('API key is not configured. %sSet up your API key%s to enable full functionality.', 'scamnemesis'),
                        '<a href="' . esc_url(admin_url('admin.php?page=scamnemesis-settings')) . '">',
                        '</a>'
                    );
                    ?>
                </p>
            </div>
            <?php
        }
    }

    /**
     * Add plugin action links
     *
     * @param array $links
     * @return array
     */
    public function plugin_action_links(array $links): array {
        $settings_link = '<a href="' . esc_url(admin_url('admin.php?page=scamnemesis-settings')) . '">' . __('Settings', 'scamnemesis') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * AJAX: Test API connection
     */
    public function ajax_test_connection(): void {
        check_ajax_referer('scamnemesis_admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'scamnemesis')]);
        }

        $api = scamnemesis()->get_api();
        $result = $api->test_connection();

        if (is_wp_error($result)) {
            wp_send_json_error(['message' => $result->get_error_message()]);
        }

        wp_send_json_success(['message' => __('Connection successful!', 'scamnemesis')]);
    }

    /**
     * AJAX: Clear cache
     */
    public function ajax_clear_cache(): void {
        check_ajax_referer('scamnemesis_admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'scamnemesis')]);
        }

        $api = scamnemesis()->get_api();
        $api->clear_cache();

        wp_send_json_success(['message' => __('Cache cleared successfully!', 'scamnemesis')]);
    }
}
