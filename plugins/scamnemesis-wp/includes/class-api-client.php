<?php
/**
 * Scamnemesis API Client
 *
 * Handles all communication with the Scamnemesis API
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Client Class
 */
class Scamnemesis_API_Client {

    /**
     * API base URL
     */
    private string $api_url;

    /**
     * API key
     */
    private string $api_key;

    /**
     * Cache duration in seconds
     */
    private int $cache_duration;

    /**
     * Constructor
     */
    public function __construct() {
        $this->api_url = get_option('scamnemesis_api_url', 'https://api.scamnemesis.com');
        $this->api_key = get_option('scamnemesis_api_key', '');
        $this->cache_duration = (int) get_option('scamnemesis_cache_duration', 300);
    }

    /**
     * Search for fraud reports
     *
     * @param string $query Search query (email, phone, wallet, etc.)
     * @param string $type Search type (all, email, phone, wallet, domain)
     * @param int $page Page number
     * @param int $per_page Results per page
     * @return array|WP_Error
     */
    public function search(string $query, string $type = 'all', int $page = 1, int $per_page = 10): array|WP_Error {
        $cache_key = 'search_' . md5($query . $type . $page . $per_page);
        $cached = $this->get_cache($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = $this->request('GET', '/v1/search', [
            'q' => $query,
            'type' => $type,
            'page' => $page,
            'per_page' => $per_page,
        ]);

        if (!is_wp_error($response)) {
            $this->set_cache($cache_key, $response);
        }

        return $response;
    }

    /**
     * Get fraud report by ID
     *
     * @param string $report_id Report ID
     * @return array|WP_Error
     */
    public function get_report(string $report_id): array|WP_Error {
        $cache_key = 'report_' . $report_id;
        $cached = $this->get_cache($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = $this->request('GET', '/v1/reports/' . $report_id);

        if (!is_wp_error($response)) {
            $this->set_cache($cache_key, $response);
        }

        return $response;
    }

    /**
     * Submit a new fraud report
     *
     * @param array $data Report data
     * @return array|WP_Error
     */
    public function submit_report(array $data): array|WP_Error {
        // Validate required fields
        $required = ['type', 'identifier', 'description'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return new WP_Error(
                    'missing_field',
                    sprintf(__('Missing required field: %s', 'scamnemesis'), $field)
                );
            }
        }

        // Sanitize data
        $sanitized = [
            'type' => sanitize_text_field($data['type']),
            'identifier' => sanitize_text_field($data['identifier']),
            'description' => sanitize_textarea_field($data['description']),
            'evidence_urls' => isset($data['evidence_urls']) ? array_map('esc_url_raw', (array) $data['evidence_urls']) : [],
            'amount_lost' => isset($data['amount_lost']) ? floatval($data['amount_lost']) : null,
            'currency' => isset($data['currency']) ? sanitize_text_field($data['currency']) : 'USD',
            'scam_type' => isset($data['scam_type']) ? sanitize_text_field($data['scam_type']) : '',
            'contact_email' => isset($data['contact_email']) ? sanitize_email($data['contact_email']) : '',
            'anonymous' => !empty($data['anonymous']),
        ];

        return $this->request('POST', '/v1/reports', $sanitized);
    }

    /**
     * Verify an identifier (check if it's reported)
     *
     * @param string $identifier The identifier to verify
     * @param string $type Type of identifier
     * @return array|WP_Error
     */
    public function verify(string $identifier, string $type = 'auto'): array|WP_Error {
        $cache_key = 'verify_' . md5($identifier . $type);
        $cached = $this->get_cache($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = $this->request('GET', '/v1/verify', [
            'identifier' => $identifier,
            'type' => $type,
        ]);

        if (!is_wp_error($response)) {
            $this->set_cache($cache_key, $response, 60); // Short cache for verification
        }

        return $response;
    }

    /**
     * Get statistics
     *
     * @return array|WP_Error
     */
    public function get_stats(): array|WP_Error {
        $cache_key = 'stats';
        $cached = $this->get_cache($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = $this->request('GET', '/v1/stats');

        if (!is_wp_error($response)) {
            $this->set_cache($cache_key, $response, 3600); // 1 hour cache for stats
        }

        return $response;
    }

    /**
     * Get recent reports
     *
     * @param int $limit Number of reports
     * @return array|WP_Error
     */
    public function get_recent_reports(int $limit = 10): array|WP_Error {
        $cache_key = 'recent_' . $limit;
        $cached = $this->get_cache($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $response = $this->request('GET', '/v1/reports/recent', [
            'limit' => $limit,
        ]);

        if (!is_wp_error($response)) {
            $this->set_cache($cache_key, $response);
        }

        return $response;
    }

    /**
     * Make API request
     *
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $data Request data
     * @return array|WP_Error
     */
    private function request(string $method, string $endpoint, array $data = []): array|WP_Error {
        $url = rtrim($this->api_url, '/') . $endpoint;

        $args = [
            'method' => $method,
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-API-Key' => $this->api_key,
                'X-Client' => 'wordpress-plugin',
                'X-Client-Version' => SCAMNEMESIS_VERSION,
            ],
        ];

        if ($method === 'GET' && !empty($data)) {
            $url = add_query_arg($data, $url);
        } elseif (!empty($data)) {
            $args['body'] = wp_json_encode($data);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);

        if ($status_code >= 400) {
            $error_message = $decoded['message'] ?? __('API request failed', 'scamnemesis');
            return new WP_Error('api_error', $error_message, ['status' => $status_code]);
        }

        return $decoded ?? [];
    }

    /**
     * Get cached data
     *
     * @param string $key Cache key
     * @return mixed|false
     */
    private function get_cache(string $key): mixed {
        global $wpdb;
        $table_name = $wpdb->prefix . 'scamnemesis_cache';

        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return false;
        }

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT cache_value FROM $table_name WHERE cache_key = %s AND expiration > NOW()",
                $key
            )
        );

        if ($result) {
            return json_decode($result->cache_value, true);
        }

        return false;
    }

    /**
     * Set cache data
     *
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int|null $duration Cache duration in seconds
     * @return bool
     */
    private function set_cache(string $key, mixed $value, ?int $duration = null): bool {
        global $wpdb;
        $table_name = $wpdb->prefix . 'scamnemesis_cache';

        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return false;
        }

        $duration = $duration ?? $this->cache_duration;
        $expiration = gmdate('Y-m-d H:i:s', time() + $duration);

        $result = $wpdb->replace(
            $table_name,
            [
                'cache_key' => $key,
                'cache_value' => wp_json_encode($value),
                'expiration' => $expiration,
            ],
            ['%s', '%s', '%s']
        );

        return $result !== false;
    }

    /**
     * Clear cache
     *
     * @param string|null $key Specific key to clear, or null for all
     * @return bool
     */
    public function clear_cache(?string $key = null): bool {
        global $wpdb;
        $table_name = $wpdb->prefix . 'scamnemesis_cache';

        if ($key) {
            return $wpdb->delete($table_name, ['cache_key' => $key], ['%s']) !== false;
        }

        return $wpdb->query("TRUNCATE TABLE $table_name") !== false;
    }

    /**
     * Clean expired cache entries
     *
     * @return int Number of deleted entries
     */
    public function clean_expired_cache(): int {
        global $wpdb;
        $table_name = $wpdb->prefix . 'scamnemesis_cache';

        return (int) $wpdb->query("DELETE FROM $table_name WHERE expiration < NOW()");
    }

    /**
     * Test API connection
     *
     * @return array|WP_Error
     */
    public function test_connection(): array|WP_Error {
        return $this->request('GET', '/v1/health');
    }
}
