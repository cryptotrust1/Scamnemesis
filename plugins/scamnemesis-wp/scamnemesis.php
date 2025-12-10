<?php
/**
 * Plugin Name: Scamnemesis
 * Plugin URI: https://scamnemesis.com
 * Description: Fraud report and search integration for WordPress. Search for scammers, report fraud, and protect your community.
 * Version: 1.0.0
 * Author: Scamnemesis Team
 * Author URI: https://scamnemesis.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: scamnemesis
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('SCAMNEMESIS_VERSION', '1.0.0');
define('SCAMNEMESIS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SCAMNEMESIS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SCAMNEMESIS_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Scamnemesis Plugin Class
 */
final class Scamnemesis {

    /**
     * Single instance of the class
     */
    private static ?Scamnemesis $instance = null;

    /**
     * API client instance
     */
    public ?Scamnemesis_API_Client $api = null;

    /**
     * Get single instance
     */
    public static function instance(): Scamnemesis {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Include required files
     */
    private function includes(): void {
        // Core classes
        require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/class-api-client.php';
        require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/class-shortcodes.php';
        require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/class-widgets.php';

        // Admin
        if (is_admin()) {
            require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/admin/class-admin.php';
            require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/admin/class-settings.php';
        }

        // REST API
        require_once SCAMNEMESIS_PLUGIN_DIR . 'includes/class-rest-api.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks(): void {
        // Activation/Deactivation
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // Initialize plugin
        add_action('plugins_loaded', [$this, 'init']);

        // Load translations
        add_action('init', [$this, 'load_textdomain']);

        // Enqueue assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);

        // Register Gutenberg blocks
        add_action('init', [$this, 'register_blocks']);
    }

    /**
     * Plugin activation
     */
    public function activate(): void {
        // Set default options
        $defaults = [
            'api_url' => 'https://api.scamnemesis.com',
            'api_key' => '',
            'widget_key' => '',
            'primary_color' => '#2563eb',
            'enable_search' => true,
            'enable_report' => true,
            'default_language' => 'en',
            'cache_duration' => 300,
        ];

        foreach ($defaults as $key => $value) {
            if (get_option('scamnemesis_' . $key) === false) {
                add_option('scamnemesis_' . $key, $value);
            }
        }

        // Create custom tables if needed
        $this->create_tables();

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate(): void {
        // Clear scheduled events
        wp_clear_scheduled_hook('scamnemesis_cache_cleanup');

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create custom database tables
     */
    private function create_tables(): void {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'scamnemesis_cache';

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            cache_key varchar(255) NOT NULL,
            cache_value longtext NOT NULL,
            expiration datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY cache_key (cache_key),
            KEY expiration (expiration)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Initialize plugin
     */
    public function init(): void {
        // Initialize API client
        $this->api = new Scamnemesis_API_Client();

        // Initialize shortcodes
        new Scamnemesis_Shortcodes();

        // Initialize widgets
        new Scamnemesis_Widgets();

        // Initialize REST API
        new Scamnemesis_REST_API();

        // Admin initialization
        if (is_admin()) {
            new Scamnemesis_Admin();
        }
    }

    /**
     * Load plugin translations
     */
    public function load_textdomain(): void {
        load_plugin_textdomain(
            'scamnemesis',
            false,
            dirname(SCAMNEMESIS_PLUGIN_BASENAME) . '/languages'
        );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets(): void {
        // Only load on pages with shortcodes or blocks
        global $post;

        if (!is_a($post, 'WP_Post')) {
            return;
        }

        $has_shortcode = has_shortcode($post->post_content, 'scamnemesis_search') ||
                         has_shortcode($post->post_content, 'scamnemesis_report') ||
                         has_shortcode($post->post_content, 'scamnemesis_widget');

        $has_block = has_block('scamnemesis/search', $post) ||
                     has_block('scamnemesis/report', $post);

        if ($has_shortcode || $has_block) {
            wp_enqueue_style(
                'scamnemesis-frontend',
                SCAMNEMESIS_PLUGIN_URL . 'assets/css/frontend.css',
                [],
                SCAMNEMESIS_VERSION
            );

            wp_enqueue_script(
                'scamnemesis-frontend',
                SCAMNEMESIS_PLUGIN_URL . 'assets/js/frontend.js',
                ['jquery'],
                SCAMNEMESIS_VERSION,
                true
            );

            // Localize script
            wp_localize_script('scamnemesis-frontend', 'scamnemesisConfig', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('scamnemesis/v1'),
                'nonce' => wp_create_nonce('scamnemesis_nonce'),
                'apiUrl' => get_option('scamnemesis_api_url'),
                'widgetKey' => get_option('scamnemesis_widget_key'),
                'primaryColor' => get_option('scamnemesis_primary_color'),
                'language' => get_option('scamnemesis_default_language'),
                'i18n' => [
                    'search' => __('Search', 'scamnemesis'),
                    'searching' => __('Searching...', 'scamnemesis'),
                    'noResults' => __('No results found', 'scamnemesis'),
                    'error' => __('An error occurred', 'scamnemesis'),
                    'submit' => __('Submit Report', 'scamnemesis'),
                    'submitting' => __('Submitting...', 'scamnemesis'),
                    'success' => __('Report submitted successfully', 'scamnemesis'),
                ],
            ]);
        }
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets(string $hook): void {
        // Only on plugin pages
        if (strpos($hook, 'scamnemesis') === false) {
            return;
        }

        wp_enqueue_style(
            'scamnemesis-admin',
            SCAMNEMESIS_PLUGIN_URL . 'assets/css/admin.css',
            [],
            SCAMNEMESIS_VERSION
        );

        wp_enqueue_script(
            'scamnemesis-admin',
            SCAMNEMESIS_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery', 'wp-color-picker'],
            SCAMNEMESIS_VERSION,
            true
        );

        wp_enqueue_style('wp-color-picker');
    }

    /**
     * Register Gutenberg blocks
     */
    public function register_blocks(): void {
        // Check if Gutenberg is available
        if (!function_exists('register_block_type')) {
            return;
        }

        // Register search block
        register_block_type(SCAMNEMESIS_PLUGIN_DIR . 'blocks/search');

        // Register report block
        register_block_type(SCAMNEMESIS_PLUGIN_DIR . 'blocks/report');
    }

    /**
     * Get API client
     */
    public function get_api(): Scamnemesis_API_Client {
        return $this->api;
    }
}

/**
 * Returns the main instance of Scamnemesis
 */
function scamnemesis(): Scamnemesis {
    return Scamnemesis::instance();
}

// Initialize plugin
scamnemesis();
