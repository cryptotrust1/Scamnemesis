<?php
/**
 * Report Block Render Callback
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

$attributes = wp_parse_args($attributes, [
    'title' => __('Report a Scam', 'scamnemesis'),
    'showTitle' => true,
    'successMessage' => '',
]);

$shortcode_atts = [
    'title' => esc_attr($attributes['title']),
    'show_title' => $attributes['showTitle'] ? 'true' : 'false',
    'success_message' => esc_attr($attributes['successMessage']),
];

$shortcode_string = '[scamnemesis_report';
foreach ($shortcode_atts as $key => $value) {
    if ($value !== '') {
        $shortcode_string .= ' ' . $key . '="' . $value . '"';
    }
}
$shortcode_string .= ']';

echo '<div ' . get_block_wrapper_attributes() . '>';
echo do_shortcode($shortcode_string);
echo '</div>';
