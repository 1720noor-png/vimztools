import React, { useState } from 'react';

const INITIAL_COHORTS = [
  { month: 'Jan 2024', initial: 120, m1: 108, m2: 98, m3: 92, m6: 86, m12: 82 },
  { month: 'Feb 2024', initial: 145, m1: 132, m2: 121, m3: 114, m6: 106, m12: null },
  { month: 'Mar 2024', initial: 160, m1: 147, m2: 136, m3: 128, m6: 119, m12: null },
  { month: 'Apr 2024', initial: 190, m1: 176, m2: 163, m3: 154, m6: null, m12: null },
  { month: 'May 2024', initial: 215, m1: 202, m2: 189, m3: null, m6: null, m12: null },
  { month: 'Jun 2024', initial: 240, m1: 228, m2: null, m3: null, m6: null, m12: null }
];

export default function SaasCohortRetentionCalculator() {
  const [cohorts, setCohorts] = useState(INITIAL_COHORTS);
  const [copied, setCopied] = useState(false);

  const getHeatmapColor = (retentionPercent) => {
    if (retentionPercent === null) return 'bg-slate-50 dark:bg-slate-900/40 text-slate-400';
    if (retentionPercent >= 85) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
    if (retentionPercent >= 70) return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold';
    if (retentionPercent >= 55) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold';
    return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold';
  };

  // Compute average retention across cohorts
  const computeAvgRetention = (periodKey) => {
    let sum = 0;
    let count = 0;
    cohorts.forEach(c => {
      if (c[periodKey] !== null && c.initial > 0) {
        sum += (c[periodKey] / c.initial) * 100;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : 'N/A';
  };

  const avgM1 = computeAvgRetention('m1');
  const avgM2 = computeAvgRetention('m2');
  const avgM3 = computeAvgRetention('m3');
  const avgM6 = computeAvgRetention('m6');

  // Product-Market Fit verdict based on M3 and M6 stabilization
  const numM3 = parseFloat(avgM3) || 0;
  const numM6 = parseFloat(avgM6) || 0;
  let pmfHealth = 'Healthy Retention Curve';
  let pmfBadgeColor = 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/60';
  let pmfDesc = 'The retention curve flattens out after Month 3, indicating strong Product-Market Fit and predictable customer lifetime value.';

  if (numM3 < 50 || (numM6 > 0 && numM6 < 40)) {
    pmfHealth = 'Leaky Bucket (High Churn Risk)';
    pmfBadgeColor = 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/60';
    pmfDesc = 'Steep continuous drop-off indicates onboarding friction or insufficient product stickiness. Fix retention before pouring capital into customer acquisition.';
  } else if (numM3 < 70) {
    pmfHealth = 'Moderate Retention (Room for Improvement)';
    pmfBadgeColor = 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60';
    pmfDesc = 'Acceptable for self-serve consumer SaaS, but B2B SaaS typically targets >75% Month 3 logo retention.';
  }

  const exportSummary = () => {
    return `SAAS COHORT RETENTION & PRODUCT-MARKET FIT REPORT
============================================================
Analysis Date:            ${new Date().toLocaleDateString()}
Total Cohorts Analyzed:   ${cohorts.length}
------------------------------------------------------------
AVERAGE BENCHMARK RETENTION:
• Month 1 Retention:      ${avgM1}%
• Month 2 Retention:      ${avgM2}%
• Month 3 Retention:      ${avgM3}%
• Month 6 Retention:      ${avgM6}%
------------------------------------------------------------
PRODUCT-MARKET FIT STATUS: ${pmfHealth}
${pmfDesc}
============================================================`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(exportSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📈 SaaS Growth & Retention Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SaaS Customer Cohort Retention Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Visualize customer retention heatmaps across monthly onboarding cohorts to detect churn half-life and evaluate true product-market fit.
            </p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Cohort Report'}
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Avg. Month 1 Retention</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{avgM1}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Initial onboarding hurdle</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Avg. Month 3 Retention</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{avgM3}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Habit formation index</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Avg. Month 6 Retention</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{avgM6}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Long-term core retention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">PMF Status</div>
          <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-2 ${pmfBadgeColor}`}>
            {pmfHealth}
          </div>
        </div>
      </div>

      {/* Cohort Heatmap Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Cohort Retention Heatmap (% of Initial Customers Retained)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 text-left font-bold">Cohort</th>
                <th className="py-2.5 px-3 font-bold">Initial (M0)</th>
                <th className="py-2.5 px-3 font-bold">Month 1</th>
                <th className="py-2.5 px-3 font-bold">Month 2</th>
                <th className="py-2.5 px-3 font-bold">Month 3</th>
                <th className="py-2.5 px-3 font-bold">Month 6</th>
                <th className="py-2.5 px-3 font-bold">Month 12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {cohorts.map((c, idx) => {
                const p1 = c.m1 !== null ? Math.round((c.m1 / c.initial) * 100) : null;
                const p2 = c.m2 !== null ? Math.round((c.m2 / c.initial) * 100) : null;
                const p3 = c.m3 !== null ? Math.round((c.m3 / c.initial) * 100) : null;
                const p6 = c.m6 !== null ? Math.round((c.m6 / c.initial) * 100) : null;
                const p12 = c.m12 !== null ? Math.round((c.m12 / c.initial) * 100) : null;

                return (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-left font-sans font-semibold text-slate-900 dark:text-white">
                      {c.month}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {c.initial} (100%)
                    </td>
                    <td className={`py-2 px-3 rounded-lg ${getHeatmapColor(p1)}`}>
                      {p1 !== null ? `${p1}% (${c.m1})` : '-'}
                    </td>
                    <td className={`py-2 px-3 rounded-lg ${getHeatmapColor(p2)}`}>
                      {p2 !== null ? `${p2}% (${c.m2})` : '-'}
                    </td>
                    <td className={`py-2 px-3 rounded-lg ${getHeatmapColor(p3)}`}>
                      {p3 !== null ? `${p3}% (${c.m3})` : '-'}
                    </td>
                    <td className={`py-2 px-3 rounded-lg ${getHeatmapColor(p6)}`}>
                      {p6 !== null ? `${p6}% (${c.m6})` : '-'}
                    </td>
                    <td className={`py-2 px-3 rounded-lg ${getHeatmapColor(p12)}`}>
                      {p12 !== null ? `${p12}% (${c.m12})` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
