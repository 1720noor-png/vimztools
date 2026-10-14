/**
 * Pure Word Counter & Text Statistics Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

/**
 * Calculates comprehensive text statistics including word, character, sentence,
 * paragraph counts, and estimated reading and speaking times.
 *
 * @param {string} text - Input text to analyze
 * @param {Object} [options]
 * @param {number} [options.wpmReading=200] - Words per minute for reading speed
 * @param {number} [options.wpmSpeaking=130] - Words per minute for speaking speed
 * @returns {{
 *   words: number,
 *   chars: number,
 *   charsNoSpace: number,
 *   sentences: number,
 *   paragraphs: number,
 *   readingMins: number,
 *   speakingMins: number,
 *   readingTimeFormatted: string,
 *   speakingTimeFormatted: string,
 *   summary: string
 * }}
 */
export function calculateTextStats(text, options = {}) {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string.');
  }

  const wpmReading = Number(options.wpmReading) > 0 ? Number(options.wpmReading) : 200;
  const wpmSpeaking = Number(options.wpmSpeaking) > 0 ? Number(options.wpmSpeaking) : 130;

  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;

  const sentences = trimmed
    ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || (trimmed ? 1 : 0)
    : 0;

  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;

  const readingMins = words > 0 ? words / wpmReading : 0;
  const speakingMins = words > 0 ? words / wpmSpeaking : 0;

  const formatDuration = (m) => {
    if (m === 0) return '0 sec';
    if (m < 1) return `${Math.max(1, Math.round(m * 60))} sec`;
    return `${Math.ceil(m)} min`;
  };

  const readingTimeFormatted = formatDuration(readingMins);
  const speakingTimeFormatted = formatDuration(speakingMins);

  const summary = `Words: ${words} | Characters: ${chars} (${charsNoSpace} without spaces) | Sentences: ${sentences} | Paragraphs: ${paragraphs} | Reading: ${readingTimeFormatted}`;

  return {
    words,
    chars,
    charsNoSpace,
    sentences,
    paragraphs,
    readingMins,
    speakingMins,
    readingTimeFormatted,
    speakingTimeFormatted,
    summary
  };
}
