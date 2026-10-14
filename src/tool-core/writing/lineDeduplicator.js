/**
 * Pure Duplicate Line & String Deduplicator Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

/**
 * Strips duplicate lines from a text list, with optional sorting and whitespace cleanup.
 *
 * @param {string} text - Multiline string of items
 * @param {Object} [options]
 * @param {'none'|'asc'|'desc'} [options.sortMode='none'] - Sort ordering
 * @param {boolean} [options.caseSensitive=true] - Whether comparison is case-sensitive
 * @param {boolean} [options.trimLines=true] - Whether to trim leading/trailing line whitespace
 * @param {boolean} [options.removeEmpty=true] - Whether to skip empty lines
 * @returns {{
 *   originalCount: number,
 *   uniqueCount: number,
 *   removedCount: number,
 *   lines: string[],
 *   output: string,
 *   val: string,
 *   summary: string
 * }}
 */
export function deduplicateLines(text, options = {}) {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string.');
  }

  const sortMode = options.sortMode || 'none';
  const caseSensitive = options.caseSensitive !== false;
  const trimLines = options.trimLines !== false;
  const removeEmpty = options.removeEmpty !== false;

  let rawLines = text.split('\n');

  if (trimLines) {
    rawLines = rawLines.map((l) => l.trim());
  }

  if (removeEmpty) {
    rawLines = rawLines.filter((l) => l.length > 0);
  }

  const originalCount = rawLines.length;

  // Deduplicate preserving first-seen order
  const seen = new Set();
  const unique = [];

  for (const line of rawLines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(line);
    }
  }

  if (sortMode === 'asc') {
    unique.sort((a, b) => a.localeCompare(b));
  } else if (sortMode === 'desc') {
    unique.sort((a, b) => b.localeCompare(a));
  }

  const uniqueCount = unique.length;
  const removedCount = originalCount - uniqueCount;
  const output = unique.join('\n');

  const val = `Removed ${removedCount} duplicates. Remaining: ${uniqueCount} unique lines.\n\n${output}`;
  const summary = `Removed ${removedCount} duplicates (${uniqueCount} unique lines remaining).`;

  return {
    originalCount,
    uniqueCount,
    removedCount,
    lines: unique,
    output,
    val,
    summary
  };
}
