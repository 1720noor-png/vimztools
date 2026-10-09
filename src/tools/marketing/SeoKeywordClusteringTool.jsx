import React, { useState } from 'react';

export default function SeoKeywordClusteringTool() {
  const [keywordInput, setKeywordInput] = useState(`best ai tools for marketing
how to use ai for marketing
ai marketing automation software
ai marketing software pricing
top ai tools 2026
buy ai marketing tool
ai copywriting examples
best ai copywriter for agencies
how does ai copywriting work
free ai copywriter trial
ai analytics dashboard features
b2b ai analytics platform reviews`);
  const [copiedKey, setCopiedKey] = useState('');

  const clusterKeywords = () => {
    const lines = keywordInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const clusters = {
      informational: { name: 'Informational (Top of Funnel)', keywords: [], desc: 'Users seeking explanations, definitions, guides, and tutorials.' },
      commercial: { name: 'Commercial Investigation (Middle of Funnel)', keywords: [], desc: 'Users comparing solutions, reading reviews, and looking for best options.' },
      transactional: { name: 'Transactional (Bottom of Funnel)', keywords: [], desc: 'High-intent users looking to purchase, subscribe, check pricing, or get trials.' },
      navigational: { name: 'Navigational & Brand', keywords: [], desc: 'Users looking for specific brands, login portals, or tools.' }
    };

    const infoWords = ['how', 'what', 'why', 'guide', 'tutorial', 'learn', 'examples', 'tips', 'ideas', 'does'];
    const commWords = ['best', 'top', 'vs', 'review', 'comparison', 'alternative', 'features', 'software', 'platform', 'tools'];
    const transWords = ['buy', 'pricing', 'price', 'cost', 'discount', 'coupon', 'free trial', 'trial', 'order', 'purchase', 'hire'];

    lines.forEach((kw) => {
      const lower = kw.toLowerCase();
      
      const isTrans = transWords.some(w => lower.includes(w));
      const isComm = commWords.some(w => lower.includes(w));
      const isInfo = infoWords.some(w => lower.includes(w));

      if (isTrans) {
        clusters.transactional.keywords.push(kw);
      } else if (isComm) {
        clusters.commercial.keywords.push(kw);
      } else if (isInfo) {
        clusters.informational.keywords.push(kw);
      } else {
        // Fallback categorization based on length/words
        clusters.commercial.keywords.push(kw);
      }
    });

    return {
      total: lines.length,
      clusters
    };
  };

  const results = clusterKeywords();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const exportCSV = () => {
    let csv = 'Keyword,Intent Cluster,Funnel Stage\n';
    Object.entries(results.clusters).forEach(([key, group]) => {
      group.keywords.forEach(kw => {
        csv += `"${kw}","${group.name}","${key.toUpperCase()}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-keyword-clusters-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ✨ Semantic SEO Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SEO Keyword Intent Clustering Tool
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Group raw keyword lists by Search Intent (Informational, Commercial, Transactional) to build high-converting pillar content clusters and prevent keyword cannibalization.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            📥 Export Clustered CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                🔍 Raw Keyword List
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {results.total} keywords entered
              </span>
            </div>

            <textarea
              rows={12}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Paste one keyword per line..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
            />

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Tip: Paste up to hundreds of keywords directly from Ahrefs, SEMrush, or Google Search Console exports.
            </p>
          </div>
        </div>

        {/* Results clusters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(results.clusters).map(([key, cluster]) => (
              <div
                key={key}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      key === 'transactional' ? 'bg-amber-500' : key === 'commercial' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cluster.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono">
                      {cluster.keywords.length}
                    </span>
                  </div>

                  {cluster.keywords.length > 0 && (
                    <button
                      onClick={() => handleCopy(cluster.keywords.join('\n'), key)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                    >
                      {copiedKey === key  ? '✓' : '📋'}
                      {copiedKey === key ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {cluster.desc}
                </p>

                {cluster.keywords.length === 0 ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs text-slate-400 italic">
                    No keywords categorized into this intent bucket.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {cluster.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
