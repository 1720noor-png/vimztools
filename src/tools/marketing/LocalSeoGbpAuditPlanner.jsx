import React, { useState } from 'react';

const LOCAL_SECTIONS = [
  {
    name: '1. Name, Address & Phone (NAP) Consistency',
    weight: 25,
    items: [
      { id: 'nap1', text: 'Business Name on GBP matches legal entity name exactly without spam keyword stuffing.' },
      { id: 'nap2', text: 'Physical street address matches website footer, schema markup, and utility bills.' },
      { id: 'nap3', text: 'Local area code phone number used (avoid toll-free 800 numbers for local ranking).' },
      { id: 'nap4', text: 'Service area radii configured if operating as a hybrid or Service Area Business (SAB).' }
    ]
  },
  {
    name: '2. Google Business Profile (GBP) Completeness',
    weight: 25,
    items: [
      { id: 'gbp1', text: 'Primary GBP category carefully selected to match high-volume local search queries.' },
      { id: 'gbp2', text: '3 to 5 relevant secondary categories configured to capture long-tail local searches.' },
      { id: 'gbp3', text: '750-character business description includes primary services and service cities.' },
      { id: 'gbp4', text: 'Direct appointment / booking link URL configured.' },
      { id: 'gbp5', text: 'Attributes (e.g. Women-owned, Veteran-owned, Wheelchair accessible) completed.' }
    ]
  },
  {
    name: '3. Reviews & Social Proof Velocity',
    weight: 20,
    items: [
      { id: 'rev1', text: 'Minimum 20+ authentic customer reviews with average star rating &ge; 4.5.' },
      { id: 'rev2', text: 'Active review response protocol: 100% of reviews answered within 48 hours.' },
      { id: 'rev3', text: 'Customer reviews organically contain specific keywords and neighborhood city names.' }
    ]
  },
  {
    name: '4. On-Page Local SEO & Structured Data',
    weight: 20,
    items: [
      { id: 'web1', text: 'LocalBusiness JSON-LD schema with complete address, geo coordinates, and telephone.' },
      { id: 'web2', text: 'City and state included in homepage <title> and meta description.' },
      { id: 'web3', text: 'Embedded Google Maps iframe present on Contact / Location landing page.' }
    ]
  },
  {
    name: '5. Core Citation Aggregators',
    weight: 10,
    items: [
      { id: 'cit1', text: 'Submitted to Tier-1 aggregators (Data Axle, Neustar Localeze, Foursquare).' },
      { id: 'cit2', text: 'Apple Business Connect (Apple Maps) and Bing Places claimed and verified.' }
    ]
  }
];

export default function LocalSeoGbpAuditPlanner() {
  const [businessName, setBusinessName] = useState('Apex Roofing & Solar');
  const [cityName, setCityName] = useState('Austin, TX');
  const [checks, setChecks] = useState(() => {
    const s = {};
    LOCAL_SECTIONS.forEach(sec => sec.items.forEach(i => { s[i.id] = false; }));
    return s;
  });

  const toggle = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  let totalScore = 0;
  LOCAL_SECTIONS.forEach(sec => {
    const passed = sec.items.filter(i => checks[i.id]).length;
    totalScore += (passed / sec.items.length) * sec.weight;
  });
  const localScore = Math.round(totalScore);

  const totalPassed = Object.values(checks).filter(Boolean).length;
  const totalItems = Object.keys(checks).length;

  const exportReport = () => {
    let md = `# Local SEO & Google Business Profile Audit: ${businessName} (${cityName})\n\n`;
    md += `Local Search Readiness Score: **${localScore}/100** (${totalPassed}/${totalItems} Passed)\n\n`;
    LOCAL_SECTIONS.forEach(sec => {
      md += `### ${sec.name}\n`;
      sec.items.forEach(i => {
        md += `- [${checks[i.id] ? 'X' : ' '}] ${i.text}\n`;
      });
      md += '\n';
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `local_seo_audit_${businessName.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{ fontSize: '1.3rem', fontWeight: 700, padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
            />
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City, State"
              style={{ fontSize: '1.1rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Google Business Profile (GBP) & Local Map Pack Ranking Audit
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={exportReport} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Markdown Audit</button>
          <button onClick={() => window.print()} className="btn primary" style={{ fontSize: '0.85rem' }}>Print Local Scorecard</button>
        </div>
      </div>

      {/* Local Score Banner */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: localScore >= 80 ? 'var(--success, #0D9B79)' : localScore >= 50 ? '#D97706' : '#E11D48', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{localScore}%</span>
          <span style={{ fontSize: '0.65rem' }}>LOCAL PACK</span>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {localScore >= 80 ? '📍 Prime 3-Pack Contender: High Local Relevancy & Prominence' :
             localScore >= 50 ? '⚠️ Moderate Local Signals: Category or Review Gaps Restrict Rank' :
             '🛑 Suppressed Local Visibility: Missing Core NAP or Schema Markups'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            {totalPassed} of {totalItems} local authority signals satisfied for {cityName}.
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {LOCAL_SECTIONS.map(sec => {
          const passedInSec = sec.items.filter(i => checks[i.id]).length;
          return (
            <div key={sec.name} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{sec.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>({passedInSec}/{sec.items.length} passed • Weight: {sec.weight}%)</span>
              </div>

              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {sec.items.map(item => (
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
                    <span style={{ flex: 1, fontSize: '0.88rem', textDecoration: checks[item.id] ? 'line-through' : 'none', color: checks[item.id] ? 'var(--muted)' : 'var(--text)' }}>
                      {item.text}
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
