import React, { useState, useId } from 'react';

// Accurate Standard Normal Cumulative Distribution Function (Abramowitz & Stegun formula 26.2.17)
function normalCdf(z) {
  if (isNaN(z)) return 0.5;
  if (z === 0) return 0.5;
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const t = 1.0 / (1.0 + p * absZ);
  const zDensity = (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absZ * absZ);
  const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  const cdf = 1.0 - zDensity * poly;
  return sign === 1 ? cdf : 1.0 - cdf;
}

export default function AbTestCalculator() {
  const visitorsAId = useId();
  const convAId = useId();
  const visitorsBId = useId();
  const convBId = useId();
  const confId = useId();
  const baselineRateId = useId();
  const mdeId = useId();

  // Inputs for A/B Test
  const [controlVisitors, setControlVisitors] = useState('10000');
  const [controlConversions, setControlConversions] = useState('450');
  const [variantVisitors, setVariantVisitors] = useState('10000');
  const [variantConversions, setVariantConversions] = useState('520');
  const [confidenceLevel, setConfidenceLevel] = useState('0.95');

  // Inputs for Sample Size Estimator
  const [baselineRate, setBaselineRate] = useState('4.5');
  const [mdePercent, setMdePercent] = useState('10');

  const [copied, setCopied] = useState(false);

  // Parse numbers
  const nA = parseInt(controlVisitors, 10);
  const cA = parseInt(controlConversions, 10);
  const nB = parseInt(variantVisitors, 10);
  const cB = parseInt(variantConversions, 10);
  const confThreshold = parseFloat(confidenceLevel);

  // Validation
  let error = '';
  if (isNaN(nA) || nA <= 0) error = 'Enter a valid visitor count for Control (A).';
  else if (isNaN(cA) || cA < 0) error = 'Enter valid conversions for Control (A).';
  else if (cA > nA) error = 'Control conversions cannot exceed total visitors.';
  else if (isNaN(nB) || nB <= 0) error = 'Enter a valid visitor count for Variant (B).';
  else if (isNaN(cB) || cB < 0) error = 'Enter valid conversions for Variant (B).';
  else if (cB > nB) error = 'Variant conversions cannot exceed total visitors.';

  let stats = null;
  if (!error) {
    const pA = cA / nA;
    const pB = cB / nB;
    const diff = pB - pA;
    const relativeUplift = pA > 0 ? (diff / pA) * 100 : 0;

    // Pooled proportion for hypothesis testing (H0: pA = pB)
    const pooledP = (cA + cB) / (nA + nB);
    const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1 / nA + 1 / nB));

    // Z-Score and two-tailed P-value
    const zScore = sePooled > 0 ? diff / sePooled : 0;
    const absZ = Math.abs(zScore);
    const pValue = 2 * (1 - normalCdf(absZ));

    // Confidence Interval for the difference (unpooled standard error)
    const seDiff = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
    // Critical Z value based on selected confidence
    let zCrit = 1.96;
    if (confThreshold === 0.90) zCrit = 1.645;
    else if (confThreshold === 0.99) zCrit = 2.576;

    const ciLower = (diff - zCrit * seDiff) * 100;
    const ciUpper = (diff + zCrit * seDiff) * 100;

    // Significance determination
    const isSignificant = pValue < (1 - confThreshold);
    const isWinner = isSignificant && diff > 0;
    const isLoser = isSignificant && diff < 0;

    // Sample Ratio Mismatch (SRM) check (testing if traffic split is roughly 50:50 or expected)
    const totalN = nA + nB;
    const expectedSplit = 0.5;
    const zSrm = (nA - totalN * expectedSplit) / Math.sqrt(totalN * expectedSplit * (1 - expectedSplit));
    const srmPValue = 2 * (1 - normalCdf(Math.abs(zSrm)));
    const srmFlag = totalN > 500 && srmPValue < 0.001;

    stats = {
      pA: (pA * 100).toFixed(2),
      pB: (pB * 100).toFixed(2),
      diff: (diff * 100).toFixed(2),
      relativeUplift: relativeUplift.toFixed(2),
      zScore: zScore.toFixed(3),
      pValue: pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4),
      ciLower: ciLower.toFixed(2),
      ciUpper: ciUpper.toFixed(2),
      isSignificant,
      isWinner,
      isLoser,
      srmFlag,
      srmPValue: srmPValue.toFixed(4)
    };
  }

  // Sample Size Estimation (Evan Miller standard approximation for 80% power at alpha = 0.05)
  const baseP = (parseFloat(baselineRate) || 0) / 100;
  const mde = (parseFloat(mdePercent) || 0) / 100;
  let sampleSizePerVar = 0;
  if (baseP > 0 && baseP < 1 && mde > 0) {
    const delta = baseP * mde;
    // Approximation: 16 * p * (1 - p) / delta^2 (where 16 corresponds to (Z_alpha/2 + Z_beta)^2 approx 7.85 for 2 arms ~ 16)
    sampleSizePerVar = Math.round((16 * baseP * (1 - baseP)) / (delta * delta));
  }

  const copyReport = () => {
    if (!stats) return;
    const summary = `Vimz.ai A/B Test Statistical Significance Report
=============================================
Control (A): ${controlVisitors} visitors, ${controlConversions} conversions (${stats.pA}%)
Variant (B): ${variantVisitors} visitors, ${variantConversions} conversions (${stats.pB}%)
Relative Uplift: ${stats.relativeUplift}%
Absolute Difference: ${stats.diff}%
Z-Score: ${stats.zScore}
Two-Tailed P-Value: ${stats.pValue}
Confidence Level: ${(confThreshold * 100).toFixed(0)}%
Confidence Interval: [${stats.ciLower}%, ${stats.ciUpper}%]
Verdict: ${stats.isWinner ? 'Statistically Significant Winner (Variant B)' : stats.isLoser ? 'Statistically Significant Loser (Variant B underperformed)' : 'Inconclusive (No statistically significant difference)'}
${stats.srmFlag ? 'WARNING: Sample Ratio Mismatch detected! Investigate traffic allocation.' : ''}
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📊 Conversion Rate Optimization (CRO)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              A/B Test Statistical Significance Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Validate two-proportion conversion tests with two-tailed p-values, z-scores, confidence intervals, and sample ratio mismatch checks.
            </p>
          </div>
          {stats && (
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy Report'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔬</span> Test Traffic & Conversions
            </h2>

            {/* Control A */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Control Group (A)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={visitorsAId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Total Visitors</label>
                  <input
                    id={visitorsAId}
                    type="number"
                    min="1"
                    value={controlVisitors}
                    onChange={(e) => setControlVisitors(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor={convAId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Conversions</label>
                  <input
                    id={convAId}
                    type="number"
                    min="0"
                    value={controlConversions}
                    onChange={(e) => setControlConversions(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Variant B */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Variant Group (B)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={visitorsBId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Total Visitors</label>
                  <input
                    id={visitorsBId}
                    type="number"
                    min="1"
                    value={variantVisitors}
                    onChange={(e) => setVariantVisitors(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor={convBId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Conversions</label>
                  <input
                    id={convBId}
                    type="number"
                    min="0"
                    value={variantConversions}
                    onChange={(e) => setVariantConversions(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <label htmlFor={confId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confidence Level Threshold
              </label>
              <select
                id={confId}
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              >
                <option value="0.90">90% Confidence (α = 0.10 — Fast exploratory tests)</option>
                <option value="0.95">95% Confidence (α = 0.05 — Industry standard)</option>
                <option value="0.99">99% Confidence (α = 0.01 — High-risk checkout tests)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Sample Size Calculator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📐</span> Pre-Test Sample Size Estimator (80% Power)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate how many visitors per variation you need before launching to reliably detect an uplift.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={baselineRateId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Baseline Rate (%)</label>
                <input
                  id={baselineRateId}
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="99"
                  value={baselineRate}
                  onChange={(e) => setBaselineRate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor={mdeId} className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Min. Detectable Uplift (%)</label>
                <input
                  id={mdeId}
                  type="number"
                  step="1"
                  min="1"
                  value={mdePercent}
                  onChange={(e) => setMdePercent(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
            {sampleSizePerVar > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Required per variation:</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {sampleSizePerVar.toLocaleString()} visitors
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Total test sample: {(sampleSizePerVar * 2).toLocaleString()} visitors
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistical Results */}
        <div className="lg:col-span-7 space-y-6">
          {stats ? (
            <>
              {/* Verdict Banner */}
              <div className={`rounded-2xl p-6 border shadow-sm ${
                stats.isWinner
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : stats.isLoser
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {stats.isWinner ? '🏆' : stats.isLoser ? '📉' : '⏳'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {stats.isWinner
                        ? 'Variant B is a Statistically Significant Winner!'
                        : stats.isLoser
                        ? 'Variant B Underperformed Statistically'
                        : 'Results are Inconclusive (Not Significant Yet)'}
                    </h3>
                    <p className="text-sm mt-1 opacity-90">
                      {stats.isWinner
                        ? `Variant B produced a +${stats.relativeUplift}% relative lift over Control with p = ${stats.pValue} (exceeding ${(confThreshold * 100).toFixed(0)}% confidence).`
                        : stats.isLoser
                        ? `Variant B conversion rate dropped by ${stats.relativeUplift}% with p = ${stats.pValue}. Reverting to Control is recommended.`
                        : `The observed difference (${stats.diff}%) has a p-value of ${stats.pValue}, which is above α = ${(1 - confThreshold).toFixed(2)}. Do not stop the test early.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Ratio Mismatch Warning */}
              {stats.srmFlag && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⚠️</span> Potential Sample Ratio Mismatch (SRM) Detected (p = {stats.srmPValue})
                  </div>
                  <p>
                    The visitor distribution between Control and Variant deviates significantly from expected traffic routing. This often indicates a redirect bug, tracking failure, or bot filter imbalance. Results may be invalid.
                  </p>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Control Rate (A)</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.pA}%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Variant Rate (B)</div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.pB}%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Relative Uplift</div>
                  <div className={`text-xl font-bold mt-1 ${parseFloat(stats.relativeUplift) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {parseFloat(stats.relativeUplift) >= 0 ? `+${stats.relativeUplift}%` : `${stats.relativeUplift}%`}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Two-Tailed P-Value</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.pValue}</div>
                </div>
              </div>

              {/* Detailed Statistical Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Statistical Test Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Calculated Z-Score</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{stats.zScore}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Absolute Difference</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{stats.diff > 0 ? `+${stats.diff}%` : `${stats.diff}%`}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">{(confThreshold * 100).toFixed(0)}% Confidence Interval of Difference</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">[{stats.ciLower}%, {stats.ciUpper}%]</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Hypothesis Result</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stats.isSignificant ? `Reject Null Hypothesis (H0)` : `Fail to Reject Null Hypothesis`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Best Practices Note */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  📌 Critical Statistical Caveats:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>The Peeking Problem:</strong> Repeatedly checking significance before reaching the planned sample size inflates false positive rates (Type I error). Always decide sample size upfront.</li>
                  <li><strong>Full Business Cycles:</strong> Run tests for at least one or two full weekly cycles to normalize weekday vs. weekend conversion swings.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Enter valid visitor and conversion counts to view statistical analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
