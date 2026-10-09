import React, { useState } from 'react';

const AUDIT_CATEGORIES = [
  {
    name: '1. Crawlability & Indexing',
    weight: 25,
    items: [
      { id: 'c1', label: 'Robots.txt is valid, accessible at /robots.txt, and does not block critical JS/CSS assets.', crit: 'High' },
      { id: 'c2', label: 'XML Sitemap exists, is referenced in robots.txt, and contains only HTTP 200 URLs.', crit: 'High' },
      { id: 'c3', label: 'Self-referencing rel="canonical" tags are present on all indexable pages to avoid duplicate content.', crit: 'High' },
      { id: 'c4', label: 'No accidental "noindex, nofollow" meta tags remain on staging or production pages.', crit: 'High' },
      { id: 'c5', label: 'Pagination rel="prev" and rel="next" or canonicalized view-all pages configured properly.', crit: 'Medium' }
    ]
  },
  {
    name: '2. Architecture & Security',
    weight: 20,
    items: [
      { id: 'a1', label: 'HTTPS enforced site-wide with 301 redirects from HTTP to HTTPS.', crit: 'High' },
      { id: 'a2', label: 'Canonical domain chosen (www vs non-www) with strict 301 redirect consolidation.', crit: 'High' },
      { id: 'a3', label: 'Trailing slash vs non-trailing slash URL consistency enforced across all routes.', crit: 'Medium' },
      { id: 'a4', label: 'Custom 404 error page returns HTTP 404 status (not soft 404 with 200 OK) with navigation links.', crit: 'High' },
      { id: 'a5', label: 'Mixed content warnings absent: no insecure HTTP images, scripts, or stylesheets loaded.', crit: 'High' }
    ]
  },
  {
    name: '3. Meta Tags & Structured Data',
    weight: 20,
    items: [
      { id: 'm1', label: 'Unique, descriptive <title> tag on every page (between 50–60 characters).', crit: 'High' },
      { id: 'm2', label: 'Unique meta description between 120–160 characters with clear call-to-action.', crit: 'Medium' },
      { id: 'm3', label: 'Single primary <h1> tag per page matching target page topic.', crit: 'Medium' },
      { id: 'm4', label: 'JSON-LD structured data (Organization, BreadcrumbList, WebPage, or Article) validates without syntax errors.', crit: 'High' },
      { id: 'm5', label: 'Open Graph (og:title, og:image, og:url) and Twitter Card tags configured for social sharing.', crit: 'Medium' }
    ]
  },
  {
    name: '4. Core Web Vitals & Performance',
    weight: 20,
    items: [
      { id: 'p1', label: 'Largest Contentful Paint (LCP) under 2.5 seconds on mobile 4G network.', crit: 'High' },
      { id: 'p2', label: 'Interaction to Next Paint (INP) under 200 milliseconds across interactive widgets.', crit: 'High' },
      { id: 'p3', label: 'Cumulative Layout Shift (CLS) under 0.1 with explicit image and video aspect ratio dimensions.', crit: 'High' },
      { id: 'p4', label: 'Modern image formats (WebP/AVIF) used with responsive srcset and lazy-loading.', crit: 'Medium' },
      { id: 'p5', label: 'Gzip or Brotli compression enabled with cache-control headers on static assets.', crit: 'Medium' }
    ]
  },
  {
    name: '5. Mobile UX & Accessibility',
    weight: 15,
    items: [
      { id: 'u1', label: 'Viewport meta tag configured (<meta name="viewport" content="width=device-width, initial-scale=1">).', crit: 'High' },
      { id: 'u2', label: 'No horizontal scrolling on mobile viewports (320px–414px width).', crit: 'High' },
      { id: 'u3', label: 'Touch targets (buttons, links) sized at minimum 48x48px with adequate spacing.', crit: 'Medium' },
      { id: 'u4', label: 'Descriptive alt text present on all informational images (empty alt="" on decorative images).', crit: 'Medium' }
    ]
  }
];

export default function TechnicalSeoAuditChecklist() {
  const [siteUrl, setSiteUrl] = useState('https://mywebsite.com');
  const [checks, setChecks] = useState(() => {
    const initial = {};
    AUDIT_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        initial[item.id] = false;
      });
    });
    return initial;
  });

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAllInCategory = (cat, val) => {
    setChecks(prev => {
      const next = { ...prev };
      cat.items.forEach(item => { next[item.id] = val; });
      return next;
    });
  };

  // Calculate weighted readiness score
  let weightedScore = 0;
  AUDIT_CATEGORIES.forEach(cat => {
    const passed = cat.items.filter(item => checks[item.id]).length;
    const catPct = passed / cat.items.length;
    weightedScore += catPct * cat.weight;
  });
  const overallScore = Math.round(weightedScore);

  const totalPassed = Object.values(checks).filter(Boolean).length;
  const totalItems = Object.keys(checks).length;

  const exportMarkdown = () => {
    let md = `# Pre-Launch Technical SEO Audit Report: ${siteUrl}\n\n`;
    md += `Audit Date: ${new Date().toLocaleDateString()}\n`;
    md += `Overall Technical SEO Readiness Score: **${overallScore}/100** (${totalPassed}/${totalItems} Checks Passed)\n\n`;
    
    AUDIT_CATEGORIES.forEach(cat => {
      const passedInCat = cat.items.filter(i => checks[i.id]).length;
      md += `### ${cat.name} (${passedInCat}/${cat.items.length} Passed)\n`;
      cat.items.forEach(i => {
        md += `- [${checks[i.id] ? 'X' : ' '}] (${i.crit}) ${i.label}\n`;
      });
      md += '\n';
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `technical_seo_audit_${siteUrl.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            style={{ fontSize: '1.3rem', fontWeight: 700, padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Comprehensive 24-Point Technical SEO Pre-Launch & Migration Checklist
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={exportMarkdown} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Markdown Report</button>
          <button onClick={() => window.print()} className="btn primary" style={{ fontSize: '0.85rem' }}>Print Audit Report</button>
        </div>
      </div>

      {/* Notice Banner */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#1E40AF' }}>
        ℹ️ <strong>Heuristic Audit Notice:</strong> This interactive pre-flight tool guides your manual inspection and testing protocols. Verify each element in browser DevTools, Google Search Console, or PageSpeed Insights before checking off.
      </div>

      {/* Readiness Score Banner */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: overallScore >= 85 ? 'var(--success, #0D9B79)' : overallScore >= 60 ? '#D97706' : '#E11D48', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{overallScore}%</span>
          <span style={{ fontSize: '0.65rem' }}>READINESS</span>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {overallScore >= 85 ? '🟢 Production Ready: Exceptional Technical Foundation' :
             overallScore >= 60 ? '🟡 Caution: Critical Pre-Launch Technical Issues Unresolved' :
             '🔴 High Risk: Major Crawlability / Performance Barriers Detected'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            {totalPassed} of {totalItems} verified items checked. Weighted based on Google Search Essentials guidelines.
          </div>
        </div>
      </div>

      {/* Checklists by Category */}
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {AUDIT_CATEGORIES.map(cat => {
          const passedInCat = cat.items.filter(i => checks[i.id]).length;
          return (
            <div key={cat.name} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '0.6rem' }}>({passedInCat}/{cat.items.length} passed • Weight: {cat.weight}%)</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => markAllInCategory(cat, true)} style={{ fontSize: '0.75rem', background: 'none', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark All Passed</button>
                  <button onClick={() => markAllInCategory(cat, false)} style={{ fontSize: '0.75rem', background: 'none', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {cat.items.map(item => (
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
                      onChange={() => toggleCheck(item.id)}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, fontSize: '0.88rem' }}>
                      <span style={{ textDecoration: checks[item.id] ? 'line-through' : 'none', color: checks[item.id] ? 'var(--muted)' : 'var(--text)' }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: item.crit === 'High' ? '#FEE2E2' : '#FEF3C7', color: item.crit === 'High' ? '#DC2626' : '#D97706' }}>
                      {item.crit}
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
