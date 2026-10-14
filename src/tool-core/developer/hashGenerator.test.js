import { describe, it, expect } from 'vitest';
import {
  generateHash,
  verifyHash,
  normalizeAlgorithm,
  SUPPORTED_HASH_ALGORITHMS
} from './hashGenerator.js';

describe('Developer Core - hashGenerator Engine', () => {
  describe('SUPPORTED_HASH_ALGORITHMS', () => {
    it('contains standard SHA algorithms', () => {
      expect(SUPPORTED_HASH_ALGORITHMS).toEqual(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
    });
  });

  describe('normalizeAlgorithm', () => {
    it('normalizes various casing and hyphenation formats', () => {
      expect(normalizeAlgorithm('sha256')).toBe('SHA-256');
      expect(normalizeAlgorithm('SHA-256')).toBe('SHA-256');
      expect(normalizeAlgorithm('sha_1')).toBe('SHA-1');
      expect(normalizeAlgorithm('sha512')).toBe('SHA-512');
      expect(normalizeAlgorithm('sha-384')).toBe('SHA-384');
      expect(normalizeAlgorithm(null)).toBe('SHA-256');
    });
  });

  describe('generateHash', () => {
    it('generates correct SHA-256 hash for known vector', async () => {
      const hash = await generateHash('hello', 'SHA-256');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('defaults to SHA-256 when no algorithm is provided', async () => {
      const hash = await generateHash('hello');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('generates correct SHA-1 hash', async () => {
      const hash = await generateHash('hello', 'SHA-1');
      expect(hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
    });

    it('generates correct SHA-384 and SHA-512 hashes', async () => {
      const hash384 = await generateHash('hello', 'SHA-384');
      expect(hash384).toHaveLength(96); // 48 bytes * 2 hex chars

      const hash512 = await generateHash('hello', 'SHA-512');
      expect(hash512).toHaveLength(128); // 64 bytes * 2 hex chars
    });

    it('handles empty string properly', async () => {
      const hash = await generateHash('', 'SHA-256');
      // Known SHA-256 of empty string: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('throws error for unsupported algorithms', async () => {
      await expect(generateHash('hello', 'MD5')).rejects.toThrow(/Unsupported hash algorithm/);
    });

    it('throws error for non-string text', async () => {
      await expect(generateHash(12345)).rejects.toThrow('Input text must be a string.');
    });
  });

  describe('verifyHash', () => {
    it('returns true when hash matches (case-insensitive)', async () => {
      const isMatch = await verifyHash(
        'hello',
        '2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824',
        'SHA-256'
      );
      expect(isMatch).toBe(true);
    });

    it('returns false when hash does not match', async () => {
      const isMatch = await verifyHash('hello', 'deadbeef', 'SHA-256');
      expect(isMatch).toBe(false);
    });

    it('returns false on invalid or empty expected hash', async () => {
      expect(await verifyHash('hello', '')).toBe(false);
      expect(await verifyHash('hello', null)).toBe(false);
      expect(await verifyHash('hello', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', 'INVALID_ALGO')).toBe(false);
    });
  });
});
