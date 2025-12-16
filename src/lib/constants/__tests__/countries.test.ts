/**
 * Tests for countries constants
 */

import {
  Country,
  PRIORITY_COUNTRIES,
  ALL_COUNTRIES,
  getCountriesWithPriority,
  getCountryLabel,
} from '../countries';

describe('Countries Constants', () => {
  describe('PRIORITY_COUNTRIES', () => {
    it('should contain Central/Eastern European countries', () => {
      const priorityCodes = PRIORITY_COUNTRIES.map((c) => c.value);

      expect(priorityCodes).toContain('SK'); // Slovakia
      expect(priorityCodes).toContain('CZ'); // Czech Republic
      expect(priorityCodes).toContain('HU'); // Hungary
      expect(priorityCodes).toContain('PL'); // Poland
      expect(priorityCodes).toContain('AT'); // Austria
    });

    it('should have valid ISO 3166-1 alpha-2 codes', () => {
      PRIORITY_COUNTRIES.forEach((country) => {
        // ISO codes should be 2 uppercase letters
        expect(country.value).toMatch(/^[A-Z]{2}$/);
        // Should have a label
        expect(country.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ALL_COUNTRIES', () => {
    it('should contain at least 190 countries', () => {
      // There are ~195 countries in the world
      expect(ALL_COUNTRIES.length).toBeGreaterThanOrEqual(190);
    });

    it('should contain major world countries', () => {
      const countryCodes = ALL_COUNTRIES.map((c) => c.value);

      expect(countryCodes).toContain('US'); // United States
      expect(countryCodes).toContain('GB'); // United Kingdom
      expect(countryCodes).toContain('DE'); // Germany
      expect(countryCodes).toContain('FR'); // France
      expect(countryCodes).toContain('JP'); // Japan
      expect(countryCodes).toContain('CN'); // China
      expect(countryCodes).toContain('AU'); // Australia
      expect(countryCodes).toContain('BR'); // Brazil
      expect(countryCodes).toContain('IN'); // India
    });

    it('should have unique country codes', () => {
      const codes = ALL_COUNTRIES.map((c) => c.value);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should have valid ISO 3166-1 alpha-2 codes or special values', () => {
      ALL_COUNTRIES.forEach((country) => {
        // ISO codes should be 2 uppercase letters, or OTHER
        expect(country.value).toMatch(/^([A-Z]{2}|OTHER)$/);
        // Should have a label
        expect(country.label.length).toBeGreaterThan(0);
      });
    });

    it('should contain OTHER option', () => {
      const hasOther = ALL_COUNTRIES.some((c) => c.value === 'OTHER');
      expect(hasOther).toBe(true);
    });
  });

  describe('getCountriesWithPriority', () => {
    it('should return priority countries first', () => {
      const countries = getCountriesWithPriority();

      // First countries should be from priority list
      const firstCountries = countries.slice(0, PRIORITY_COUNTRIES.length);
      const firstCodes = firstCountries.map((c) => c.value);
      const priorityCodes = PRIORITY_COUNTRIES.map((c) => c.value);

      priorityCodes.forEach((code) => {
        expect(firstCodes).toContain(code);
      });
    });

    it('should include a separator', () => {
      const countries = getCountriesWithPriority();
      const separator = countries.find((c) => c.value === 'SEPARATOR');

      expect(separator).toBeDefined();
      expect(separator?.label).toContain('─');
    });

    it('should have OTHER at the end', () => {
      const countries = getCountriesWithPriority();
      const lastCountry = countries[countries.length - 1];

      expect(lastCountry.value).toBe('OTHER');
    });

    it('should not duplicate priority countries', () => {
      const countries = getCountriesWithPriority();
      const codes = countries.map((c) => c.value).filter((c) => c !== 'SEPARATOR');
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('getCountryLabel', () => {
    it('should return label for valid country code', () => {
      expect(getCountryLabel('SK')).toBe('Slovensko');
      // US and DE have Slovak labels in this dataset
      const usLabel = getCountryLabel('US');
      expect(usLabel.length).toBeGreaterThan(0);
      expect(usLabel).not.toBe('US'); // Should return a label, not the code
    });

    it('should return code for unknown country code', () => {
      expect(getCountryLabel('XX')).toBe('XX');
      expect(getCountryLabel('ZZ')).toBe('ZZ');
    });

    it('should handle OTHER', () => {
      const label = getCountryLabel('OTHER');
      // Label could be in any language (Slovak: "Iné", English: "Other")
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe('OTHER'); // Should return a label, not the code
    });
  });
});

describe('Country Type', () => {
  it('should have required properties', () => {
    const country: Country = { value: 'SK', label: 'Slovakia' };

    expect(country).toHaveProperty('value');
    expect(country).toHaveProperty('label');
  });
});
