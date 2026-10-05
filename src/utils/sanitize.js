/**
 * Input sanitization and XSS prevention utilities
 */

/**
 * Escapes HTML special characters to prevent XSS injection in raw contexts.
 * @param {string} str - Raw input string
 * @returns {string} Escaped string safe from HTML injection
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };
  return str.replace(/[&<>"'`/]/g, (match) => htmlEscapes[match]);
}

/**
 * Strips script tags, event handlers, and dangerous protocols from user input.
 * @param {string} text - User provided text
 * @returns {string} Clean sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove control characters (except newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers like onclick=, onerror=
    .replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    // Remove data: text/html base64
    .replace(/data\s*:\s*text\/html/gi, '')
    .trim();
}

/**
 * Validates and sanitizes a URL to prevent javascript: or data: injection.
 * @param {string} url - Target URL
 * @returns {string} Sanitized URL or empty string if unsafe
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Safe protocols: http, https, mailto, relative path
  if (/^(https?:\/\/|\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

/**
 * Sanitizes form fields in an object recursively.
 * @param {Record<string, any>} obj - Object containing form fields
 * @returns {Record<string, any>} Sanitized copy of the object
 */
export function sanitizeFormData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'string' ? sanitizeText(item) : sanitizeFormData(item)));
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
