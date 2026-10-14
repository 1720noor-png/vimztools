import { describe, it, expect } from 'vitest';
import { analyzeWordFrequency } from './wordFrequencyDensity.js';

describe('Writing Core - wordFrequencyDensity Engine', () => {
  const sample = 'Search engine optimization is vital for modern websites. Optimization helps content rank higher on search engines.';

  it('analyzes word frequencies and top keywords density', () => {
    const res = analyzeWordFrequency(sample);

    expect(res.totalWords).toBe(16);
    expect(res.uniqueWords).toBeGreaterThan(5);
    expect(res.keywords.length).toBeLessThanOrEqual(5);

    // "optimization" and "search" appear twice
    const optKeyword = res.keywords.find((k) => k.word === 'optimization');
    expect(optKeyword).toBeDefined();
    expect(optKeyword.count).toBe(2);
    expect(optKeyword.densityPercent).toBe(12.5); // (2/16)*100 = 12.5%

    expect(res.val).toContain('Total Words: 16');
    expect(res.val).toContain('Top Keywords:');
  });

  it('respects minWordLength option', () => {
    const text = 'an in on at to go optimization';
    // With default minWordLength=3, words <=2 chars are ignored
    const res = analyzeWordFrequency(text, { minWordLength: 4 });
    expect(res.keywords.length).toBe(1);
    expect(res.keywords[0].word).toBe('optimization');
  });

  it('respects topN limit', () => {
    const text = 'alpha beta gamma delta epsilon zeta eta theta iota';
    const res = analyzeWordFrequency(text, { topN: 3 });
    expect(res.keywords.length).toBe(3);
  });

  it('handles text with no matching words', () => {
    const res = analyzeWordFrequency('... --- !!! ???');
    expect(res.totalWords).toBe(0);
    expect(res.keywords).toEqual([]);
    expect(res.val).toContain('Total Words: 0');
  });

  it('throws error on empty or whitespace string', () => {
    expect(() => analyzeWordFrequency('')).toThrow('Paste text to analyze.');
    expect(() => analyzeWordFrequency('   ')).toThrow('Paste text to analyze.');
  });

  it('throws error when non-string input is provided', () => {
    expect(() => analyzeWordFrequency(null)).toThrow('Input text must be a string.');
  });
});
