import React, { useState } from 'react';

export default function SaasCacPaybackMatrix() {
  const [cac, setCac] = useState(1400); // Customer Acquisition Cost ($)
  const [arpu, setArpu] = useState(180); // Avg Revenue Per User / Mo ($)
  const [grossMargin, setGrossMargin] = useState(82); // Gross Margin %
  const [monthlyChurn, setMonthlyChurn] = useState(1.8); // Monthly Churn %
  const [growthRate, setGrowthRate] = useState(45); // YoY Growth %
  const [freeCashFlowMargin, setFreeCashFlowMargin] = useState(12); // FCF Margin %
  const [copied, setCopied] = useState(false);

  // Formulas:
  // Gross Margin-Adjusted ARPU = ARPU * (Gross Margin / 100)
  // CAC Payback (Months) = CAC / (ARPU * Gross Margin %)
  // Customer Lifetime (Months) = 1 / (Churn % / 100)
  // LTV = (ARPU * Gross Margin %) / (Churn % / 100)
  // LTV:CAC Ratio = LTV / CAC
  // Rule of 40 = YoY Revenue Growth % + Free Cash Flow Margin %
  const calcMetrics = () => {
    const marginAdjArpu = arpu * (grossMargin / 100);
    const paybackMonths = marginAdjArpu > 0 ? (cac / marginAdjArpu) : 0;
    const lifetimeMonths = monthlyChurn > 0 ? 1 / (monthlyChurn / 100) : 0;
    const ltv = monthlyChurn > 0 ? marginAdjArpu / (monthlyChurn / 100) : 0;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const ruleOf40 = growthRate + freeCashFlowMargin;

    return {
      paybackMonths: paybackMonths.toFixed(1),
      ltv: Math.round(ltv),
      ltvCacRatio: ltvCacRatio.toFixed(1),
      ruleOf40: ruleOf40.toFixed(1),
      lifetimeMonths: Math.round(lifetimeMonths)
    };
  };

  const metrics = calcMetrics();

  const handleCopy = () => {
    const text = `=== SAAS UNIT ECONOMICS & CAC PAYBACK MATRIX ===\n` +
      `CAC: $${cac}\n` +
      `ARPU: $${arpu}/mo\n` +
      `Gross Margin: ${grossMargin}%\n` +
      `Monthly Churn: ${monthlyChurn}%\n\n` +
      `Key Valuation Benchmarks:\n` +
      `• CAC Payback Period: ${metrics.paybackMonths} months\n` +
      `• Customer LTV (Gross Margin Adj): $${metrics.ltv.toLocaleString()}\n` +
      `• LTV:CAC Ratio: ${metrics.ltvCacRatio}x (Target: >3x)\n` +
      `• Rule of 40 Score: ${metrics.ruleOf40}% (Growth + FCF)\n`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📊 Unit Economics & Valuation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SaaS CAC Payback, LTV & Rule of 40 Matrix
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Analyze gross margin-adjusted CAC payback time, LTV-to-CAC multiples, customer lifetime duration, and venture capital Rule of 40 scores.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied Metrics!' : '📋 Copy Summary Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Customer Acquisition Cost (CAC) ($)
                </label>
                <input
                  type="number"
                  value={cac}
                  onChange={(e) => setCac(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Monthly ARPU ($)
                </label>
                <input
                  type="number"
                  value={arpu}
                  onChange={(e) => setArpu(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Gross Margin (%)
                </label>
                <input
                  type="number"
                  value={grossMargin}
                  onChange={(e) => setGrossMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Monthly User Churn (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={monthlyChurn}
                  onChange={(e) => setMonthlyChurn(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  YoY Revenue Growth (%)
                </label>
                <input
                  type="number"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Free Cash Flow Margin (%)
                </label>
                <input
                  type="number"
                  value={freeCashFlowMargin}
                  onChange={(e) => setFreeCashFlowMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Executive Valuation Benchmarks
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 block mb-1">CAC Payback Time</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{metrics.paybackMonths} mo</span>
                <span className="text-[10px] text-slate-400 block mt-1">Benchmark: &lt;12 months</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 block mb-1">LTV : CAC Multiple</span>
                <span className="text-2xl font-bold font-mono text-emerald-500">{metrics.ltvCacRatio}x</span>
                <span className="text-[10px] text-slate-400 block mt-1">Target: &gt;3.0x</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Customer LTV</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">${metrics.ltv.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{metrics.lifetimeMonths} mo avg lifetime</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Rule of 40 Score</span>
                <span className="text-2xl font-bold font-mono text-indigo-500">{metrics.ruleOf40}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Target: &gt;40% for top tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
