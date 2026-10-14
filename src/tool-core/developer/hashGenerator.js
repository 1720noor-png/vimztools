/**
 * Pure Cryptographic Hash Generator Engine
 * Uses Web Crypto API (crypto.subtle.digest).
 * Cross-environment: Node.js (v18+) & modern browsers.
 */

export const SUPPORTED_HASH_ALGORITHMS = Object.freeze([
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512'
]);

/**
 * Normalizes algorithm name to standard uppercase (e.g., 'sha256' -> 'SHA-256').
 * @param {string} alg
 * @returns {string}
 */
export function normalizeAlgorithm(alg) {
  if (typeof alg !== 'string') return 'SHA-256';
  const clean = alg.trim().toUpperCase().replace(/_/g, '-');
  if (clean === 'SHA1' || clean === 'SHA-1') return 'SHA-1';
  if (clean === 'SHA256' || clean === 'SHA-256') return 'SHA-256';
  if (clean === 'SHA384' || clean === 'SHA-384') return 'SHA-384';
  if (clean === 'SHA512' || clean === 'SHA-512') return 'SHA-512';
  return clean;
}

/**
 * Generates a cryptographic hash hex digest for the given input text.
 * @param {string} text - Input text to hash
 * @param {string} [algorithm='SHA-256'] - Hash algorithm ('SHA-1', 'SHA-256', 'SHA-384', 'SHA-512')
 * @returns {Promise<string>} Hexadecimal digest string
 */
export async function generateHash(text, algorithm = 'SHA-256') {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string.');
  }

  const normalizedAlg = normalizeAlgorithm(algorithm);
  if (!SUPPORTED_HASH_ALGORITHMS.includes(normalizedAlg)) {
    throw new Error(`Unsupported hash algorithm: "${algorithm}". Supported: ${SUPPORTED_HASH_ALGORITHMS.join(', ')}`);
  }

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available in this environment.');
  }

  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await subtle.digest(normalizedAlg, encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies whether input text matches an expected hash digest.
 * @param {string} text - Input text
 * @param {string} expectedHash - Hex hash to compare against
 * @param {string} [algorithm='SHA-256']
 * @returns {Promise<boolean>}
 */
export async function verifyHash(text, expectedHash, algorithm = 'SHA-256') {
  if (!expectedHash || typeof expectedHash !== 'string') return false;
  try {
    const computed = await generateHash(text, algorithm);
    return computed.toLowerCase() === expectedHash.trim().toLowerCase();
  } catch {
    return false;
  }
}
