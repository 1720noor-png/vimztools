import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  calculateDateDifference,
  getZodiacSign,
  parseDate
} from './ageCalculator.js';

describe('Age & Date Calculator Engine (ageCalculator.js)', () => {
  describe('Exact Age Calculation', () => {
    it('calculates exact age in years, months, and days for fixed target date', () => {
      const res = calculateAge({
        birthDate: '1995-04-10',
        targetDate: '2026-10-14'
      });
      expect(res.years).toBe(31);
      expect(res.months).toBe(6);
      expect(res.days).toBe(4);
      expect(res.totalDays).toBeGreaterThan(11000);
      expect(res.summary).toContain('31 Years, 6 Months, 4 Days old');
    });

    it('handles same day and month (exact birthday)', () => {
      const res = calculateAge({
        birthDate: '2000-10-14',
        targetDate: '2026-10-14'
      });
      expect(res.years).toBe(26);
      expect(res.months).toBe(0);
      expect(res.days).toBe(0);
      expect(res.nextBirthday.daysUntil).toBe(0);
    });

    it('calculates correct next birthday countdown', () => {
      const res = calculateAge({
        birthDate: '1998-12-25',
        targetDate: '2026-10-14'
      });
      expect(res.nextBirthday.date).toBe('2026-12-25');
      expect(res.nextBirthday.daysUntil).toBe(72);
      expect(res.nextBirthday.dayOfWeek).toBe('Friday');
    });

    it('detects correct Zodiac signs', () => {
      expect(getZodiacSign(3, 25)).toBe('Aries');
      expect(getZodiacSign(7, 15)).toBe('Cancer');
      expect(getZodiacSign(11, 5)).toBe('Scorpio');
      expect(getZodiacSign(1, 5)).toBe('Capricorn');
    });
  });

  describe('Date Difference Calculations', () => {
    it('calculates absolute difference between two dates', () => {
      const diff = calculateDateDifference({
        startDate: '2026-01-01',
        endDate: '2026-01-15'
      });
      expect(diff.days).toBe(14);
      expect(diff.weeks).toBe(2);
      expect(diff.remainingDays).toBe(0);
      expect(diff.summary).toBe('14 days (2 weeks, 0 days)');
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws when birth date is in the future', () => {
      expect(() => calculateAge({
        birthDate: '2030-01-01',
        targetDate: '2026-10-14'
      })).toThrow('Birth date cannot be in the future');
    });

    it('throws when birth date is missing', () => {
      expect(() => calculateAge({})).toThrow('Birth date is required.');
    });

    it('throws on invalid date string format', () => {
      expect(() => parseDate('not-a-date')).toThrow('Invalid date format');
    });
  });
});
