/**
 * ScamNemesis Widget Auto-Resize Script
 *
 * This script listens for postMessage events from embedded ScamNemesis widgets
 * and automatically adjusts the iframe height to fit the content.
 *
 * Usage:
 * 1. Add the widget iframe to your page
 * 2. Include this script after the iframe
 *
 * Example:
 * <iframe src="https://scamnemesis.com/en/embed/widget/YOUR_WIDGET_ID" ...></iframe>
 * <script src="https://scamnemesis.com/embed/widget-resize.js"></script>
 */

(function() {
  'use strict';

  // Find all ScamNemesis widget iframes
  function findWidgetIframes() {
    return document.querySelectorAll('iframe[src*="/embed/widget/"]');
  }

  // Handle resize message from widget
  function handleMessage(event) {
    // Validate origin (allow scamnemesis.com and localhost for development)
    const allowedOrigins = [
      'https://scamnemesis.com',
      'https://www.scamnemesis.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    // Also allow same origin
    if (!allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
      return;
    }

    // Check if it's a widget resize message
    if (!event.data || event.data.type !== 'scamnemesis-widget-resize') {
      return;
    }

    var height = event.data.height;
    var widgetId = event.data.widgetId;

    if (typeof height !== 'number' || height < 100) {
      return;
    }

    // Find the matching iframe
    var iframes = findWidgetIframes();
    iframes.forEach(function(iframe) {
      // Match by widgetId in src or by event source
      if (iframe.contentWindow === event.source ||
          (widgetId && iframe.src.indexOf(widgetId) !== -1)) {
        // Add some padding and set height
        iframe.style.height = (height + 20) + 'px';
      }
    });
  }

  // Listen for messages
  window.addEventListener('message', handleMessage, false);

  // Set initial height for all widget iframes
  function initializeIframes() {
    var iframes = findWidgetIframes();
    iframes.forEach(function(iframe) {
      // Set initial styling
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.minHeight = '400px';
      iframe.style.transition = 'height 0.2s ease-out';
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIframes);
  } else {
    initializeIframes();
  }
})();
