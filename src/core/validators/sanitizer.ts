/**
 * Sanitizes generic user text input to defend against XSS and injection attacks.
 */
export function sanitizeTextInput(input: string, maxLength: number = 250): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Strip HTML script tags and dangerous characters
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .trim();

  // Enforce maximum length to prevent buffer exhaustion attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}
