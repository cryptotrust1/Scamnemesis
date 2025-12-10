=== Scamnemesis - Fraud Report & Search ===
Contributors: scamnemesis
Donate link: https://scamnemesis.com/donate
Tags: fraud, scam, security, protection, search, report, crypto, phishing
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Protect your community from fraud. Search for scammers, report fraud, and integrate Scamnemesis fraud database into your WordPress site.

== Description ==

**Scamnemesis** is a comprehensive fraud protection plugin that integrates the Scamnemesis fraud database directly into your WordPress website. Help your users identify scammers, report fraudulent activity, and protect your community.

= Key Features =

* **Fraud Search** - Allow visitors to search the Scamnemesis database for known scammers (emails, phone numbers, crypto wallets, domains)
* **Report Form** - Enable users to submit fraud reports directly from your website
* **Quick Verification** - Instant check if an identifier has been reported
* **Statistics Display** - Show global fraud statistics on your site
* **Recent Reports** - Display latest fraud reports
* **Gutenberg Blocks** - Easy drag-and-drop integration with the block editor
* **Shortcodes** - Flexible placement anywhere on your site
* **Widgets** - Add fraud tools to your sidebar
* **REST API** - Build custom integrations
* **Caching** - Built-in caching for optimal performance
* **Multi-language** - Supports English, Slovak, Czech, and German

= Shortcodes =

* `[scamnemesis_search]` - Full search form with filters
* `[scamnemesis_report]` - Fraud report submission form
* `[scamnemesis_verify]` - Quick verification widget
* `[scamnemesis_stats]` - Display fraud statistics
* `[scamnemesis_recent]` - Show recent fraud reports
* `[scamnemesis_widget]` - Embed hosted widget

= Use Cases =

* **E-commerce Sites** - Let customers verify sellers before transactions
* **Cryptocurrency Platforms** - Check wallet addresses against known scams
* **Community Forums** - Protect members from fraudulent users
* **Financial Services** - Verify identities and flag suspicious accounts
* **News Websites** - Provide fraud awareness tools to readers

= Privacy & Security =

* All data is transmitted securely over HTTPS
* User IP addresses are hashed for rate limiting, not stored
* Report submissions can be anonymous
* Compliant with GDPR requirements
* No tracking or analytics of your visitors

= Requirements =

* WordPress 6.0 or higher
* PHP 8.0 or higher
* Scamnemesis API key (free tier available)

== Installation ==

1. Upload the `scamnemesis` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Scamnemesis > Settings** to configure your API key
4. Add shortcodes or blocks to your pages

= Getting an API Key =

1. Visit [scamnemesis.com/register](https://scamnemesis.com/register)
2. Create a free account
3. Go to your dashboard and copy your API key
4. Paste the API key in the plugin settings

== Frequently Asked Questions ==

= Is the plugin free? =

Yes, the plugin is completely free. You'll need a Scamnemesis account to get an API key. Free accounts include generous API limits for most websites.

= What data is sent to Scamnemesis? =

Only search queries and report submissions are sent to the Scamnemesis API. We don't track your visitors or collect any personal data from your website.

= Can I customize the appearance? =

Yes! You can customize the primary color in settings, or override the CSS using your theme's stylesheet. All elements have specific CSS classes for easy styling.

= Does it work with page builders? =

Yes, the shortcodes work with all major page builders including Elementor, Divi, WPBakery, and Beaver Builder.

= Is it GDPR compliant? =

Yes. The plugin does not store any personal data on your server. Report submissions are handled by Scamnemesis according to their privacy policy, and users can choose to submit anonymously.

= Can I disable the report form? =

Yes, you can disable report submissions in the plugin settings while keeping the search functionality active.

= How do I report a bug or request a feature? =

Please visit our [GitHub repository](https://github.com/scamnemesis/scamnemesis-wp) to report issues or request features.

== Screenshots ==

1. Search widget on the frontend
2. Report form for submitting fraud reports
3. Admin dashboard with statistics
4. Plugin settings page
5. Shortcodes reference page
6. Gutenberg block in the editor
7. Quick verify widget
8. Dark theme widget

== Changelog ==

= 1.0.0 =
* Initial release
* Search functionality with filters
* Report submission form
* Quick verification widget
* Statistics display
* Recent reports widget
* Admin dashboard
* Settings page with API configuration
* Gutenberg blocks for search and report
* Shortcodes for all features
* WordPress widgets
* REST API endpoints
* Caching layer
* Multi-language support (EN, SK, CS, DE)

== Upgrade Notice ==

= 1.0.0 =
Initial release of Scamnemesis plugin.

== Additional Info ==

= Support =

* Documentation: [scamnemesis.com/docs/wordpress](https://scamnemesis.com/docs/wordpress)
* Support Forum: [WordPress.org Support](https://wordpress.org/support/plugin/scamnemesis/)
* Email: support@scamnemesis.com

= Credits =

Scamnemesis is developed by the Scamnemesis Team. We're committed to making the internet a safer place by helping identify and report fraudulent activity.

= Contributing =

Contributions are welcome! Visit our [GitHub repository](https://github.com/scamnemesis/scamnemesis-wp) to contribute code, report bugs, or suggest improvements.
