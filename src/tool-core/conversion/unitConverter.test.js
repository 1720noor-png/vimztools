import { describe, it, expect } from 'vitest';
import {
  convertUnit,
  resolveUnit,
  getUnitCategories,
  UNIT_CATEGORIES
} from './unitConverter.js';

describe('Universal Unit Converter Engine (unitConverter.js)', () => {
  describe('Length Conversions', () => {
    it('converts 10 kilometers to miles accurately', () => {
      const res = convertUnit({ value: 10, fromUnit: 'km', toUnit: 'mi' });
      expect(res.category).toBe('length');
      expect(res.result).toBeCloseTo(6.21371, 4);
      expect(res.summary).toContain('10 km = 6.213712 mi');
    });

    it('converts 1 meter to centimeters', () => {
      const res = convertUnit({ value: 1, fromUnit: 'm', toUnit: 'cm' });
      expect(res.result).toBe(100);
      expect(res.resultFormatted).toBe('100');
    });

    it('converts inches to feet', () => {
      const res = convertUnit({ value: 24, fromUnit: 'in', toUnit: 'ft' });
      expect(res.result).toBe(2);
      expect(res.resultFormatted).toBe('2');
    });

    it('converts yards to meters', () => {
      const res = convertUnit({ value: 100, fromUnit: 'yd', toUnit: 'm' });
      expect(res.result).toBeCloseTo(91.44, 2);
    });
  });

  describe('Mass & Weight Conversions', () => {
    it('converts 1 kilogram to pounds', () => {
      const res = convertUnit({ value: 1, fromUnit: 'kg', toUnit: 'lb' });
      expect(res.category).toBe('mass');
      expect(res.result).toBeCloseTo(2.20462, 4);
    });

    it('converts 500 grams to kilograms', () => {
      const res = convertUnit({ value: 500, fromUnit: 'g', toUnit: 'kg' });
      expect(res.result).toBe(0.5);
      expect(res.resultFormatted).toBe('0.5');
    });

    it('converts ounces to grams', () => {
      const res = convertUnit({ value: 16, fromUnit: 'oz', toUnit: 'lb' });
      expect(res.result).toBeCloseTo(1, 4);
    });

    it('converts metric tons to kilograms', () => {
      const res = convertUnit({ value: 2.5, fromUnit: 'ton', toUnit: 'kg' });
      expect(res.result).toBe(2500);
    });
  });

  describe('Speed Conversions', () => {
    it('converts 100 km/h to mph', () => {
      const res = convertUnit({ value: 100, fromUnit: 'kmh', toUnit: 'mph' });
      expect(res.category).toBe('speed');
      expect(res.result).toBeCloseTo(62.1371, 4);
    });

    it('converts meters per second to km/h', () => {
      const res = convertUnit({ value: 10, fromUnit: 'ms', toUnit: 'kmh' });
      expect(res.result).toBe(36);
    });

    it('converts knots to km/h', () => {
      const res = convertUnit({ value: 20, fromUnit: 'knot', toUnit: 'kmh' });
      expect(res.result).toBeCloseTo(37.04, 2);
    });
  });

  describe('Area Conversions', () => {
    it('converts 1 hectare to square meters', () => {
      const res = convertUnit({ value: 1, fromUnit: 'ha', toUnit: 'sqm' });
      expect(res.result).toBe(10000);
    });

    it('converts 1 acre to square feet', () => {
      const res = convertUnit({ value: 1, fromUnit: 'acre', toUnit: 'sqft' });
      expect(res.result).toBeCloseTo(43560, 0);
    });

    it('converts square meters to square feet', () => {
      const res = convertUnit({ value: 100, fromUnit: 'sqm', toUnit: 'sqft' });
      expect(res.result).toBeCloseTo(1076.39, 1);
    });
  });

  describe('Volume Conversions', () => {
    it('converts 1 US gallon to liters', () => {
      const res = convertUnit({ value: 1, fromUnit: 'gal', toUnit: 'l' });
      expect(res.result).toBeCloseTo(3.78541, 4);
    });

    it('converts 1000 milliliters to liters', () => {
      const res = convertUnit({ value: 1000, fromUnit: 'ml', toUnit: 'l' });
      expect(res.result).toBe(1);
    });

    it('converts cups to fluid ounces', () => {
      const res = convertUnit({ value: 2, fromUnit: 'cup', toUnit: 'floz' });
      expect(res.result).toBeCloseTo(16, 0);
    });
  });

  describe('Alias Resolution & Formatting', () => {
    it('resolves unit aliases like "kilometers" and "miles"', () => {
      const res = convertUnit({ value: '5', fromUnit: 'kilometers', toUnit: 'miles' });
      expect(res.fromUnit).toBe('km');
      expect(res.toUnit).toBe('mi');
      expect(res.result).toBeCloseTo(3.10686, 4);
    });

    it('resolves weight aliases like "pounds" and "kilos"', () => {
      const res = convertUnit({ value: 150, fromUnit: 'pounds', toUnit: 'kg' });
      expect(res.fromUnit).toBe('lb');
      expect(res.toUnit).toBe('kg');
      expect(res.result).toBeCloseTo(68.0389, 3);
    });

    it('resolves speed aliases like "km/h" and "mph"', () => {
      const res = convertUnit({ value: 60, fromUnit: 'km/h', toUnit: 'mph' });
      expect(res.fromUnit).toBe('kmh');
      expect(res.toUnit).toBe('mph');
    });

    it('formats integers cleanly without trailing decimals', () => {
      const res = convertUnit({ value: 5, fromUnit: 'km', toUnit: 'm' });
      expect(res.resultFormatted).toBe('5000');
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws when value is missing or NaN', () => {
      expect(() => convertUnit({ fromUnit: 'km', toUnit: 'mi' })).toThrow('A valid numeric value is required.');
      expect(() => convertUnit({ value: 'abc', fromUnit: 'km', toUnit: 'mi' })).toThrow('A valid numeric value is required.');
    });

    it('throws when fromUnit or toUnit is missing', () => {
      expect(() => convertUnit({ value: 10, fromUnit: '', toUnit: 'mi' })).toThrow('Both source unit');
      expect(() => convertUnit({ value: 10, fromUnit: 'km', toUnit: '' })).toThrow('Both source unit');
    });

    it('throws when unit is unrecognized', () => {
      expect(() => convertUnit({ value: 10, fromUnit: 'nonexistent', toUnit: 'mi' })).toThrow('Unknown source unit');
    });

    it('throws when trying to convert between incompatible categories', () => {
      expect(() => convertUnit({ value: 10, fromUnit: 'km', toUnit: 'kg' })).toThrow('Cannot convert between incompatible categories');
    });
  });

  describe('Helper Functions', () => {
    it('resolveUnit returns null for invalid input', () => {
      expect(resolveUnit(null)).toBeNull();
      expect(resolveUnit('')).toBeNull();
      expect(resolveUnit(123)).toBeNull();
      expect(resolveUnit('invalid-unit-xyz')).toBeNull();
    });

    it('getUnitCategories returns all configured categories', () => {
      const cats = getUnitCategories();
      expect(cats.length).toBe(Object.keys(UNIT_CATEGORIES).length);
      expect(cats.map(c => c.key)).toContain('length');
      expect(cats.map(c => c.key)).toContain('mass');
      expect(cats.map(c => c.key)).toContain('speed');
    });
  });
});
