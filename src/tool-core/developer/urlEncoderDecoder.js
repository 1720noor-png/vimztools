/**
 * Pure URL Encoder / Decoder & Query Parameter Engine
 * Zero dependencies. Node.js & Browser compatible.
 */

/**
 * Encodes text or parameter value using percent-encoding (encodeURIComponent).
 * Suitable for query parameters and form fields.
 * @param {string} text - Raw string to encode
 * @returns {string} Percent-encoded string
 */
export function encodeUrlText(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }
  return encodeURIComponent(text);
}

/**
 * Encodes a full URL, preserving protocol and structural characters (encodeURI).
 * Suitable for entire URLs (e.g., https://example.com/path with spaces).
 * @param {string} url - Full URL string
 * @returns {string} Encoded URL
 */
export function encodeFullUrl(url) {
  if (typeof url !== 'string') {
    throw new Error('Input must be a string.');
  }
  try {
    return encodeURI(url.trim());
  } catch (err) {
    throw new Error('This text contains an invalid character sequence.');
  }
}

/**
 * Decodes percent-encoded URLs or text.
 * @param {string} encoded - Encoded string
 * @returns {string} Decoded plain text / URL
 */
export function decodeUrl(encoded) {
  if (typeof encoded !== 'string') {
    throw new Error('Input must be a string.');
  }
  try {
    return decodeURIComponent(encoded.trim());
  } catch (err) {
    throw new Error('This is not valid percent-encoding (for example a stray % sign).');
  }
}

/**
 * Parses query parameters from a URL or query string into a structured object and array.
 * @param {string} input - URL or query string (e.g., "https://example.com?foo=bar&baz=123" or "foo=bar&baz=123")
 * @returns {{ params: Record<string, string>, list: Array<{ key: string, value: string }> }}
 */
export function parseUrlQueryParams(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.');
  }

  const queryPart = input.includes('?') ? input.split('?')[1] : (input.startsWith('?') ? input.slice(1) : input);
  const searchParams = new URLSearchParams(queryPart);
  const params = {};
  const list = [];

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
    list.push({ key, value });
  }

  return { params, list };
}

/**
 * Builds a query string from key-value pairs.
 * @param {Record<string, any> | Array<{ key: string, value: any }>} params
 * @returns {string} Formatted query string (without leading '?')
 */
export function buildQueryString(params) {
  if (!params || typeof params !== 'object') {
    throw new Error('Params must be an object or array.');
  }

  const searchParams = new URLSearchParams();

  if (Array.isArray(params)) {
    for (const item of params) {
      if (item && item.key) {
        searchParams.append(String(item.key), String(item.value ?? ''));
      }
    }
  } else {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
  }

  return searchParams.toString();
}
