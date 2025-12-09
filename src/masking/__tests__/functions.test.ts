/**
 * Unit tests for masking functions
 * @module __tests__/functions.test
 */

import {
  maskName,
  maskNamePartial,
  maskEmail,
  maskEmailPartial,
  maskPhone,
  maskPhonePartial,
  maskIBAN,
  maskIP,
  maskIPv4,
  maskIPv6,
  maskWallet,
  maskSPZ,
  maskVIN,
  maskAddress,
  maskDate,
  maskAmount,
} from '../functions';
import { Role, MaskingOptions, Address } from '../types';

describe('Name Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask full name correctly', () => {
    expect(maskName('Vladimir Gala', options)).toBe('Vlxxxxr Gxa');
  });

  test('should mask short names', () => {
    expect(maskName('John', options)).toBe('Joxn');
    expect(maskName('Al', options)).toBe('Ax');
    expect(maskName('A', options)).toBe('A');
  });

  test('should handle hyphenated names', () => {
    expect(maskName('Anna-Maria Schmidt', options)).toBe('Anxx-Maxa Scxxxxt');
  });

  test('should handle multiple spaces', () => {
    expect(maskName('John  Doe', options)).toContain('Joxn');
  });

  test('should handle empty string', () => {
    expect(maskName('', options)).toBe('');
  });

  test('should mask name partially', () => {
    expect(maskNamePartial('Vladimir Gala', options)).toBe('Vladimir G.');
  });
});

describe('Email Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask standard email', () => {
    expect(maskEmail('john.doe@example.com', options)).toBe('j*****@example.com');
  });

  test('should mask short local part', () => {
    expect(maskEmail('a@test.com', options)).toBe('a*****@test.com');
  });

  test('should preserve domain', () => {
    const masked = maskEmail('admin@company.co.uk', options);
    expect(masked).toContain('@company.co.uk');
  });

  test('should handle invalid email', () => {
    const masked = maskEmail('notanemail', options);
    expect(masked).toBe('********');
  });

  test('should handle empty string', () => {
    expect(maskEmail('', options)).toBe('');
  });

  test('should mask email partially', () => {
    expect(maskEmailPartial('john.doe@example.com', options)).toBe('joh*****@example.com');
  });
});

describe('Phone Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask Slovak phone number', () => {
    const masked = maskPhone('+421 912 345 678', options);
    expect(masked).toMatch(/\+421 9.. ... 678/);
  });

  test('should mask US phone number', () => {
    const masked = maskPhone('+1 (555) 123-4567', options);
    expect(masked).toContain('+1');
    expect(masked).toContain('567');
  });

  test('should mask international format', () => {
    const masked = maskPhone('00420777888999', options);
    expect(masked).toContain('0042');
    expect(masked).toContain('999');
  });

  test('should handle short phone', () => {
    const masked = maskPhone('12345', options);
    expect(masked).toContain('45');
  });

  test('should handle empty string', () => {
    expect(maskPhone('', options)).toBe('');
  });
});

describe('IBAN Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask Slovak IBAN', () => {
    const masked = maskIBAN('SK89 1100 0000 0029 4912 9426', options);
    expect(masked).toMatch(/^SK89 \*\*\*\*.*\*\*26/);
  });

  test('should mask UK IBAN', () => {
    const masked = maskIBAN('GB82 WEST 1234 5698 7654 32', options);
    expect(masked).toMatch(/^GB82 \*\*\*\*.*\*\*32/);
  });

  test('should mask German IBAN', () => {
    const masked = maskIBAN('DE89 3704 0044 0532 0130 00', options);
    expect(masked).toMatch(/^DE89 \*\*\*\*.*\*\*00/);
  });

  test('should handle short account number', () => {
    const masked = maskIBAN('1234567890', options);
    expect(masked).toContain('1234');
    expect(masked).toContain('90');
  });

  test('should handle empty string', () => {
    expect(maskIBAN('', options)).toBe('');
  });
});

describe('IP Address Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask IPv4 last octet', () => {
    expect(maskIPv4('192.168.1.100', options)).toBe('192.168.1.xxx');
    expect(maskIPv4('8.8.8.8', options)).toBe('8.8.8.xxx');
  });

  test('should mask IPv6', () => {
    const masked = maskIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334', options);
    expect(masked).toContain('2001:0db8');
    expect(masked).toContain('****');
  });

  test('should auto-detect IP version', () => {
    expect(maskIP('192.168.1.100', options)).toBe('192.168.1.xxx');
    expect(maskIP('2001:0db8::1', options)).toContain('****');
  });

  test('should handle loopback addresses', () => {
    expect(maskIPv4('127.0.0.1', options)).toBe('127.0.0.xxx');
  });

  test('should handle empty string', () => {
    expect(maskIP('', options)).toBe('');
  });
});

describe('Crypto Wallet Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask Ethereum address', () => {
    const masked = maskWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f5a3', options);
    expect(masked).toBe('0x742d...f5a3');
  });

  test('should mask Bitcoin address', () => {
    const masked = maskWallet('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', options);
    expect(masked).toBe('1A1zP1...vfNa');
  });

  test('should mask Bitcoin SegWit', () => {
    const masked = maskWallet('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', options);
    expect(masked).toBe('bc1qxy...x0wlh');
  });

  test('should handle short wallet', () => {
    const masked = maskWallet('shortwal', options);
    expect(masked).toContain('...');
  });

  test('should handle empty string', () => {
    expect(maskWallet('', options)).toBe('');
  });
});

describe('SPZ Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask Slovak SPZ', () => {
    expect(maskSPZ('BA123CD', options)).toBe('BA***D');
  });

  test('should mask Hungarian SPZ', () => {
    expect(maskSPZ('KE-987-AB', options)).toBe('KE***B');
  });

  test('should handle short SPZ', () => {
    const masked = maskSPZ('ABC', options);
    expect(masked).toContain('A');
  });

  test('should handle empty string', () => {
    expect(maskSPZ('', options)).toBe('');
  });
});

describe('VIN Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should mask Honda VIN', () => {
    expect(maskVIN('1HGBH41JXMN109186', options)).toBe('1HG***86');
  });

  test('should mask Mazda VIN', () => {
    expect(maskVIN('JM1BL1S55A1234567', options)).toBe('JM1***67');
  });

  test('should handle invalid VIN length', () => {
    const masked = maskVIN('SHORT', options);
    expect(masked).toContain('***');
  });

  test('should handle empty string', () => {
    expect(maskVIN('', options)).toBe('');
  });
});

describe('Address Masking', () => {
  const address: Address = {
    street: 'Hlavná 123',
    city: 'Bratislava',
    postalCode: '841 01',
    country: 'Slovakia',
  };

  test('should mask address for Basic user', () => {
    const masked = maskAddress(address, { role: Role.BASIC });
    expect(masked.country).toBe('Slovakia');
    expect(masked.street).toBeUndefined();
    expect(masked.city).toBeUndefined();
  });

  test('should show city for Standard user', () => {
    const masked = maskAddress(address, { role: Role.STANDARD });
    expect(masked.city).toBe('Bratislava');
    expect(masked.postalCode).toBe('841**');
    expect(masked.street).toBeUndefined();
  });

  test('should show everything for Gold user', () => {
    const masked = maskAddress(address, { role: Role.GOLD });
    expect(masked.street).toBe('Hlavná 123');
    expect(masked.city).toBe('Bratislava');
    expect(masked.postalCode).toBe('841 01');
  });

  test('should handle null address', () => {
    const masked = maskAddress(null as any, { role: Role.BASIC });
    expect(masked).toEqual({});
  });
});

describe('Date Masking', () => {
  const date = new Date('2025-12-09T14:35:22Z');

  test('should mask date for Basic user (month only)', () => {
    const masked = maskDate(date, { role: Role.BASIC });
    expect(masked).toBe('2025-12-XX');
  });

  test('should show full date for Standard user', () => {
    const masked = maskDate(date, { role: Role.STANDARD });
    expect(masked).toBe('2025-12-09');
  });

  test('should show full timestamp for Gold user', () => {
    const masked = maskDate(date, { role: Role.GOLD });
    expect(masked).toContain('2025-12-09');
    expect(masked).toContain('14:35:22');
  });

  test('should handle string date', () => {
    const masked = maskDate('2025-12-09', { role: Role.STANDARD });
    expect(masked).toContain('2025-12-09');
  });

  test('should handle empty date', () => {
    expect(maskDate(null as any, { role: Role.BASIC })).toBe('');
  });
});

describe('Amount Masking', () => {
  const amount = 5432.18;

  test('should show range for Basic user', () => {
    const masked = maskAmount(amount, 'EUR', { role: Role.BASIC });
    expect(masked).toContain('1,000');
    expect(masked).toContain('10,000');
  });

  test('should show rounded for Standard user', () => {
    const masked = maskAmount(amount, 'EUR', { role: Role.STANDARD });
    expect(masked).toContain('5,400');
  });

  test('should show exact for Gold user', () => {
    const masked = maskAmount(amount, 'EUR', { role: Role.GOLD });
    expect(masked).toContain('5,432.18');
  });

  test('should handle different currencies', () => {
    const masked = maskAmount(amount, 'USD', { role: Role.GOLD });
    expect(masked).toContain('USD');
  });

  test('should handle zero amount', () => {
    const masked = maskAmount(0, 'EUR', { role: Role.BASIC });
    expect(masked).toBeDefined();
  });
});

describe('Deterministic Masking', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: true,
    salt: 'test-salt-12345678901234567890123456789012',
  };

  test('should produce same output for same input', () => {
    const input = 'test@example.com';
    const masked1 = maskEmail(input, options);
    const masked2 = maskEmail(input, options);
    expect(masked1).toBe(masked2);
  });

  test('should produce different output for different inputs', () => {
    const masked1 = maskEmail('test1@example.com', options);
    const masked2 = maskEmail('test2@example.com', options);
    expect(masked1).not.toBe(masked2);
  });
});

describe('Edge Cases', () => {
  const options: MaskingOptions = {
    role: Role.BASIC,
    deterministicHash: false,
  };

  test('should handle null values gracefully', () => {
    expect(maskName(null as any, options)).toBe('');
    expect(maskEmail(null as any, options)).toBe('');
    expect(maskPhone(null as any, options)).toBe('');
  });

  test('should handle undefined values gracefully', () => {
    expect(maskName(undefined as any, options)).toBe('');
    expect(maskEmail(undefined as any, options)).toBe('');
    expect(maskPhone(undefined as any, options)).toBe('');
  });

  test('should handle very long strings', () => {
    const longName = 'A'.repeat(1000);
    const masked = maskName(longName, options);
    expect(masked.length).toBeGreaterThan(0);
  });

  test('should handle special characters', () => {
    expect(maskName('Müller Ørsted', options)).toBeDefined();
    expect(maskEmail('test+tag@example.com', options)).toContain('@example.com');
  });
});
