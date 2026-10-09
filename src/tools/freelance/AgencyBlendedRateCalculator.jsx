import React, { useState } from 'react';

const DEFAULT_ROLES = [
  { id: 1, title: 'Strategic Director / Principal', count: 1, salary: 140000, utilPercent: 50 },
  { id: 2, title: 'Lead UI/UX Designer', count: 2, salary: 95000, utilPercent: 75 },
  { id: 3, title: 'Senior Full-Stack Engineer', count: 3, salary: 115000, utilPercent: 80 },
  { id: 4, title: 'Project / Delivery Manager', count: 1, salary: 85000, utilPercent: 40 },
  { id: 5, title: 'Associate / QA Engineer', count: 2, salary: 65000, utilPercent: 85 }
];

export default function AgencyBlendedRateCalculator() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [annualHours, setAnnualHours] = useState('2080'); // 40 hrs * 52 wks
  const [overheadExpenses, setOverheadExpenses] = useState('180000'); // Rent, SaaS, Legal, Accounting
  const [targetMargin, setTargetMargin] = useState('35'); // 35% gross profit margin
  const [copied, setCopied] = useState(false);

  const hoursPerFte = parseFloat(annualHours) || 2080;
  const overhead = parseFloat(overheadExpenses) || 0;
  const marginPct = (parseFloat(targetMargin) || 0) / 100;

  // Compute team totals
  let totalHeadcount = 0;
  let totalLaborCost = 0;
  let totalBillableHours = 0;

  const roleCalculations = roles.map(role => {
    const count = parseInt(role.count, 10) || 0;
    const salary = parseFloat(role.salary) || 0;
    const util = (parseFloat(role.utilPercent) || 0) / 100;

    const roleLaborCost = count * salary;
    const roleBillableHours = count * hoursPerFte * util;

    totalHeadcount += count;
    totalLaborCost += roleLaborCost;
    totalBillableHours += roleBillableHours;

    return {
      ...role,
      roleLaborCost,
      roleBillableHours,
      directCostPerHour: roleBillableHours > 0 ? roleLaborCost / roleBillableHours : 0
    };
  });

  const totalAgencyCost = totalLaborCost + overhead;
  const breakevenCostPerHour = totalBillableHours > 0 ? totalAgencyCost / totalBillableHours : 0;
  const blendedHourlyRate = marginPct < 1 && marginPct >= 0 ? breakevenCostPerHour / (1 - marginPct) : breakevenCostPerHour;
  const targetAnnualRevenue = totalBillableHours * blendedHourlyRate;
  const targetGrossProfit = targetAnnualRevenue - totalAgencyCost;

  const updateRole = (id, field, value) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRole = () => {
    const newId = Date.now();
    setRoles([...roles, { id: newId, title: 'New Agency Role', count: 1, salary: 80000, utilPercent: 75 }]);
  };

  const removeRole = (id) => {
    if (roles.length <= 1) return;
    setRoles(roles.filter(r => r.id !== id));
  };

  const generateReportText = () => {
    return `AGENCY BLENDED BILLING RATE & CAPACITY REPORT
============================================================
Total Agency Team Size:        ${totalHeadcount} FTEs
Annual Available Billable:     ${Math.round(totalBillableHours).toLocaleString()} hours
Total Annual Operating Cost:   $${Math.round(totalAgencyCost).toLocaleString()} USD
Target Gross Profit Margin:    ${targetMargin}%
------------------------------------------------------------
RECOMMENDED BLENDED BILLING RATE:  $${Math.round(blendedHourlyRate)} / hour
Agency Breakeven Floor Rate:       $${Math.round(breakevenCostPerHour)} / hour
Target Annual Billable Revenue:    $${Math.round(targetAnnualRevenue).toLocaleString()}
Projected Annual Gross Profit:     $${Math.round(targetGrossProfit).toLocaleString()}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🏢 Agency Economics & Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Agency Blended Rate & Capacity Utilization Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Model multi-role team capacity, factor in non-billable overhead, and calculate your true blended billing rate to maintain profit margins.
            </p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Financial Model'}
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Recommended Blended Rate</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ${Math.round(blendedHourlyRate)}<span className="text-sm font-normal text-slate-400">/hr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">At {targetMargin}% target margin</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Breakeven Floor Rate</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            ${Math.round(breakevenCostPerHour)}<span className="text-sm font-normal text-slate-400">/hr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">0% profit threshold</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Total Billable Hours</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {Math.round(totalBillableHours).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Annual team capacity</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Target Annual Revenue</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${(targetAnnualRevenue / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">${(targetGrossProfit / 1000).toFixed(0)}k gross profit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Agency Team Roles & Billable Utilization
              </h2>
              <button
                onClick={addRole}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
              >
                ➕ Add Role
              </button>
            </div>

            <div className="space-y-3">
              {roleCalculations.map((role) => (
                <div
                  key={role.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                      className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 text-slate-900 dark:text-white focus:outline-none w-2/3"
                    />
                    <button
                      onClick={() => removeRole(role.id)}
                      className="text-slate-400 hover:text-red-500 text-xs"
                      title="Remove Role"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Headcount (FTEs)</label>
                      <input
                        type="number"
                        min="1"
                        value={role.count}
                        onChange={(e) => updateRole(role.id, 'count', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Annual Salary ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={role.salary}
                        onChange={(e) => updateRole(role.id, 'salary', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Target Billability (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={role.utilPercent}
                        onChange={(e) => updateRole(role.id, 'utilPercent', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                    <span>Direct Billable Hours: {Math.round(role.roleBillableHours).toLocaleString()} hrs</span>
                    <span>Cost per Billable Hour: ${Math.round(role.directCostPerHour)}/hr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agency Overhead & Margin Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Overhead & Margin Targets
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Annual Overhead Expenses ($)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={overheadExpenses}
                onChange={(e) => setOverheadExpenses(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Office rent, SaaS tools, legal, marketing & insurance.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Target Gross Profit Margin (%)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Typical digital agencies target 30% to 50% gross margin.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Standard Annual Hours per FTE
              </label>
              <input
                type="number"
                value={annualHours}
                onChange={(e) => setAnnualHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard 2,080 hrs (40 hours/week × 52 weeks).
              </span>
            </div>
          </div>

          {/* Mathematical Formula Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white">
              📐 Mathematical Derivation:
            </div>
            <p className="font-mono text-[11px] text-amber-700 dark:text-amber-300">
              Blended Rate = [Total Costs / Billable Hours] ÷ (1 - Margin)
            </p>
            <p className="text-[11px] leading-relaxed">
              This formula guarantees that non-billable leadership, vacation time, and operational overhead are fully absorbed into every invoiced client hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
