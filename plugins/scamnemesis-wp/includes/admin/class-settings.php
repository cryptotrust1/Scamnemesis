<?php
/**
 * Scamnemesis Settings
 *
 * Handles plugin settings registration and rendering
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Settings Class
 */
class Scamnemesis_Settings {

    /**
     * Option group
     */
    private string $option_group = 'scamnemesis_settings';

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Register settings
     */
    public function register_settings(): void {
        // API Settings Section
        add_settings_section(
            'scamnemesis_api_settings',
            __('API Configuration', 'scamnemesis'),
            [$this, 'render_api_section'],
            $this->option_group
        );

        // API URL
        register_setting($this->option_group, 'scamnemesis_api_url', [
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'https://api.scamnemesis.com',
        ]);
        add_settings_field(
            'scamnemesis_api_url',
            __('API URL', 'scamnemesis'),
            [$this, 'render_text_field'],
            $this->option_group,
            'scamnemesis_api_settings',
            [
                'name' => 'scamnemesis_api_url',
                'description' => __('The Scamnemesis API endpoint URL.', 'scamnemesis'),
                'placeholder' => 'https://api.scamnemesis.com',
            ]
        );

        // API Key
        register_setting($this->option_group, 'scamnemesis_api_key', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ]);
        add_settings_field(
            'scamnemesis_api_key',
            __('API Key', 'scamnemesis'),
            [$this, 'render_password_field'],
            $this->option_group,
            'scamnemesis_api_settings',
            [
                'name' => 'scamnemesis_api_key',
                'description' => __('Your Scamnemesis API key. Get one at scamnemesis.com/dashboard.', 'scamnemesis'),
            ]
        );

        // Widget Key
        register_setting($this->option_group, 'scamnemesis_widget_key', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ]);
        add_settings_field(
            'scamnemesis_widget_key',
            __('Widget Key', 'scamnemesis'),
            [$this, 'render_text_field'],
            $this->option_group,
            'scamnemesis_api_settings',
            [
                'name' => 'scamnemesis_widget_key',
                'description' => __('Widget key for embedded widgets (optional).', 'scamnemesis'),
            ]
        );

        // Features Section
        add_settings_section(
            'scamnemesis_features_settings',
            __('Features', 'scamnemesis'),
            [$this, 'render_features_section'],
            $this->option_group
        );

        // Enable Search
        register_setting($this->option_group, 'scamnemesis_enable_search', [
            'type' => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default' => true,
        ]);
        add_settings_field(
            'scamnemesis_enable_search',
            __('Enable Search', 'scamnemesis'),
            [$this, 'render_checkbox_field'],
            $this->option_group,
            'scamnemesis_features_settings',
            [
                'name' => 'scamnemesis_enable_search',
                'label' => __('Allow users to search the fraud database', 'scamnemesis'),
            ]
        );

        // Enable Report
        register_setting($this->option_group, 'scamnemesis_enable_report', [
            'type' => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default' => true,
        ]);
        add_settings_field(
            'scamnemesis_enable_report',
            __('Enable Report Form', 'scamnemesis'),
            [$this, 'render_checkbox_field'],
            $this->option_group,
            'scamnemesis_features_settings',
            [
                'name' => 'scamnemesis_enable_report',
                'label' => __('Allow users to submit fraud reports', 'scamnemesis'),
            ]
        );

        // Appearance Section
        add_settings_section(
            'scamnemesis_appearance_settings',
            __('Appearance', 'scamnemesis'),
            [$this, 'render_appearance_section'],
            $this->option_group
        );

        // Primary Color
        register_setting($this->option_group, 'scamnemesis_primary_color', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default' => '#2563eb',
        ]);
        add_settings_field(
            'scamnemesis_primary_color',
            __('Primary Color', 'scamnemesis'),
            [$this, 'render_color_field'],
            $this->option_group,
            'scamnemesis_appearance_settings',
            [
                'name' => 'scamnemesis_primary_color',
                'description' => __('Main accent color for buttons and highlights.', 'scamnemesis'),
            ]
        );

        // Default Language
        register_setting($this->option_group, 'scamnemesis_default_language', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'en',
        ]);
        add_settings_field(
            'scamnemesis_default_language',
            __('Default Language', 'scamnemesis'),
            [$this, 'render_select_field'],
            $this->option_group,
            'scamnemesis_appearance_settings',
            [
                'name' => 'scamnemesis_default_language',
                'options' => [
                    'en' => __('English', 'scamnemesis'),
                    'sk' => __('Slovak', 'scamnemesis'),
                    'cs' => __('Czech', 'scamnemesis'),
                    'de' => __('German', 'scamnemesis'),
                    'es' => __('Spanish', 'scamnemesis'),
                    'fr' => __('French', 'scamnemesis'),
                ],
            ]
        );

        // Performance Section
        add_settings_section(
            'scamnemesis_performance_settings',
            __('Performance', 'scamnemesis'),
            [$this, 'render_performance_section'],
            $this->option_group
        );

        // Cache Duration
        register_setting($this->option_group, 'scamnemesis_cache_duration', [
            'type' => 'integer',
            'sanitize_callback' => 'absint',
            'default' => 300,
        ]);
        add_settings_field(
            'scamnemesis_cache_duration',
            __('Cache Duration', 'scamnemesis'),
            [$this, 'render_number_field'],
            $this->option_group,
            'scamnemesis_performance_settings',
            [
                'name' => 'scamnemesis_cache_duration',
                'description' => __('How long to cache API responses (in seconds). Set to 0 to disable caching.', 'scamnemesis'),
                'min' => 0,
                'max' => 86400,
                'step' => 60,
            ]
        );
    }

    /**
     * Render settings page
     */
    public function render_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Handle form submission
        if (isset($_GET['settings-updated']) && $_GET['settings-updated']) {
            add_settings_error('scamnemesis_messages', 'scamnemesis_message', __('Settings saved.', 'scamnemesis'), 'updated');
        }

        settings_errors('scamnemesis_messages');
        ?>
        <div class="wrap scamnemesis-admin-wrap">
            <h1><?php esc_html_e('Scamnemesis Settings', 'scamnemesis'); ?></h1>

            <form action="options.php" method="post">
                <?php
                settings_fields($this->option_group);
                do_settings_sections($this->option_group);
                submit_button(__('Save Settings', 'scamnemesis'));
                ?>
            </form>
        </div>
        <?php
    }

    /**
     * Render API section description
     */
    public function render_api_section(): void {
        echo '<p>' . esc_html__('Configure your Scamnemesis API credentials.', 'scamnemesis') . '</p>';
    }

    /**
     * Render features section description
     */
    public function render_features_section(): void {
        echo '<p>' . esc_html__('Enable or disable plugin features.', 'scamnemesis') . '</p>';
    }

    /**
     * Render appearance section description
     */
    public function render_appearance_section(): void {
        echo '<p>' . esc_html__('Customize the look and feel of the plugin.', 'scamnemesis') . '</p>';
    }

    /**
     * Render performance section description
     */
    public function render_performance_section(): void {
        echo '<p>' . esc_html__('Configure caching and performance options.', 'scamnemesis') . '</p>';
    }

    /**
     * Render text field
     */
    public function render_text_field(array $args): void {
        $value = get_option($args['name'], '');
        $placeholder = $args['placeholder'] ?? '';
        ?>
        <input
            type="text"
            id="<?php echo esc_attr($args['name']); ?>"
            name="<?php echo esc_attr($args['name']); ?>"
            value="<?php echo esc_attr($value); ?>"
            placeholder="<?php echo esc_attr($placeholder); ?>"
            class="regular-text"
        >
        <?php if (!empty($args['description'])): ?>
            <p class="description"><?php echo esc_html($args['description']); ?></p>
        <?php endif;
    }

    /**
     * Render password field
     */
    public function render_password_field(array $args): void {
        $value = get_option($args['name'], '');
        ?>
        <input
            type="password"
            id="<?php echo esc_attr($args['name']); ?>"
            name="<?php echo esc_attr($args['name']); ?>"
            value="<?php echo esc_attr($value); ?>"
            class="regular-text"
            autocomplete="new-password"
        >
        <button type="button" class="button scamnemesis-toggle-password" data-target="<?php echo esc_attr($args['name']); ?>">
            <span class="dashicons dashicons-visibility"></span>
        </button>
        <?php if (!empty($args['description'])): ?>
            <p class="description"><?php echo esc_html($args['description']); ?></p>
        <?php endif;
    }

    /**
     * Render checkbox field
     */
    public function render_checkbox_field(array $args): void {
        $value = get_option($args['name'], true);
        ?>
        <label for="<?php echo esc_attr($args['name']); ?>">
            <input
                type="checkbox"
                id="<?php echo esc_attr($args['name']); ?>"
                name="<?php echo esc_attr($args['name']); ?>"
                value="1"
                <?php checked($value, true); ?>
            >
            <?php echo esc_html($args['label']); ?>
        </label>
        <?php
    }

    /**
     * Render color field
     */
    public function render_color_field(array $args): void {
        $value = get_option($args['name'], '#2563eb');
        ?>
        <input
            type="text"
            id="<?php echo esc_attr($args['name']); ?>"
            name="<?php echo esc_attr($args['name']); ?>"
            value="<?php echo esc_attr($value); ?>"
            class="scamnemesis-color-picker"
            data-default-color="#2563eb"
        >
        <?php if (!empty($args['description'])): ?>
            <p class="description"><?php echo esc_html($args['description']); ?></p>
        <?php endif;
    }

    /**
     * Render select field
     */
    public function render_select_field(array $args): void {
        $value = get_option($args['name'], '');
        ?>
        <select id="<?php echo esc_attr($args['name']); ?>" name="<?php echo esc_attr($args['name']); ?>">
            <?php foreach ($args['options'] as $key => $label): ?>
                <option value="<?php echo esc_attr($key); ?>" <?php selected($value, $key); ?>>
                    <?php echo esc_html($label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php if (!empty($args['description'])): ?>
            <p class="description"><?php echo esc_html($args['description']); ?></p>
        <?php endif;
    }

    /**
     * Render number field
     */
    public function render_number_field(array $args): void {
        $value = get_option($args['name'], 0);
        $min = $args['min'] ?? 0;
        $max = $args['max'] ?? 999999;
        $step = $args['step'] ?? 1;
        ?>
        <input
            type="number"
            id="<?php echo esc_attr($args['name']); ?>"
            name="<?php echo esc_attr($args['name']); ?>"
            value="<?php echo esc_attr($value); ?>"
            min="<?php echo esc_attr($min); ?>"
            max="<?php echo esc_attr($max); ?>"
            step="<?php echo esc_attr($step); ?>"
            class="small-text"
        >
        <?php if (!empty($args['description'])): ?>
            <p class="description"><?php echo esc_html($args['description']); ?></p>
        <?php endif;
    }
}
