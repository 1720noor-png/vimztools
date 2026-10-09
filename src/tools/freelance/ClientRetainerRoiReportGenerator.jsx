import React, { useState } from 'react';

const INITIAL_DELIVERABLES = [
  'Published 4 comprehensive SEO topic cluster articles',
  'Resolved 28 critical technical crawl errors & broken canonicals',
  'Launched Google Ads retargeting campaign achieving 4.2x ROAS',
  'Delivered Q4 Competitive Market Gap & Keyword Strategy Deck'
];

export default function ClientRetainerRoiReportGenerator() {
  const [clientName, setClientName] = useState('Acme Corporation');
  const [reportMonth, setReportMonth] = useState('October 2026');
  const [retainerFee, setRetainerFee] = useState(4500); // $4,500/mo
  const [allocatedHours, setAllocatedHours] = useState(30);
  const [deliveredHours, setDeliveredHours] = useState(32);
  const [revenueAttributed, setRevenueAttributed] = useState(24500); // $24,500 pipeline/revenue
  const [leadsGenerated, setLeadsGenerated] = useState(48);

  const [deliverables, setDeliverables] = useState(INITIAL_DELIVERABLES);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [nextMonthFocus, setNextMonthFocus] = useState(
    '1. Scale high-converting Google Search campaigns\n2. Launch conversion rate testing on demo page\n3. Execute programmatic SEO content rollout'
  );

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables([...deliverables, newDeliverable.trim()]);
    setNewDeliverable('');
  };

  const removeDeliverable = (idx) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  // Calculations
  const roiMultiplier = retainerFee > 0 ? (revenueAttributed / retainerFee).toFixed(1) : 0;
  const costPerLead = leadsGenerated > 0 ? Math.round(retainerFee / leadsGenerated) : 0;
  const effectiveHourlyCost = deliveredHours > 0 ? Math.round(retainerFee / deliveredHours) : 0;

  const exportMarkdown = () => {
    let md = `# Monthly Retainer Executive Performance Report\n\n`;
    md += `**Client:** ${clientName}  \n**Billing Period:** ${reportMonth}  \n**Retainer Fee:** $${retainerFee.toLocaleString()}  \n\n`;
    md += `## 1. Executive Summary & ROI Multiplier\n`;
    md += `- **Attributed Revenue / Pipeline:** $${revenueAttributed.toLocaleString()} (${roiMultiplier}x ROI)\n`;
    md += `- **Qualified Leads Delivered:** ${leadsGenerated} (Cost Per Lead: $${costPerLead})\n`;
    md += `- **Hours Delivered:** ${deliveredHours} hrs / ${allocatedHours} allocated ($${effectiveHourlyCost}/hr effective)\n\n`;
    md += `## 2. Deliverables Completed This Month\n`;
    deliverables.forEach(d => { md += `- [x] ${d}\n`; });
    md += `\n## 3. Next Month Strategic Sprint Focus\n${nextMonthFocus}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_report_${clientName.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={{ fontSize: '1.3rem', fontWeight: 700, padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
            />
            <input
              type="text"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              style={{ fontSize: '1.1rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Client Monthly Retainer ROI Reporting Generator & Executive Value Sheet
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={exportMarkdown} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Markdown</button>
          <button onClick={() => window.print()} className="btn primary" style={{ fontSize: '0.85rem' }}>Print 1-Page Report</button>
        </div>
      </div>

      {/* ROI & Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--success, #0D9B79)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--success, #0D9B79)', fontWeight: 600 }}>Realized ROI Multiplier</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--success, #0D9B79)' }}>{roiMultiplier}x ROI</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>${revenueAttributed.toLocaleString()} Attributed Value</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Leads Generated</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2563EB' }}>{leadsGenerated} Leads</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Cost Per Lead: ${costPerLead}</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Hours Delivered</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)' }}>{deliveredHours} / {allocatedHours} hrs</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>${effectiveHourlyCost}/hr effective rate</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Retainer Investment</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>${retainerFee.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Contracted Monthly Base</div>
        </div>
      </div>

      {/* Retainer Controls */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Monthly Retainer Fee ($):</label>
          <input
            type="number"
            value={retainerFee}
            onChange={(e) => setRetainerFee(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Hours Delivered This Month:</label>
          <input
            type="number"
            value={deliveredHours}
            onChange={(e) => setDeliveredHours(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Attributed Revenue / Pipeline ($):</label>
          <input
            type="number"
            value={revenueAttributed}
            onChange={(e) => setRevenueAttributed(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Total Leads Delivered:</label>
          <input
            type="number"
            value={leadsGenerated}
            onChange={(e) => setLeadsGenerated(Number(e.target.value))}
            style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Deliverables List */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.05rem' }}>📦 Key Deliverables Shipped This Month ({deliverables.length})</h3>
        
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
          {deliverables.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem' }}>✅ {d}</span>
              <button onClick={() => removeDeliverable(i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            placeholder="Add completed sprint deliverable..."
            value={newDeliverable}
            onChange={(e) => setNewDeliverable(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDeliverable()}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
          <button onClick={addDeliverable} className="btn primary" style={{ padding: '0.5rem 1rem' }}>+ Add</button>
        </div>
      </div>

      {/* Next Month Sprint Focus */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
        <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.05rem', color: 'var(--primary)' }}>🚀 Next Month Strategic Priorities</h3>
        <textarea
          rows="4"
          value={nextMonthFocus}
          onChange={(e) => setNextMonthFocus(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}
        />
      </div>
    </div>
  );
}
