import React, { useState } from 'react';

export default function SalesFunnelVelocityCalculator() {
  const [opportunities, setOpportunities] = useState(45);
  const [winRate, setWinRate] = useState(24); // %
  const [dealValue, setDealValue] = useState(8500); // $
  const [salesCycleDays, setSalesCycleDays] = useState(38); // Days
  const [copied, setCopied] = useState(false);

  // Sales Velocity Formula: (Opportunities * Win Rate % * Avg Deal Value) / Sales Cycle (Days)
  const calcVelocity = () => {
    const wins = opportunities * (winRate / 100);
    const pipelineRevenue = wins * dealValue;
    const dailyVelocity = salesCycleDays > 0 ? (pipelineRevenue / salesCycleDays) : 0;
    const monthlyVelocity = dailyVelocity * 30;
    const annualVelocity = dailyVelocity * 365;

    return {
      dailyVelocity,
      monthlyVelocity,
      annualVelocity,
      wonDeals: wins.toFixed(1),
      pipelineRevenue
    };
  };

  const results = calcVelocity();

  const handleCopy = () => {
    const text = `=== SALES FUNNEL VELOCITY REPORT ===\n` +
      `Opportunities: ${opportunities}\n` +
      `Win Rate: ${winRate}%\n` +
      `Avg Deal Size: $${dealValue.toLocaleString()}\n` +
      `Sales Cycle Length: ${salesCycleDays} days\n\n` +
      `Expected Revenue Velocity:\n` +
      `• Daily Pipeline Velocity: $${Math.round(results.dailyVelocity).toLocaleString()}/day\n` +
      `• 30-Day Monthly Pipeline Run Rate: $${Math.round(results.monthlyVelocity).toLocaleString()}/mo\n` +
      `• Annualized Projected Velocity: $${Math.round(results.annualVelocity).toLocaleString()}/yr\n`;
    
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ⚡ B2B Pipeline Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              B2B Sales Funnel Velocity Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate pipeline revenue velocity, sales cycle cycle-time impact, and monthly quota run rates using standard B2B sales formulas.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied Metrics!' : '📋 Copy Velocity Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders / Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Active Qualified Opportunities (N)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{opportunities} Deals</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={opportunities}
                onChange={(e) => setOpportunities(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Opportunity Win Rate (%) (W)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{winRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={winRate}
                onChange={(e) => setWinRate(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Average Deal Size / ACV ($) (V)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">${dealValue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={dealValue}
                onChange={(e) => setDealValue(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Average Sales Cycle (Days) (L)
                </label>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{salesCycleDays} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="180"
                value={salesCycleDays}
                onChange={(e) => setSalesCycleDays(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pipeline Velocity Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                  Daily Pipeline Velocity
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  ${Math.round(results.dailyVelocity).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">per day produced</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                  Monthly Run Rate
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  ${Math.round(results.monthlyVelocity).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">projected 30-day revenue</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Expected Closed-Won Deals:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{results.wonDeals} deals</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Annualized Velocity:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">${Math.round(results.annualVelocity).toLocaleString()} / year</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
