import { describe, it, expect } from 'vitest';
import {
  convertPxToUnits,
  convertRemToPx
} from './pxRemConverter.js';

describe('CSS Px to Rem & Em Converter Engine (pxRemConverter.js)', () => {
  describe('Standard 16px Base Conversions', () => {
    it('converts base 16px to 1rem', () => {
      const res = convertPxToUnits({ px: 16, basePx: 16 });
      expect(res.rem).toBe(1);
      expect(res.em).toBe(1);
      expect(res.formattedRem).toBe('1rem');
      expect(res.formattedEm).toBe('1em');
      expect(res.percentage).toBe(100);
      expect(res.pt).toBe(12);
      expect(res.cssSnippet).toBe('font-size: 1rem; /* 16px at base 16px */');
    });

    it('converts 24px to 1.5rem', () => {
      const res = convertPxToUnits({ px: 24, basePx: 16 });
      expect(res.rem).toBe(1.5);
      expect(res.formattedRem).toBe('1.5rem');
      expect(res.summary).toBe('24px = 1.5rem (base: 16px)');
    });

    it('converts 8px to 0.5rem', () => {
      const res = convertPxToUnits({ px: 8 });
      expect(res.rem).toBe(0.5);
      expect(res.formattedRem).toBe('0.5rem');
    });

    it('converts zero pixels to 0rem', () => {
      const res = convertPxToUnits({ px: 0 });
      expect(res.rem).toBe(0);
      expect(res.formattedRem).toBe('0rem');
    });
  });

  describe('Custom Base Font Sizes', () => {
    it('converts with 10px base (e.g., 62.5% root setup)', () => {
      const res = convertPxToUnits({ px: 16, basePx: 10 });
      expect(res.rem).toBe(1.6);
      expect(res.formattedRem).toBe('1.6rem');
    });

    it('converts with 14px base', () => {
      const res = convertPxToUnits({ px: 28, basePx: 14 });
      expect(res.rem).toBe(2);
      expect(res.formattedRem).toBe('2rem');
    });
  });

  describe('Reverse Conversion (Rem to Px)', () => {
    it('converts 1.5rem to 24px with default 16px base', () => {
      const res = convertRemToPx({ rem: 1.5, basePx: 16 });
      expect(res.px).toBe(24);
      expect(res.formattedPx).toBe('24px');
      expect(res.summary).toBe('1.5rem = 24px (base: 16px)');
    });

    it('converts 2rem to 20px with 10px base', () => {
      const res = convertRemToPx({ rem: 2, basePx: 10 });
      expect(res.px).toBe(20);
      expect(res.formattedPx).toBe('20px');
    });
  });

  describe('Validation & Edge Cases', () => {
    it('throws error when pixel value is missing or NaN', () => {
      expect(() => convertPxToUnits({})).toThrow('A valid pixel value is required.');
      expect(() => convertPxToUnits({ px: 'abc' })).toThrow('A valid pixel value is required.');
    });

    it('throws error when basePx is zero or negative', () => {
      expect(() => convertPxToUnits({ px: 16, basePx: 0 })).toThrow('Base root font size must be a positive number');
      expect(() => convertPxToUnits({ px: 16, basePx: -5 })).toThrow('Base root font size must be a positive number');
    });

    it('throws error in convertRemToPx when rem is missing or NaN', () => {
      expect(() => convertRemToPx({})).toThrow('A valid REM value is required.');
      expect(() => convertRemToPx({ rem: 'xyz' })).toThrow('A valid REM value is required.');
    });
  });
});
