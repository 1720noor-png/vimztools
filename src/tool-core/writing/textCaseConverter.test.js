import { describe, it, expect } from 'vitest';
import {
  convertTextCase,
  normalizeCaseMode,
  SUPPORTED_CASE_MODES
} from './textCaseConverter.js';

describe('Writing Core - textCaseConverter Engine', () => {
  const sample = 'hello world example text';

  it('verifies supported case modes list', () => {
    expect(SUPPORTED_CASE_MODES).toContain('upper');
    expect(SUPPORTED_CASE_MODES).toContain('lower');
    expect(SUPPORTED_CASE_MODES).toContain('camel');
    expect(SUPPORTED_CASE_MODES).toContain('kebab');
    expect(SUPPORTED_CASE_MODES).toContain('snake');
    expect(SUPPORTED_CASE_MODES).toContain('pascal');
    expect(SUPPORTED_CASE_MODES).toContain('title');
    expect(SUPPORTED_CASE_MODES).toContain('sentence');
  });

  it('normalizes case mode variants cleanly', () => {
    expect(normalizeCaseMode('UPPERCASE')).toBe('upper');
    expect(normalizeCaseMode('camelCase')).toBe('camel');
    expect(normalizeCaseMode('sentenceCase')).toBe('sentence');
    expect(normalizeCaseMode('unknown')).toBe('upper');
    expect(normalizeCaseMode(null)).toBe('upper');
  });

  it('converts to UPPERCASE', () => {
    const res = convertTextCase(sample, 'upper');
    expect(res.val).toBe('HELLO WORLD EXAMPLE TEXT');
    expect(res.mode).toBe('upper');
  });

  it('converts to lowercase', () => {
    const res = convertTextCase('HELLO WORLD EXAMPLE TEXT', 'lower');
    expect(res.val).toBe('hello world example text');
  });

  it('converts to Title Case', () => {
    const res = convertTextCase('hello world example', 'title');
    expect(res.val).toBe('Hello World Example');
  });

  it('converts to Sentence case', () => {
    const res = convertTextCase('hELLO WORLD EXAMPLE', 'sentence');
    expect(res.val).toBe('Hello world example');
  });

  it('converts to camelCase', () => {
    const res = convertTextCase('hello world example text', 'camel');
    expect(res.val).toBe('helloWorldExampleText');
  });

  it('converts to PascalCase', () => {
    const res = convertTextCase('hello world example text', 'pascal');
    expect(res.val).toBe('HelloWorldExampleText');
  });

  it('converts to snake_case', () => {
    const res = convertTextCase('Hello World Example', 'snake');
    expect(res.val).toBe('hello_world_example');
  });

  it('converts to kebab-case', () => {
    const res = convertTextCase('Hello World Example', 'kebab');
    expect(res.val).toBe('hello-world-example');
  });

  it('handles empty or whitespace strings', () => {
    const res = convertTextCase('   ', 'camel');
    expect(res.val).toBe('');
    expect(res.mode).toBe('camel');
  });

  it('throws error when non-string input is provided', () => {
    expect(() => convertTextCase(null)).toThrow('Input text must be a string.');
    expect(() => convertTextCase(123)).toThrow('Input text must be a string.');
  });
});
