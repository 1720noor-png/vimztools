import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64, isValidBase64 } from './base64Converter.js';

describe('Developer Core - base64Converter Engine', () => {
  describe('encodeBase64', () => {
    it('encodes simple ASCII strings correctly', () => {
      expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
      expect(encodeBase64('')).toBe('');
    });

    it('encodes UTF-8 multilingual characters correctly', () => {
      // Urdu / Arabic
      const urdu = 'سلام';
      const encoded = encodeBase64(urdu);
      expect(decodeBase64(encoded)).toBe(urdu);

      // Emojis
      const emojis = '🔥🚀✨';
      const emojiEncoded = encodeBase64(emojis);
      expect(decodeBase64(emojiEncoded)).toBe(emojis);
    });

    it('supports URL-safe encoding without +, / or padding =', () => {
      // Input chosen to produce + and / in standard Base64
      const input = 'subjects?_d=1&test=true+val';
      const standard = encodeBase64(input);
      const urlSafe = encodeBase64(input, { urlSafe: true });

      expect(urlSafe).not.toContain('+');
      expect(urlSafe).not.toContain('/');
      expect(urlSafe).not.toMatch(/=+$/);

      // Can decode URL-safe back to original
      expect(decodeBase64(urlSafe)).toBe(input);
    });

    it('throws error when non-string input is provided', () => {
      expect(() => encodeBase64(123)).toThrow('Input must be a string.');
      expect(() => encodeBase64(null)).toThrow('Input must be a string.');
    });
  });

  describe('decodeBase64', () => {
    it('decodes standard Base64 correctly', () => {
      expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
      expect(decodeBase64('')).toBe('');
    });

    it('decodes strings without padding =', () => {
      expect(decodeBase64('SGVsbG8sIFdvcmxkIQ')).toBe('Hello, World!');
    });

    it('decodes URL-safe strings with - and _', () => {
      const input = 'subjects?_d=1&test=true+val';
      const urlSafe = encodeBase64(input, { urlSafe: true });
      expect(decodeBase64(urlSafe)).toBe(input);
    });

    it('throws descriptive error on invalid base64 input', () => {
      expect(() => decodeBase64('Not Valid Base64!@#$')).toThrow(/Invalid Base64 input/);
    });

    it('throws error when non-string input is provided', () => {
      expect(() => decodeBase64(null)).toThrow('Input must be a string.');
    });
  });

  describe('isValidBase64', () => {
    it('returns true for valid base64 strings', () => {
      expect(isValidBase64('SGVsbG8sIFdvcmxkIQ==')).toBe(true);
      expect(isValidBase64('SGVsbG8=')).toBe(true);
    });

    it('returns false for invalid base64 strings or empty input', () => {
      expect(isValidBase64('!!!not-base64???')).toBe(false);
      expect(isValidBase64('')).toBe(false);
      expect(isValidBase64(null)).toBe(false);
    });
  });
});
