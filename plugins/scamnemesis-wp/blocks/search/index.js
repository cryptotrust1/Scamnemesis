/**
 * Scamnemesis Search Block
 *
 * @package Scamnemesis
 */

(function(wp) {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl, ToggleControl, SelectControl, RangeControl } = wp.components;
    const { __ } = wp.i18n;
    const el = wp.element.createElement;

    registerBlockType('scamnemesis/search', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { placeholder, buttonText, searchType, showFilters, resultsPerPage } = attributes;

            const blockProps = useBlockProps({
                className: 'scamnemesis-search-block-editor'
            });

            return el(
                'div',
                blockProps,
                [
                    // Inspector Controls (Sidebar)
                    el(
                        InspectorControls,
                        { key: 'inspector' },
                        el(
                            PanelBody,
                            { title: __('Search Settings', 'scamnemesis'), initialOpen: true },
                            el(TextControl, {
                                label: __('Placeholder Text', 'scamnemesis'),
                                value: placeholder,
                                onChange: (value) => setAttributes({ placeholder: value }),
                                placeholder: __('Enter email, phone, wallet...', 'scamnemesis')
                            }),
                            el(TextControl, {
                                label: __('Button Text', 'scamnemesis'),
                                value: buttonText,
                                onChange: (value) => setAttributes({ buttonText: value })
                            }),
                            el(SelectControl, {
                                label: __('Default Search Type', 'scamnemesis'),
                                value: searchType,
                                options: [
                                    { label: __('All Types', 'scamnemesis'), value: 'all' },
                                    { label: __('Email', 'scamnemesis'), value: 'email' },
                                    { label: __('Phone', 'scamnemesis'), value: 'phone' },
                                    { label: __('Wallet', 'scamnemesis'), value: 'wallet' },
                                    { label: __('Domain', 'scamnemesis'), value: 'domain' }
                                ],
                                onChange: (value) => setAttributes({ searchType: value })
                            }),
                            el(ToggleControl, {
                                label: __('Show Type Filters', 'scamnemesis'),
                                checked: showFilters,
                                onChange: (value) => setAttributes({ showFilters: value })
                            }),
                            el(RangeControl, {
                                label: __('Results Per Page', 'scamnemesis'),
                                value: resultsPerPage,
                                onChange: (value) => setAttributes({ resultsPerPage: value }),
                                min: 5,
                                max: 50,
                                step: 5
                            })
                        )
                    ),
                    // Block Preview
                    el(
                        'div',
                        { className: 'scamnemesis-search-preview', key: 'preview' },
                        el(
                            'div',
                            { className: 'scamnemesis-search-preview-header' },
                            el('span', { className: 'dashicons dashicons-search' }),
                            el('span', null, __('Scamnemesis Search', 'scamnemesis'))
                        ),
                        el(
                            'div',
                            { className: 'scamnemesis-search-preview-form' },
                            el('input', {
                                type: 'text',
                                placeholder: placeholder || __('Enter email, phone, wallet address...', 'scamnemesis'),
                                disabled: true
                            }),
                            el('button', { type: 'button', disabled: true }, buttonText || __('Search', 'scamnemesis'))
                        ),
                        showFilters && el(
                            'div',
                            { className: 'scamnemesis-search-preview-filters' },
                            el('span', { className: 'filter active' }, __('All', 'scamnemesis')),
                            el('span', { className: 'filter' }, __('Email', 'scamnemesis')),
                            el('span', { className: 'filter' }, __('Phone', 'scamnemesis')),
                            el('span', { className: 'filter' }, __('Wallet', 'scamnemesis')),
                            el('span', { className: 'filter' }, __('Domain', 'scamnemesis'))
                        )
                    )
                ]
            );
        },

        save: function() {
            // Dynamic block - rendered on server
            return null;
        }
    });
})(window.wp);
