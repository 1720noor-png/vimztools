import { describe, it, expect } from 'vitest';
import { calculateTextStats } from './wordCounter.js';

describe('Writing Core - wordCounter Engine', () => {
  it('calculates statistics for standard multi-word text', () => {
    const text = 'Hello world! This is a test sentence. Here is paragraph two.';
    const stats = calculateTextStats(text);

    expect(stats.words).toBe(11);
    expect(stats.chars).toBe(60);
    expect(stats.charsNoSpace).toBe(50);
    expect(stats.sentences).toBe(3);
    expect(stats.paragraphs).toBe(1);
    expect(stats.readingMins).toBeCloseTo(11 / 200, 4);
    expect(stats.speakingMins).toBeCloseTo(11 / 130, 4);
    expect(stats.readingTimeFormatted).toMatch(/\d+ sec/);
    expect(stats.summary).toContain('Words: 11');
  });

  it('detects multiple paragraphs separated by blank lines', () => {
    const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
    const stats = calculateTextStats(text);

    expect(stats.paragraphs).toBe(3);
    expect(stats.sentences).toBe(3);
    expect(stats.words).toBe(6);
  });

  it('handles empty or whitespace-only text gracefully', () => {
    const emptyStats = calculateTextStats('');
    expect(emptyStats.words).toBe(0);
    expect(emptyStats.chars).toBe(0);
    expect(emptyStats.charsNoSpace).toBe(0);
    expect(emptyStats.sentences).toBe(0);
    expect(emptyStats.paragraphs).toBe(0);
    expect(emptyStats.readingTimeFormatted).toBe('0 sec');

    const spacesStats = calculateTextStats('   \n\t  ');
    expect(spacesStats.words).toBe(0);
    expect(spacesStats.chars).toBe(7);
    expect(spacesStats.charsNoSpace).toBe(0);
  });

  it('formats reading time in minutes for longer text (>200 words)', () => {
    const longText = Array(250).fill('word').join(' ');
    const stats = calculateTextStats(longText);

    expect(stats.words).toBe(250);
    expect(stats.readingMins).toBe(1.25);
    expect(stats.readingTimeFormatted).toBe('2 min');
  });

  it('supports custom reading and speaking speeds', () => {
    const text = 'One two three four five.';
    const stats = calculateTextStats(text, { wpmReading: 100, wpmSpeaking: 60 });

    expect(stats.words).toBe(5);
    expect(stats.readingMins).toBe(0.05);
    expect(stats.speakingMins).toBeCloseTo(5 / 60, 4);
  });

  it('throws error when non-string input is provided', () => {
    expect(() => calculateTextStats(null)).toThrow('Input text must be a string.');
    expect(() => calculateTextStats(12345)).toThrow('Input text must be a string.');
  });
});
