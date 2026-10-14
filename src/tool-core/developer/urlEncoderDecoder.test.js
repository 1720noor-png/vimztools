import { describe, it, expect } from 'vitest';
import {
  encodeUrlText,
  encodeFullUrl,
  decodeUrl,
  parseUrlQueryParams,
  buildQueryString
} from './urlEncoderDecoder.js';

describe('Developer Core - urlEncoderDecoder Engine', () => {
  describe('encodeUrlText', () => {
    it('encodes special query parameter characters with percent encoding', () => {
      expect(encodeUrlText('hello world')).toBe('hello%20world');
      expect(encodeUrlText('foo=bar&baz=123')).toBe('foo%3Dbar%26baz%3D123');
      expect(encodeUrlText('https://vimz.ai/tool?id=1')).toBe('https%3A%2F%2Fvimz.ai%2Ftool%3Fid%3D1');
    });

    it('throws error when non-string input is provided', () => {
      expect(() => encodeUrlText(123)).toThrow('Input must be a string.');
      expect(() => encodeUrlText(null)).toThrow('Input must be a string.');
    });
  });

  describe('encodeFullUrl', () => {
    it('encodes spaces while keeping URL protocol and slashes intact', () => {
      const url = 'https://example.com/path with spaces/page.html?q=hello world';
      const encoded = encodeFullUrl(url);
      expect(encoded).toBe('https://example.com/path%20with%20spaces/page.html?q=hello%20world');
    });

    it('throws error when non-string input is provided', () => {
      expect(() => encodeFullUrl(null)).toThrow('Input must be a string.');
    });
  });

  describe('decodeUrl', () => {
    it('decodes percent-encoded URLs and strings correctly', () => {
      expect(decodeUrl('hello%20world')).toBe('hello world');
      expect(decodeUrl('https%3A%2F%2Fexample.com%3Fq%3Dtest')).toBe('https://example.com?q=test');
    });

    it('throws helpful error on malformed percent sequences', () => {
      expect(() => decodeUrl('%E0%A4%A')).toThrow(/not valid percent-encoding/);
      expect(() => decodeUrl('%')).toThrow(/not valid percent-encoding/);
    });

    it('throws error when non-string input is provided', () => {
      expect(() => decodeUrl(undefined)).toThrow('Input must be a string.');
    });
  });

  describe('parseUrlQueryParams', () => {
    it('extracts parameters from full URL', () => {
      const url = 'https://vimz.ai/search?query=react&page=2&sort=desc';
      const result = parseUrlQueryParams(url);

      expect(result.params).toEqual({
        query: 'react',
        page: '2',
        sort: 'desc'
      });
      expect(result.list).toHaveLength(3);
      expect(result.list[0]).toEqual({ key: 'query', value: 'react' });
    });

    it('extracts parameters from raw query string', () => {
      const qs = 'mode=encode&text=hello';
      const result = parseUrlQueryParams(qs);
      expect(result.params).toEqual({
        mode: 'encode',
        text: 'hello'
      });
    });

    it('handles query string with leading ?', () => {
      const qs = '?name=John&active=true';
      const result = parseUrlQueryParams(qs);
      expect(result.params).toEqual({ name: 'John', active: 'true' });
    });

    it('throws error on non-string input', () => {
      expect(() => parseUrlQueryParams(null)).toThrow('Input must be a string.');
    });
  });

  describe('buildQueryString', () => {
    it('builds query string from plain object ignoring undefined or null', () => {
      const obj = { search: 'vite test', limit: 10, offset: 0, ignored: null, notDef: undefined };
      expect(buildQueryString(obj)).toBe('search=vite+test&limit=10&offset=0');
    });

    it('builds query string from key-value list', () => {
      const list = [
        { key: 'filter', value: 'active' },
        null,
        { key: '' },
        { key: 'tag', value: 'ai' }
      ];
      expect(buildQueryString(list)).toBe('filter=active&tag=ai');
    });

    it('throws error when non-object is provided', () => {
      expect(() => buildQueryString(null)).toThrow('Params must be an object or array.');
    });
  });
});
