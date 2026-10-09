import React, { useState } from 'react';

const INITIAL_MILESTONES = [
  { id: 1, name: '1. Discovery & Architecture Blueprint', hours: 25, rate: 125 },
  { id: 2, name: '2. UI/UX Design & High-Fidelity Prototypes', hours: 40, rate: 125 },
  { id: 3, name: '3. Frontend Application Engineering', hours: 60, rate: 125 },
  { id: 4, name: '4. Backend API & Database Infrastructure', hours: 50, rate: 125 },
  { id: 5, name: '5. Quality Assurance, Cross-Device Testing & Launch', hours: 20, rate: 125 }
];

export default function ProjectScopePricingEstimator() {
  const [projectName, setProjectName] = useState('Custom Web Application Project');
  const [clientName, setClientName] = useState('Acme Corp');
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
  const [contingencyPct, setContingencyPct] = useState(20); // 20% scope buffer
  const [revisionRounds, setRevisionRounds] = useState(2);
  const [outOfScopeRate, setOutOfScopeRate] = useState(150); // $/hr

  const updateMilestone = (idx, field, val) => {
    const updated = [...milestones];
    updated[idx][field] = field === 'name' ? val : Number(val);
    setMilestones(updated);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now(), name: `Phase ${milestones.length + 1}`, hours: 20, rate: 125 }
    ]);
  };

  const removeMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  // Calculations
  const baseHours = milestones.reduce((acc, m) => acc + (m.hours || 0), 0);
  const baseCost = milestones.reduce((acc, m) => acc + (m.hours * m.rate || 0), 0);
  const avgHourlyRate = baseHours > 0 ? Math.round(baseCost / baseHours) : 125;
  const contingencyCost = Math.round(baseCost * (contingencyPct / 100));
  const contingencyHours = Math.round(baseHours * (contingencyPct / 100));

  const lowQuote = baseCost;
  const targetQuote = baseCost + contingencyCost;
  const highQuote = Math.round(baseCost * 1.35); // 35% upper bound

  const exportScopeCSV = () => {
    let csv = 'Milestone_Name,Estimated_Hours,Hourly_Rate,Milestone_Subtotal\n';
    milestones.forEach(m => {
      csv += `"${m.name}",${m.hours},$${m.rate},$${m.hours * m.rate}\n`;
    });
    csv += `\n"Base Total",${baseHours},,$${baseCost}\n`;
    csv += `"Contingency Buffer (${contingencyPct}%)",${contingencyHours},,$${contingencyCost}\n`;
    csv += `"Recommended Fixed Fee Target",,,$${targetQuote}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_estimate.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Project Scope & Fixed-Fee Pricing Estimator</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Factor deliverable milestones, contingency buffers, and scope creep allowances into fixed quotes.
          </p>
        </div>
        <button onClick={exportScopeCSV} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Scope CSV</button>
      </div>

      {/* Quote Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Best-Case Floor (0% Buffer)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>${lowQuote.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{baseHours} Base Scope Hours</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Recommended Fixed Fee Quote</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>${targetQuote.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Includes {contingencyPct}% risk buffer (+${contingencyCost.toLocaleString()})</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Blended Hourly Realization</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success, #0D9B79)' }}>${avgHourlyRate}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/hr</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Across {milestones.length} milestones</div>
        </div>
      </div>

      {/* Settings Row */}
      <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scope Risk Contingency:</span>
          <input
            type="range"
            min="5"
            max="40"
            value={contingencyPct}
            onChange={(e) => setContingencyPct(Number(e.target.value))}
            style={{ width: '100px' }}
          />
          <strong style={{ fontSize: '0.9rem', width: '35px' }}>{contingencyPct}%</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Included Revisions:</span>
          <input
            type="number"
            min="1"
            value={revisionRounds}
            onChange={(e) => setRevisionRounds(Number(e.target.value))}
            style={{ width: '50px', padding: '3px 6px' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>rounds</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Out-of-Scope Overage Rate:</span>
          <input
            type="number"
            value={outOfScopeRate}
            onChange={(e) => setOutOfScopeRate(Number(e.target.value))}
            style={{ width: '70px', padding: '3px 6px' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>$/hr</span>
        </div>
      </div>

      {/* Milestones Table */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '0.8rem 1rem' }}>Milestone / Phase Name</th>
              <th style={{ padding: '0.8rem 1rem' }}>Estimated Hours</th>
              <th style={{ padding: '0.8rem 1rem' }}>Hourly Rate ($)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Subtotal</th>
              <th style={{ padding: '0.8rem 1rem', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, idx) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMilestone(idx, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </td>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <input
                    type="number"
                    min="1"
                    value={m.hours}
                    onChange={(e) => updateMilestone(idx, 'hours', e.target.value)}
                    style={{ width: '70px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </td>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <input
                    type="number"
                    value={m.rate}
                    onChange={(e) => updateMilestone(idx, 'rate', e.target.value)}
                    style={{ width: '70px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </td>
                <td style={{ padding: '0.7rem 1rem', fontWeight: 600 }}>
                  ${(m.hours * m.rate).toLocaleString()}
                </td>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <button onClick={() => removeMilestone(m.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '0.8rem 1rem', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <button onClick={addMilestone} className="btn sub" style={{ fontSize: '0.8rem' }}>+ Add Scope Milestone</button>
        </div>
      </div>
    </div>
  );
}
