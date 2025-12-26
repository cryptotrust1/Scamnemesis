import { redirect } from 'next/navigation';

/**
 * Developers Page Redirect
 *
 * Redirects to the localized developers page.
 * The default locale is English (en).
 */
export default function DevelopersRedirect() {
  redirect('/en/developers');
}
