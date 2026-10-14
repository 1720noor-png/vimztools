import { describe, it, expect } from 'vitest';
import {
  generatePassword,
  calculatePasswordEntropy
} from './passwordGenerator.js';

describe('Password Generator & Entropy Engine (passwordGenerator.js)', () => {
  describe('Password Generation', () => {
    it('generates a 16-character password by default with high entropy', () => {
      const res = generatePassword();
      expect(res.password).toHaveLength(16);
      expect(res.length).toBe(16);
      expect(res.entropy).toBeGreaterThanOrEqual(80);
      expect(['Strong', 'Very strong']).toContain(res.strength);
      expect(res.summary).toContain('Generated 16-character password');
    });

    it('generates passwords of custom lengths (e.g. 24 characters)', () => {
      const res = generatePassword({ length: 24 });
      expect(res.password).toHaveLength(24);
      expect(res.entropy).toBeGreaterThan(120);
      expect(res.strength).toBe('Very strong');
    });

    it('respects character set exclusions (digits only)', () => {
      const res = generatePassword({
        length: 10,
        lower: false,
        upper: false,
        symbols: false,
        digits: true
      });
      expect(res.password).toHaveLength(10);
      expect(/^[0-9]+$/.test(res.password)).toBe(true);
    });

    it('avoids ambiguous characters when avoidAmbiguous is true', () => {
      const res = generatePassword({
        length: 32,
        avoidAmbiguous: true
      });
      expect(/[il1Lo0O]/.test(res.password)).toBe(false);
    });
  });

  describe('Entropy & Strength Evaluation', () => {
    it('evaluates weak passwords correctly', () => {
      const entropy = calculatePasswordEntropy('123456');
      expect(entropy.bits).toBeLessThan(45);
      expect(entropy.rating).toBe('Weak');
    });

    it('evaluates strong mixed passwords correctly', () => {
      const entropy = calculatePasswordEntropy('P@ssw0rd!#2026_Secure');
      expect(entropy.bits).toBeGreaterThanOrEqual(100);
      expect(entropy.rating).toBe('Very strong');
    });

    it('handles empty input gracefully', () => {
      const entropy = calculatePasswordEntropy('');
      expect(entropy.bits).toBe(0);
      expect(entropy.rating).toBe('Weak');
    });
  });

  describe('Validation & Constraints', () => {
    it('throws error when length is less than 8', () => {
      expect(() => generatePassword({ length: 5 })).toThrow('between 8 and 128 characters');
    });

    it('throws error when length exceeds 128', () => {
      expect(() => generatePassword({ length: 200 })).toThrow('between 8 and 128 characters');
    });

    it('throws error when all character sets are disabled', () => {
      expect(() => generatePassword({
        lower: false,
        upper: false,
        digits: false,
        symbols: false
      })).toThrow('At least one character type must be selected');
    });
  });
});
