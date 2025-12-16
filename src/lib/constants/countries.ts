/**
 * Complete list of world countries with ISO 3166-1 alpha-2 codes
 * Organized by region with priority countries for Central/Eastern Europe at the top
 */

export interface Country {
  value: string;  // ISO 3166-1 alpha-2 code
  label: string;  // Country name
}

// Priority countries (Central/Eastern Europe - most relevant for this platform)
export const PRIORITY_COUNTRIES: Country[] = [
  { value: 'SK', label: 'Slovensko' },
  { value: 'CZ', label: 'Česká republika' },
  { value: 'PL', label: 'Poľsko' },
  { value: 'HU', label: 'Maďarsko' },
  { value: 'AT', label: 'Rakúsko' },
  { value: 'DE', label: 'Nemecko' },
  { value: 'UA', label: 'Ukrajina' },
];

// All world countries organized alphabetically
export const ALL_COUNTRIES: Country[] = [
  // A
  { value: 'AF', label: 'Afganistan' },
  { value: 'AL', label: 'Albánsko' },
  { value: 'DZ', label: 'Alžírsko' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AG', label: 'Antigua a Barbuda' },
  { value: 'AR', label: 'Argentína' },
  { value: 'AM', label: 'Arménsko' },
  { value: 'AU', label: 'Austrália' },
  { value: 'AT', label: 'Rakúsko' },
  { value: 'AZ', label: 'Azerbajdžan' },
  // B
  { value: 'BS', label: 'Bahamy' },
  { value: 'BH', label: 'Bahrajn' },
  { value: 'BD', label: 'Bangladéš' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Bielorusko' },
  { value: 'BE', label: 'Belgicko' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhután' },
  { value: 'BO', label: 'Bolívia' },
  { value: 'BA', label: 'Bosna a Hercegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BR', label: 'Brazília' },
  { value: 'BN', label: 'Brunej' },
  { value: 'BG', label: 'Bulharsko' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  // C
  { value: 'CV', label: 'Cabo Verde' },
  { value: 'KH', label: 'Kambodža' },
  { value: 'CM', label: 'Kamerun' },
  { value: 'CA', label: 'Kanada' },
  { value: 'CF', label: 'Stredoafrická republika' },
  { value: 'TD', label: 'Čad' },
  { value: 'CL', label: 'Čile' },
  { value: 'CN', label: 'Čína' },
  { value: 'CO', label: 'Kolumbia' },
  { value: 'KM', label: 'Komory' },
  { value: 'CG', label: 'Kongo' },
  { value: 'CD', label: 'Konžská demokratická republika' },
  { value: 'CR', label: 'Kostarika' },
  { value: 'CI', label: 'Pobrežie Slonoviny' },
  { value: 'HR', label: 'Chorvátsko' },
  { value: 'CU', label: 'Kuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Česká republika' },
  // D
  { value: 'DK', label: 'Dánsko' },
  { value: 'DJ', label: 'Džibutsko' },
  { value: 'DM', label: 'Dominika' },
  { value: 'DO', label: 'Dominikánska republika' },
  // E
  { value: 'EC', label: 'Ekvádor' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'Salvádor' },
  { value: 'GQ', label: 'Rovníková Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estónsko' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Etiópia' },
  // F
  { value: 'FJ', label: 'Fidži' },
  { value: 'FI', label: 'Fínsko' },
  { value: 'FR', label: 'Francúzsko' },
  // G
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Gruzínsko' },
  { value: 'DE', label: 'Nemecko' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Grécko' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  // H
  { value: 'HT', label: 'Haiti' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Maďarsko' },
  // I
  { value: 'IS', label: 'Island' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonézia' },
  { value: 'IR', label: 'Irán' },
  { value: 'IQ', label: 'Irak' },
  { value: 'IE', label: 'Írsko' },
  { value: 'IL', label: 'Izrael' },
  { value: 'IT', label: 'Taliansko' },
  // J
  { value: 'JM', label: 'Jamajka' },
  { value: 'JP', label: 'Japonsko' },
  { value: 'JO', label: 'Jordánsko' },
  // K
  { value: 'KZ', label: 'Kazachstan' },
  { value: 'KE', label: 'Keňa' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KP', label: 'Kórejská ľudovodemokratická republika' },
  { value: 'KR', label: 'Kórejská republika' },
  { value: 'KW', label: 'Kuvajt' },
  { value: 'KG', label: 'Kirgizsko' },
  // L
  { value: 'LA', label: 'Laos' },
  { value: 'LV', label: 'Lotyšsko' },
  { value: 'LB', label: 'Libanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Libéria' },
  { value: 'LY', label: 'Líbya' },
  { value: 'LI', label: 'Lichtenštajnsko' },
  { value: 'LT', label: 'Litva' },
  { value: 'LU', label: 'Luxembursko' },
  // M
  { value: 'MG', label: 'Madagaskar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malajzia' },
  { value: 'MV', label: 'Maldivy' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshallove ostrovy' },
  { value: 'MR', label: 'Mauritánia' },
  { value: 'MU', label: 'Maurícius' },
  { value: 'MX', label: 'Mexiko' },
  { value: 'FM', label: 'Mikronézia' },
  { value: 'MD', label: 'Moldavsko' },
  { value: 'MC', label: 'Monako' },
  { value: 'MN', label: 'Mongolsko' },
  { value: 'ME', label: 'Čierna Hora' },
  { value: 'MA', label: 'Maroko' },
  { value: 'MZ', label: 'Mozambik' },
  { value: 'MM', label: 'Mjanmarsko' },
  // N
  { value: 'NA', label: 'Namíbia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepál' },
  { value: 'NL', label: 'Holandsko' },
  { value: 'NZ', label: 'Nový Zéland' },
  { value: 'NI', label: 'Nikaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigéria' },
  { value: 'MK', label: 'Severné Macedónsko' },
  { value: 'NO', label: 'Nórsko' },
  // O
  { value: 'OM', label: 'Omán' },
  // P
  { value: 'PK', label: 'Pakistan' },
  { value: 'PW', label: 'Palau' },
  { value: 'PS', label: 'Palestína' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua-Nová Guinea' },
  { value: 'PY', label: 'Paraguaj' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Filipíny' },
  { value: 'PL', label: 'Poľsko' },
  { value: 'PT', label: 'Portugalsko' },
  // Q
  { value: 'QA', label: 'Katar' },
  // R
  { value: 'RO', label: 'Rumunsko' },
  { value: 'RU', label: 'Rusko' },
  { value: 'RW', label: 'Rwanda' },
  // S
  { value: 'KN', label: 'Svätý Krištof a Nevis' },
  { value: 'LC', label: 'Svätá Lucia' },
  { value: 'VC', label: 'Svätý Vincent a Grenadíny' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Maríno' },
  { value: 'ST', label: 'Svätý Tomáš a Princov ostrov' },
  { value: 'SA', label: 'Saudská Arábia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Srbsko' },
  { value: 'SC', label: 'Seychely' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapur' },
  { value: 'SK', label: 'Slovensko' },
  { value: 'SI', label: 'Slovinsko' },
  { value: 'SB', label: 'Šalamúnove ostrovy' },
  { value: 'SO', label: 'Somálsko' },
  { value: 'ZA', label: 'Južná Afrika' },
  { value: 'SS', label: 'Južný Sudán' },
  { value: 'ES', label: 'Španielsko' },
  { value: 'LK', label: 'Srí Lanka' },
  { value: 'SD', label: 'Sudán' },
  { value: 'SR', label: 'Surinam' },
  { value: 'SE', label: 'Švédsko' },
  { value: 'CH', label: 'Švajčiarsko' },
  { value: 'SY', label: 'Sýria' },
  // T
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tadžikistan' },
  { value: 'TZ', label: 'Tanzánia' },
  { value: 'TH', label: 'Thajsko' },
  { value: 'TL', label: 'Východný Timor' },
  { value: 'TG', label: 'Togo' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad a Tobago' },
  { value: 'TN', label: 'Tunisko' },
  { value: 'TR', label: 'Turecko' },
  { value: 'TM', label: 'Turkménsko' },
  { value: 'TV', label: 'Tuvalu' },
  // U
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukrajina' },
  { value: 'AE', label: 'Spojené arabské emiráty' },
  { value: 'GB', label: 'Veľká Británia' },
  { value: 'US', label: 'Spojené štáty americké' },
  { value: 'UY', label: 'Uruguaj' },
  { value: 'UZ', label: 'Uzbekistan' },
  // V
  { value: 'VU', label: 'Vanuatu' },
  { value: 'VA', label: 'Vatikán' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  // Y
  { value: 'YE', label: 'Jemen' },
  // Z
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
  // Other
  { value: 'OTHER', label: 'Iné' },
];

/**
 * Get countries list with priority countries at the top
 */
export function getCountriesWithPriority(): Country[] {
  const priorityCodes = new Set(PRIORITY_COUNTRIES.map(c => c.value));
  const otherCountries = ALL_COUNTRIES.filter(c => !priorityCodes.has(c.value) && c.value !== 'OTHER');
  const other = ALL_COUNTRIES.find(c => c.value === 'OTHER');

  return [
    ...PRIORITY_COUNTRIES,
    { value: 'SEPARATOR', label: '───────────────' },
    ...otherCountries,
    ...(other ? [other] : []),
  ];
}

/**
 * Get country label by ISO code
 */
export function getCountryLabel(code: string): string {
  const country = ALL_COUNTRIES.find(c => c.value === code);
  return country?.label || code;
}
