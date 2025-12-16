/**
 * Tests for currencies constants
 */

import {
  Currency,
  PRIORITY_CURRENCIES,
  ALL_CURRENCIES,
  getCurrenciesWithPriority,
  getCurrencyLabel,
  getCurrencySymbol,
} from '../currencies';

describe('Currencies Constants', () => {
  describe('PRIORITY_CURRENCIES', () => {
    it('should contain major world currencies', () => {
      const priorityCodes = PRIORITY_CURRENCIES.map((c) => c.value);

      expect(priorityCodes).toContain('EUR'); // Euro
      expect(priorityCodes).toContain('USD'); // US Dollar
      expect(priorityCodes).toContain('GBP'); // British Pound
      expect(priorityCodes).toContain('CZK'); // Czech Koruna
    });

    it('should have valid ISO 4217 currency codes', () => {
      PRIORITY_CURRENCIES.forEach((currency) => {
        // ISO codes should be 3 uppercase letters
        expect(currency.value).toMatch(/^[A-Z]{3}$/);
        // Should have a label with symbol
        expect(currency.label.length).toBeGreaterThan(0);
        // Should have a symbol
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });

    it('should have symbols for all priority currencies', () => {
      expect(PRIORITY_CURRENCIES.find((c) => c.value === 'EUR')?.symbol).toBe('€');
      expect(PRIORITY_CURRENCIES.find((c) => c.value === 'USD')?.symbol).toBe('$');
      expect(PRIORITY_CURRENCIES.find((c) => c.value === 'GBP')?.symbol).toBe('£');
    });
  });

  describe('ALL_CURRENCIES', () => {
    it('should contain at least 100 currencies', () => {
      // There are ~150+ currencies globally
      expect(ALL_CURRENCIES.length).toBeGreaterThanOrEqual(100);
    });

    it('should contain cryptocurrencies', () => {
      const currencyCodes = ALL_CURRENCIES.map((c) => c.value);

      expect(currencyCodes).toContain('BTC'); // Bitcoin
      expect(currencyCodes).toContain('ETH'); // Ethereum
      expect(currencyCodes).toContain('USDT'); // Tether
    });

    it('should contain major fiat currencies', () => {
      const currencyCodes = ALL_CURRENCIES.map((c) => c.value);

      expect(currencyCodes).toContain('JPY'); // Japanese Yen
      expect(currencyCodes).toContain('CHF'); // Swiss Franc
      expect(currencyCodes).toContain('AUD'); // Australian Dollar
      expect(currencyCodes).toContain('CAD'); // Canadian Dollar
      expect(currencyCodes).toContain('CNY'); // Chinese Yuan
      expect(currencyCodes).toContain('INR'); // Indian Rupee
    });

    it('should have unique currency codes', () => {
      const codes = ALL_CURRENCIES.map((c) => c.value);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should have valid currency code format', () => {
      ALL_CURRENCIES.forEach((currency) => {
        // Currency codes should be 3-5 uppercase letters (allows crypto like USDT)
        expect(currency.value).toMatch(/^([A-Z]{3,5}|OTHER)$/);
        // Should have a label
        expect(currency.label.length).toBeGreaterThan(0);
        // Should have a symbol
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });

    it('should contain OTHER option', () => {
      const hasOther = ALL_CURRENCIES.some((c) => c.value === 'OTHER');
      expect(hasOther).toBe(true);
    });
  });

  describe('getCurrenciesWithPriority', () => {
    it('should return priority currencies first', () => {
      const currencies = getCurrenciesWithPriority();

      // First currencies should be from priority list
      const firstCurrencies = currencies.slice(0, PRIORITY_CURRENCIES.length);
      const firstCodes = firstCurrencies.map((c) => c.value);
      const priorityCodes = PRIORITY_CURRENCIES.map((c) => c.value);

      priorityCodes.forEach((code) => {
        expect(firstCodes).toContain(code);
      });
    });

    it('should include a separator', () => {
      const currencies = getCurrenciesWithPriority();
      const separator = currencies.find((c) => c.value === 'SEPARATOR');

      expect(separator).toBeDefined();
      expect(separator?.label).toContain('─');
    });

    it('should have OTHER at the end', () => {
      const currencies = getCurrenciesWithPriority();
      const lastCurrency = currencies[currencies.length - 1];

      expect(lastCurrency.value).toBe('OTHER');
    });

    it('should not duplicate priority currencies', () => {
      const currencies = getCurrenciesWithPriority();
      const codes = currencies.map((c) => c.value).filter((c) => c !== 'SEPARATOR');
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('getCurrencyLabel', () => {
    it('should return label for valid currency code', () => {
      const eurLabel = getCurrencyLabel('EUR');
      expect(eurLabel).toContain('EUR');
      expect(eurLabel).toContain('€');

      const usdLabel = getCurrencyLabel('USD');
      expect(usdLabel).toContain('USD');
      expect(usdLabel).toContain('$');
    });

    it('should return code for unknown currency code', () => {
      expect(getCurrencyLabel('XXX')).toBe('XXX');
      expect(getCurrencyLabel('ZZZ')).toBe('ZZZ');
    });

    it('should handle cryptocurrency', () => {
      const btcLabel = getCurrencyLabel('BTC');
      expect(btcLabel).toContain('Bitcoin');

      const ethLabel = getCurrencyLabel('ETH');
      expect(ethLabel).toContain('Ethereum');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return symbol for valid currency code', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('GBP')).toBe('£');
      expect(getCurrencySymbol('JPY')).toBe('¥');
    });

    it('should return code for unknown currency code', () => {
      expect(getCurrencySymbol('XXX')).toBe('XXX');
    });

    it('should return symbol for cryptocurrency', () => {
      expect(getCurrencySymbol('BTC')).toBe('₿');
      expect(getCurrencySymbol('ETH')).toBe('Ξ');
    });
  });
});

describe('Currency Type', () => {
  it('should have required properties', () => {
    const currency: Currency = { value: 'EUR', label: 'Euro', symbol: '€' };

    expect(currency).toHaveProperty('value');
    expect(currency).toHaveProperty('label');
    expect(currency).toHaveProperty('symbol');
  });
});
