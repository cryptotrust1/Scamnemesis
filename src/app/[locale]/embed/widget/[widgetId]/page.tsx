/**
 * Embeddable Widget Page
 *
 * GET /[locale]/embed/widget/[widgetId]
 *
 * Renders a customizable search widget that can be embedded via iframe.
 * - Loads widget config from database
 * - Applies custom theming via CSS variables
 * - Sends height updates to parent window via postMessage
 * - noindex for SEO protection
 */

import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { FEATURES } from '@/lib/config/features';
import { EmbedWidgetClient } from './EmbedWidgetClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    locale: string;
    widgetId: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'ScamNemesis Widget',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}

export default async function EmbedWidgetPage({ params }: PageProps) {
  const { widgetId, locale } = await params;

  // Check if feature is enabled
  if (!FEATURES.PARTNER_WIDGETS.enabled) {
    notFound();
  }

  // Validate widgetId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(widgetId)) {
    notFound();
  }

  // Load widget config
  const widget = await prisma.widget.findUnique({
    where: { id: widgetId },
  });

  if (!widget || !widget.isActive) {
    notFound();
  }

  // Prepare widget config for client
  const widgetConfig = {
    id: widget.id,
    name: widget.name,
    locale: widget.locale,
    theme: widget.theme,
    primaryColor: widget.primaryColor,
    backgroundColor: widget.backgroundColor,
    textColor: widget.textColor,
    borderRadius: widget.borderRadius,
    showReportButton: widget.showReportButton,
    showAdvancedByDefault: widget.showAdvancedByDefault,
    defaultSearchMode: widget.defaultSearchMode.toLowerCase() as 'auto' | 'fuzzy' | 'exact',
  };

  return (
    <EmbedWidgetClient
      widget={widgetConfig}
      locale={locale}
    />
  );
}
