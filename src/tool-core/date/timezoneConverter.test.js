import { describe, it, expect } from 'vitest';
import {
  convertTimeZone,
  normalizeTimezone,
  COMMON_TIMEZONE_ALIASES
} from './timezoneConverter.js';

describe('Time Zone Converter Engine (timezoneConverter.js)', () => {
  describe('Standard Conversions', () => {
    it('converts 12:00 UTC to PKT (Pakistan Standard Time is UTC+5)', () => {
      const res = convertTimeZone({
        time: '12:00',
        date: '2026-06-15',
        fromZone: 'UTC',
        toZone: 'PKT'
      });
      expect(res.fromZone).toBe('UTC');
      expect(res.toZone).toBe('Asia/Karachi');
      expect(res.convertedTime).toContain('17:00');
      expect(res.dayDiffLabel).toBe('same day');
    });

    it('converts with 12-hour AM/PM formatting enabled', () => {
      const res = convertTimeZone({
        time: '14:30',
        date: '2026-06-15',
        fromZone: 'UTC',
        toZone: 'UTC',
        use12h: true
      });
      expect(res.convertedTime).toContain('02:30');
      expect(res.convertedTime).toMatch(/PM|pm/i);
    });

    it('handles day boundary transitions correctly (+1 day)', () => {
      const res = convertTimeZone({
        time: '23:00',
        date: '2026-06-15',
        fromZone: 'UTC',
        toZone: 'Asia/Tokyo' // UTC+9
      });
      expect(res.dayDifference).toBe(1);
      expect(res.dayDiffLabel).toBe('+1 day');
    });
  });

  describe('Timezone Aliases & Normalization', () => {
    it('maps common abbreviations like "pkt", "est", "pst", "gmt"', () => {
      expect(normalizeTimezone('pkt')).toBe('Asia/Karachi');
      expect(normalizeTimezone('est')).toBe('America/New_York');
      expect(normalizeTimezone('pst')).toBe('America/Los_Angeles');
      expect(normalizeTimezone('gmt')).toBe('UTC');
      expect(normalizeTimezone('bst')).toBe('Europe/London');
    });

    it('defaults to UTC when timezone string is omitted or empty', () => {
      expect(normalizeTimezone(null)).toBe('UTC');
      expect(normalizeTimezone('')).toBe('UTC');
    });

    it('throws error for unsupported timezone string', () => {
      expect(() => normalizeTimezone('Atlantis/City')).toThrow('Unsupported or unrecognized time zone');
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws error for invalid time string', () => {
      expect(() => convertTimeZone({ time: '25:99' })).toThrow('Hours must be 0-23');
      expect(() => convertTimeZone({ time: 'noon' })).toThrow('Invalid time format');
    });
  });
});
