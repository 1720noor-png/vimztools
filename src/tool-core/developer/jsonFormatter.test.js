import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from './jsonFormatter.js';

describe('Developer Core - jsonFormatter Engine', () => {
  describe('formatJson', () => {
    it('formats valid JSON with default 2 spaces indentation', () => {
      const input = '{"name":"Vimz","tools":1059}';
      const formatted = formatJson(input);
      expect(formatted).toBe('{\n  "name": "Vimz",\n  "tools": 1059\n}');
    });

    it('formats with custom 4 spaces indentation', () => {
      const input = '{"a":1}';
      const formatted = formatJson(input, 4);
      expect(formatted).toBe('{\n    "a": 1\n}');
    });

    it('formats with tab indentation when specified', () => {
      const input = '{"a":1}';
      expect(formatJson(input, 'tab')).toBe('{\n\t"a": 1\n}');
      expect(formatJson(input, '\t')).toBe('{\n\t"a": 1\n}');
    });

    it('falls back to 2 spaces for invalid or negative indent values', () => {
      const input = '{"a":1}';
      expect(formatJson(input, -1)).toBe('{\n  "a": 1\n}');
      expect(formatJson(input, 'invalid')).toBe('{\n  "a": 1\n}');
    });

    it('handles nested objects and arrays', () => {
      const input = '{"items":[1,2,{"sub":true}]}';
      const formatted = formatJson(input, 2);
      expect(JSON.parse(formatted)).toEqual({ items: [1, 2, { sub: true }] });
    });

    it('throws error on empty or whitespace input', () => {
      expect(() => formatJson('')).toThrow('Input must be a non-empty string.');
      expect(() => formatJson('   ')).toThrow('Input must be a non-empty string.');
      expect(() => formatJson(null)).toThrow('Input must be a non-empty string.');
    });

    it('throws descriptive error with line and column on syntax errors', () => {
      const invalidJson = '{\n  "name": "Vimz",\n  "invalid": ,\n}';
      expect(() => formatJson(invalidJson)).toThrow(/Invalid JSON/);
    });
  });

  describe('minifyJson', () => {
    it('minifies multiline JSON into single line', () => {
      const input = '{\n  "name": "Vimz",\n  "count": 42\n}';
      expect(minifyJson(input)).toBe('{"name":"Vimz","count":42}');
    });

    it('throws error on empty or non-string input', () => {
      expect(() => minifyJson('')).toThrow('Input must be a non-empty string.');
      expect(() => minifyJson(123)).toThrow('Input must be a non-empty string.');
    });

    it('throws error with line details on syntax failure', () => {
      expect(() => minifyJson('{ broken }')).toThrow(/Invalid JSON/);
    });
  });

  describe('validateJson', () => {
    it('validates correct JSON object and returns metadata', () => {
      const res = validateJson('{"name": "ToolHub", "version": 1}');
      expect(res.valid).toBe(true);
      expect(res.summary).toBe('Valid JSON (object with 2 key(s)).');
      expect(res.parsed).toEqual({ name: 'ToolHub', version: 1 });
    });

    it('validates JSON array and reports count', () => {
      const res = validateJson('[10, 20, 30, 40]');
      expect(res.valid).toBe(true);
      expect(res.summary).toBe('Valid JSON (array with 4 item(s)).');
    });

    it('validates JSON null and primitives', () => {
      expect(validateJson('null')).toEqual({
        valid: true,
        parsed: null,
        summary: 'Valid JSON (null).'
      });

      expect(validateJson('true')).toEqual({
        valid: true,
        parsed: true,
        summary: 'Valid JSON (boolean).'
      });
    });

    it('returns error with line and column for invalid JSON', () => {
      const res = validateJson('{\n  "key": "val",\n  bad\n}');
      expect(res.valid).toBe(false);
      expect(res.line).toBeDefined();
      expect(res.column).toBeDefined();
      expect(res.positionDescription).toMatch(/line \d+, column \d+/);
    });

    it('handles empty input gracefully', () => {
      const res = validateJson('');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Empty or non-string input provided.');
    });
  });
});
