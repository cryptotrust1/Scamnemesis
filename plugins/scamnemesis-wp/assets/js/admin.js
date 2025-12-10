/**
 * Scamnemesis Admin JavaScript
 *
 * @package Scamnemesis
 */

(function($) {
    'use strict';

    /**
     * Initialize color pickers
     */
    function initColorPickers() {
        $('.scamnemesis-color-picker').wpColorPicker();
    }

    /**
     * Initialize password toggle
     */
    function initPasswordToggle() {
        $('.scamnemesis-toggle-password').on('click', function() {
            const targetId = $(this).data('target');
            const input = $('#' + targetId);
            const icon = $(this).find('.dashicons');

            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('dashicons-visibility').addClass('dashicons-hidden');
            } else {
                input.attr('type', 'password');
                icon.removeClass('dashicons-hidden').addClass('dashicons-visibility');
            }
        });
    }

    /**
     * Handle test connection button
     */
    function initTestConnection() {
        $('#scamnemesis-test-connection').on('click', function() {
            const button = $(this);
            const originalText = button.text();

            button.prop('disabled', true).text('Testing...');

            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'scamnemesis_test_connection',
                    nonce: scamnemesisAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        showNotice('success', response.data.message);
                    } else {
                        showNotice('error', response.data.message);
                    }
                },
                error: function() {
                    showNotice('error', 'Connection test failed. Please try again.');
                },
                complete: function() {
                    button.prop('disabled', false).text(originalText);
                }
            });
        });
    }

    /**
     * Handle clear cache button
     */
    function initClearCache() {
        $('#scamnemesis-clear-cache').on('click', function() {
            const button = $(this);
            const originalText = button.text();

            button.prop('disabled', true).text('Clearing...');

            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'scamnemesis_clear_cache',
                    nonce: scamnemesisAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        showNotice('success', response.data.message);
                    } else {
                        showNotice('error', response.data.message);
                    }
                },
                error: function() {
                    showNotice('error', 'Failed to clear cache. Please try again.');
                },
                complete: function() {
                    button.prop('disabled', false).text(originalText);
                }
            });
        });
    }

    /**
     * Show admin notice
     *
     * @param {string} type - Notice type (success, error, warning, info)
     * @param {string} message - Notice message
     */
    function showNotice(type, message) {
        // Remove existing notices
        $('.scamnemesis-admin-notice').remove();

        const noticeClass = type === 'success' ? 'notice-success' :
                           type === 'error' ? 'notice-error' :
                           type === 'warning' ? 'notice-warning' : 'notice-info';

        const notice = $(`
            <div class="notice ${noticeClass} is-dismissible scamnemesis-admin-notice">
                <p>${escapeHtml(message)}</p>
            </div>
        `);

        $('.scamnemesis-admin-wrap h1').after(notice);

        // Make it dismissible
        notice.find('.notice-dismiss').on('click', function() {
            notice.fadeOut(200, function() {
                $(this).remove();
            });
        });

        // Add dismiss button if not present
        if (!notice.find('.notice-dismiss').length) {
            notice.append('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
        }

        // Auto-dismiss after 5 seconds for success notices
        if (type === 'success') {
            setTimeout(function() {
                notice.fadeOut(200, function() {
                    $(this).remove();
                });
            }, 5000);
        }
    }

    /**
     * Escape HTML entities
     *
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Initialize clipboard copy for shortcodes
     */
    function initClipboardCopy() {
        $('.scamnemesis-shortcodes-list code').on('click', function() {
            const text = $(this).text();
            navigator.clipboard.writeText(text).then(function() {
                showNotice('success', 'Copied to clipboard: ' + text);
            }).catch(function() {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showNotice('success', 'Copied to clipboard: ' + text);
            });
        });

        // Add cursor pointer to shortcode codes
        $('.scamnemesis-shortcodes-list h2 code').css('cursor', 'pointer').attr('title', 'Click to copy');
    }

    /**
     * Initialize on document ready
     */
    $(document).ready(function() {
        // Check if we're on a Scamnemesis admin page
        if (!$('.scamnemesis-admin-wrap').length) {
            return;
        }

        initColorPickers();
        initPasswordToggle();
        initTestConnection();
        initClearCache();
        initClipboardCopy();

        // Add nonce if not present
        if (typeof scamnemesisAdmin === 'undefined') {
            window.scamnemesisAdmin = {
                nonce: $('#_wpnonce').val() || ''
            };
        }
    });

})(jQuery);
