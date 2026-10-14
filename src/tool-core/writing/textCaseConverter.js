/**
 * Pure Text Case Converter Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

export const SUPPORTED_CASE_MODES = Object.freeze([
  'upper',
  'lower',
  'title',
  'sentence',
  'camel',
  'snake',
  'kebab',
  'pascal'
]);

/**
 * Normalizes case mode name (e.g. 'UPPERCASE' -> 'upper', 'camelCase' -> 'camel').
 * @param {string} mode
 * @returns {string}
 */
export function normalizeCaseMode(mode) {
  if (typeof mode !== 'string') return 'upper';
  const clean = mode.trim().toLowerCase().replace(/case$/, '');
  if (SUPPORTED_CASE_MODES.includes(clean)) return clean;
  return 'upper';
}

/**
 * Converts text into the specified case format.
 *
 * @param {string} text - Input text
 * @param {string} [mode='upper'] - Target case ('upper', 'lower', 'title', 'sentence', 'camel', 'snake', 'kebab', 'pascal')
 * @returns {{
 *   original: string,
 *   mode: string,
 *   val: string,
 *   summary: string
 * }}
 */
export function convertTextCase(text, mode = 'upper') {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string.');
  }

  const normalizedMode = normalizeCaseMode(mode);
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      original: text,
      mode: normalizedMode,
      val: '',
      summary: 'Converted to ' + normalizedMode + ': (empty)'
    };
  }

  let converted = '';

  switch (normalizedMode) {
    case 'upper':
      converted = text.toUpperCase();
      break;

    case 'lower':
      converted = text.toLowerCase();
      break;

    case 'title':
      converted = text.replace(/\b\w/g, (c) => c.toUpperCase());
      break;

    case 'sentence':
      converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      break;

    case 'camel': {
      // Split on non-alphanumeric, filter empty
      const words = trimmed.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      if (words.length === 0) converted = '';
      else {
        converted = words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      }
      break;
    }

    case 'pascal': {
      const words = trimmed.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      converted = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      break;
    }

    case 'snake':
      converted = trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      break;

    case 'kebab':
      converted = trimmed
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      break;

    default:
      converted = text.toUpperCase();
  }

  return {
    original: text,
    mode: normalizedMode,
    val: converted,
    summary: `Converted to ${normalizedMode}: ${converted}`
  };
}
