import { describe, it, expect } from 'vitest';
import {
  calculateGeometry,
  SUPPORTED_SHAPES
} from './geometryCalculator.js';

describe('Geometry Calculator Engine (geometryCalculator.js)', () => {
  describe('2D Shapes Calculations', () => {
    it('calculates circle area and circumference with radius 10', () => {
      const res = calculateGeometry({ shape: 'circle', radius: 10 });
      expect(res.is3D).toBe(false);
      expect(res.area).toBeCloseTo(314.1593, 3);
      expect(res.perimeter).toBeCloseTo(62.8319, 3);
      expect(res.volume).toBeNull();
      expect(res.summary).toContain('CIRCLE: Area = 314.1593');
    });

    it('calculates rectangle area and perimeter (10 x 5)', () => {
      const res = calculateGeometry({ shape: 'rectangle', length: 10, width: 5 });
      expect(res.area).toBe(50);
      expect(res.perimeter).toBe(30);
      expect(res.formula).toContain('Area = length × width');
    });

    it('calculates right triangle area and perimeter (base 6, height 8)', () => {
      const res = calculateGeometry({ shape: 'triangle', base: 6, height: 8 });
      expect(res.area).toBe(24);
      expect(res.perimeter).toBe(24); // 6 + 8 + 10
    });
  });

  describe('3D Solids Calculations', () => {
    it('calculates sphere volume and surface area with radius 3', () => {
      const res = calculateGeometry({ shape: 'sphere', radius: 3 });
      expect(res.is3D).toBe(true);
      expect(res.volume).toBeCloseTo(113.0973, 3);
      expect(res.surfaceArea).toBeCloseTo(113.0973, 3);
      expect(res.area).toBeNull();
    });

    it('calculates cylinder volume and surface area (radius 5, height 10)', () => {
      const res = calculateGeometry({ shape: 'cylinder', radius: 5, height: 10 });
      expect(res.volume).toBeCloseTo(785.3982, 3);
      expect(res.surfaceArea).toBeCloseTo(471.2389, 3);
    });

    it('calculates rectangular prism volume and surface area (4 x 5 x 6)', () => {
      const res = calculateGeometry({ shape: 'prism', a: 4, b: 5, c: 6 });
      expect(res.volume).toBe(120);
      expect(res.surfaceArea).toBe(148);
    });
  });

  describe('Parameter Aliases & Flexibility', () => {
    it('accepts generic a, b, c inputs matching UI component state', () => {
      const circleRes = calculateGeometry({ shape: 'circle', a: 7 });
      expect(circleRes.area).toBeCloseTo(153.938, 2);

      const rectRes = calculateGeometry({ shape: 'rectangle', a: 8, b: 4 });
      expect(rectRes.area).toBe(32);
    });

    it('handles uppercase and trimmed shape strings', () => {
      const res = calculateGeometry({ shape: '  SPHERE  ', radius: 2 });
      expect(res.shape).toBe('sphere');
      expect(res.is3D).toBe(true);
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws error for unsupported shape', () => {
      expect(() => calculateGeometry({ shape: 'pentagram' })).toThrow('Unsupported shape');
    });

    it('throws error when dimension is missing or zero', () => {
      expect(() => calculateGeometry({ shape: 'circle', radius: 0 })).toThrow('Circle radius must be greater than 0');
      expect(() => calculateGeometry({ shape: 'rectangle', length: 10, width: 0 })).toThrow('Rectangle length and width must be greater than 0');
      expect(() => calculateGeometry({ shape: 'cylinder', radius: 5, height: 0 })).toThrow('Cylinder radius and height must be greater than 0');
      expect(() => calculateGeometry({ shape: 'prism', a: 1, b: 2, c: 0 })).toThrow('Rectangular prism length, width, and height must be greater than 0');
    });

    it('throws error when dimension is negative', () => {
      expect(() => calculateGeometry({ shape: 'circle', radius: -5 })).toThrow('Shape dimensions cannot be negative');
      expect(() => calculateGeometry({ shape: 'rectangle', length: -10, width: 5 })).toThrow('Shape dimensions cannot be negative');
    });

    it('lists all supported shapes in export', () => {
      expect(SUPPORTED_SHAPES).toContain('circle');
      expect(SUPPORTED_SHAPES).toContain('cylinder');
      expect(SUPPORTED_SHAPES).toContain('prism');
    });
  });
});
