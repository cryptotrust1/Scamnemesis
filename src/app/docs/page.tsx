import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FEATURES } from '@/lib/config/features';
import SwaggerUI from './SwaggerUI';

export const metadata: Metadata = {
  title: 'API Documentation | ScamNemesis',
  description: 'ScamNemesis REST API Documentation',
  robots: 'noindex, nofollow',
};

/**
 * API Documentation Page
 *
 * Renders Swagger UI with the OpenAPI specification.
 * Protected by feature flag and admin authentication (handled in layout).
 */
export default function DocsPage() {
  // Check if Swagger UI is enabled via feature flag
  if (!FEATURES.SWAGGER_UI.enabled) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        url="/api/docs/openapi"
        tryItOutEnabled={FEATURES.SWAGGER_UI.tryItOutEnabled}
      />
    </div>
  );
}
