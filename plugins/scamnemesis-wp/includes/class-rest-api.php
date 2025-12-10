<?php
/**
 * Scamnemesis REST API
 *
 * Registers REST API endpoints for the plugin
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API Class
 */
class Scamnemesis_REST_API {

    /**
     * API namespace
     */
    private string $namespace = 'scamnemesis/v1';

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST routes
     */
    public function register_routes(): void {
        // Search endpoint
        register_rest_route($this->namespace, '/search', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'search'],
            'permission_callback' => '__return_true',
            'args' => [
                'q' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'type' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'all',
                    'enum' => ['all', 'email', 'phone', 'wallet', 'domain'],
                ],
                'page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 1,
                    'minimum' => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 10,
                    'minimum' => 1,
                    'maximum' => 100,
                ],
            ],
        ]);

        // Verify endpoint
        register_rest_route($this->namespace, '/verify', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'verify'],
            'permission_callback' => '__return_true',
            'args' => [
                'identifier' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'type' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'auto',
                ],
            ],
        ]);

        // Report endpoint
        register_rest_route($this->namespace, '/report', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [$this, 'submit_report'],
            'permission_callback' => [$this, 'check_report_permission'],
            'args' => [
                'type' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'identifier' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'description' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ],
                'scam_type' => [
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'amount_lost' => [
                    'required' => false,
                    'type' => 'number',
                ],
                'currency' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'USD',
                ],
                'evidence_urls' => [
                    'required' => false,
                    'type' => 'array',
                ],
                'contact_email' => [
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_email',
                ],
                'anonymous' => [
                    'required' => false,
                    'type' => 'boolean',
                    'default' => false,
                ],
            ],
        ]);

        // Single report endpoint
        register_rest_route($this->namespace, '/report/(?P<id>[a-zA-Z0-9-]+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_report'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Stats endpoint
        register_rest_route($this->namespace, '/stats', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_stats'],
            'permission_callback' => '__return_true',
        ]);

        // Recent reports endpoint
        register_rest_route($this->namespace, '/recent', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_recent'],
            'permission_callback' => '__return_true',
            'args' => [
                'limit' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 10,
                    'minimum' => 1,
                    'maximum' => 50,
                ],
            ],
        ]);

        // Clear cache endpoint (admin only)
        register_rest_route($this->namespace, '/cache/clear', [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => [$this, 'clear_cache'],
            'permission_callback' => [$this, 'check_admin_permission'],
        ]);
    }

    /**
     * Search endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function search(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $api = scamnemesis()->get_api();

        $result = $api->search(
            $request->get_param('q'),
            $request->get_param('type'),
            $request->get_param('page'),
            $request->get_param('per_page')
        );

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response($result, 200);
    }

    /**
     * Verify endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function verify(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $api = scamnemesis()->get_api();

        $result = $api->verify(
            $request->get_param('identifier'),
            $request->get_param('type')
        );

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response($result, 200);
    }

    /**
     * Submit report endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function submit_report(WP_REST_Request $request): WP_REST_Response|WP_Error {
        // Check if reports are enabled
        if (!get_option('scamnemesis_enable_report', true)) {
            return new WP_Error(
                'reports_disabled',
                __('Report submissions are currently disabled.', 'scamnemesis'),
                ['status' => 403]
            );
        }

        // Rate limiting check
        $ip = $this->get_client_ip();
        $rate_limit_key = 'scamnemesis_rate_' . md5($ip);
        $rate_limit = get_transient($rate_limit_key);

        if ($rate_limit !== false && $rate_limit >= 5) {
            return new WP_Error(
                'rate_limited',
                __('Too many requests. Please try again later.', 'scamnemesis'),
                ['status' => 429]
            );
        }

        // Increment rate limit
        set_transient($rate_limit_key, ($rate_limit ?: 0) + 1, HOUR_IN_SECONDS);

        $api = scamnemesis()->get_api();

        $data = [
            'type' => $request->get_param('type'),
            'identifier' => $request->get_param('identifier'),
            'description' => $request->get_param('description'),
            'scam_type' => $request->get_param('scam_type'),
            'amount_lost' => $request->get_param('amount_lost'),
            'currency' => $request->get_param('currency'),
            'evidence_urls' => $request->get_param('evidence_urls'),
            'contact_email' => $request->get_param('contact_email'),
            'anonymous' => $request->get_param('anonymous'),
        ];

        $result = $api->submit_report($data);

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Report submitted successfully.', 'scamnemesis'),
            'data' => $result,
        ], 201);
    }

    /**
     * Get single report endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_report(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $api = scamnemesis()->get_api();

        $result = $api->get_report($request->get_param('id'));

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response($result, 200);
    }

    /**
     * Get stats endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_stats(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $api = scamnemesis()->get_api();

        $result = $api->get_stats();

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response($result, 200);
    }

    /**
     * Get recent reports endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_recent(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $api = scamnemesis()->get_api();

        $result = $api->get_recent_reports($request->get_param('limit'));

        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response($result, 200);
    }

    /**
     * Clear cache endpoint handler
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function clear_cache(WP_REST_Request $request): WP_REST_Response {
        $api = scamnemesis()->get_api();
        $api->clear_cache();

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Cache cleared successfully.', 'scamnemesis'),
        ], 200);
    }

    /**
     * Check permission for report submission
     *
     * @return bool
     */
    public function check_report_permission(): bool {
        // Verify nonce for frontend requests
        $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? '';
        if (!empty($nonce) && !wp_verify_nonce($nonce, 'wp_rest')) {
            return false;
        }

        return true;
    }

    /**
     * Check admin permission
     *
     * @return bool
     */
    public function check_admin_permission(): bool {
        return current_user_can('manage_options');
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip(): string {
        $ip_keys = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR',
        ];

        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }
}
