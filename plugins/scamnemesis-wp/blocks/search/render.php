<?php
/**
 * Search Block Render Callback
 *
 * @package Scamnemesis
 */

if (!defined('ABSPATH')) {
    exit;
}

$attributes = wp_parse_args($attributes, [
    'placeholder' => '',
    'buttonText' => __('Search', 'scamnemesis'),
    'searchType' => 'all',
    'showFilters' => true,
    'resultsPerPage' => 10,
]);

$shortcode_atts = [
    'placeholder' => esc_attr($attributes['placeholder']),
    'button_text' => esc_attr($attributes['buttonText']),
    'type' => esc_attr($attributes['searchType']),
    'show_filters' => $attributes['showFilters'] ? 'true' : 'false',
    'results_per_page' => intval($attributes['resultsPerPage']),
];

$shortcode_string = '[scamnemesis_search';
foreach ($shortcode_atts as $key => $value) {
    if ($value !== '') {
        $shortcode_string .= ' ' . $key . '="' . $value . '"';
    }
}
$shortcode_string .= ']';

echo '<div ' . get_block_wrapper_attributes() . '>';
echo do_shortcode($shortcode_string);
echo '</div>';
