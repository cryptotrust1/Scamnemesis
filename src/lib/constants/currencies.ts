/**
 * Complete list of world currencies with ISO 4217 codes
 * Organized by region with priority currencies for Europe at the top
 */

export interface Currency {
  value: string;  // ISO 4217 code
  label: string;  // Display label with symbol
  symbol: string; // Currency symbol
}

// Priority currencies (most commonly used in Central/Eastern Europe)
export const PRIORITY_CURRENCIES: Currency[] = [
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
  { value: 'CZK', label: 'CZK (Kč) - Czech Koruna', symbol: 'Kč' },
  { value: 'PLN', label: 'PLN (zł) - Polish Zloty', symbol: 'zł' },
  { value: 'HUF', label: 'HUF (Ft) - Hungarian Forint', symbol: 'Ft' },
  { value: 'CHF', label: 'CHF (Fr) - Swiss Franc', symbol: 'Fr' },
  { value: 'UAH', label: 'UAH (₴) - Ukrainian Hryvnia', symbol: '₴' },
];

// All world currencies
export const ALL_CURRENCIES: Currency[] = [
  // Europe
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
  { value: 'CHF', label: 'CHF (Fr) - Swiss Franc', symbol: 'Fr' },
  { value: 'CZK', label: 'CZK (Kč) - Czech Koruna', symbol: 'Kč' },
  { value: 'PLN', label: 'PLN (zł) - Polish Zloty', symbol: 'zł' },
  { value: 'HUF', label: 'HUF (Ft) - Hungarian Forint', symbol: 'Ft' },
  { value: 'RON', label: 'RON (lei) - Romanian Leu', symbol: 'lei' },
  { value: 'BGN', label: 'BGN (лв) - Bulgarian Lev', symbol: 'лв' },
  { value: 'HRK', label: 'HRK (kn) - Croatian Kuna', symbol: 'kn' },
  { value: 'RSD', label: 'RSD (дин) - Serbian Dinar', symbol: 'дин' },
  { value: 'BAM', label: 'BAM (KM) - Bosnia Mark', symbol: 'KM' },
  { value: 'MKD', label: 'MKD (ден) - Macedonian Denar', symbol: 'ден' },
  { value: 'ALL', label: 'ALL (L) - Albanian Lek', symbol: 'L' },
  { value: 'MDL', label: 'MDL (L) - Moldovan Leu', symbol: 'L' },
  { value: 'UAH', label: 'UAH (₴) - Ukrainian Hryvnia', symbol: '₴' },
  { value: 'BYN', label: 'BYN (Br) - Belarusian Ruble', symbol: 'Br' },
  { value: 'RUB', label: 'RUB (₽) - Russian Ruble', symbol: '₽' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona', symbol: 'kr' },
  { value: 'NOK', label: 'NOK (kr) - Norwegian Krone', symbol: 'kr' },
  { value: 'DKK', label: 'DKK (kr) - Danish Krone', symbol: 'kr' },
  { value: 'ISK', label: 'ISK (kr) - Icelandic Króna', symbol: 'kr' },
  { value: 'GEL', label: 'GEL (₾) - Georgian Lari', symbol: '₾' },
  { value: 'AMD', label: 'AMD (֏) - Armenian Dram', symbol: '֏' },
  { value: 'AZN', label: 'AZN (₼) - Azerbaijani Manat', symbol: '₼' },

  // Americas
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar', symbol: '$' },
  { value: 'MXN', label: 'MXN ($) - Mexican Peso', symbol: '$' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real', symbol: 'R$' },
  { value: 'ARS', label: 'ARS ($) - Argentine Peso', symbol: '$' },
  { value: 'CLP', label: 'CLP ($) - Chilean Peso', symbol: '$' },
  { value: 'COP', label: 'COP ($) - Colombian Peso', symbol: '$' },
  { value: 'PEN', label: 'PEN (S/) - Peruvian Sol', symbol: 'S/' },
  { value: 'UYU', label: 'UYU ($U) - Uruguayan Peso', symbol: '$U' },
  { value: 'PYG', label: 'PYG (₲) - Paraguayan Guarani', symbol: '₲' },
  { value: 'BOB', label: 'BOB (Bs) - Bolivian Boliviano', symbol: 'Bs' },
  { value: 'VES', label: 'VES (Bs) - Venezuelan Bolívar', symbol: 'Bs' },
  { value: 'GTQ', label: 'GTQ (Q) - Guatemalan Quetzal', symbol: 'Q' },
  { value: 'HNL', label: 'HNL (L) - Honduran Lempira', symbol: 'L' },
  { value: 'NIO', label: 'NIO (C$) - Nicaraguan Córdoba', symbol: 'C$' },
  { value: 'CRC', label: 'CRC (₡) - Costa Rican Colón', symbol: '₡' },
  { value: 'PAB', label: 'PAB (B/) - Panamanian Balboa', symbol: 'B/' },
  { value: 'DOP', label: 'DOP ($) - Dominican Peso', symbol: '$' },
  { value: 'CUP', label: 'CUP ($) - Cuban Peso', symbol: '$' },
  { value: 'JMD', label: 'JMD ($) - Jamaican Dollar', symbol: '$' },
  { value: 'TTD', label: 'TTD ($) - Trinidad Dollar', symbol: '$' },
  { value: 'BSD', label: 'BSD ($) - Bahamian Dollar', symbol: '$' },
  { value: 'BBD', label: 'BBD ($) - Barbadian Dollar', symbol: '$' },
  { value: 'HTG', label: 'HTG (G) - Haitian Gourde', symbol: 'G' },

  // Asia Pacific
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan', symbol: '¥' },
  { value: 'KRW', label: 'KRW (₩) - South Korean Won', symbol: '₩' },
  { value: 'TWD', label: 'TWD (NT$) - Taiwan Dollar', symbol: 'NT$' },
  { value: 'HKD', label: 'HKD (HK$) - Hong Kong Dollar', symbol: 'HK$' },
  { value: 'SGD', label: 'SGD (S$) - Singapore Dollar', symbol: 'S$' },
  { value: 'MYR', label: 'MYR (RM) - Malaysian Ringgit', symbol: 'RM' },
  { value: 'THB', label: 'THB (฿) - Thai Baht', symbol: '฿' },
  { value: 'IDR', label: 'IDR (Rp) - Indonesian Rupiah', symbol: 'Rp' },
  { value: 'PHP', label: 'PHP (₱) - Philippine Peso', symbol: '₱' },
  { value: 'VND', label: 'VND (₫) - Vietnamese Dong', symbol: '₫' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹' },
  { value: 'PKR', label: 'PKR (Rs) - Pakistani Rupee', symbol: 'Rs' },
  { value: 'BDT', label: 'BDT (৳) - Bangladeshi Taka', symbol: '৳' },
  { value: 'LKR', label: 'LKR (Rs) - Sri Lankan Rupee', symbol: 'Rs' },
  { value: 'NPR', label: 'NPR (Rs) - Nepalese Rupee', symbol: 'Rs' },
  { value: 'MMK', label: 'MMK (K) - Myanmar Kyat', symbol: 'K' },
  { value: 'KHR', label: 'KHR (៛) - Cambodian Riel', symbol: '៛' },
  { value: 'LAK', label: 'LAK (₭) - Lao Kip', symbol: '₭' },
  { value: 'BND', label: 'BND (B$) - Brunei Dollar', symbol: 'B$' },
  { value: 'MOP', label: 'MOP (P) - Macanese Pataca', symbol: 'P' },
  { value: 'MNT', label: 'MNT (₮) - Mongolian Tugrik', symbol: '₮' },
  { value: 'KZT', label: 'KZT (₸) - Kazakhstani Tenge', symbol: '₸' },
  { value: 'UZS', label: 'UZS (сўм) - Uzbekistani Som', symbol: 'сўм' },
  { value: 'KGS', label: 'KGS (с) - Kyrgyzstani Som', symbol: 'с' },
  { value: 'TJS', label: 'TJS (SM) - Tajikistani Somoni', symbol: 'SM' },
  { value: 'TMT', label: 'TMT (m) - Turkmenistani Manat', symbol: 'm' },
  { value: 'AFN', label: 'AFN (؋) - Afghan Afghani', symbol: '؋' },
  { value: 'AUD', label: 'AUD (A$) - Australian Dollar', symbol: 'A$' },
  { value: 'NZD', label: 'NZD (NZ$) - New Zealand Dollar', symbol: 'NZ$' },
  { value: 'FJD', label: 'FJD (FJ$) - Fijian Dollar', symbol: 'FJ$' },
  { value: 'PGK', label: 'PGK (K) - Papua New Guinean Kina', symbol: 'K' },
  { value: 'SBD', label: 'SBD ($) - Solomon Islands Dollar', symbol: '$' },
  { value: 'TOP', label: 'TOP (T$) - Tongan Paʻanga', symbol: 'T$' },
  { value: 'VUV', label: 'VUV (Vt) - Vanuatu Vatu', symbol: 'Vt' },
  { value: 'WST', label: 'WST (T) - Samoan Tala', symbol: 'T' },

  // Middle East
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham', symbol: 'د.إ' },
  { value: 'SAR', label: 'SAR (﷼) - Saudi Riyal', symbol: '﷼' },
  { value: 'QAR', label: 'QAR (ر.ق) - Qatari Riyal', symbol: 'ر.ق' },
  { value: 'KWD', label: 'KWD (د.ك) - Kuwaiti Dinar', symbol: 'د.ك' },
  { value: 'BHD', label: 'BHD (.د.ب) - Bahraini Dinar', symbol: '.د.ب' },
  { value: 'OMR', label: 'OMR (ر.ع.) - Omani Rial', symbol: 'ر.ع.' },
  { value: 'JOD', label: 'JOD (د.ا) - Jordanian Dinar', symbol: 'د.ا' },
  { value: 'LBP', label: 'LBP (ل.ل) - Lebanese Pound', symbol: 'ل.ل' },
  { value: 'SYP', label: 'SYP (ل.س) - Syrian Pound', symbol: 'ل.س' },
  { value: 'IQD', label: 'IQD (د.ع) - Iraqi Dinar', symbol: 'د.ع' },
  { value: 'IRR', label: 'IRR (﷼) - Iranian Rial', symbol: '﷼' },
  { value: 'YER', label: 'YER (﷼) - Yemeni Rial', symbol: '﷼' },
  { value: 'ILS', label: 'ILS (₪) - Israeli Shekel', symbol: '₪' },
  { value: 'TRY', label: 'TRY (₺) - Turkish Lira', symbol: '₺' },

  // Africa
  { value: 'ZAR', label: 'ZAR (R) - South African Rand', symbol: 'R' },
  { value: 'EGP', label: 'EGP (ج.م) - Egyptian Pound', symbol: 'ج.م' },
  { value: 'MAD', label: 'MAD (د.م.) - Moroccan Dirham', symbol: 'د.م.' },
  { value: 'DZD', label: 'DZD (د.ج) - Algerian Dinar', symbol: 'د.ج' },
  { value: 'TND', label: 'TND (د.ت) - Tunisian Dinar', symbol: 'د.ت' },
  { value: 'LYD', label: 'LYD (ل.د) - Libyan Dinar', symbol: 'ل.د' },
  { value: 'NGN', label: 'NGN (₦) - Nigerian Naira', symbol: '₦' },
  { value: 'GHS', label: 'GHS (GH₵) - Ghanaian Cedi', symbol: 'GH₵' },
  { value: 'KES', label: 'KES (Sh) - Kenyan Shilling', symbol: 'Sh' },
  { value: 'TZS', label: 'TZS (Sh) - Tanzanian Shilling', symbol: 'Sh' },
  { value: 'UGX', label: 'UGX (Sh) - Ugandan Shilling', symbol: 'Sh' },
  { value: 'ETB', label: 'ETB (Br) - Ethiopian Birr', symbol: 'Br' },
  { value: 'XOF', label: 'XOF (CFA) - West African CFA', symbol: 'CFA' },
  { value: 'XAF', label: 'XAF (FCFA) - Central African CFA', symbol: 'FCFA' },
  { value: 'NAD', label: 'NAD (N$) - Namibian Dollar', symbol: 'N$' },
  { value: 'BWP', label: 'BWP (P) - Botswana Pula', symbol: 'P' },
  { value: 'MUR', label: 'MUR (Rs) - Mauritian Rupee', symbol: 'Rs' },
  { value: 'SCR', label: 'SCR (₨) - Seychellois Rupee', symbol: '₨' },
  { value: 'MGA', label: 'MGA (Ar) - Malagasy Ariary', symbol: 'Ar' },
  { value: 'ZMW', label: 'ZMW (ZK) - Zambian Kwacha', symbol: 'ZK' },
  { value: 'MWK', label: 'MWK (MK) - Malawian Kwacha', symbol: 'MK' },
  { value: 'AOA', label: 'AOA (Kz) - Angolan Kwanza', symbol: 'Kz' },
  { value: 'SDG', label: 'SDG (ج.س) - Sudanese Pound', symbol: 'ج.س' },
  { value: 'RWF', label: 'RWF (FRw) - Rwandan Franc', symbol: 'FRw' },
  { value: 'BIF', label: 'BIF (FBu) - Burundian Franc', symbol: 'FBu' },
  { value: 'DJF', label: 'DJF (Fr) - Djiboutian Franc', symbol: 'Fr' },
  { value: 'SOS', label: 'SOS (Sh) - Somali Shilling', symbol: 'Sh' },
  { value: 'ERN', label: 'ERN (Nfk) - Eritrean Nakfa', symbol: 'Nfk' },
  { value: 'GMD', label: 'GMD (D) - Gambian Dalasi', symbol: 'D' },
  { value: 'SLL', label: 'SLL (Le) - Sierra Leonean Leone', symbol: 'Le' },
  { value: 'LRD', label: 'LRD (L$) - Liberian Dollar', symbol: 'L$' },
  { value: 'GNF', label: 'GNF (Fr) - Guinean Franc', symbol: 'Fr' },
  { value: 'CVE', label: 'CVE ($) - Cape Verdean Escudo', symbol: '$' },
  { value: 'STN', label: 'STN (Db) - São Tomé Dobra', symbol: 'Db' },
  { value: 'KMF', label: 'KMF (Fr) - Comorian Franc', symbol: 'Fr' },
  { value: 'CDF', label: 'CDF (Fr) - Congolese Franc', symbol: 'Fr' },

  // Cryptocurrencies (commonly used in scams)
  { value: 'BTC', label: 'BTC (₿) - Bitcoin', symbol: '₿' },
  { value: 'ETH', label: 'ETH (Ξ) - Ethereum', symbol: 'Ξ' },
  { value: 'USDT', label: 'USDT ($) - Tether', symbol: '$' },
  { value: 'USDC', label: 'USDC ($) - USD Coin', symbol: '$' },
  { value: 'XRP', label: 'XRP (✕) - Ripple', symbol: '✕' },
  { value: 'BNB', label: 'BNB - Binance Coin', symbol: 'BNB' },
  { value: 'SOL', label: 'SOL - Solana', symbol: 'SOL' },
  { value: 'ADA', label: 'ADA - Cardano', symbol: 'ADA' },
  { value: 'DOGE', label: 'DOGE (Ð) - Dogecoin', symbol: 'Ð' },
  { value: 'DOT', label: 'DOT - Polkadot', symbol: 'DOT' },
  { value: 'MATIC', label: 'MATIC - Polygon', symbol: 'MATIC' },
  { value: 'LTC', label: 'LTC (Ł) - Litecoin', symbol: 'Ł' },

  // Other
  { value: 'OTHER', label: 'Iná mena', symbol: '?' },
];

/**
 * Get currencies list with priority currencies at the top
 */
export function getCurrenciesWithPriority(): Currency[] {
  const priorityCodes = new Set(PRIORITY_CURRENCIES.map(c => c.value));
  const otherCurrencies = ALL_CURRENCIES.filter(c => !priorityCodes.has(c.value) && c.value !== 'OTHER');
  const other = ALL_CURRENCIES.find(c => c.value === 'OTHER');

  return [
    ...PRIORITY_CURRENCIES,
    { value: 'SEPARATOR', label: '───────────────', symbol: '' },
    ...otherCurrencies,
    ...(other ? [other] : []),
  ];
}

/**
 * Get currency label by ISO code
 */
export function getCurrencyLabel(code: string): string {
  const currency = ALL_CURRENCIES.find(c => c.value === code);
  return currency?.label || code;
}

/**
 * Get currency symbol by ISO code
 */
export function getCurrencySymbol(code: string): string {
  const currency = ALL_CURRENCIES.find(c => c.value === code);
  return currency?.symbol || code;
}
