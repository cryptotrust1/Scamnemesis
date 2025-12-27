'use client';

/**
 * Admin API Documentation Page
 *
 * Full Swagger UI for admin users.
 * Accessible at /admin/docs
 */

import { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';

export default function AdminDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ui = SwaggerUIBundle({
      url: '/api/docs/openapi',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset,
      ],
      layout: 'StandaloneLayout',
      // Enable "Try it out" for admins
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'],
      persistAuthorization: true,
      withCredentials: true,
    });

    // Store for potential cleanup
    (window as unknown as { swaggerUI?: typeof ui }).swaggerUI = ui;

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .info .title {
          font-size: 1.75rem;
          color: #1a1a2e;
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #61affe;
          background: rgba(97, 175, 254, 0.1);
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #49cc90;
          background: rgba(73, 204, 144, 0.1);
        }
        .swagger-ui .opblock.opblock-delete {
          border-color: #f93e3e;
          background: rgba(249, 62, 62, 0.1);
        }
        .swagger-ui .opblock.opblock-put {
          border-color: #fca130;
          background: rgba(252, 161, 48, 0.1);
        }
        .swagger-ui .opblock.opblock-patch {
          border-color: #50e3c2;
          background: rgba(80, 227, 194, 0.1);
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        .swagger-ui section.models {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .swagger-ui section.models .model-container {
          background: #f8f9fa;
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">API Documentation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Full Swagger UI with &quot;Try it out&quot; functionality
          </p>
        </div>
        <div
          id="swagger-ui"
          ref={containerRef}
          style={{ minHeight: '80vh', padding: '0 20px 20px' }}
        />
      </div>
    </>
  );
}
