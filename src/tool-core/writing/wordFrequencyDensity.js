/**
 * Pure Word Frequency & Keyword Density Analyzer Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

/**
 * Analyzes text to find total words, distinct words, and top keyword density.
 *
 * @param {string} text - Input text to analyze
 * @param {Object} [options]
 * @param {number} [options.minWordLength=3] - Minimum word length to consider as keyword
 * @param {number} [options.topN=5] - Number of top recurring keywords to return
 * @returns {{
 *   totalWords: number,
 *   uniqueWords: number,
 *   keywords: Array<{ word: string, count: number, densityPercent: number }>,
 *   val: string,
 *   summary: string
 * }}
 */
export function analyzeWordFrequency(text, options = {}) {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string.');
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Paste text to analyze.');
  }

  const minLen = Number.isInteger(options.minWordLength) && options.minWordLength >= 1
    ? options.minWordLength
    : 3;

  const topN = Number.isInteger(options.topN) && options.topN >= 1
    ? options.topN
    : 5;

  const words = trimmed.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      keywords: [],
      val: 'Total Words: 0 | Top Keywords: None',
      summary: 'Total Words: 0 | Top Keywords: None'
    };
  }

  const counts = {};
  for (const w of words) {
    if (w.length >= minLen) {
      counts[w] = (counts[w] || 0) + 1;
    }
  }

  const uniqueWords = Object.keys(counts).length;

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const keywords = sorted.map(([word, count]) => {
    const densityPercent = Number(((count / totalWords) * 100).toFixed(1));
    return {
      word,
      count,
      densityPercent
    };
  });

  const topStr = keywords.length > 0
    ? keywords.map((k) => `"${k.word}": ${k.count}x (${k.densityPercent}%)`).join(', ')
    : 'None';

  const val = `Total Words: ${totalWords} | Top Keywords: ${topStr}`;

  return {
    totalWords,
    uniqueWords,
    keywords,
    val,
    summary: val
  };
}
