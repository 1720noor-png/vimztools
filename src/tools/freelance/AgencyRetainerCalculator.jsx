import React, { useState } from 'react';

export default function AgencyRetainerCalculator() {
  const [estimatedHours, setEstimatedHours] = useState(40); // monthly hours
  const [blendedHourlyRate, setBlendedHourlyRate] = useState(150); // $ / hr
  const [targetMargin, setTargetMargin] = useState(35); // 35% profit margin
  const [bufferPercent, setBufferPercent] = useState(15); // 15% scope creep buffer
  const [copied, setCopied] = useState(false);

  // Calculation:
  // Base Labor Cost = Hours * Hourly Rate
  // With Buffer = Base Labor * (1 + Buffer / 100)
  // Retainer Price = Cost / (1 - Margin / 100)
  const calcRetainer = () => {
    const baseCost = estimatedHours * blendedHourlyRate;
    const bufferCost = baseCost * (bufferPercent / 100);
    const totalCost = baseCost + bufferCost;
    const retainerPrice = targetMargin < 100 ? (totalCost / (1 - (targetMargin / 100))) : (totalCost * 2);
    const profit = retainerPrice - totalCost;
    const effectiveHourlyRate = estimatedHours > 0 ? (retainerPrice / estimatedHours) : 0;

    return {
      baseCost,
      bufferCost,
      totalCost,
      retainerPrice: Math.round(retainerPrice),
      profit: Math.round(profit),
      effectiveHourlyRate: Math.round(effectiveHourlyRate)
    };
  };

  const results = calcRetainer();

  const handleCopy = () => {
    const text = `=== AGENCY MONTHLY RETAINER QUOTE ===\n` +
      `Dedicated Hours: ${estimatedHours} hrs/month\n` +
      `Blended Rate: $${blendedHourlyRate}/hr\n` +
      `Scope Buffer: ${bufferPercent}%\n` +
      `Target Profit Margin: ${targetMargin}%\n\n` +
      `Pricing Structure:\n` +
      `• Recommended Monthly Retainer: $${results.retainerPrice.toLocaleString()} / month\n` +
      `• Effective Client Rate: $${results.effectiveHourlyRate}/hr\n` +
      `• Projected Agency Net Profit: $${results.profit.toLocaleString()} / month\n` +
      `• Annual Retainer Contract Value: $${(results.retainerPrice * 12).toLocaleString()} / year\n`;
    
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              💼 Agency Economics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Agency Client Retainer & Margin Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Price profitable recurring agency client retainers with blended team hourly rates, scope creep risk buffers, and net profit margins.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Retainer Quote Copied!' : '📋 Copy Retainer Quote'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Estimated Monthly Dedicated Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Blended Team Hourly Rate ($/hr)
              </label>
              <input
                type="number"
                value={blendedHourlyRate}
                onChange={(e) => setBlendedHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Scope Creep Buffer (%)
                </label>
                <input
                  type="number"
                  value={bufferPercent}
                  onChange={(e) => setBufferPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Target Profit Margin (%)
                </label>
                <input
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
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
              Recommended Monthly Retainer Pricing
            </h3>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-1">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Target Monthly Retainer Fee</span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                ${results.retainerPrice.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ mo</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Effective Client Rate: ${results.effectiveHourlyRate}/hr
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Base Production Labor Cost:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">${results.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Scope Buffer Reserve:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">${results.bufferCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Net Agency Profit / Month:</span>
                <span className="font-bold font-mono text-emerald-500">+${results.profit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
