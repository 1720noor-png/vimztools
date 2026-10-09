import React, { useState } from 'react';

const INITIAL_SPOKES = [
  { id: 1, title: 'What is Technical SEO? Beginner Fundamentals', slug: '/blog/what-is-technical-seo', anchor: 'technical SEO fundamentals', linksToPillar: true, linksToSiblings: [2, 3] },
  { id: 2, title: 'How to Fix Broken Canonical Tags', slug: '/blog/fix-canonical-tags', anchor: 'canonical tag fixes', linksToPillar: true, linksToSiblings: [1] },
  { id: 3, title: 'XML Sitemap Best Practices Guide', slug: '/blog/xml-sitemap-guide', anchor: 'XML sitemap setup', linksToPillar: true, linksToSiblings: [1] },
  { id: 4, title: 'Robots.txt Optimization for Large Sites', slug: '/blog/robots-txt-optimization', anchor: 'robots.txt rules', linksToPillar: true, linksToSiblings: [] },
  { id: 5, title: 'Core Web Vitals Optimization Playbook', slug: '/blog/core-web-vitals-guide', anchor: 'Core Web Vitals metrics', linksToPillar: false, linksToSiblings: [] }
];

export default function InternalLinkingClusterArchitect() {
  const [pillarTitle, setPillarTitle] = useState('The Definitive Guide to Technical SEO');
  const [pillarUrl, setPillarUrl] = useState('/hub/technical-seo');
  const [pillarAnchor, setPillarAnchor] = useState('technical SEO guide');
  const [spokes, setSpokes] = useState(INITIAL_SPOKES);

  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newAnchor, setNewAnchor] = useState('');

  const addSpoke = () => {
    if (!newTitle.trim()) return;
    setSpokes([
      ...spokes,
      {
        id: Date.now(),
        title: newTitle.trim(),
        slug: newSlug.trim() || `/blog/${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        anchor: newAnchor.trim() || newTitle.trim(),
        linksToPillar: true,
        linksToSiblings: []
      }
    ]);
    setNewTitle('');
    setNewSlug('');
    setNewAnchor('');
  };

  const removeSpoke = (id) => {
    setSpokes(spokes.filter(s => s.id !== id));
  };

  const togglePillarLink = (id) => {
    setSpokes(spokes.map(s => s.id === id ? { ...s, linksToPillar: !s.linksToPillar } : s));
  };

  // Find orphan pages (does not link to pillar and has no sibling links)
  const orphanCount = spokes.filter(s => !s.linksToPillar && (s.linksToSiblings || []).length === 0).length;
  const pillarLinkedCount = spokes.filter(s => s.linksToPillar).length;

  const exportCSV = () => {
    let csv = 'Spoke_Title,Spoke_URL,Recommended_Anchor_Text,Links_To_Pillar_Target,Pillar_URL\n';
    spokes.forEach(s => {
      csv += `"${s.title}","${s.slug}","${s.anchor}",${s.linksToPillar ? 'YES' : 'NO'},"${pillarUrl}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internal_linking_cluster_${pillarAnchor.replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>SEO Internal Linking & Topic Cluster Architect</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Map hub-and-spoke topic clusters, optimize anchor text distributions, and eliminate orphan pages.
          </p>
        </div>
        <button onClick={exportCSV} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Cluster CSV</button>
      </div>

      {/* Pillar Page Master Card */}
      <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🏛️</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Master Pillar Page (Core Hub)</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Pillar Topic / Title:</label>
            <input
              type="text"
              value={pillarTitle}
              onChange={(e) => setPillarTitle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Pillar Canonical URL:</label>
            <input
              type="text"
              value={pillarUrl}
              onChange={(e) => setPillarUrl(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Target Upstream Anchor Text:</label>
            <input
              type="text"
              value={pillarAnchor}
              onChange={(e) => setPillarAnchor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>
        </div>
      </div>

      {/* Cluster Health Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cluster Spokes Defined</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{spokes.length} Articles</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Links to Pillar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success, #0D9B79)' }}>{pillarLinkedCount} / {spokes.length}</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Orphan Pages Detected</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: orphanCount > 0 ? '#E11D48' : 'var(--success, #0D9B79)' }}>
            {orphanCount} {orphanCount > 0 ? '⚠️' : '✅'}
          </div>
        </div>
      </div>

      {/* Quick Add Spoke */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Subtopic Title (e.g. Broken Links Guide)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: 2, minWidth: '200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <input
          type="text"
          placeholder="Slug (e.g. /blog/broken-links)..."
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          style={{ flex: 1.5, minWidth: '150px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <input
          type="text"
          placeholder="Anchor Text..."
          value={newAnchor}
          onChange={(e) => setNewAnchor(e.target.value)}
          style={{ flex: 1.5, minWidth: '140px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <button onClick={addSpoke} className="btn primary" style={{ padding: '0.5rem 1rem' }}>+ Add Spoke</button>
      </div>

      {/* Spoke Articles List */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '0.8rem 1rem' }}>Spoke Article Title & URL</th>
              <th style={{ padding: '0.8rem 1rem' }}>Target Anchor Text</th>
              <th style={{ padding: '0.8rem 1rem' }}>Pillar Link Status</th>
              <th style={{ padding: '0.8rem 1rem', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {spokes.map(s => {
              const isOrphan = !s.linksToPillar && (s.linksToSiblings || []).length === 0;
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: isOrphan ? 'rgba(225, 29, 72, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{s.slug}</div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      "{s.anchor}"
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <button
                      onClick={() => togglePillarLink(s.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: s.linksToPillar ? 'rgba(13, 155, 121, 0.15)' : '#FEE2E2',
                        color: s.linksToPillar ? 'var(--success, #0D9B79)' : '#DC2626'
                      }}
                    >
                      {s.linksToPillar ? '✅ Links to Pillar' : '❌ Missing Pillar Link'}
                    </button>
                  </td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <button onClick={() => removeSpoke(s.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
