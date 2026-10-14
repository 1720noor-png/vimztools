/**
 * Pure JSON Formatter, Minifier & Validator Engine
 * Zero external dependencies. Browser & Node.js cross-compatible.
 */

/**
 * Parses and formats a JSON string with customizable indentation.
 * @param {string} input - JSON string to format
 * @param {number|string} [indent=2] - Indent spaces (e.g., 2, 4) or 'tab'
 * @returns {string} Formatted JSON string
 */
export function formatJson(input, indent = 2) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Input must be a non-empty string.');
  }

  let indentValue = 2;
  if (indent === 'tab' || indent === '\t') {
    indentValue = '\t';
  } else {
    const num = Number(indent);
    indentValue = Number.isInteger(num) && num >= 0 ? num : 2;
  }

  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, indentValue);
  } catch (err) {
    const errorDetails = extractJsonErrorDetails(input, err.message);
    throw new Error(`Invalid JSON: ${err.message}${errorDetails ? ` (${errorDetails})` : ''}`);
  }
}

/**
 * Minifies a JSON string by removing all unnecessary whitespace.
 * @param {string} input - JSON string to minify
 * @returns {string} Compact single-line JSON string
 */
export function minifyJson(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Input must be a non-empty string.');
  }

  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch (err) {
    const errorDetails = extractJsonErrorDetails(input, err.message);
    throw new Error(`Invalid JSON: ${err.message}${errorDetails ? ` (${errorDetails})` : ''}`);
  }
}

/**
 * Validates a JSON string and extracts structural metadata or error locations.
 * @param {string} input - JSON string to validate
 * @returns {{ valid: boolean, parsed?: any, summary?: string, error?: string, line?: number, column?: number }}
 */
export function validateJson(input) {
  if (typeof input !== 'string' || !input.trim()) {
    return {
      valid: false,
      error: 'Empty or non-string input provided.'
    };
  }

  try {
    const parsed = JSON.parse(input);
    let summary = 'primitive value';
    if (parsed === null) {
      summary = 'null';
    } else if (Array.isArray(parsed)) {
      summary = `array with ${parsed.length} item(s)`;
    } else if (typeof parsed === 'object') {
      summary = `object with ${Object.keys(parsed).length} key(s)`;
    } else {
      summary = typeof parsed;
    }

    return {
      valid: true,
      parsed,
      summary: `Valid JSON (${summary}).`
    };
  } catch (err) {
    const posMatch = /position (\d+)/.exec(err.message);
    let line;
    let column;

    if (posMatch) {
      const charIndex = Number(posMatch[1]);
      const precedingText = input.slice(0, charIndex);
      const lines = precedingText.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      valid: false,
      error: err.message,
      line,
      column,
      positionDescription: line && column ? `line ${line}, column ${column}` : undefined
    };
  }
}

/**
 * Helper to calculate line and column from JSON error message
 */
function extractJsonErrorDetails(raw, message) {
  const match = /position (\d+)/.exec(message);
  if (!match) return '';
  const charIndex = Number(match[1]);
  const preceding = raw.slice(0, charIndex).split('\n');
  const line = preceding.length;
  const col = preceding[preceding.length - 1].length + 1;
  return `line ${line}, column ${col}`;
}
