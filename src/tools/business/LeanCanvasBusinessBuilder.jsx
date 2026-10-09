import React, {useState } from 'react';

export default function LeanCanvasBusinessBuilder() {
  const [copied, setCopied] = useState(false);
  const [canvas, setCanvas] = useState({
    problem: '1. Repetitive manual marketing tasks consume 20+ hrs/wk.\n2. Disconnected SaaS tools cause data silos.\n3. Lack of unified analytics across channels.',
    solution: '1. Autonomous multi-agent automation loops.\n2. One-click content repurposing across 7 platforms.\n3. Integrated executive ROI dashboards.',
    metrics: '• Monthly Recurring Revenue (MRR)\n• Net Revenue Retention (NRR > 120%)\n• Weekly Active Teams',
    uvp: 'Transform your marketing operations from manual chaotic guesswork into an autonomous high-velocity growth engine.',
    advantage: 'Proprietary cross-platform schema integrations, domain-trained AI workflows, and high-speed execution engine.',
    channels: '• Organic SEO & Free Tools\n• B2B Thought Leadership (LinkedIn)\n• Direct Enterprise Outbound',
    segments: '• B2B SaaS Growth Teams\n• Performance Marketing Agencies\n• High-Output Solopreneurs',
    cost: '• Cloud Infrastructure (AWS/Railway)\n• Foundational Model API usage\n• Engineering & Product Team',
    revenue: '• Monthly/Annual SaaS Subscriptions ($49 - $299/mo)\n• Enterprise Custom Workflows\n• Marketplace Add-ons'
  });

  const updateField = (key, val) => {
    setCanvas({ ...canvas, [key]: val });
  };

  const handleCopy = () => {
    const text = `=== LEAN CANVAS BUSINESS MODEL ===\n\n` +
      `1. PROBLEM:\n${canvas.problem}\n\n` +
      `2. CUSTOMER SEGMENTS:\n${canvas.segments}\n\n` +
      `3. UNIQUE VALUE PROPOSITION (UVP):\n${canvas.uvp}\n\n` +
      `4. SOLUTION:\n${canvas.solution}\n\n` +
      `5. UNFAIR ADVANTAGE:\n${canvas.advantage}\n\n` +
      `6. REVENUE STREAMS:\n${canvas.revenue}\n\n` +
      `7. COST STRUCTURE:\n${canvas.cost}\n\n` +
      `8. KEY METRICS:\n${canvas.metrics}\n\n` +
      `9. CHANNELS:\n${canvas.channels}\n`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📐 Startup Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Lean Canvas 1-Page Business Model Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Deconstruct your business hypothesis into Ash Maurya’s 9-box Lean Startup framework in a visual, interactive dashboard.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied  ? '✓' : '📋'}
            {copied ? 'Canvas Copied!' : 'Copy 9-Box Canvas'}
          </button>
        </div>
      </div>

      {/* 9-Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Column 1: Problem */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Problem</span>
          <textarea
            rows={8}
            value={canvas.problem}
            onChange={(e) => updateField('problem', e.target.value)}
            className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
          />
        </div>

        {/* Column 2: Solution & Metrics */}
        <div className="space-y-3 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">4. Solution</span>
            <textarea
              rows={4}
              value={canvas.solution}
              onChange={(e) => updateField('solution', e.target.value)}
              className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">8. Key Metrics</span>
            <textarea
              rows={3}
              value={canvas.metrics}
              onChange={(e) => updateField('metrics', e.target.value)}
              className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
            />
          </div>
        </div>

        {/* Column 3: UVP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Unique Value (UVP)</span>
          <textarea
            rows={8}
            value={canvas.uvp}
            onChange={(e) => updateField('uvp', e.target.value)}
            className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
          />
        </div>

        {/* Column 4: Advantage & Channels */}
        <div className="space-y-3 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">5. Unfair Advantage</span>
            <textarea
              rows={4}
              value={canvas.advantage}
              onChange={(e) => updateField('advantage', e.target.value)}
              className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">9. Channels</span>
            <textarea
              rows={3}
              value={canvas.channels}
              onChange={(e) => updateField('channels', e.target.value)}
              className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
            />
          </div>
        </div>

        {/* Column 5: Customer Segments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Customer Segments</span>
          <textarea
            rows={8}
            value={canvas.segments}
            onChange={(e) => updateField('segments', e.target.value)}
            className="w-full flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
          />
        </div>
      </div>

      {/* Bottom Row: Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">7. Cost Structure</span>
          <textarea
            rows={3}
            value={canvas.cost}
            onChange={(e) => updateField('cost', e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">6. Revenue Streams</span>
          <textarea
            rows={3}
            value={canvas.revenue}
            onChange={(e) => updateField('revenue', e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
          />
        </div>
      </div>
    </div>
  );
}
