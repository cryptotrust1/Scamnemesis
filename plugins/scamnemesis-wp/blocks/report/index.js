/**
 * Scamnemesis Report Block
 *
 * @package Scamnemesis
 */

(function(wp) {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl, ToggleControl, TextareaControl } = wp.components;
    const { __ } = wp.i18n;
    const el = wp.element.createElement;

    registerBlockType('scamnemesis/report', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { title, showTitle, successMessage } = attributes;

            const blockProps = useBlockProps({
                className: 'scamnemesis-report-block-editor'
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
                            { title: __('Report Form Settings', 'scamnemesis'), initialOpen: true },
                            el(TextControl, {
                                label: __('Form Title', 'scamnemesis'),
                                value: title,
                                onChange: (value) => setAttributes({ title: value })
                            }),
                            el(ToggleControl, {
                                label: __('Show Title', 'scamnemesis'),
                                checked: showTitle,
                                onChange: (value) => setAttributes({ showTitle: value })
                            }),
                            el(TextareaControl, {
                                label: __('Success Message', 'scamnemesis'),
                                value: successMessage,
                                onChange: (value) => setAttributes({ successMessage: value }),
                                placeholder: __('Thank you for your report. It will be reviewed by our team.', 'scamnemesis'),
                                help: __('Message shown after successful submission.', 'scamnemesis')
                            })
                        )
                    ),
                    // Block Preview
                    el(
                        'div',
                        { className: 'scamnemesis-report-preview', key: 'preview' },
                        el(
                            'div',
                            { className: 'scamnemesis-report-preview-header' },
                            el('span', { className: 'dashicons dashicons-flag' }),
                            el('span', null, __('Scamnemesis Report Form', 'scamnemesis'))
                        ),
                        showTitle && el(
                            'h3',
                            { className: 'scamnemesis-report-preview-title' },
                            title || __('Report a Scam', 'scamnemesis')
                        ),
                        el(
                            'div',
                            { className: 'scamnemesis-report-preview-form' },
                            el(
                                'div',
                                { className: 'form-row' },
                                el('label', null, __('Type of Identifier', 'scamnemesis')),
                                el('select', { disabled: true },
                                    el('option', null, __('Select type...', 'scamnemesis'))
                                )
                            ),
                            el(
                                'div',
                                { className: 'form-row' },
                                el('label', null, __('Identifier', 'scamnemesis')),
                                el('input', { type: 'text', disabled: true, placeholder: 'e.g., scammer@email.com' })
                            ),
                            el(
                                'div',
                                { className: 'form-row' },
                                el('label', null, __('Description', 'scamnemesis')),
                                el('textarea', { disabled: true, rows: 3, placeholder: __('Describe the scam...', 'scamnemesis') })
                            ),
                            el(
                                'div',
                                { className: 'form-row' },
                                el('button', { type: 'button', disabled: true }, __('Submit Report', 'scamnemesis'))
                            )
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
