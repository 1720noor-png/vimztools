import React, { useState } from 'react';

const INITIAL_STAGES = [
  { id: 1, name: '1. Inbound / MQL', count: 200, convRate: 40, dealSize: 12000, days: 5 },
  { id: 2, name: '2. Discovery Call', count: 80, convRate: 50, dealSize: 12000, days: 7 },
  { id: 3, name: '3. Technical Demo', count: 40, convRate: 60, dealSize: 12000, days: 12 },
  { id: 4, name: '4. Executive Proposal', count: 24, convRate: 50, dealSize: 12000, days: 10 },
  { id: 5, name: '5. Contract / Legal', count: 12, convRate: 80, dealSize: 12000, days: 8 },
  { id: 6, name: '6. Closed Won', count: 10, convRate: 100, dealSize: 12000, days: 0 }
];

export default function SalesPipelineStagePlanner() {
  const [stages, setStages] = useState(INITIAL_STAGES);

  const updateStage = (index, field, value) => {
    const updated = [...stages];
    updated[index][field] = Number(value);
    
    // Automatically cascade counts if conversion rate or initial count changed
    if (field === 'count' || field === 'convRate') {
      for (let i = 0; i < updated.length - 1; i++) {
        const nextCount = Math.round(updated[i].count * (updated[i].convRate / 100));
        updated[i + 1].count = nextCount;
      }
    }
    setStages(updated);
  };

  const initialDeals = stages[0]?.count || 0;
  const wonDeals = stages[stages.length - 1]?.count || 0;
  const overallWinRate = initialDeals > 0 ? ((wonDeals / initialDeals) * 100).toFixed(1) : 0;
  const avgDealSize = stages[stages.length - 1]?.dealSize || 10000;
  const totalPipelineValue = stages.reduce((acc, s) => acc + (s.count * s.dealSize), 0);
  const projectedRevenue = wonDeals * avgDealSize;
  const totalCycleDays = stages.reduce((acc, s) => acc + (s.days || 0), 0);

  // Sales Velocity = (Qualified Opportunities * Win Rate % * Avg Deal Size) / Sales Cycle Days
  const salesVelocityDaily = totalCycleDays > 0 
    ? Math.round((initialDeals * (overallWinRate / 100) * avgDealSize) / totalCycleDays)
    : 0;
  const salesVelocityMonthly = salesVelocityDaily * 30;

  // Identify bottleneck: stage with highest deal drop-off value
  let worstStage = null;
  let maxLossValue = 0;
  for (let i = 0; i < stages.length - 1; i++) {
    const droppedCount = stages[i].count - stages[i + 1].count;
    const lossVal = droppedCount * stages[i].dealSize;
    if (lossVal > maxLossValue) {
      maxLossValue = lossVal;
      worstStage = { ...stages[i], lostDeals: droppedCount, lostValue: lossVal };
    }
  }

  const exportCSV = () => {
    let csv = 'Stage,Active_Deals,Conversion_Rate_Pct,Avg_Deal_Size,Days_In_Stage,Projected_Stage_Value\n';
    stages.forEach(s => {
      csv += `"${s.name}",${s.count},${s.convRate}%,$${s.dealSize},${s.days},$${s.count * s.dealSize}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_pipeline_velocity_report.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Sales Pipeline Stage Velocity & Leakage Planner</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Model stage conversions, identify pipeline leaks, and calculate revenue velocity ($/day).
          </p>
        </div>
        <button onClick={exportCSV} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Pipeline CSV</button>
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Projected Closed Won Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success, #0D9B79)' }}>${projectedRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>From {wonDeals} Closed Won deals</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Daily Pipeline Velocity</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary, #6C4CF1)' }}>${salesVelocityDaily.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/day</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>${salesVelocityMonthly.toLocaleString()} / month run-rate</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Full Funnel Win Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB' }}>{overallWinRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{initialDeals} MQLs ➔ {wonDeals} Customers</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Sales Cycle Duration</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>{totalCycleDays} Days</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Average time from lead to contract</div>
        </div>
      </div>

      {/* Primary Bottleneck Alert */}
      {worstStage && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🚨</span>
          <div>
            <strong style={{ color: '#BE123C' }}>Primary Pipeline Bottleneck Identified: {worstStage.name}</strong>
            <div style={{ fontSize: '0.85rem', color: '#9F1239', marginTop: '0.2rem' }}>
              Dropping <strong>{worstStage.lostDeals} deals</strong> (${worstStage.lostValue.toLocaleString()} lost pipeline value) with a {100 - worstStage.convRate}% drop-off rate. Improving this stage by 10% unlocks ${(worstStage.count * 0.1 * worstStage.dealSize).toLocaleString()} in incremental pipeline.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Stages Table */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '0.8rem 1rem' }}>Stage Name</th>
              <th style={{ padding: '0.8rem 1rem' }}>Deals Entering</th>
              <th style={{ padding: '0.8rem 1rem' }}>Stage Conversion %</th>
              <th style={{ padding: '0.8rem 1rem' }}>Avg Deal Size ($)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Duration (Days)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Stage Pipeline Value</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, idx) => (
              <tr key={stage.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{stage.name}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  {idx === 0 ? (
                    <input
                      type="number"
                      value={stage.count}
                      onChange={(e) => updateStage(idx, 'count', e.target.value)}
                      style={{ width: '80px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    />
                  ) : (
                    <span>{stage.count} deals</span>
                  )}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  {idx < stages.length - 1 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={stage.convRate}
                        onChange={(e) => updateStage(idx, 'convRate', e.target.value)}
                        style={{ width: '65px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--success, #0D9B79)', fontWeight: 600 }}>100% (Won)</span>
                  )}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <input
                    type="number"
                    value={stage.dealSize}
                    onChange={(e) => updateStage(idx, 'dealSize', e.target.value)}
                    style={{ width: '90px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <input
                    type="number"
                    min="0"
                    value={stage.days}
                    onChange={(e) => updateStage(idx, 'days', e.target.value)}
                    style={{ width: '60px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>
                  ${(stage.count * stage.dealSize).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
