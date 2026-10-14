import { describe, it, expect } from 'vitest';
import {
  convertTemperature,
  normalizeTempUnit
} from './temperatureConverter.js';

describe('Temperature Converter Engine (temperatureConverter.js)', () => {
  describe('Conversions from Celsius', () => {
    it('converts freezing point of water (0 °C)', () => {
      const res = convertTemperature({ value: 0, fromUnit: 'c' });
      expect(res.celsius).toBe(0);
      expect(res.fahrenheit).toBe(32);
      expect(res.kelvin).toBe(273.15);
      expect(res.formattedCelsius).toBe('0 °C');
      expect(res.formattedFahrenheit).toBe('32 °F');
      expect(res.formattedKelvin).toBe('273.15 K');
    });

    it('converts boiling point of water (100 °C)', () => {
      const res = convertTemperature({ value: 100, fromUnit: 'c' });
      expect(res.celsius).toBe(100);
      expect(res.fahrenheit).toBe(212);
      expect(res.kelvin).toBe(373.15);
    });

    it('converts room temperature (25 °C)', () => {
      const res = convertTemperature({ value: 25, fromUnit: 'c' });
      expect(res.celsius).toBe(25);
      expect(res.fahrenheit).toBe(77);
      expect(res.kelvin).toBe(298.15);
    });

    it('handles negative temperatures above absolute zero (-40 °C)', () => {
      // At -40, Celsius and Fahrenheit are equal
      const res = convertTemperature({ value: -40, fromUnit: 'c' });
      expect(res.celsius).toBe(-40);
      expect(res.fahrenheit).toBe(-40);
      expect(res.kelvin).toBe(233.15);
    });
  });

  describe('Conversions from Fahrenheit', () => {
    it('converts standard human body temperature (98.6 °F)', () => {
      const res = convertTemperature({ value: 98.6, fromUnit: 'f' });
      expect(res.celsius).toBe(37);
      expect(res.fahrenheit).toBe(98.6);
      expect(res.kelvin).toBe(310.15);
    });

    it('converts freezing point (32 °F)', () => {
      const res = convertTemperature({ value: 32, fromUnit: 'f' });
      expect(res.celsius).toBe(0);
      expect(res.kelvin).toBe(273.15);
    });

    it('converts 212 °F to 100 °C', () => {
      const res = convertTemperature({ value: 212, fromUnit: 'f' });
      expect(res.celsius).toBe(100);
    });
  });

  describe('Conversions from Kelvin', () => {
    it('converts absolute zero (0 K)', () => {
      const res = convertTemperature({ value: 0, fromUnit: 'k' });
      expect(res.kelvin).toBe(0);
      expect(res.celsius).toBe(-273.15);
      expect(res.fahrenheit).toBe(-459.67);
    });

    it('converts 300 K', () => {
      const res = convertTemperature({ value: 300, fromUnit: 'k' });
      expect(res.celsius).toBe(26.85);
      expect(res.fahrenheit).toBe(80.33);
    });
  });

  describe('Unit Normalization & Aliases', () => {
    it('accepts variations of unit strings like "celsius", "°C", "fahrenheit", "kelvin"', () => {
      expect(normalizeTempUnit('celsius')).toBe('c');
      expect(normalizeTempUnit('°C')).toBe('c');
      expect(normalizeTempUnit('fahrenheit')).toBe('f');
      expect(normalizeTempUnit('°F')).toBe('f');
      expect(normalizeTempUnit('kelvin')).toBe('k');
      expect(normalizeTempUnit('K')).toBe('k');
    });

    it('defaults to Celsius when unit is omitted or null', () => {
      expect(normalizeTempUnit(null)).toBe('c');
      expect(normalizeTempUnit('')).toBe('c');
    });

    it('throws on unrecognized temperature unit', () => {
      expect(() => normalizeTempUnit('rankine')).toThrow('Invalid temperature unit');
    });
  });

  describe('Validation & Physical Constraints', () => {
    it('throws error when value is below absolute zero', () => {
      expect(() => convertTemperature({ value: -300, fromUnit: 'c' })).toThrow('absolute zero');
      expect(() => convertTemperature({ value: -500, fromUnit: 'f' })).toThrow('absolute zero');
      expect(() => convertTemperature({ value: -1, fromUnit: 'k' })).toThrow('absolute zero');
    });

    it('throws error when value is missing or NaN', () => {
      expect(() => convertTemperature({})).toThrow('A valid numeric temperature value is required.');
      expect(() => convertTemperature({ value: 'abc' })).toThrow('A valid numeric temperature value is required.');
    });
  });
});
