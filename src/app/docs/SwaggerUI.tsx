'use client';

import { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';

interface SwaggerUIProps {
  url: string;
  tryItOutEnabled: boolean;
}

export default function SwaggerUI({ url, tryItOutEnabled }: SwaggerUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ui = SwaggerUIBundle({
      url,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset,
      ],
      layout: 'StandaloneLayout',
      // Disable "Try it out" in production
      supportedSubmitMethods: tryItOutEnabled
        ? ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']
        : [],
      persistAuthorization: true,
      withCredentials: true,
    });

    // Store for potential cleanup
    (window as unknown as { swaggerUI?: typeof ui }).swaggerUI = ui;

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
    };
  }, [url, tryItOutEnabled]);

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
          margin: 30px 0;
        }
        .swagger-ui .info .title {
          font-size: 2rem;
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
      `}</style>
      <div
        id="swagger-ui"
        ref={containerRef}
        style={{ minHeight: '100vh', padding: '0 20px' }}
      />
    </>
  );
}
