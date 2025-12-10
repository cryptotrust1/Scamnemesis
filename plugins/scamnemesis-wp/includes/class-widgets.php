<?php
/**
 * Scamnemesis Widgets
 *
 * Registers WordPress widgets for the plugin
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Widgets Registration Class
 */
class Scamnemesis_Widgets {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('widgets_init', [$this, 'register_widgets']);
    }

    /**
     * Register all widgets
     */
    public function register_widgets(): void {
        register_widget('Scamnemesis_Search_Widget');
        register_widget('Scamnemesis_Verify_Widget');
        register_widget('Scamnemesis_Stats_Widget');
        register_widget('Scamnemesis_Recent_Widget');
    }
}

/**
 * Search Widget
 */
class Scamnemesis_Search_Widget extends WP_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'scamnemesis_search',
            __('Scamnemesis Search', 'scamnemesis'),
            [
                'description' => __('Search for fraud reports in the Scamnemesis database', 'scamnemesis'),
                'classname' => 'widget-scamnemesis-search',
            ]
        );
    }

    /**
     * Widget output
     */
    public function widget($args, $instance): void {
        echo $args['before_widget'];

        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }

        $shortcode_atts = [
            'placeholder' => $instance['placeholder'] ?? '',
            'button_text' => $instance['button_text'] ?? __('Search', 'scamnemesis'),
            'show_filters' => !empty($instance['show_filters']) ? 'true' : 'false',
        ];

        echo do_shortcode('[scamnemesis_search ' . $this->build_shortcode_atts($shortcode_atts) . ']');

        echo $args['after_widget'];
    }

    /**
     * Widget form
     */
    public function form($instance): void {
        $title = $instance['title'] ?? __('Search Scam Database', 'scamnemesis');
        $placeholder = $instance['placeholder'] ?? '';
        $button_text = $instance['button_text'] ?? __('Search', 'scamnemesis');
        $show_filters = !empty($instance['show_filters']);
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('placeholder')); ?>"><?php esc_html_e('Placeholder:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('placeholder')); ?>" name="<?php echo esc_attr($this->get_field_name('placeholder')); ?>" type="text" value="<?php echo esc_attr($placeholder); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('button_text')); ?>"><?php esc_html_e('Button Text:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('button_text')); ?>" name="<?php echo esc_attr($this->get_field_name('button_text')); ?>" type="text" value="<?php echo esc_attr($button_text); ?>">
        </p>
        <p>
            <input type="checkbox" id="<?php echo esc_attr($this->get_field_id('show_filters')); ?>" name="<?php echo esc_attr($this->get_field_name('show_filters')); ?>" <?php checked($show_filters); ?>>
            <label for="<?php echo esc_attr($this->get_field_id('show_filters')); ?>"><?php esc_html_e('Show type filters', 'scamnemesis'); ?></label>
        </p>
        <?php
    }

    /**
     * Update widget
     */
    public function update($new_instance, $old_instance): array {
        return [
            'title' => sanitize_text_field($new_instance['title'] ?? ''),
            'placeholder' => sanitize_text_field($new_instance['placeholder'] ?? ''),
            'button_text' => sanitize_text_field($new_instance['button_text'] ?? ''),
            'show_filters' => !empty($new_instance['show_filters']),
        ];
    }

    /**
     * Build shortcode attributes string
     */
    private function build_shortcode_atts(array $atts): string {
        $parts = [];
        foreach ($atts as $key => $value) {
            if ($value !== '') {
                $parts[] = $key . '="' . esc_attr($value) . '"';
            }
        }
        return implode(' ', $parts);
    }
}

/**
 * Quick Verify Widget
 */
class Scamnemesis_Verify_Widget extends WP_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'scamnemesis_verify',
            __('Scamnemesis Verify', 'scamnemesis'),
            [
                'description' => __('Quick verification check for identifiers', 'scamnemesis'),
                'classname' => 'widget-scamnemesis-verify',
            ]
        );
    }

    /**
     * Widget output
     */
    public function widget($args, $instance): void {
        echo $args['before_widget'];

        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }

        echo do_shortcode('[scamnemesis_verify]');

        echo $args['after_widget'];
    }

    /**
     * Widget form
     */
    public function form($instance): void {
        $title = $instance['title'] ?? __('Verify Before You Trust', 'scamnemesis');
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <?php
    }

    /**
     * Update widget
     */
    public function update($new_instance, $old_instance): array {
        return [
            'title' => sanitize_text_field($new_instance['title'] ?? ''),
        ];
    }
}

/**
 * Statistics Widget
 */
class Scamnemesis_Stats_Widget extends WP_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'scamnemesis_stats',
            __('Scamnemesis Statistics', 'scamnemesis'),
            [
                'description' => __('Display fraud report statistics', 'scamnemesis'),
                'classname' => 'widget-scamnemesis-stats',
            ]
        );
    }

    /**
     * Widget output
     */
    public function widget($args, $instance): void {
        echo $args['before_widget'];

        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }

        $show = $instance['show'] ?? 'all';
        echo do_shortcode('[scamnemesis_stats show="' . esc_attr($show) . '"]');

        echo $args['after_widget'];
    }

    /**
     * Widget form
     */
    public function form($instance): void {
        $title = $instance['title'] ?? __('Scam Statistics', 'scamnemesis');
        $show = $instance['show'] ?? 'all';
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('show')); ?>"><?php esc_html_e('Show:', 'scamnemesis'); ?></label>
            <select class="widefat" id="<?php echo esc_attr($this->get_field_id('show')); ?>" name="<?php echo esc_attr($this->get_field_name('show')); ?>">
                <option value="all" <?php selected($show, 'all'); ?>><?php esc_html_e('All Statistics', 'scamnemesis'); ?></option>
                <option value="reports" <?php selected($show, 'reports'); ?>><?php esc_html_e('Reports Only', 'scamnemesis'); ?></option>
                <option value="amount" <?php selected($show, 'amount'); ?>><?php esc_html_e('Amount Lost Only', 'scamnemesis'); ?></option>
                <option value="users" <?php selected($show, 'users'); ?>><?php esc_html_e('Users Protected Only', 'scamnemesis'); ?></option>
            </select>
        </p>
        <?php
    }

    /**
     * Update widget
     */
    public function update($new_instance, $old_instance): array {
        return [
            'title' => sanitize_text_field($new_instance['title'] ?? ''),
            'show' => sanitize_text_field($new_instance['show'] ?? 'all'),
        ];
    }
}

/**
 * Recent Reports Widget
 */
class Scamnemesis_Recent_Widget extends WP_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'scamnemesis_recent',
            __('Recent Scam Reports', 'scamnemesis'),
            [
                'description' => __('Display recent fraud reports', 'scamnemesis'),
                'classname' => 'widget-scamnemesis-recent',
            ]
        );
    }

    /**
     * Widget output
     */
    public function widget($args, $instance): void {
        echo $args['before_widget'];

        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }

        $limit = $instance['limit'] ?? 5;
        echo do_shortcode('[scamnemesis_recent limit="' . intval($limit) . '"]');

        echo $args['after_widget'];
    }

    /**
     * Widget form
     */
    public function form($instance): void {
        $title = $instance['title'] ?? __('Recent Reports', 'scamnemesis');
        $limit = $instance['limit'] ?? 5;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'scamnemesis'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('limit')); ?>"><?php esc_html_e('Number of reports:', 'scamnemesis'); ?></label>
            <input class="tiny-text" id="<?php echo esc_attr($this->get_field_id('limit')); ?>" name="<?php echo esc_attr($this->get_field_name('limit')); ?>" type="number" min="1" max="20" value="<?php echo intval($limit); ?>">
        </p>
        <?php
    }

    /**
     * Update widget
     */
    public function update($new_instance, $old_instance): array {
        return [
            'title' => sanitize_text_field($new_instance['title'] ?? ''),
            'limit' => min(20, max(1, intval($new_instance['limit'] ?? 5))),
        ];
    }
}
