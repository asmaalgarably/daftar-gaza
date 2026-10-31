/**
 * Sanitizes and validates Palestinian phone numbers (Jawwal: 059, Ooredoo: 056).
 * Normalizes formats like:
 * - 0599123456
 * - +970599123456
 * - 00972568987654
 * - 059-912-3456
 */
export function sanitizeAndValidatePalestinianPhone(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('رقم هاتف فلسطيني غير صالح');
  }

  // Strip whitespaces, hyphens, and parenthesis
  let cleaned = input.trim().replace(/[\s\-()]/g, '');

  // Handle +970 or +972 prefixes
  if (cleaned.startsWith('+970') || cleaned.startsWith('+972')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00970') || cleaned.startsWith('00972')) {
    cleaned = '0' + cleaned.slice(5);
  }

  // Strictly enforce 10 digits starting with 059 or 056
  const palPhoneRegex = /^0(59|56)\d{7}$/;

  if (!palPhoneRegex.test(cleaned)) {
    throw new Error('رقم هاتف فلسطيني غير صالح');
  }

  return cleaned;
}
