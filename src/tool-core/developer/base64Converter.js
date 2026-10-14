/**
 * Pure Base64 Encoder / Decoder Engine
 * Full UTF-8 support (emojis, multilingual scripts, symbols).
 * Node.js & Browser compatible.
 */

/**
 * Encodes text into a Base64 string with full UTF-8 support.
 * @param {string} text - Plain text to encode
 * @param {Object} [options]
 * @param {boolean} [options.urlSafe=false] - If true, replaces + with - and / with _, removes padding =
 * @returns {string} Base64 encoded string
 */
export function encodeBase64(text, options = {}) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }
  if (!text) return '';

  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  let encoded = btoa(binary);

  if (options.urlSafe) {
    encoded = encoded
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  return encoded;
}

/**
 * Decodes a Base64 string back into plain UTF-8 text.
 * Handles both standard Base64 and URL-safe Base64 strings.
 * @param {string} base64Text - Base64 string to decode
 * @returns {string} Decoded plain text
 */
export function decodeBase64(base64Text) {
  if (typeof base64Text !== 'string') {
    throw new Error('Input must be a string.');
  }

  const trimmed = base64Text.trim();
  if (!trimmed) return '';

  // Convert URL-safe characters back to standard Base64
  let normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');

  // Add missing padding '='
  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (err) {
    throw new Error('Invalid Base64 input or payload is not valid UTF-8 text.');
  }
}

/**
 * Checks if a string is valid Base64 encoded text.
 * @param {string} text
 * @returns {boolean}
 */
export function isValidBase64(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  try {
    decodeBase64(text);
    return true;
  } catch {
    return false;
  }
}
