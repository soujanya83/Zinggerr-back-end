import crypto from 'crypto';

/**
 * Generates a SHA-256 hash of a token.
 * @param {string} token 
 * @returns {string} Hashed token
 */
export function hashToken(token) {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Securely compares a raw token against a stored hash using timing-safe comparison.
 * @param {string} token - Raw token
 * @param {string} hash - Stored SHA-256 hash
 * @returns {boolean} True if they match
 */
export function compareToken(token, hash) {
  if (!token || !hash) return false;
  const hashedInput = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hash));
}
