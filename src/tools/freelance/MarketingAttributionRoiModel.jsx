import React, { useState } from 'react';

export default function MarketingAttributionRoiModel() {
  const [totalBudget, setTotalBudget] = useState(25000);
  const [totalRevenue, setTotalRevenue] = useState(115000);
  const [modelType, setModelType] = useState('linear');
  const [copied, setCopied] = useState(false);

  // Channels with raw touchpoint data
  const channels = [
    { name: 'Paid Search (Google Ads)', spend: 9000, firstTouchShare: 40, lastTouchShare: 20, linearShare: 30 },
    { name: 'Paid Social (Meta / LinkedIn)', spend: 8000, firstTouchShare: 35, lastTouchShare: 25, linearShare: 30 },
    { name: 'Organic SEO / Content', spend: 5000, firstTouchShare: 15, lastTouchShare: 20, linearShare: 25 },
    { name: 'Email / Lifecycle', spend: 3000, firstTouchShare: 10, lastTouchShare: 35, linearShare: 15 },
  ];

  const calcAttribution = () => {
    const overallRoi = totalBudget > 0 ? (((totalRevenue - totalBudget) / totalBudget) * 100) : 0;
    const overallRoas = totalBudget > 0 ? (totalRevenue / totalBudget) : 0;

    const channelResults = channels.map(c => {
      let attributedShare = 0;
      if (modelType === 'first') attributedShare = c.firstTouchShare;
      else if (modelType === 'last') attributedShare = c.lastTouchShare;
      else attributedShare = c.linearShare;

      const attributedRev = totalRevenue * (attributedShare / 100);
      const roas = c.spend > 0 ? (attributedRev / c.spend) : 0;
      const profit = attributedRev - c.spend;

      return {
        ...c,
        attributedRev,
        roas: roas.toFixed(2),
        profit
      };
    });

    return {
      overallRoi: overallRoi.toFixed(1),
      overallRoas: overallRoas.toFixed(2),
      channelResults
    };
  };

  const results = calcAttribution();

  const handleCopy = () => {
    const text = `=== MULTI-TOUCH MARKETING ATTRIBUTION REPORT ===\n` +
      `Attribution Model: ${modelType.toUpperCase()}\n` +
      `Total Spend: $${totalBudget.toLocaleString()}\n` +
      `Total Revenue: $${totalRevenue.toLocaleString()}\n` +
      `Blended ROAS: ${results.overallRoas}x (ROI: ${results.overallRoi}%)\n\n` +
      `Channel Breakdown:\n` +
      results.channelResults.map(c => `• ${c.name}: Spend $${c.spend.toLocaleString()} | Attributed Rev $${Math.round(c.attributedRev).toLocaleString()} | ROAS ${c.roas}x`).join('\n');
    
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
              📊 Attribution Modeling
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Multi-Touch Marketing Attribution & ROI Modeler
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare First-Touch, Last-Touch, and Linear multi-channel revenue attribution models to optimize paid media ad spend.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Attribution Report Copied!' : '📋 Copy Attribution Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Marketing Spend ($)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Attributed Revenue ($)
                </label>
                <input
                  type="number"
                  value={totalRevenue}
                  onChange={(e) => setTotalRevenue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Attribution Logic Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'linear', label: 'Linear' },
                  { id: 'first', label: 'First-Touch' },
                  { id: 'last', label: 'Last-Touch' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelType(m.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                      modelType === m.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blended High-Level Box */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Blended Marketing ROAS</span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {results.overallRoas}x <span className="text-sm font-normal text-slate-400">({results.overallRoi}% ROI)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Channel-by-Channel Attributed Return
            </h3>

            <div className="space-y-2.5">
              {results.channelResults.map((ch, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ch.name}</span>
                    <span className="font-mono font-bold text-emerald-500">{ch.roas}x ROAS</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span>Spend: </span>
                      <strong className="text-slate-700 dark:text-slate-300">${ch.spend.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Attributed Rev: </span>
                      <strong className="text-slate-700 dark:text-slate-300">${Math.round(ch.attributedRev).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Net Profit: </span>
                      <strong className="text-slate-700 dark:text-slate-300">${Math.round(ch.profit).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
