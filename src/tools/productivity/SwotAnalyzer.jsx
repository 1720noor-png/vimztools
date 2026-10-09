import React, { useState } from 'react';

export default function SwotAnalyzer() {
  // SWOT Core Inputs
  const [swot, setSwot] = useState({
    s: '• Proprietary AI algorithms & quick workflow models\n• Highly dedicated engineering team with zero debt\n• High customer retention on organic tools',
    w: '• Limited paid marketing budget relative to enterprise incumbents\n• Brand awareness in non-English speaking markets is nascent\n• Customer support team is currently operating leanly',
    o: '• Massive surge in demand for AI-driven agency productivity\n• International expansion into APAC and LATAM territories\n• Integration partnerships with marketing SaaS ecosystems',
    t: '• Rapid emergence of low-cost copycat micro-tools\n• Algorithmic search volatility affecting top-of-funnel traffic\n• Shifting browser privacy restrictions and ad-blockers'
  });

  // TOWS Strategic Action Pairings
  const [strategies, setStrategies] = useState({
    so: '• Leverage proprietary AI algorithms to aggressively build tools for the emerging agency market.\n• Package organic popularity into referral loops for marketing SaaS partnerships.',
    wo: '• Partner with overseas affiliates to expand brand awareness without high upfront ad spend.\n• Automate tier-1 customer support via in-house AI agents to scale leanly.',
    st: '• Protect proprietary algorithm lead by rapid weekly feature shipping and high reliability.\n• Diversify acquisition beyond search traffic into direct newsletter & API communities.',
    wt: '• Establish emergency traffic fallback channels to hedge against search engine algorithm shifts.\n• Focus strictly on defensible, complex multi-step tools rather than single-input copycat utilities.'
  });

  const [activeTab, setActiveTab] = useState('tows'); // 'quadrant', 'tows', 'export'
  const [copied, setCopied] = useState(false);

  const handleSwotChange = (field, value) => {
    setSwot(prev => ({ ...prev, [field]: value }));
  };

  const handleStrategyChange = (field, value) => {
    setStrategies(prev => ({ ...prev, [field]: value }));
  };

  const getFullMarkdownReport = () => {
    return `# Strategic SWOT & TOWS Action Matrix
Generated on Vimz.ai — ${new Date().toLocaleDateString()}

## 1. Core SWOT Foundations

### 🟢 Strengths (Internal & Positive)
${swot.s || 'None recorded'}

### 🔴 Weaknesses (Internal & Negative)
${swot.w || 'None recorded'}

### 🔵 Opportunities (External & Positive)
${swot.o || 'None recorded'}

### 🟡 Threats (External & Negative)
${swot.t || 'None recorded'}

---

## 2. Strategic TOWS Cross-Action Plan

### 🚀 SO Strategies (Maxi-Maxi)
*How do we use internal Strengths to capture external Opportunities?*
${strategies.so || 'None recorded'}

### 🛠️ WO Strategies (Mini-Maxi)
*How do we overcome internal Weaknesses by seizing external Opportunities?*
${strategies.wo || 'None recorded'}

### 🛡️ ST Strategies (Maxi-Mini)
*How do we use internal Strengths to mitigate or neutralize external Threats?*
${strategies.st || 'None recorded'}

### 🚨 WT Strategies (Mini-Mini)
*How do we minimize internal Weaknesses to survive external Threats?*
${strategies.wt || 'None recorded'}

==================================================
`;
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(getFullMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const text = getFullMarkdownReport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swot-strategic-analysis-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🎯 Strategic Management & Planning
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SWOT & TOWS Strategic Action Matrix
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transform standard 4-quadrant observations into an actionable TOWS execution roadmap with SO, WO, ST, and WT strategic pairings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy Report'}
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              📥 Download .md
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('quadrant')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'quadrant'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Core SWOT Quadrants
          </button>
          <button
            onClick={() => setActiveTab('tows')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'tows'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. TOWS Action Strategy Matrix
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'export'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3. Executive Briefing
          </button>
        </div>
      </div>

      {/* Tab 1: Core SWOT Quadrants */}
      {activeTab === 'quadrant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <span>🟢</span> Strengths (Internal)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                Assets & Advantages
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What does your organization excel at? What unique resources or capabilities can you deploy?
            </p>
            <textarea
              rows={6}
              value={swot.s}
              onChange={(e) => handleSwotChange('s', e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="List key strengths..."
            />
          </div>

          {/* Weaknesses */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <span>🔴</span> Weaknesses (Internal)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium">
                Gaps & Vulnerabilities
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Where are resource limitations, talent bottlenecks, or process deficiencies holding you back?
            </p>
            <textarea
              rows={6}
              value={swot.w}
              onChange={(e) => handleSwotChange('w', e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="List key weaknesses..."
            />
          </div>

          {/* Opportunities */}
          <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2">
                <span>🔵</span> Opportunities (External)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-medium">
                Market Tailwinds
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What market trends, regulatory shifts, or competitor oversights present profitable expansion?
            </p>
            <textarea
              rows={6}
              value={swot.o}
              onChange={(e) => handleSwotChange('o', e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="List key opportunities..."
            />
          </div>

          {/* Threats */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span>🟡</span> Threats (External)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium">
                Headwinds & Risks
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What macroeconomic risks, disruptive technologies, or aggressive rivals could harm your revenue?
            </p>
            <textarea
              rows={6}
              value={swot.t}
              onChange={(e) => handleSwotChange('t', e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="List key threats..."
            />
          </div>
        </div>
      )}

      {/* Tab 2: TOWS Strategic Action Pairings */}
      {activeTab === 'tows' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200">
            💡 <strong>TOWS Matrix Guidance:</strong> Standard SWOT identifies raw conditions; the TOWS matrix cross-pairs internal factors (Strengths/Weaknesses) with external factors (Opportunities/Threats) to formulate real competitive strategy.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SO Strategies */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg font-bold">SO</span>
                  Maxi-Maxi Strategies
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Strengths + Opportunities</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How can we exploit our internal strengths to maximize external market opportunities?
              </p>
              <textarea
                rows={5}
                value={strategies.so}
                onChange={(e) => handleStrategyChange('so', e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* WO Strategies */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-1 bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs rounded-lg font-bold">WO</span>
                  Mini-Maxi Strategies
                </h3>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Weaknesses + Opportunities</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How can we neutralize internal weaknesses by taking advantage of external opportunities?
              </p>
              <textarea
                rows={5}
                value={strategies.wo}
                onChange={(e) => handleStrategyChange('wo', e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* ST Strategies */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-lg font-bold">ST</span>
                  Maxi-Mini Strategies
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Strengths + Threats</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How can we use internal strengths to defend against or neutralize external market threats?
              </p>
              <textarea
                rows={5}
                value={strategies.st}
                onChange={(e) => handleStrategyChange('st', e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* WT Strategies */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg font-bold">WT</span>
                  Mini-Mini Strategies
                </h3>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Weaknesses + Threats</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How can we minimize vulnerabilities to safeguard against existential threats (survival plan)?
              </p>
              <textarea
                rows={5}
                value={strategies.wt}
                onChange={(e) => handleStrategyChange('wt', e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Executive Briefing */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Generated Strategic Briefing Document
            </h3>
            <span className="text-xs text-slate-500 font-mono">Format: GitHub Flavored Markdown</span>
          </div>
          <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {getFullMarkdownReport()}
          </pre>
        </div>
      )}
    </div>
  );
}
