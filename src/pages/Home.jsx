import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import { useFavorites, useRecentTools } from '../utils/userPrefs.js'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    catSlug: 'office-tools'
  },
  {
    icon: '💻',
    title: 'Developers & Code',
    desc: 'Encoders, formatters, schema generators, regex, and API debugging.',
    slugs: ['developer-tools', 'coding', 'web-development', 'data-tools'],
    catSlug: 'developer-tools'
  },
  {
    icon: '💼',
    title: 'Business & Management',
    desc: 'SaaS metrics, unit economics, CAC/LTV, timesheets, and checklists.',
    slugs: ['business-tools', 'management', 'startup', 'operations'],
    catSlug: 'business-tools'
  },
  {
    icon: '🎓',
    title: 'Education & Academics',
    desc: 'GPA calculation, citations, study timers, math solvers, and formulas.',
    slugs: ['student-tools', 'education-tools', 'academics', 'learning'],
    catSlug: 'student-tools'
  },
  {
    icon: '🎨',
    title: 'Design & Creative',
    desc: 'Color palettes, aspect ratios, contrast checkers, and typography.',
    slugs: ['design-tools', 'typography-tools', 'media-tools'],
    catSlug: 'design-tools'
  },
  {
    icon: '📈',
    title: 'Marketing & SEO',
    desc: 'UTM campaign builders, meta tags, keyword analyzers, and copywriting.',
    slugs: ['marketing-tools', 'social-media-tools', 'seo'],
    catSlug: 'marketing-tools'
  },
  {
    icon: '💰',
    title: 'Finance & Money',
    desc: 'Mortgages, compounding, DCF valuations, tax escrow, and loans.',
    slugs: ['finance-tools', 'real-estate-tools', 'crypto-blockchain-tools'],
    catSlug: 'finance-tools'
  },
  {
    icon: '⚡',
    title: 'Productivity & Utilities',
    desc: 'Pomodoro focus, timers, converters, organizers, and list processors.',
    slugs: ['productivity-tools', 'organization-tools', 'household-tools'],
    catSlug: 'productivity-tools'
  },
  {
    icon: '🛡️',
    title: 'Security & Privacy',
    desc: 'Hash generators, password entropy, token encoders, and encryption.',
    slugs: ['security-tools', 'privacy-tools', 'cryptography'],
    catSlug: 'security-tools'
  },
  {
    icon: '🏗️',
    title: 'Construction & Engineering',
    desc: 'Riser/tread safety, concrete volume, framing, and HVAC calculations.',
    slugs: ['construction-tools', 'interior-design-tools', 'diy-tools'],
    catSlug: 'construction-tools'
  },
  {
    icon: '🌱',
    title: 'Sustainability & Eco',
    desc: 'Carbon footprint, energy audits, solar savings, and water usage.',
    slugs: ['sustainability-tools', 'agriculture-tools'],
    catSlug: 'sustainability-tools'
  },
  {
    icon: '🌿',
    title: 'Health & Wellness',
    desc: 'Calorie targets, body fat index, travel budgets, and wellness tracking.',
    slugs: ['health-wellness-tools', 'fitness-tools', 'mental-health-tools'],
    catSlug: 'health-wellness-tools'
  },
]

const FEATURES = [
  { icon: '🔒', title: '100% Client-Side Privacy', desc: 'Computations run entirely in your local browser sandbox. No sensitive inputs, files, or documents are ever transmitted to remote servers.' },
  { icon: '⚡', title: 'Zero Subscriptions', desc: 'Enjoy unrestricted access to all 1,000+ utilities without forced monthly recurring plans. Safe, clean, and instant.' },
  { icon: '🎯', title: 'Instant & Frictionless', desc: 'No forced sign-ups to calculate, convert, or generate. Search, configure parameters, and receive results instantaneously.' },
  { icon: '🚀', title: '1,043 Verified Tools', desc: 'Over 1,000 rigorous, formula-verified utilities systematically cataloged across 48 specialized workspace categories.' },
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
    document.title = 'Vimz.ai — Smarter Workspace for Everyday Tasks (1,000+ Tools)' 
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
  
  // Featured categories on homepage
  const featuredCategories = categories.slice(0, 12)

  return (
    <>
      {/* 3. HERO SECTION */}
      <section className="hero">
        <span className="eyebrow">✨ 1,043 Smart Tools · 100% Private · Zero Subscriptions</span>
        <h1 style={{ maxWidth: '18ch' }}>
          One Workspace. <span className="grad">Endless Possibilities.</span>
        </h1>
        <p style={{ maxWidth: '62ch' }}>
          Vimz.ai provides powerful, friction-free utilities for productivity, business, development,
          creativity, and everyday workflows. 100% in-browser with complete privacy.
        </p>
        
        <div className="hero-search">
          <SearchIcon />
          <input 
            className="big" 
            type="search" 
            value={q} 
            aria-label="Search 1,000+ free tools" 
            placeholder="Search 1,000+ free tools (e.g. invoice, GPA, JSON, SEO, mortgage)..."
            onChange={(e) => setP(e.target.value ? { ...Object.fromEntries(p), q: e.target.value } : (selectedCat ? { cat: selectedCat } : {}), { replace: true })} 
          />
          <span className="kbd-hint" aria-hidden="true">Ctrl K</span>
        </div>

        <div className="chips">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => setP({ q: c })}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
          <Link to="/tools" className="btn primary" style={{ padding: '0.7rem 1.45rem', fontSize: '0.98rem' }}>
            Explore All Tools →
          </Link>
          <Link to="/categories" className="btn sub" style={{ padding: '0.7rem 1.45rem', fontSize: '0.98rem' }}>
            Browse Categories
          </Link>
        </div>
      </section>

      {/* SEARCH / FILTER RESULTS VIEW */}
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
                  <p>Tools and calculators you recently opened on this device.</p>
                </div>
                <button type="button" className="btn ghost" style={{ fontSize: '0.82rem' }} onClick={clearRecents}>
                  Clear History
                </button>
              </div>
              <div className="grid tight">{recentToolObjects.map((t) => <ToolCard key={'rec-' + t.slug} t={t} />)}</div>
            </section>
          )}

          {/* 2.C POPULAR TOOLS (MIX OF CLEAN WHITE + SOFT LAVENDER FEATURED) */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">Featured Utilities</span>
                <h2>Popular Tools</h2>
                <p>High-frequency utilities used by thousands of professionals and creators every day.</p>
              </div>
              <Link className="view-all" to="/tools?popular=1">View all popular tools →</Link>
            </div>
            <div className="grid">
              {popularTools.map((t, idx) => (
                <ToolCard 
                  key={t.cat + t.slug} 
                  t={t} 
                  variant={idx === 0 || idx === 3 ? 'lavender' : idx === 1 ? 'featured' : 'default'} 
                />
              ))}
            </div>
          </section>

          {/* 2.A CATEGORY CARDS SECTION */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">Browse By Suite</span>
                <h2>Explore Tool Categories</h2>
                <p>Each category features soft surface styling, specialized icons, and real-time tool catalogs.</p>
              </div>
              <Link className="view-all" to="/categories">View all {categories.length} categories →</Link>
            </div>
            <div className="grid">
              {featuredCategories.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </section>

          {/* PLATFORM METRICS */}
          <section>
            <div className="stats">
              <div className="stat"><b>{tools.length}</b><span>Active Utilities</span></div>
              <div className="stat"><b>{categories.length}</b><span>Specialized Categories</span></div>
              <div className="stat"><b>{totalSub}</b><span>Curated Subcategories</span></div>
              <div className="stat"><b>100%</b><span>Client-Side Privacy</span></div>
            </div>
          </section>

          {/* EXPLORE BY NEED (CURATED WORKFLOW CLUSTERS) */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">Curated Workflows</span>
                <h2>Explore by Need</h2>
                <p>Find the right tools grouped by your workflow and industry requirements.</p>
              </div>
              <Link className="view-all" to="/categories">View all categories →</Link>
            </div>
            <div className="grid">
              {EXPLORE_BY_NEED.map((cluster) => {
                const targetCat = categories.find(c => c.slug === cluster.catSlug) || categories[0]
                const clusterToolCount = tools.filter(t => cluster.slugs.includes(t.cat) || t.cat === cluster.catSlug).length || 20
                return (
                  <CategoryCard 
                    key={cluster.title} 
                    category={{
                      slug: targetCat.slug,
                      icon: cluster.icon,
                      name: cluster.title,
                      desc: cluster.desc,
                      subcategories: targetCat.subcategories || []
                    }} 
                  />
                )
              })}
            </div>
          </section>

          {/* WHY VIMZ.AI ADVANTAGE */}
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow-sm">The Vimz.ai Advantage</span>
                <h2>Built for Speed, Privacy & Clarity</h2>
                <p>Why modern creators and teams choose Vimz.ai over bloated subscription apps.</p>
              </div>
            </div>
            <div className="why-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature">
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
              <h2>Instant access to all {tools.length}+ tools</h2>
              <p>No downloads, no subscriptions, and complete data privacy. Every tool runs directly inside your web browser.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link className="btn" to="/tools" style={{ background: '#FFFFFF', color: '#6C4CF1', fontWeight: 800, padding: '0.75rem 1.6rem' }}>
                  Explore All Tools →
                </Link>
                <Link className="btn ghost" to="/categories" style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.35)', padding: '0.75rem 1.6rem' }}>
                  Browse Categories
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
