import React, { useState } from 'react';

export default function SalesCommissionCalculator() {
  const [baseSalary, setBaseSalary] = useState(65000);
  const [quota, setQuota] = useState(400000);
  const [closedRevenue, setClosedRevenue] = useState(480000);
  const [baseCommissionRate, setBaseCommissionRate] = useState(10); // 10%
  const [acceleratorRate, setAcceleratorRate] = useState(15); // 15% above quota
  const [copied, setCopied] = useState(false);

  // Calculation
  const attainment = quota > 0 ? (closedRevenue / quota) * 100 : 0;
  
  let baseCommission = 0;
  let acceleratedCommission = 0;

  if (closedRevenue <= quota) {
    baseCommission = closedRevenue * (baseCommissionRate / 100);
  } else {
    baseCommission = quota * (baseCommissionRate / 100);
    const excess = closedRevenue - quota;
    acceleratedCommission = excess * (acceleratorRate / 100);
  }

  const totalCommission = baseCommission + acceleratedCommission;
  const totalEarnings = baseSalary + totalCommission;

  const handleCopy = () => {
    const text = `=== SALES COMMISSION & EARNINGS BREAKDOWN ===\n` +
      `Base Salary: $${baseSalary.toLocaleString()}\n` +
      `Annual Quota: $${quota.toLocaleString()}\n` +
      `Closed Revenue: $${closedRevenue.toLocaleString()} (${attainment.toFixed(1)}% Attainment)\n\n` +
      `Commission Payouts:\n` +
      `• Base Tier Commission: $${baseCommission.toLocaleString()}\n` +
      `• Quota Accelerator Payout: $${acceleratedCommission.toLocaleString()}\n` +
      `• Total Commission Earned: $${totalCommission.toLocaleString()}\n` +
      `• Total On-Target / Actual Earnings (OTE): $${totalEarnings.toLocaleString()}\n`;
    
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🏆 Compensation Engineering
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Tiered Sales Commission & Quota Accelerator Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate sales payouts, multi-tiered quota accelerators, base commission splits, and total on-target earnings (OTE).
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied Payout Summary!' : '📋 Copy Summary'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Base Annual Salary ($)
              </label>
              <input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Annual Quota ($)
                </label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Closed Revenue ($)
                </label>
                <input
                  type="number"
                  value={closedRevenue}
                  onChange={(e) => setClosedRevenue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Base Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={baseCommissionRate}
                  onChange={(e) => setBaseCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Over-Quota Accelerator (%)
                </label>
                <input
                  type="number"
                  value={acceleratorRate}
                  onChange={(e) => setAcceleratorRate(parseFloat(e.target.value) || 0)}
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
              Total Earnings & Attainment Breakdown
            </h3>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Total Actual Take-Home Earnings</span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                ${Math.round(totalEarnings).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">
                {attainment.toFixed(1)}% of Quota Achieved
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Base Salary:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">${baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Standard Commission:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">${Math.round(baseCommission).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                <span className="text-slate-500">Accelerator Bonus:</span>
                <span className="font-bold font-mono text-emerald-500">+${Math.round(acceleratedCommission).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
