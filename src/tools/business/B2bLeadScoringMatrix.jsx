import React, { useState } from 'react';

const BANT_DEFINITIONS = {
  budget: {
    label: 'Budget (Financial Capacity)',
    options: [
      { text: 'Budget fully allocated & approved for current quarter ($50k+)', score: 100 },
      { text: 'Budget exists, requires standard VP/finance sign-off ($20k-$50k)', score: 75 },
      { text: 'Budget unallocated; discretionary reallocation possible (<$20k)', score: 40 },
      { text: 'No budget allocated; price shopping or seeking free tier', score: 10 }
    ]
  },
  authority: {
    label: 'Authority (Decision-Making Power)',
    options: [
      { text: 'Direct Economic Buyer / Final Signer (C-Level, VP, Owner)', score: 100 },
      { text: 'Core Buying Committee Member with strong veto power (Director, Lead)', score: 75 },
      { text: 'Internal Champion / End-User without purchasing authority', score: 45 },
      { text: 'Individual researcher / Student / Entry-level contact', score: 10 }
    ]
  },
  need: {
    label: 'Need (Pain Point Severity)',
    options: [
      { text: 'Mission-critical bottleneck causing measurable revenue loss', score: 100 },
      { text: 'High-priority business challenge with active initiative mandate', score: 75 },
      { text: 'Moderate inconvenience / Nice-to-have workflow optimization', score: 40 },
      { text: 'General curiosity / No clear business pain identified', score: 10 }
    ]
  },
  timeline: {
    label: 'Timeline (Urgency to Implement)',
    options: [
      { text: 'Immediate rollout scheduled within 30 days', score: 100 },
      { text: 'Active evaluation for the upcoming quarter (30–90 days)', score: 75 },
      { text: 'Medium-term consideration (3–6 months)', score: 40 },
      { text: 'Undefined or distant roadmap timeline (6+ months)', score: 10 }
    ]
  }
};

export default function B2bLeadScoringMatrix() {
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Enterprise FinTech Lead (Stripe)',
      contact: 'Jordan Vance (VP of Ops)',
      dealSize: '$45,000',
      bIdx: 0,
      aIdx: 0,
      nIdx: 0,
      tIdx: 1
    },
    {
      id: 2,
      name: 'Mid-Market E-commerce (Glossier)',
      contact: 'Claire Miller (Head of Growth)',
      dealSize: '$18,000',
      bIdx: 1,
      aIdx: 1,
      nIdx: 1,
      tIdx: 2
    }
  ]);

  const [activeLeadId, setActiveLeadId] = useState(1);

  // Criteria Weights (Default 25% each)
  const [weights, setWeights] = useState({
    budget: 25,
    authority: 30,
    need: 25,
    timeline: 20
  });

  const [copied, setCopied] = useState(false);

  const activeLead = leads.find(l => l.id === activeLeadId) || leads[0];

  const calculateLeadScore = (lead) => {
    const bScore = BANT_DEFINITIONS.budget.options[lead.bIdx].score;
    const aScore = BANT_DEFINITIONS.authority.options[lead.aIdx].score;
    const nScore = BANT_DEFINITIONS.need.options[lead.nIdx].score;
    const tScore = BANT_DEFINITIONS.timeline.options[lead.tIdx].score;

    const totalWeight = (weights.budget + weights.authority + weights.need + weights.timeline) || 100;
    const weightedScore = (
      (bScore * weights.budget) +
      (aScore * weights.authority) +
      (nScore * weights.need) +
      (tScore * weights.timeline)
    ) / totalWeight;

    let tier = 'Unqualified / Low Priority';
    let tierColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800';
    let recommendation = 'Route to automated email nurture or self-serve content.';

    if (weightedScore >= 75) {
      tier = 'Sales Qualified Lead (SQL)';
      tierColor = 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/60';
      recommendation = 'Book discovery call immediately with Senior Account Executive.';
    } else if (weightedScore >= 50) {
      tier = 'Marketing Qualified Lead (MQL)';
      tierColor = 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/60';
      recommendation = 'Share case studies and schedule product demo to build urgency.';
    }

    return {
      score: Math.round(weightedScore),
      bScore,
      aScore,
      nScore,
      tScore,
      tier,
      tierColor,
      recommendation
    };
  };

  const currentResult = calculateLeadScore(activeLead);

  const updateLeadField = (field, value) => {
    setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, [field]: value } : l));
  };

  const addNewLead = () => {
    const newId = Date.now();
    const newLead = {
      id: newId,
      name: `Prospective Account #${leads.length + 1}`,
      contact: 'Primary Contact',
      dealSize: '$10,000',
      bIdx: 2,
      aIdx: 2,
      nIdx: 2,
      tIdx: 2
    };
    setLeads([...leads, newLead]);
    setActiveLeadId(newId);
  };

  const exportSummaryText = () => {
    return `B2B LEAD QUALIFICATION & SCORING SUMMARY
============================================================
Lead Name:     ${activeLead.name}
Key Contact:   ${activeLead.contact}
Target ACV:    ${activeLead.dealSize}
Calculated:    ${new Date().toLocaleDateString()}
------------------------------------------------------------
OVERALL QUALIFICATION SCORE: ${currentResult.score} / 100
SALES TIER:                  ${currentResult.tier}
NEXT ACTION:                 ${currentResult.recommendation}
------------------------------------------------------------
BANT BREAKDOWN:
• Budget:     ${currentResult.bScore}/100 (Weight: ${weights.budget}%)
• Authority:  ${currentResult.aScore}/100 (Weight: ${weights.authority}%)
• Need:       ${currentResult.nScore}/100 (Weight: ${weights.need}%)
• Timeline:   ${currentResult.tScore}/100 (Weight: ${weights.timeline}%)

*Note: Qualification scores are heuristic sales qualification estimates, not predictive statistical certainties.
============================================================`;
  };

  const copySummary = () => {
    navigator.clipboard.writeText(exportSummaryText());
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
              🎯 B2B Sales Operations & CRM
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              B2B Lead Scoring & BANT Qualification Matrix
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Score inbound and outbound prospects across Budget, Authority, Need, and Timeline with configurable weighting and qualification tiers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addNewLead}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              ➕ Add Lead
            </button>
            <button
              onClick={copySummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy Lead Card'}
            </button>
          </div>
        </div>

        {/* Lead Switcher Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
          {leads.map(lead => {
            const sc = calculateLeadScore(lead);
            const isActive = lead.id === activeLeadId;
            return (
              <button
                key={lead.id}
                onClick={() => setActiveLeadId(lead.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{lead.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${sc.score >= 75 ? 'bg-emerald-500 text-white' : sc.score >= 50 ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'}`}>
                  {sc.score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Matrix */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Account Metadata
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Company Account Name</label>
                <input
                  type="text"
                  value={activeLead.name}
                  onChange={(e) => updateLeadField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Key Stakeholder</label>
                <input
                  type="text"
                  value={activeLead.contact}
                  onChange={(e) => updateLeadField('contact', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Estimated Deal Size (ACV)</label>
                <input
                  type="text"
                  value={activeLead.dealSize}
                  onChange={(e) => updateLeadField('dealSize', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* BANT Evaluation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              BANT Criteria Evaluation
            </h2>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">1. {BANT_DEFINITIONS.budget.label}</span>
                <span className="text-slate-400">Weight: {weights.budget}%</span>
              </div>
              <select
                value={activeLead.bIdx}
                onChange={(e) => updateLeadField('bIdx', parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {BANT_DEFINITIONS.budget.options.map((opt, i) => (
                  <option key={i} value={i}>{opt.text} ({opt.score} pts)</option>
                ))}
              </select>
            </div>

            {/* Authority */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">2. {BANT_DEFINITIONS.authority.label}</span>
                <span className="text-slate-400">Weight: {weights.authority}%</span>
              </div>
              <select
                value={activeLead.aIdx}
                onChange={(e) => updateLeadField('aIdx', parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {BANT_DEFINITIONS.authority.options.map((opt, i) => (
                  <option key={i} value={i}>{opt.text} ({opt.score} pts)</option>
                ))}
              </select>
            </div>

            {/* Need */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">3. {BANT_DEFINITIONS.need.label}</span>
                <span className="text-slate-400">Weight: {weights.need}%</span>
              </div>
              <select
                value={activeLead.nIdx}
                onChange={(e) => updateLeadField('nIdx', parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {BANT_DEFINITIONS.need.options.map((opt, i) => (
                  <option key={i} value={i}>{opt.text} ({opt.score} pts)</option>
                ))}
              </select>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">4. {BANT_DEFINITIONS.timeline.label}</span>
                <span className="text-slate-400">Weight: {weights.timeline}%</span>
              </div>
              <select
                value={activeLead.tIdx}
                onChange={(e) => updateLeadField('tIdx', parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {BANT_DEFINITIONS.timeline.options.map((opt, i) => (
                  <option key={i} value={i}>{opt.text} ({opt.score} pts)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Qualification Scorecard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lead Score
                </span>
                <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                  {currentResult.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentResult.tierColor}`}>
                {currentResult.tier}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-200">Recommended Sales Action:</div>
              <p className="text-slate-600 dark:text-slate-400">{currentResult.recommendation}</p>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Budget Match:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentResult.bScore}/100</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Authority Level:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentResult.aScore}/100</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Pain Severity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentResult.nScore}/100</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Deployment Timeline:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentResult.tScore}/100</span>
              </div>
            </div>

            {/* Methodology Disclaimer */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              ⚠️ <strong>Methodology Note:</strong> This score represents a standardized qualification heuristic for pipeline triage, not a statistically predictive forecast.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
