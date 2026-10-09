import React, {useState } from 'react';

export default function AgencyPitchProposalGenerator() {
  const [clientName, setClientName] = useState('Acme Corporation');
  const [projectTitle, setProjectTitle] = useState('Autonomous AI Growth & Operations Engine');
  const [timeline, setTimeline] = useState('6 Weeks');
  const [pricingTier, setPricingTier] = useState('18,500');
  const [copied, setCopied] = useState(false);

  const generateProposal = () => {
    return `================================================================================
STATEMENT OF WORK & COMMERCIAL PROPOSAL
================================================================================

PREPARED FOR:
${clientName}

PROJECT INITIATIVE:
${projectTitle}

PROJECT TIMELINE:
${timeline} Delivery & Implementation Sprint

TOTAL INVESTMENT:
$${pricingTier} USD (Milestone-based billing: 50% upfront, 50% upon final acceptance)

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY & OBJECTIVES
--------------------------------------------------------------------------------
${clientName} is seeking to eliminate manual operational drag, streamline cross-platform publishing, and deploy autonomous agentic workflows to increase high-leverage team output by 3-5x. 

Our agency will architect, deploy, and verify the infrastructure end-to-end.

--------------------------------------------------------------------------------
2. SCOPE OF DELIVERABLES
--------------------------------------------------------------------------------
Phase 1: Discovery & Workflow Audit (Weeks 1-2)
• Deep-dive audit of current team bottlenecks and software stack.
• Data ingestion architecture design and benchmark metrics definition.

Phase 2: Custom Agent & Automation Engineering (Weeks 3-4)
• Build tailored agentic loops for CRM synchronization, automated drafting, and data parsing.
• Implement continuous hallucination checks and evaluation guardrails.

Phase 3: Integration, Team Onboarding & Hand-off (Weeks 5-6)
• Live deployment to production environment.
• Full documentation, SOP video guides, and 30-day post-launch support.

--------------------------------------------------------------------------------
3. TERMS & ACCEPTANCE
--------------------------------------------------------------------------------
Authorized Client Signature: _______________________   Date: ___________
Agency Lead Signature:       _______________________   Date: ___________

Generated via Vimz.ai Commercial Proposal Engine`;
  };

  const output = generateProposal();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📄 Client Commercials
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Agency Client Pitch & Proposal Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate structured statements of work (SOW), client project deliverables, milestone timelines, and professional investment agreements.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied  ? '✓' : '📋'}
            {copied ? 'Copied SOW Proposal!' : 'Copy Proposal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Client / Company Name</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Project Initiative Name</label>
              <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Timeline</label>
                <input type="text" value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Total Fixed Fee ($)</label>
                <input type="text" value={pricingTier} onChange={(e) => setPricingTier(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Formal Statement of Work (SOW) Preview
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
