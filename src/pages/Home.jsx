import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import { useFavorites, useRecentTools } from '../utils/userPrefs.js'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
)

const CHIPS = ['GPA Calculator', 'JSON Formatter', 'Invoice Generator', 'Password Generator', 'Regex Tester', 'Markdown Preview', 'Unit Converter', 'Text Diff', 'DCF Valuation', 'QR Code']

const EXPLORE_BY_NEED = [
  {
    icon: '📝',
    title: 'Documents & Writing',
    desc: 'Invoices, proposals, agreements, formatting, and text processing.',
    slugs: ['office', 'text', 'writing', 'student-tools'],
    accent: 'blue',
  },
  {
    icon: '💻',
    title: 'Developers & Code',
    desc: 'Encoders, formatters, schema generators, regex, and API debugging.',
    slugs: ['developer-tools', 'coding', 'web-development', 'data-formats'],
    accent: 'indigo',
  },
  {
    icon: '💼',
    title: 'Business & Management',
    desc: 'SaaS metrics, unit economics, CAC/LTV, timesheets, and checklists.',
    slugs: ['business', 'management', 'startup', 'operations'],
    accent: 'teal',
  },
  {
    icon: '🎓',
    title: 'Education & Academics',
    desc: 'GPA calculation, citations, study timers, math solvers, and formulas.',
    slugs: ['student-tools', 'academics', 'education', 'learning'],
    accent: 'purple',
  },
  {
    icon: '🎨',
    title: 'Design & Creative',
    desc: 'Color palettes, aspect ratios, contrast checkers, and typography.',
    slugs: ['design', 'colors', 'typography', 'creative'],
    accent: 'pink',
  },
  {
    icon: '📈',
    title: 'Marketing & SEO',
    desc: 'UTM campaign builders, meta tags, keyword analyzers, and copywriting.',
    slugs: ['marketing', 'seo', 'social-media', 'content'],
    accent: 'orange',
  },
  {
    icon: '💰',
    title: 'Finance & Money',
    desc: 'Mortgages, compounding, DCF valuations, tax escrow, and loans.',
    slugs: ['finance-tools', 'finance', 'realestate', 'investing'],
    accent: 'green',
  },
  {
    icon: '⚡',
    title: 'Productivity & Utilities',
    desc: 'Pomodoro focus, timers, converters, organizers, and list processors.',
    slugs: ['productivity', 'organization', 'time', 'utilities'],
    accent: 'amber',
  },
  {
    icon: '🛡️',
    title: 'Security & Privacy',
    desc: 'Hash generators, password entropy, token encoders, and encryption.',
    slugs: ['security', 'cryptography', 'privacy', 'checksums'],
    accent: 'blue',
  },
  {
    icon: '🎬',
    title: 'Media & Audio/Video',
    desc: 'Aspect ratio calculators, BPM/LFO timing, audio pitch, and photo rules.',
    slugs: ['media', 'audio', 'music', 'photography'],
    accent: 'purple',
  },
  {
    icon: '🔬',
    title: 'Science & Engineering',
    desc: 'Physics constants, chemical conversions, electronics, and geometry.',
    slugs: ['science', 'electronics', 'construction', 'engineering'],
    accent: 'teal',
  },
  {
    icon: '🌱',
    title: 'Lifestyle & Health',
    desc: 'Calorie targets, body fat index, travel budgets, and gardening math.',
    slugs: ['health', 'lifestyle', 'fitness', 'gardening'],
    accent: 'green',
  },
]

const FEATURES = [
  { icon: '🔒', accent: 'blue', title: '100% Client-Side Privacy', desc: 'Computations run entirely in your local browser sandbox. No sensitive inputs or documents are sent to remote servers.' },
  { icon: '⚡', accent: 'teal', title: 'Zero Subscriptions', desc: 'Enjoy full free base access with zero subscriptions or monthly recurring commitments. Optional lifetime pro exports are strictly one-time.' },
  { icon: '🎯', accent: 'purple', title: 'Instant & Frictionless', desc: 'No forced sign-ups to calculate or convert. Search, launch, configure parameters, and receive results instantly.' },
  { icon: '🚀', accent: 'indigo', title: '1,000+ Verified Tools', desc: 'Over 1,000 rigorous, formula-verified utilities systematically cataloged across 72 specialized workspace categories.' },
]

export default function Home() {
  const [p, setP] = useSearchParams()
  const q = p.get('q') || ''
  const selectedCat = p.get('cat') || ''
  const [selectedSubcat, setSelectedSubcat] = useState('')

  const { favorites } = useFavorites()
  const { recents, clearRecents } = useRecentTools()

  const res = q.trim() || selectedCat ? search(q, selectedCat || undefined) : null
  const filteredRes = res && selectedSubcat ? res.filter(t => t.subcat === selectedSubcat) : res

  useEffect(() => { 
    document.title = 'Vimz.ai — Smarter Workspace for Everyday Tasks' 
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = 'Vimz.ai is your smarter workspace for everyday tasks. 1,000+ fast, private, AI-ready utilities for developers, business, finance, design, math, and everyday workflows.'
  }, [])

  const totalSub = categories.reduce((n, c) => n + (c.subcategories?.length || 0), 0)
  const popularTools = tools.filter((t) => t.popular).slice(0, 8)
  
  // Resolve favorite & recent tool objects
  const favoriteTools = tools.filter(t => favorites.includes(t.slug))
  const recentToolObjects = recents.map(slug => tools.find(t => t.slug === slug)).filter(Boolean)

  const activeCategoryObj = categories.find(c => c.slug === selectedCat)

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <span className="eyebrow">✨ 1,000+ Smart Tools · 100% Private · Zero Subscriptions</span>
        <h1 style={{ maxWidth: '20ch' }}>
          Your smarter workspace for <span className="grad">everyday tasks.</span>
        </h1>
        <p style={{ maxWidth: '64ch' }}>
          Create, calculate, convert, analyze and simplify your work with 1,000+ useful tools.
          Instant client-side execution with complete privacy.
        </p>
        
        <div className="hero-search">
          <SearchIcon />
          <input 
            className="big" 
            type="search" 
            value={q} 
            aria-label="Search 1,000+ tools" 
            placeholder="Search 1,000+ tools (e.g., 'invoice', 'GPA', 'JSON', 'mortgage', 'regex')..."
            onChange={(e) => setP(e.target.value ? { ...Object.fromEntries(p), q: e.target.value } : (selectedCat ? { cat: selectedCat } : {}), { replace: true })} 
          />
          <span className="kbd-hint" aria-hidden="true">Ctrl K</span>
        </div>

        <div className="chips">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => setP({ q: c })}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
          <Link to="/tools" className="btn primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.98rem' }}>
            Explore Tools →
          </Link>
          <Link to="/categories" className="btn sub" style={{ padding: '0.65rem 1.4rem', fontSize: '0.98rem' }}>
            Browse Categories
          </Link>
        </div>
      </section>

      {/* SEARCH / FILTER SECTION */}
      {filteredRes ? (
        <section aria-live="polite" className="search-results-section">
          <div className="section-head">
            <div>
              <span className="eyebrow-sm">Search & Filter</span>
              <h2>{filteredRes.length} tool{filteredRes.length === 1 ? '' : 's'} found {q ? `for "${q}"` : ''}</h2>
              {selectedCat && <p>Filtered by category: <strong>{activeCategoryObj?.name || selectedCat}</strong></p>}
            </div>
            {(q || selectedCat || selectedSubcat) && (
              <button className="btn ghost" onClick={() => { setP({}); setSelectedSubcat('') }}>
                ✕ Clear all filters
              </button>
            )}
          </div>

          {/* Subcategory pills if category selected */}
          {activeCategoryObj?.subcategories?.length > 0 && (
            <div className="chips" style={{ marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                className={'chip' + (!selectedSubcat ? ' active-chip' : '')}
                onClick={() => setSelectedSubcat('')}
              >
                All Subcategories
              </button>
              {activeCategoryObj.subcategories.map(s => (
                <button 
                  key={s.slug} 
                  type="button" 
                  className={'chip' + (selectedSubcat === s.slug ? ' active-chip' : '')}
                  onClick={() => setSelectedSubcat(s.slug)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {filteredRes.length ? (
            <div className="grid">{filteredRes.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}</div>
          ) : (
            <div className="empty">
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🔍</span>
              <h3>No matching tools found</h3>
              <p>We couldn't find a tool matching your search. Try searching for a broader term or browse our curated categories.</p>
              <button className="btn primary" style={{ marginTop: '1rem' }} onClick={() => { setP({}); setSelectedSubcat('') }}>
                Reset Search
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* USER PREFERENCES: FAVORITES & RECENT TOOLS */}
          {favoriteTools.length > 0 && (
            <section className="user-section">
              <div className="section-head">
                <div>
                  <span className="eyebrow-sm">My Workspace</span>
                  <h2>Favorited Tools</h2>
                  <p>Quick access to your pinned utilities.</p>
                </div>
              </div>
              <div className="grid">{favoriteTools.map((t) => <ToolCard key={'fav-' + t.slug} t={t} />)}</div>
            </section>
          )}

          {recentToolObjects.length > 0 && (
            <section className="user-section">
              <div className="section-head">
                <div>
                  <span className="eyebrow-sm">Recent Activity</span>
                  <h2>Recently Used Tools</h2>
                  <p>Tools and calculators you recently opened.</p>
                </div>
                <button type="button" className="btn ghost" style={{ fontSize: '0.8rem' }} onClick={clearRecents}>
                  Clear History
                </button>
              </div>
              <div className="grid tight">{recentToolObjects.map((t) => <ToolCard key={'rec-' + t.slug} t={t} />)}</div>
            </section>
          )}

          {/* PLATFORM METRICS */}
          <section>
            <div className="stats">
              <div className="stat"><b>1,015</b><span>Active Utilities</span></div>
              <div className="stat"><b>72</b><span>Categories</span></div>
              <div className="stat"><b>{totalSub}</b><span>Subcategories</span></div>
              <div className="stat"><b>100%</b><span>Client-Side Privacy</span></div>
            </div>
          </section>

          {/* POPULAR TOOLS */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">Featured Utilities</span>
                <h2>Popular Tools</h2>
                <p>High-frequency utilities used by thousands of professionals every day.</p>
              </div>
              <Link className="view-all" to="/tools?popular=1">View all popular →</Link>
            </div>
            <div className="grid">{popularTools.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}</div>
          </section>

          {/* EXPLORE BY NEED (CURATED CLUSTERS) */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">Curated Workflows</span>
                <h2>Explore by Need</h2>
                <p>Find the right tools grouped by your workflow and industry requirements.</p>
              </div>
              <Link className="view-all" to="/categories">View all 72 categories →</Link>
            </div>
            <div className="grid">
              {EXPLORE_BY_NEED.map((cluster) => {
                // Find matching category object if possible or fallback
                const primaryCat = categories.find(c => cluster.slugs.includes(c.slug)) || categories[0]
                const clusterToolCount = tools.filter(t => cluster.slugs.includes(t.cat)).length || 15
                return (
                  <Link key={cluster.title} to={'/' + primaryCat.slug} className={'cat-card accent-' + cluster.accent}>
                    <span className="cat-ico" aria-hidden="true">{cluster.icon}</span>
                    <h3>{cluster.title}</h3>
                    <p>{cluster.desc}</p>
                    <div className="cat-meta">
                      <span>{clusterToolCount}+ tools</span>
                      <span>Instant Access</span>
                    </div>
                    <span className="cat-arrow">Open suite →</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* WHY VIMZ.AI */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">The Vimz.ai Advantage</span>
                <h2>Built for Speed, Privacy & Clarity</h2>
              </div>
            </div>
            <div className="why-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className={'feature accent-' + f.accent}>
                  <span className="f-ico" aria-hidden="true">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA BAND */}
          <section>
            <div className="cta-band">
              <h2>Instant access to all 1,000+ tools</h2>
              <p>No downloads, no subscriptions, and complete data privacy. Every tool runs directly inside your web browser.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link className="btn primary" to="/tools" style={{ background: '#fff', color: '#0B5FFF', fontWeight: 800 }}>
                  Explore 1,000+ Tools
                </Link>
                <Link className="btn sub" to="/register" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Create Free Workspace
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
