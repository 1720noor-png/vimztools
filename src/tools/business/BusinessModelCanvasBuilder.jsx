import React, { useState, useEffect } from 'react';

const PRESETS = {
  saas: {
    name: 'B2B SaaS Platform',
    partners: ['Cloud Infrastructure (AWS/Cloudflare)', 'Stripe Payment Processor', 'CRM & HubSpot Integration Partners'],
    activities: ['Continuous Feature Development', 'Enterprise Security & SOC2 Compliance', 'Product-Led Growth Onboarding'],
    resources: ['Proprietary Algorithmic Engine', 'Engineering & Product Talent', 'Customer Success Data Pipeline'],
    valueProps: ['Automates 80% of repetitive data pipelines', 'Single pane of glass observability', 'Zero-setup self-service onboarding'],
    relationships: ['Self-service product-led trial', 'Dedicated enterprise account managers', 'Community Discord & Knowledge Base'],
    channels: ['SEO Content & Technical Documentation', 'LinkedIn B2B Outreach', 'Product Hunt & GitHub Marketplace'],
    segments: ['Growth-stage SaaS Companies (50-500 employees)', 'DevOps & Data Engineering Leads', 'Solo Tech Founders'],
    costStructure: ['Cloud Compute & Hosting', 'Software Developer Salaries', 'Customer Acquisition Cost (CAC)'],
    revenueStreams: ['Tiered Monthly/Annual Subscriptions ($49/$199/$599)', 'Enterprise Custom SLA Contracts', 'Add-on API Seat Licenses']
  },
  marketplace: {
    name: 'Two-Sided Service Marketplace',
    partners: ['Vetted Local Service Providers', 'Identity Verification API (Stripe Identity)', 'Insurance & Bond Underwriters'],
    activities: ['Supply-Side Quality Vetting', 'Algorithmic Job Matching & Dispatch', 'Dispute Resolution & Escrow Handling'],
    resources: ['Two-Sided Matching Algorithm', 'Localized Network Density', 'Customer Review & Rating Graph'],
    valueProps: ['For Clients: Guaranteed vetted talent in <1 hour', 'For Pros: Consistent job flow & instant payout escrows'],
    relationships: ['Automated in-app messaging', 'Satisfaction guarantee & customer support bot', 'Loyalty tiered discounts'],
    channels: ['Localized Google Local Service Ads', 'Organic Referrals & Word of Mouth', 'Social Video Before/After Proof'],
    segments: ['Busy Homeowners needing immediate fixes', 'Independent licensed contractors seeking work'],
    costStructure: ['Local PPC Advertising', 'Payment gateway transaction fees', 'Trust & safety manual auditing'],
    revenueStreams: ['15% Take-Rate on completed transactions', 'Lead generation fees for high-value bids', 'Premium Pro subscription badge']
  }
};

export default function BusinessModelCanvasBuilder() {
  const [activePreset, setActivePreset] = useState('saas');
  const [modelName, setModelName] = useState('My Business Model Canvas');
  const [canvas, setCanvas] = useState(() => {
    try {
      const saved = localStorage.getItem('vimz_bmc_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESETS.saas;
  });

  const [activeBlock, setActiveBlock] = useState('valueProps');
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('vimz_bmc_v1', JSON.stringify(canvas));
    } catch (e) {}
  }, [canvas]);

  const loadPreset = (key) => {
    if (PRESETS[key]) {
      setActivePreset(key);
      setModelName(PRESETS[key].name);
      setCanvas(PRESETS[key]);
    }
  };

  const addItem = (blockKey) => {
    if (!newItemText.trim()) return;
    setCanvas(prev => ({
      ...prev,
      [blockKey]: [...(prev[blockKey] || []), newItemText.trim()]
    }));
    setNewItemText('');
  };

  const removeItem = (blockKey, index) => {
    setCanvas(prev => ({
      ...prev,
      [blockKey]: prev[blockKey].filter((_, i) => i !== index)
    }));
  };

  const blocksMeta = [
    { key: 'partners', title: '1. Key Partners', desc: 'Who are our key partners and suppliers?', icon: '🤝' },
    { key: 'activities', title: '2. Key Activities', desc: 'What key activities do our value propositions require?', icon: '⚙️' },
    { key: 'resources', title: '3. Key Resources', desc: 'What core physical, IP, human or financial assets are needed?', icon: '💡' },
    { key: 'valueProps', title: '4. Value Propositions', desc: 'What value do we deliver to the customer? What problem do we solve?', icon: '💎' },
    { key: 'relationships', title: '5. Customer Relationships', desc: 'What type of relationship does each segment expect us to maintain?', icon: '❤️' },
    { key: 'channels', title: '6. Channels', desc: 'Through which touchpoints and channels do we reach customer segments?', icon: '📢' },
    { key: 'segments', title: '7. Customer Segments', desc: 'For whom are we creating value? Who are our most important users?', icon: '👥' },
    { key: 'costStructure', title: '8. Cost Structure', desc: 'What are the most important inherent costs in our business model?', icon: '💸' },
    { key: 'revenueStreams', title: '9. Revenue Streams', desc: 'For what value are customers really willing to pay? How do they pay?', icon: '💰' }
  ];

  const totalItems = blocksMeta.reduce((acc, b) => acc + (canvas[b.key]?.length || 0), 0);
  const completedBlocks = blocksMeta.filter(b => canvas[b.key]?.length > 0).length;
  const completionPct = Math.round((completedBlocks / 9) * 100);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ modelName, canvas, date: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_bmc.json`;
    a.click();
  };

  const exportCSV = () => {
    let csv = 'Block,Item_Number,Description\n';
    blocksMeta.forEach(b => {
      (canvas[b.key] || []).forEach((item, idx) => {
        csv += `"${b.title}",${idx + 1},"${item.replace(/"/g, '""')}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_bmc.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{ fontSize: '1.4rem', fontWeight: 'bold', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Strategyzer 9-Block Framework • {completedBlocks}/9 Blocks Active ({completionPct}% Complete) • {totalItems} Total Elements
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => loadPreset('saas')} className="btn sub" style={{ fontSize: '0.8rem' }}>Load B2B SaaS</button>
          <button onClick={() => loadPreset('marketplace')} className="btn sub" style={{ fontSize: '0.8rem' }}>Load Marketplace</button>
          <button onClick={exportJSON} className="btn sub" style={{ fontSize: '0.8rem' }}>Export JSON</button>
          <button onClick={exportCSV} className="btn sub" style={{ fontSize: '0.8rem' }}>Export CSV</button>
          <button onClick={() => window.print()} className="btn primary" style={{ fontSize: '0.8rem' }}>Print Canvas</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct === 100 ? 'var(--success, #0D9B79)' : 'var(--primary, #6C4CF1)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Quick Add Bar */}
      <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quick Add to:</span>
        <select
          value={activeBlock}
          onChange={(e) => setActiveBlock(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        >
          {blocksMeta.map(b => (
            <option key={b.key} value={b.key}>{b.title}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter strategic bullet point..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem(activeBlock)}
          style={{ flex: 1, minWidth: '220px', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <button onClick={() => addItem(activeBlock)} className="btn primary" style={{ padding: '0.5rem 1rem' }}>+ Add Bullet</button>
      </div>

      {/* 9-Block Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Row 1: Key Partners (span 1, row 1-2) */}
        <div style={{ gridColumn: 'span 1', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>🤝 Key Partners</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.partners || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('partners', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Activities (span 1, row 1) */}
        <div style={{ gridColumn: 'span 1', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>⚙️ Key Activities</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.activities || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('activities', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Value Propositions (span 1, row 1-2) */}
        <div style={{ gridColumn: 'span 1', background: 'var(--card-bg)', border: '2px solid var(--primary)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>💎 Value Propositions</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.valueProps || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('valueProps', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Relationships (span 1, row 1) */}
        <div style={{ gridColumn: 'span 1', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>❤️ Customer Relationships</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.relationships || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('relationships', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Segments (span 1, row 1-2) */}
        <div style={{ gridColumn: 'span 1', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>👥 Customer Segments</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.segments || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('segments', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Row 2: Key Resources (under Activities) */}
        <div style={{ gridColumnStart: 2, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>💡 Key Resources</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.resources || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('resources', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Channels (under Relationships) */}
        <div style={{ gridColumnStart: 4, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>📢 Channels</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.channels || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('channels', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Financial Foundations (Bottom 2 blocks) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: '#E11D48' }}>💸 8. Cost Structure</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.costStructure || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('costStructure', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--success, #0D9B79)' }}>💰 9. Revenue Streams</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
            {(canvas.revenueStreams || []).map((item, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>
                <span>{item}</span>
                <button onClick={() => removeItem('revenueStreams', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '6px' }}>×</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
