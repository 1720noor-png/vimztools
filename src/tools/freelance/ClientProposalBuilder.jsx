import React, { useState } from 'react';

export default function ClientProposalBuilder() {
  const [clientName, setClientName] = useState('Sarah Jenkins');
  const [clientCompany, setClientCompany] = useState('Nexus Retail Group');
  const [projectTitle, setProjectTitle] = useState('E-commerce Checkout & Conversion Rate Redesign');
  const [timelineWeeks, setTimelineWeeks] = useState('6');
  const [feeAmount, setFeeAmount] = useState('8500');
  const [paymentTerms, setPaymentTerms] = useState('50% Upfront, 50% Upon Final Milestone Approval');
  const [validDays, setValidDays] = useState('14');

  const [problemStatement, setProblemStatement] = useState(
    'Nexus Retail Group currently experiences a 72% cart abandonment rate on mobile devices, driven by complex form validation and lack of express payment gateways.'
  );

  const [deliverables, setDeliverables] = useState(
    '1. Mobile UX/UI wireframes and interactive Figma prototype.\n2. Integration of Apple Pay, Google Pay, and 1-click checkout.\n3. A/B testing implementation to measure conversion uplift.\n4. Comprehensive post-launch analytics dashboard.'
  );

  const [copied, setCopied] = useState(false);

  const generateProposalText = () => {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + parseInt(validDays || '14', 10));

    return `CLIENT PROJECT PROPOSAL
==================================================
PREPARED FOR: ${clientName} (${clientCompany})
PROJECT:      ${projectTitle}
DATE:         ${today.toLocaleDateString()}
VALID UNTIL:  ${expiryDate.toLocaleDateString()} (${validDays} days)
==================================================

1. EXECUTIVE SUMMARY & PROBLEM STATEMENT
--------------------------------------------------
${problemStatement}

2. SCOPE OF WORK & KEY DELIVERABLES
--------------------------------------------------
${deliverables}

3. PROJECT TIMELINE & ESTIMATED DURATION
--------------------------------------------------
Estimated completion: ${timelineWeeks} weeks from kickoff deposit.

4. COMMERCIAL INVESTMENT & PAYMENT TERMS
--------------------------------------------------
Total Project Investment: $${parseInt(feeAmount || '0', 10).toLocaleString()} USD
Payment Schedule:         ${paymentTerms}

5. ACCEPTANCE & AUTHORIZATION
--------------------------------------------------
To approve this proposal and schedule the project kickoff:

Client Signature:   ______________________________________
Print Name / Title: ${clientName}
Date:               ______________________________________
`;
  };

  const copyProposal = () => {
    navigator.clipboard.writeText(generateProposalText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              💼 Freelance & Client Contracts
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Client Proposal & SOW Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create professional, client-ready project proposals with clear problem statements, deliverables, milestones, and payment terms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printProposal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              🖨️ Print / PDF
            </button>
            <button
              onClick={copyProposal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy Proposal'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Project & Client Details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Client Contact Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Client Organization</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Project Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">The Problem / Challenge Being Solved</label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Deliverables & Scope</label>
              <textarea
                rows={4}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  min="1"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Total Fee ($)</label>
                <input
                  type="number"
                  min="0"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Valid Days</label>
                <input
                  type="number"
                  min="1"
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Document Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Proposal Document Preview
            </h3>
            <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generateProposalText()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
