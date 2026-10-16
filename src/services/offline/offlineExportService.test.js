import { describe, it, expect } from 'vitest';
import { generateOfflineHtml, isBasicFreeTool } from './offlineExportService.js';

describe('Offline Export Service', () => {
  it('correctly identifies basic free tools vs advanced tools', () => {
    const advancedSet = new Set(['dcf-valuation-calc', 'client-retainer-roi-report-generator']);
    expect(isBasicFreeTool('rule-of-72-doubling-time-calculator', advancedSet)).toBe(true);
    expect(isBasicFreeTool('dcf-valuation-calc', advancedSet)).toBe(false);
  });

  it('generates valid standalone HTML with embedded styles and scripts', () => {
    const tool = {
      name: 'Rule of 72 Doubling Time Calculator',
      slug: 'rule-of-72-doubling-time-calculator',
      desc: 'Calculate how many years it takes for an investment to double.',
      cat: 'Finance'
    };

    const html = generateOfflineHtml(tool, false);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Rule of 72 Doubling Time Calculator — Offline Tool (Vimz.ai)');
    expect(html).toContain('OFFLINE STANDALONE TOOL');
    expect(html).toContain('Powered by <a href="https://vimzai.netlify.app"');
    expect(html).toContain('function runCalc()');
  });

  it('generates unbranded footer for Pro users', () => {
    const tool = {
      name: 'BMI Calculator',
      slug: 'bmi-calculator',
      desc: 'Check BMI category and ideal weight range.',
      cat: 'Health'
    };

    const html = generateOfflineHtml(tool, true);
    expect(html).toContain('Vimz.ai Pro Offline Tool');
    expect(html).not.toContain('Powered by <a href=');
  });
});
