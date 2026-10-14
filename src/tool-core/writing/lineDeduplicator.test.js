import { describe, it, expect } from 'vitest';
import { deduplicateLines } from './lineDeduplicator.js';

describe('Writing Core - lineDeduplicator Engine', () => {
  const sample = 'apple\nbanana\napple\norange\nbanana';

  it('removes duplicate lines preserving original appearance order', () => {
    const res = deduplicateLines(sample);

    expect(res.originalCount).toBe(5);
    expect(res.uniqueCount).toBe(3);
    expect(res.removedCount).toBe(2);
    expect(res.lines).toEqual(['apple', 'banana', 'orange']);
    expect(res.output).toBe('apple\nbanana\norange');
    expect(res.val).toContain('Removed 2 duplicates');
  });

  it('sorts lines ascending (A to Z) when requested', () => {
    const res = deduplicateLines(sample, { sortMode: 'asc' });
    expect(res.lines).toEqual(['apple', 'banana', 'orange']);
  });

  it('sorts lines descending (Z to A) when requested', () => {
    const res = deduplicateLines(sample, { sortMode: 'desc' });
    expect(res.lines).toEqual(['orange', 'banana', 'apple']);
  });

  it('handles case-insensitive deduplication', () => {
    const text = 'Apple\napple\nBANANA\nbanana';
    const res = deduplicateLines(text, { caseSensitive: false });

    expect(res.uniqueCount).toBe(2);
    expect(res.lines).toEqual(['Apple', 'BANANA']);
  });

  it('trims whitespace and removes empty lines by default', () => {
    const text = '  apple  \n\n\n  banana  \n  apple  ';
    const res = deduplicateLines(text);

    expect(res.originalCount).toBe(3);
    expect(res.uniqueCount).toBe(2);
    expect(res.lines).toEqual(['apple', 'banana']);
  });

  it('throws error when non-string input is provided', () => {
    expect(() => deduplicateLines(null)).toThrow('Input text must be a string.');
  });
});
