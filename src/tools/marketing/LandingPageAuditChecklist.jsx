import React, { useState } from 'react';

const CRO_PILLARS = [
  {
    name: '1. Above-the-Fold Hero Section',
    weight: 25,
    items: [
      { id: 'h1', text: 'Value proposition is clear within 5 seconds: What it is, who it is for, and the core benefit.', impact: 'High' },
      { id: 'h2', text: 'Primary call-to-action button stands out with high visual color contrast against background.', impact: 'High' },
      { id: 'h3', text: 'Product screenshot, interactive demo, or realistic visual context is visible without scrolling.', impact: 'Medium' },
      { id: 'h4', text: 'Zero competing links, excessive menu bars, or distracting external banner ads in the hero.', impact: 'Medium' }
    ]
  },
  {
    name: '2. Call-to-Action (CTA) & Value Clarity',
    weight: 25,
    items: [
      { id: 'c1', text: 'CTA button copy is action-oriented (e.g. "Start My 14-Day Free Trial" vs generic "Submit").', impact: 'High' },
      { id: 'c2', text: 'Friction-reducing microcopy is adjacent to CTA (e.g. "No credit card required • Cancel anytime").', impact: 'High' },
      { id: 'c3', text: 'CTA is repeated logically after key feature sections and in a sticky footer on mobile.', impact: 'Medium' },
      { id: 'c4', text: 'Single dominant objective per page (no competing dual forms pulling user attention).', impact: 'High' }
    ]
  },
  {
    name: '3. Social Proof & Trust Architecture',
    weight: 20,
    items: [
      { id: 't1', text: 'Recognizable customer logos or credible industry press mentions displayed prominently.', impact: 'High' },
      { id: 't2', text: 'Specific, believable testimonials with full name, role, headshot, and quantifiable outcome metrics.', impact: 'High' },
      { id: 't3', text: 'Third-party review badges (G2, Trustpilot, Capterra, or Google Reviews) with star ratings.', impact: 'Medium' },
      { id: 't4', text: 'Explicit risk-reversal guarantee stated (e.g. 30-day money-back guarantee, free migration).', impact: 'Medium' }
    ]
  },
  {
    name: '4. Form Friction & Interaction Design',
    weight: 15,
    items: [
      { id: 'f1', text: 'Form input fields are strictly minimized (requesting only email or essential setup info first).', impact: 'High' },
      { id: 'f2', text: 'Inline form validation with real-time green checkmarks and helpful error guidance.', impact: 'Medium' },
      { id: 'f3', text: 'Single-column vertical form layout on mobile screens to prevent thumb mis-taps.', impact: 'Medium' },
      { id: 'f4', text: 'Explicit security notice ("We respect your privacy. No spam ever.") near submit trigger.', impact: 'Low' }
    ]
  },
  {
    name: '5. Scannability & Mobile Experience',
    weight: 15,
    items: [
      { id: 'm1', text: 'Body copy is scannable: short 2-3 line paragraphs, bold bullet points, and high contrast headers.', impact: 'Medium' },
      { id: 'm2', text: 'Mobile tap targets are large (&ge; 48px) with ample thumb padding.', impact: 'High' },
      { id: 'm3', text: 'Zero pop-ups or intrusive interstitials blocking content upon initial page arrival.', impact: 'High' }
    ]
  }
];

export default function LandingPageAuditChecklist() {
  const [pageUrl, setPageUrl] = useState('https://landingpage.com');
  const [checks, setChecks] = useState(() => {
    const s = {};
    CRO_PILLARS.forEach(p => p.items.forEach(i => { s[i.id] = false; }));
    return s;
  });

  const toggle = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markPillar = (pillar, val) => {
    setChecks(prev => {
      const next = { ...prev };
      pillar.items.forEach(i => { next[i.id] = val; });
      return next;
    });
  };

  // Weighted CRO Score
  let score = 0;
  CRO_PILLARS.forEach(p => {
    const passed = p.items.filter(i => checks[i.id]).length;
    score += (passed / p.items.length) * p.weight;
  });
  const croScore = Math.round(score);

  const totalPassed = Object.values(checks).filter(Boolean).length;
  const totalItems = Object.keys(checks).length;

  const exportReport = () => {
    let md = `# Landing Page Conversion Rate Optimization (CRO) Audit: ${pageUrl}\n\n`;
    md += `Overall Conversion Readiness Score: **${croScore}/100** (${totalPassed}/${totalItems} Passed)\n\n`;
    CRO_PILLARS.forEach(p => {
      const passedInP = p.items.filter(i => checks[i.id]).length;
      md += `### ${p.name} (${passedInP}/${p.items.length})\n`;
      p.items.forEach(i => {
        md += `- [${checks[i.id] ? 'X' : ' '}] (${i.impact} Impact) ${i.text}\n`;
      });
      md += '\n';
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cro_audit_${pageUrl.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <input
            type="text"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            style={{ fontSize: '1.3rem', fontWeight: 700, padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Heuristic Conversion Rate Optimization (CRO) Audit & Friction Inspector
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={exportReport} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Markdown Audit</button>
          <button onClick={() => window.print()} className="btn primary" style={{ fontSize: '0.85rem' }}>Print Audit Sheet</button>
        </div>
      </div>

      {/* Score Header */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: croScore >= 80 ? 'var(--success, #0D9B79)' : croScore >= 50 ? '#D97706' : '#E11D48', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{croScore}%</span>
          <span style={{ fontSize: '0.65rem' }}>CONVERSION FIT</span>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {croScore >= 80 ? '🚀 High Conversion Potential: Minimal Friction & Clear Value' :
             croScore >= 50 ? '⚠️ Moderate Conversion Leakage: Critical Trust or CTA Flaws' :
             '🛑 High Conversion Friction: Severe Above-the-Fold or Proof Deficits'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            {totalPassed} of {totalItems} heuristic checks satisfied. Evaluates visitor anxiety, friction, and incentive.
          </div>
        </div>
      </div>

      {/* Checklist Pillars */}
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {CRO_PILLARS.map(p => {
          const passedInP = p.items.filter(i => checks[i.id]).length;
          return (
            <div key={p.name} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.6rem' }}>({passedInP}/{p.items.length} passed • Weight: {p.weight}%)</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => markPillar(p, true)} style={{ fontSize: '0.75rem', background: 'none', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark All</button>
                  <button onClick={() => markPillar(p, false)} style={{ fontSize: '0.75rem', background: 'none', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {p.items.map(item => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.8rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: checks[item.id] ? 'rgba(13, 155, 121, 0.06)' : 'var(--bg)',
                      border: `1px solid ${checks[item.id] ? 'rgba(13, 155, 121, 0.3)' : 'var(--border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checks[item.id]}
                      onChange={() => toggle(item.id)}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, fontSize: '0.88rem' }}>
                      <span style={{ textDecoration: checks[item.id] ? 'line-through' : 'none', color: checks[item.id] ? 'var(--muted)' : 'var(--text)' }}>
                        {item.text}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: item.impact === 'High' ? '#FEE2E2' : '#FEF3C7', color: item.impact === 'High' ? '#DC2626' : '#D97706' }}>
                      {item.impact}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
