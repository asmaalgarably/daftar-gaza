import { describe, it, expect } from 'vitest';
import { sanitizeAndValidatePalestinianPhone, validatePalestinianPhone } from '../../core/validators/phone';

describe('Palestinian Phone Validation (Jawwal & Ooredoo)', () => {
  it('correctly accepts standard 10-digit Jawwal numbers starting with 059', () => {
    const res = validatePalestinianPhone('0599123456');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('0599123456');
    expect(res.network).toBe('جوال (Jawwal)');
  });

  it('correctly accepts standard 10-digit Ooredoo numbers starting with 056', () => {
    const res = validatePalestinianPhone('0568987654');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('0568987654');
    expect(res.network).toBe('أوريدو (Ooredoo)');
  });

  it('normalizes international country codes +970 and +972 to standard 059/056', () => {
    expect(sanitizeAndValidatePalestinianPhone('+970599123456')).toBe('0599123456');
    expect(sanitizeAndValidatePalestinianPhone('+972568987654')).toBe('0568987654');
    expect(sanitizeAndValidatePalestinianPhone('00970599123456')).toBe('0599123456');
    expect(sanitizeAndValidatePalestinianPhone('00972568987654')).toBe('0568987654');
  });

  it('handles spaces, hyphens, and formatting characters', () => {
    const res = validatePalestinianPhone('059-912-3456');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('0599123456');

    const res2 = validatePalestinianPhone('056 898 7654');
    expect(res2.isValid).toBe(true);
    expect(res2.normalized).toBe('0568987654');
  });

  it('rejects invalid prefixes or non-palestinian numbers', () => {
    expect(validatePalestinianPhone('0501234567').isValid).toBe(false);
    expect(validatePalestinianPhone('0521234567').isValid).toBe(false);
    expect(validatePalestinianPhone('0541234567').isValid).toBe(false);
    expect(validatePalestinianPhone('1234567890').isValid).toBe(false);
  });

  it('rejects numbers with incorrect digit length', () => {
    expect(validatePalestinianPhone('05912345').isValid).toBe(false); // 8 digits
    expect(validatePalestinianPhone('05912345678').isValid).toBe(false); // 11 digits
  });

  it('rejects random strings and empty inputs', () => {
    expect(validatePalestinianPhone('').isValid).toBe(false);
    expect(validatePalestinianPhone('abcd-xyz').isValid).toBe(false);
  });
});
