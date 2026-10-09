import React, { useState } from 'react';

const SAMPLE_ARTICLES = [
  { id: 1, title: 'Complete Guide to B2B SaaS Churn Rates', url: '/blog/saas-churn-guide', peakTraffic: 8500, currentTraffic: 3200, conversionRate: 1.8, leadValue: 120 },
  { id: 2, title: 'How to Build an Agency Retainer Model', url: '/blog/agency-retainer-model', peakTraffic: 4200, currentTraffic: 1400, conversionRate: 2.5, leadValue: 250 },
  { id: 3, title: 'Top 10 Productivity Tools for Remote Teams', url: '/blog/remote-productivity-tools', peakTraffic: 12000, currentTraffic: 9800, conversionRate: 1.2, leadValue: 50 },
  { id: 4, title: 'Understanding Gross Margin in Creative Agencies', url: '/blog/agency-gross-margin', peakTraffic: 3100, currentTraffic: 850, conversionRate: 2.0, leadValue: 200 }
];

export default function SeoContentDecayAuditCalculator() {
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [copied, setCopied] = useState(false);

  const updateArticle = (id, field, value) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addArticle = () => {
    const newId = Date.now();
    setArticles([...articles, {
      id: newId,
      title: 'New High-Value Blog Post',
      url: '/blog/sample-post',
      peakTraffic: 5000,
      currentTraffic: 2000,
      conversionRate: 1.5,
      leadValue: 100
    }]);
  };

  const removeArticle = (id) => {
    if (articles.length <= 1) return;
    setArticles(articles.filter(a => a.id !== id));
  };

  // Perform calculations
  let totalPeakTraffic = 0;
  let totalCurrentTraffic = 0;
  let totalMonthlyRevenueLost = 0;

  const analyzedArticles = articles.map(art => {
    const peak = parseInt(art.peakTraffic, 10) || 0;
    const current = parseInt(art.currentTraffic, 10) || 0;
    const cr = (parseFloat(art.conversionRate) || 0) / 100;
    const leadVal = parseFloat(art.leadValue) || 0;

    const trafficLoss = Math.max(0, peak - current);
    const decayPercent = peak > 0 ? (trafficLoss / peak) * 100 : 0;
    const lostLeadsPerMonth = trafficLoss * cr;
    const lostRevenuePerMonth = lostLeadsPerMonth * leadVal;

    totalPeakTraffic += peak;
    totalCurrentTraffic += current;
    totalMonthlyRevenueLost += lostRevenuePerMonth;

    let priority = 'Low';
    let priorityColor = 'text-slate-600 bg-slate-100 dark:bg-slate-800';
    if (decayPercent >= 60 || lostRevenuePerMonth >= 3000) {
      priority = 'Urgent Refresh';
      priorityColor = 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/60';
    } else if (decayPercent >= 30 || lostRevenuePerMonth >= 1000) {
      priority = 'Moderate Decay';
      priorityColor = 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60';
    }

    return {
      ...art,
      trafficLoss,
      decayPercent: decayPercent.toFixed(1),
      lostLeadsPerMonth: lostLeadsPerMonth.toFixed(1),
      lostRevenuePerMonth: Math.round(lostRevenuePerMonth),
      priority,
      priorityColor
    };
  });

  const overallDecayPercent = totalPeakTraffic > 0 ? ((totalPeakTraffic - totalCurrentTraffic) / totalPeakTraffic) * 100 : 0;

  const generateReportText = () => {
    return `SEO CONTENT DECAY & REFRESH OPPORTUNITY AUDIT
============================================================
Articles Audited:              ${articles.length}
Total Historical Peak Traffic: ${totalPeakTraffic.toLocaleString()} monthly visits
Current Trailing Traffic:      ${totalCurrentTraffic.toLocaleString()} monthly visits
Overall Portfolio Decay:       ${overallDecayPercent.toFixed(1)}% drop
TOTAL MONTHLY REVENUE AT RISK: $${Math.round(totalMonthlyRevenueLost).toLocaleString()} / month
ANNUALIZED REVENUE OPPORTUNITY: $${Math.round(totalMonthlyRevenueLost * 12).toLocaleString()} / year
------------------------------------------------------------
HIGH PRIORITY REFRESH CANDIDATES:
${analyzedArticles.map(a => `• [${a.priority}] ${a.title} (${a.url}): -${a.decayPercent}% traffic drop | -$${a.lostRevenuePerMonth}/mo lost value`).join('\n')}
============================================================`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📉 SEO Traffic Recovery & Optimization
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SEO Content Decay & Revenue Loss Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quantify organic traffic decay across published articles, calculate commercial revenue lost, and prioritize high-ROI content refreshes.
            </p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Audit Report'}
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Monthly Revenue Lost</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ${Math.round(totalMonthlyRevenueLost).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">${Math.round(totalMonthlyRevenueLost * 12).toLocaleString()}/yr pipeline loss</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Portfolio Traffic Decay</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {overallDecayPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From historical peak</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Peak Monthly Traffic</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalPeakTraffic.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total across {articles.length} posts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Current Monthly Traffic</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {totalCurrentTraffic.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Trailing 30-day baseline</div>
        </div>
      </div>

      {/* Articles Management Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Audited URL Inventory & Decay Status
          </h2>
          <button
            onClick={addArticle}
            className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
          >
            ➕ Add URL
          </button>
        </div>

        <div className="space-y-4">
          {analyzedArticles.map((art) => (
            <div
              key={art.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 w-full sm:w-2/3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${art.priorityColor}`}>
                    {art.priority}
                  </span>
                  <input
                    type="text"
                    value={art.title}
                    onChange={(e) => updateArticle(art.id, 'title', e.target.value)}
                    className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 text-slate-900 dark:text-white focus:outline-none w-full"
                  />
                </div>
                <button
                  onClick={() => removeArticle(art.id)}
                  className="text-xs text-slate-400 hover:text-red-500 text-right"
                >
                  ✕ Remove
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Peak Monthly Visits</label>
                  <input
                    type="number"
                    min="1"
                    value={art.peakTraffic}
                    onChange={(e) => updateArticle(art.id, 'peakTraffic', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Current Monthly Visits</label>
                  <input
                    type="number"
                    min="0"
                    value={art.currentTraffic}
                    onChange={(e) => updateArticle(art.id, 'currentTraffic', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Conversion Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={art.conversionRate}
                    onChange={(e) => updateArticle(art.id, 'conversionRate', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Value per Lead ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={art.leadValue}
                    onChange={(e) => updateArticle(art.id, 'leadValue', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-slate-500">
                <span>Traffic Loss: <strong>-{art.trafficLoss.toLocaleString()} visits ({art.decayPercent}%)</strong></span>
                <span>Lost Revenue: <strong className="text-rose-600 dark:text-rose-400">-${art.lostRevenuePerMonth}/month</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
