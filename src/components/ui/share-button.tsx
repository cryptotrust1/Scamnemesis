'use client';

/**
 * ShareButton Component
 *
 * A modern, accessible share button with support for:
 * - Web Share API (mobile/desktop native sharing)
 * - Direct social network sharing (official URLs)
 * - Clipboard copy fallback
 *
 * Uses only official share URLs - no external libraries required.
 * Best practices: https://web.dev/web-share/
 */

import { useState, useCallback } from 'react';
import {
  Share2,
  Check,
  Facebook,
  Linkedin,
  Mail,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// X (Twitter) icon - custom since lucide doesn't have updated X logo
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// WhatsApp icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Telegram icon
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export interface ShareButtonProps {
  /** URL to share (defaults to current page URL) */
  url?: string;
  /** Title for the share */
  title?: string;
  /** Description text for the share */
  description?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional CSS classes */
  className?: string;
  /** Show label text */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Callback when share is successful */
  onShare?: (platform: string) => void;
}

/**
 * Official social network share URLs
 * These are the recommended, stable URLs from each platform's documentation
 */
const SHARE_URLS = {
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  linkedin: (url: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  whatsapp: (url: string, text: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  telegram: (url: string, text: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  email: (url: string, subject: string, body: string) =>
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\n${url}`)}`,
};

/**
 * Open share URL in a centered popup window
 */
function openShareWindow(url: string, platform: string): void {
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

export function ShareButton({
  url,
  title = 'Pozrite si toto hlásenie o podvode',
  description = 'Hlásenie podvodu na ScamNemesis',
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
  label = 'Zdieľať',
  onShare,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get the URL to share
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Check if Web Share API is available
  const canUseWebShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  // Handle native Web Share API
  const handleNativeShare = useCallback(async () => {
    if (!canUseWebShare) return false;

    try {
      await navigator.share({
        title: description,
        text: title,
        url: shareUrl,
      });
      onShare?.('native');
      return true;
    } catch (error) {
      // User cancelled or error
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  }, [canUseWebShare, shareUrl, title, description, onShare]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Odkaz bol skopírovaný do schránky');
      onShare?.('clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nepodarilo sa skopírovať odkaz');
    }
  }, [shareUrl, onShare]);

  // Handle social share
  const handleSocialShare = useCallback(
    (platform: keyof typeof SHARE_URLS) => {
      let shareUrlString: string;

      switch (platform) {
        case 'facebook':
          shareUrlString = SHARE_URLS.facebook(shareUrl);
          break;
        case 'twitter':
          shareUrlString = SHARE_URLS.twitter(shareUrl, title);
          break;
        case 'linkedin':
          shareUrlString = SHARE_URLS.linkedin(shareUrl);
          break;
        case 'whatsapp':
          shareUrlString = SHARE_URLS.whatsapp(shareUrl, title);
          break;
        case 'telegram':
          shareUrlString = SHARE_URLS.telegram(shareUrl, title);
          break;
        case 'email':
          shareUrlString = SHARE_URLS.email(shareUrl, description, title);
          // Email opens in default mail client, not popup
          window.location.href = shareUrlString;
          onShare?.(platform);
          setIsOpen(false);
          return;
        default:
          return;
      }

      openShareWindow(shareUrlString, platform);
      onShare?.(platform);
      setIsOpen(false);
    },
    [shareUrl, title, description, onShare]
  );

  // On mobile, try native share first
  const handleButtonClick = useCallback(async () => {
    // On mobile with Web Share API, use native sharing
    if (canUseWebShare && window.innerWidth < 768) {
      const shared = await handleNativeShare();
      if (shared) return;
    }
    // Otherwise, open dropdown (handled by DropdownMenuTrigger)
  }, [canUseWebShare, handleNativeShare]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
          onClick={handleButtonClick}
        >
          <Share2 className="h-4 w-4" />
          {showLabel && <span>{label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Social Networks */}
        <DropdownMenuItem
          onClick={() => handleSocialShare('facebook')}
          className="cursor-pointer gap-3"
        >
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          <span>Facebook</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSocialShare('twitter')}
          className="cursor-pointer gap-3"
        >
          <XIcon className="h-4 w-4" />
          <span>X (Twitter)</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSocialShare('linkedin')}
          className="cursor-pointer gap-3"
        >
          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
          <span>LinkedIn</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Messaging Apps */}
        <DropdownMenuItem
          onClick={() => handleSocialShare('whatsapp')}
          className="cursor-pointer gap-3"
        >
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
          <span>WhatsApp</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSocialShare('telegram')}
          className="cursor-pointer gap-3"
        >
          <TelegramIcon className="h-4 w-4 text-[#0088cc]" />
          <span>Telegram</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Email & Copy */}
        <DropdownMenuItem
          onClick={() => handleSocialShare('email')}
          className="cursor-pointer gap-3"
        >
          <Mail className="h-4 w-4 text-gray-600" />
          <span>Email</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-3">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Skopírované!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 text-gray-600" />
              <span>Kopírovať odkaz</span>
            </>
          )}
        </DropdownMenuItem>

        {/* Native Share (if available on desktop) */}
        {canUseWebShare && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleNativeShare}
              className="cursor-pointer gap-3"
            >
              <Share2 className="h-4 w-4 text-blue-500" />
              <span>Ďalšie možnosti...</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShareButton;
