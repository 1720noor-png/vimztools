import React, { useState } from 'react';

const PILLARS = [
  {
    id: 'desirability',
    title: '1. Desirability (Customer Demand)',
    icon: '🎯',
    weight: 25,
    questions: [
      { text: 'How acute and painful is the problem for the target customer?', key: 'pain' },
      { text: 'Have target users explicitly confirmed willingness to pay money or trade time for a solution?', key: 'wtp' },
      { text: 'Is the frequency of this problem daily or weekly (vs rare / annual)?', key: 'freq' }
    ]
  },
  {
    id: 'viability',
    title: '2. Economic Viability (Unit Economics)',
    icon: '💰',
    weight: 25,
    questions: [
      { text: 'Can Customer Lifetime Value (LTV) realistically exceed 3x Acquisition Cost (CAC)?', key: 'ltvCac' },
      { text: 'Is the gross profit margin projected to be above 70% (software) or 40% (physical/services)?', key: 'margin' },
      { text: 'Is the total addressable market (TAM) large enough to sustain target revenue goals?', key: 'tam' }
    ]
  },
  {
    id: 'feasibility',
    title: '3. Technical Feasibility (Execution)',
    icon: '⚙️',
    weight: 20,
    questions: [
      { text: 'Does the founding team possess the core technical/operational skills to build v1?', key: 'skills' },
      { text: 'Can a functional Minimum Viable Product (MVP) be launched in under 6 weeks?', key: 'mvpTime' },
      { text: 'Are there minimal critical external dependencies or regulatory gatekeepers?', key: 'gatekeepers' }
    ]
  },
  {
    id: 'competition',
    title: '4. Competitive Defensibility (Moat)',
    icon: '🛡️',
    weight: 15,
    questions: [
      { text: 'Does the product have a 10x improvement on a specific dimension (speed, price, simplicity)?', key: 'tenX' },
      { text: 'Can high switching costs, proprietary data, or network effects defend the product?', key: 'moat' }
    ]
  },
  {
    id: 'timing',
    title: '5. Market Timing ("Why Now?")',
    icon: '⏳',
    weight: 15,
    questions: [
      { text: 'Has a recent technology, platform, or regulatory shift enabled this solution now?', key: 'whyNow' },
      { text: 'Is the target industry expanding rather than contracting?', key: 'marketGrowth' }
    ]
  }
];

export default function BusinessIdeaValidationPlanner() {
  const [ideaTitle, setIdeaTitle] = useState('My Startup / Product Concept');
  const [scores, setScores] = useState({
    pain: 8, wtp: 7, freq: 8,
    ltvCac: 7, margin: 8, tam: 7,
    skills: 8, mvpTime: 8, gatekeepers: 7,
    tenX: 7, moat: 6,
    whyNow: 8, marketGrowth: 8
  });

  const handleScoreChange = (key, val) => {
    setScores(prev => ({ ...prev, [key]: Number(val) }));
  };

  // Calculate pillar percentages and overall weighted score
  const pillarResults = PILLARS.map(p => {
    const totalQScore = p.questions.reduce((acc, q) => acc + (scores[q.key] || 0), 0);
    const maxQScore = p.questions.length * 10;
    const pct = Math.round((totalQScore / maxQScore) * 100);
    const weightedContribution = (pct * p.weight) / 100;
    return { ...p, scorePct: pct, weightedContribution };
  });

  const overallValidationScore = Math.round(pillarResults.reduce((acc, p) => acc + p.weightedContribution, 0));

  const getVerdict = (score) => {
    if (score >= 80) return { label: 'Strong Greenlight — High Commercial Probability', color: 'var(--success, #0D9B79)', advice: 'Proceed immediately to MVP pre-sales or smoke-test landing page testing.' };
    if (score >= 60) return { label: 'Conditional Proceed — High-Risk Assumptions Exist', color: '#D97706', advice: 'Identify the lowest-scoring pillar below and run customer interview experiments to de-risk before writing code.' };
    return { label: 'High Risk / Rethink Thesis', color: '#E11D48', advice: 'Major viability, timing, or desirability flaws detected. Pivot the value proposition or customer segment.' };
  };

  const verdict = getVerdict(overallValidationScore);

  const exportSummary = () => {
    const text = `# Business Idea Validation Report: ${ideaTitle}\n\nOverall Validation Index: ${overallValidationScore}/100\nVerdict: ${verdict.label}\n\n` +
      pillarResults.map(p => `- ${p.title}: ${p.scorePct}%`).join('\n') + `\n\nRecommendation:\n${verdict.advice}\n`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ideaTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_validation.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <input
            type="text"
            value={ideaTitle}
            onChange={(e) => setIdeaTitle(e.target.value)}
            style={{ fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            5-Pillar Commercial Viability & Assumption Risk Framework
          </div>
        </div>
        <button onClick={exportSummary} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Markdown Summary</button>
      </div>

      {/* Aggregate Score Card */}
      <div style={{ background: 'var(--card-bg)', border: `2px solid ${verdict.color}`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: verdict.color, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{overallValidationScore}</span>
          <span style={{ fontSize: '0.7rem' }}>/ 100</span>
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: verdict.color }}>{verdict.label}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{verdict.advice}</div>
        </div>
      </div>

      {/* Pillars Breakdown */}
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {PILLARS.map(p => {
          const pResult = pillarResults.find(pr => pr.id === p.id);
          return (
            <div key={p.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{p.icon}</span> <span>{p.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>(Weight: {p.weight}%)</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: pResult.scorePct >= 70 ? 'var(--success, #0D9B79)' : '#D97706' }}>
                  {pResult.scorePct}%
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {p.questions.map(q => (
                  <div key={q.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', flex: 1, minWidth: '240px' }}>{q.text}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[q.key]}
                        onChange={(e) => handleScoreChange(q.key, e.target.value)}
                        style={{ width: '120px' }}
                      />
                      <span style={{ fontWeight: 600, width: '30px', textAlign: 'right', fontSize: '0.95rem' }}>{scores[q.key]}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
