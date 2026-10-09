import React, { useState } from 'react';

export default function SwotTemplate() {
  const [businessName, setBusinessName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState('B2B SaaS / Productivity Software');
  const [strengths, setStrengths] = useState('• High customer NPS (72+)\n• Fast release cycles (weekly deploy)\n• Experienced founding leadership');
  const [weaknesses, setWeaknesses] = useState('• Low brand search volume\n• Incomplete localized documentation\n• Reliance on a single acquisition channel');
  const [opportunities, setOpportunities] = useState('• Rapid enterprise migration to modern tooling\n• Untapped European and Latin American markets\n• White-label partnership opportunities');
  const [threats, setThreats] = useState('• Entrenched competitors offering aggressive discounts\n• Rapid shifts in data privacy regulations\n• Economic tightening slowing enterprise procurement');

  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    return `EXECUTIVE SWOT ANALYSIS TEMPLATE
==================================================
Organization: ${businessName}
Industry:     ${industry}
Date:         ${new Date().toLocaleDateString()}
==================================================

1. INTERNAL FACTORS
--------------------------------------------------
STRENGTHS:
${strengths}

WEAKNESSES:
${weaknesses}

2. EXTERNAL FACTORS
--------------------------------------------------
OPPORTUNITIES:
${opportunities}

THREATS:
${threats}

3. EXECUTIVE SUMMARY & STRATEGIC RECOMMENDATIONS
--------------------------------------------------
• Primary Advantage: Leverage key strengths to exploit high-probability market opportunities.
• Risk Mitigation: Address top internal weaknesses before competitors exploit known vulnerabilities.
• Review Frequency: Re-evaluate quarterly against company OKRs and market indicators.
`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📋 Business Planning Framework
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SWOT Analysis Template & Executive Summary
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Structured executive framework to document internal assets, vulnerabilities, and external market drivers.
            </p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Executive Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Company Information
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company / Project Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Market / Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Analysis Guidelines
          </h2>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4">
            <li><strong>Strengths & Weaknesses:</strong> Focus strictly on factors you can directly control inside your organization.</li>
            <li><strong>Opportunities & Threats:</strong> Focus strictly on external macro-economic, competitive, and technological shifts.</li>
            <li>Keep bullets concise and actionable for board or executive presentations.</li>
          </ul>
        </div>
      </div>

      {/* 4 Quadrants Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">🟢 Strengths (Internal Advantages)</h3>
          <textarea
            rows={5}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">🔴 Weaknesses (Internal Constraints)</h3>
          <textarea
            rows={5}
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div className="bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-sky-800 dark:text-sky-300">🔵 Opportunities (External Potential)</h3>
          <textarea
            rows={5}
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
          />
        </div>

        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">🟡 Threats (External Risks)</h3>
          <textarea
            rows={5}
            value={threats}
            onChange={(e) => setThreats(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>

      {/* Formatted Output Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Formatted Executive Summary Output
        </h3>
        <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
          {generateReport()}
        </pre>
      </div>
    </div>
  );
}
