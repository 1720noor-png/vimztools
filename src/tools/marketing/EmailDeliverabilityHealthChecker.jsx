import React, { useState } from 'react';

const INDUSTRY_BENCHMARKS = {
  saas: { name: 'B2B SaaS', avgOpen: 21.5, avgCtr: 2.4, avgBounce: 1.2 },
  ecommerce: { name: 'E-commerce & Retail', avgOpen: 28.0, avgCtr: 3.1, avgBounce: 0.8 },
  agency: { name: 'Agency & Professional Services', avgOpen: 23.0, avgCtr: 2.8, avgBounce: 1.5 },
  media: { name: 'Media & Newsletters', avgOpen: 34.0, avgCtr: 4.5, avgBounce: 0.9 }
};

const SPAM_TRIGGER_WORDS = [
  '100% free', 'free cash', 'guaranteed', 'risk-free', 'act now', 'urgent',
  'winner', 'congratulations', 'no catch', 'make money', 'fast cash',
  'eliminate debt', 'double your', 'buy direct', 'lowest price', 'apply now',
  'claims', 'cure', 'hidden assets', 'unlimited'
];

export default function EmailDeliverabilityHealthChecker() {
  const [industryKey, setIndustryKey] = useState('saas');
  const [sentCount, setSentCount] = useState('25000');
  const [deliveredCount, setDeliveredCount] = useState('24650');
  const [bounceCount, setBounceCount] = useState('350');
  const [openCount, setOpenCount] = useState('5916');
  const [clickCount, setClickCount] = useState('862');
  const [complaintCount, setComplaintCount] = useState('12');
  const [unsubscribeCount, setUnsubscribeCount] = useState('85');

  const [subjectLine, setSubjectLine] = useState('Quick question regarding your conversion rate optimization roadmap');
  const [copied, setCopied] = useState(false);

  const sent = parseInt(sentCount, 10) || 0;
  const delivered = parseInt(deliveredCount, 10) || 0;
  const bounces = parseInt(bounceCount, 10) || 0;
  const opens = parseInt(openCount, 10) || 0;
  const clicks = parseInt(clickCount, 10) || 0;
  const complaints = parseInt(complaintCount, 10) || 0;
  const unsubs = parseInt(unsubscribeCount, 10) || 0;

  // Computed Rates
  const bounceRate = sent > 0 ? (bounces / sent) * 100 : 0;
  const openRate = delivered > 0 ? (opens / delivered) * 100 : 0;
  const ctr = delivered > 0 ? (clicks / delivered) * 100 : 0;
  const ctor = opens > 0 ? (clicks / opens) * 100 : 0;
  const complaintRate = delivered > 0 ? (complaints / delivered) * 100 : 0;
  const unsubRate = delivered > 0 ? (unsubs / delivered) * 100 : 0;

  const benchmark = INDUSTRY_BENCHMARKS[industryKey];

  // Spam Trigger Word Audit
  const lowerSubject = subjectLine.toLowerCase();
  const matchedSpamWords = SPAM_TRIGGER_WORDS.filter(w => lowerSubject.includes(w));
  const hasAllCaps = /[A-Z]{4,}/.test(subjectLine);
  const excessivePunctuation = /[!?]{2,}/.test(subjectLine);

  // Status Evaluations
  let bounceHealth = 'Healthy';
  let bounceColor = 'text-emerald-600 dark:text-emerald-400';
  if (bounceRate > 5.0) {
    bounceHealth = 'Critical Risk (ESP Suspension)';
    bounceColor = 'text-rose-600 dark:text-rose-400';
  } else if (bounceRate > 2.0) {
    bounceHealth = 'Warning (List Decay)';
    bounceColor = 'text-amber-600 dark:text-amber-400';
  }

  let complaintHealth = 'Compliant (<0.1%)';
  let complaintColor = 'text-emerald-600 dark:text-emerald-400';
  if (complaintRate >= 0.3) {
    complaintHealth = 'Severe Blocklist Risk';
    complaintColor = 'text-rose-600 dark:text-rose-400';
  } else if (complaintRate >= 0.1) {
    complaintHealth = 'Google/Yahoo Penalty Zone';
    complaintColor = 'text-amber-600 dark:text-amber-400';
  }

  const generateReport = () => {
    return `EMAIL DELIVERABILITY & CAMPAIGN HEALTH REPORT
============================================================
Industry Benchmark:        ${benchmark.name}
Total Emails Sent:         ${sent.toLocaleString()}
Total Delivered:           ${delivered.toLocaleString()}
------------------------------------------------------------
PERFORMANCE & REPUTATION METRICS:
• Bounce Rate:             ${bounceRate.toFixed(2)}% [Status: ${bounceHealth}] (Target: < 2.0%)
• Spam Complaint Rate:     ${complaintRate.toFixed(3)}% [Status: ${complaintHealth}] (Target: < 0.10%)
• Open Rate:               ${openRate.toFixed(1)}% (Industry Avg: ${benchmark.avgOpen}%)
• Click-Through Rate:      ${ctr.toFixed(2)}% (Industry Avg: ${benchmark.avgCtr}%)
• Click-to-Open (CTOR):    ${ctor.toFixed(1)}%
• Unsubscribe Rate:        ${unsubRate.toFixed(2)}%

SUBJECT LINE SPAM AUDIT:
"${subjectLine}"
• Flagged Trigger Words:   ${matchedSpamWords.length > 0 ? matchedSpamWords.join(', ') : 'None detected'}
• Excessive Capitalization: ${hasAllCaps ? 'Flagged (All-Caps word detected)' : 'Clean'}
• Excessive Punctuation:   ${excessivePunctuation ? 'Flagged (Multiple ! or ?)' : 'Clean'}

*Disclaimer: Heuristic analysis based on industry sender guidelines. Live delivery is influenced by SPF/DKIM/DMARC records and mailbox provider reputation algorithms.
============================================================`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReport());
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
              ✉️ Email Marketing & Reputation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Email Deliverability & Campaign Health Diagnostic
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit campaign metrics against Google/Yahoo 2024 bulk sender rules, track list decay thresholds, and scan subject lines for spam triggers.
            </p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Health Diagnostic'}
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Bounce Rate</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {bounceRate.toFixed(2)}%
          </div>
          <div className={`text-xs font-bold mt-1 ${bounceColor}`}>
            {bounceHealth}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Spam Complaint Rate</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {complaintRate.toFixed(3)}%
          </div>
          <div className={`text-xs font-bold mt-1 ${complaintColor}`}>
            {complaintHealth}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Open Rate vs. Avg</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {openRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Industry Benchmark: {benchmark.avgOpen}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Click-to-Open (CTOR)</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {ctor.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Content Engagement Ratio
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Metrics Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Campaign Metrics
              </h2>
              <select
                value={industryKey}
                onChange={(e) => setIndustryKey(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
              >
                {Object.entries(INDUSTRY_BENCHMARKS).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Total Sent</label>
                <input
                  type="number"
                  min="1"
                  value={sentCount}
                  onChange={(e) => setSentCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Delivered</label>
                <input
                  type="number"
                  min="0"
                  value={deliveredCount}
                  onChange={(e) => setDeliveredCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bounces</label>
                <input
                  type="number"
                  min="0"
                  value={bounceCount}
                  onChange={(e) => setBounceCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Unique Opens</label>
                <input
                  type="number"
                  min="0"
                  value={openCount}
                  onChange={(e) => setOpenCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Unique Clicks</label>
                <input
                  type="number"
                  min="0"
                  value={clickCount}
                  onChange={(e) => setClickCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Spam Complaints</label>
                <input
                  type="number"
                  min="0"
                  value={complaintCount}
                  onChange={(e) => setComplaintCount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Subject Line Spam Tester */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>🔍</span> Subject Line Heuristic Scanner
            </h2>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Email Subject Line to Test</label>
              <input
                type="text"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 text-xs">
              {matchedSpamWords.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl">
                  ⚠️ Trigger phrase detected: <strong>{matchedSpamWords.join(', ')}</strong>. Spam filters frequently penalize sales pressure language.
                </div>
              )}
              {hasAllCaps && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl">
                  ⚠️ Avoid ALL-CAPS words in subject lines; this heavily triggers promotional tab sorting.
                </div>
              )}
              {excessivePunctuation && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl">
                  ⚠️ Avoid repeated exclamation marks or question marks (e.g. "!!", "??").
                </div>
              )}
              {matchedSpamWords.length === 0 && !hasAllCaps && !excessivePunctuation && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  ✓ Subject line has no common spam keywords, excessive punctuation, or capitalization anomalies.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reputation Guidelines & Sender Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Google & Yahoo 2024 Bulk Sender Mandates
            </h3>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li><strong>0.10% Spam Threshold:</strong> Senders must keep spam complaint rates below 0.10% (1 per 1,000 delivered). Rates above 0.30% trigger aggressive inbox rejection.</li>
              <li><strong>Mandatory Authentication:</strong> Senders sending &gt;5,000 emails/day must have valid SPF, DKIM, and aligned DMARC policies configured.</li>
              <li><strong>1-Click Unsubscribe:</strong> Marketing and subscription emails must support RFC 8058 one-click unsubscribe headers.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              📌 Deliverability Disclaimer:
            </div>
            <p>
              This tool provides diagnostic benchmarks and content heuristic auditing. Actual inbox placement is governed by live mailbox provider reputation, domain age, subscriber engagement history, and server IP posture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
