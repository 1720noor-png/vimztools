import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import NotFound from './NotFound.jsx'
import { getCategoryTheme } from '../utils/categoryColors.js'

export default function Category() {
  const { cat } = useParams()
  const c = categories.find((x) => x.slug === cat)
  const [q, setQ] = useState('')
  const [activeSubcat, setActiveSubcat] = useState('')

  const theme = c ? getCategoryTheme(c.slug) : null

  useEffect(() => { 
    if (c) {
      document.title = `${c.name} Utilities – Vimz.ai (Free Online Tools)`
      let m = document.querySelector('meta[name="description"]')
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
      m.content = `Explore free online tools in ${c.name}: ${c.desc}. Free, private client-side utilities on Vimz.ai.`
    }
    setQ('')
    setActiveSubcat('')
  }, [c])

  if (!c) return <NotFound />

  let list = search(q, c.slug)
  if (activeSubcat) {
    list = list.filter(t => t.subcat === activeSubcat)
  }

  const showGrouped = !q && !activeSubcat && c.subcategories?.length
  const totalCategoryTools = tools.filter((t) => t.cat === c.slug).length

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <Link to="/categories">Categories</Link> <span>/</span> <span>{c.name}</span>
      </nav>

      <header 
        className="category-header-banner"
        style={{
          background: theme?.bg || 'var(--card)',
          border: `1px solid ${theme?.border || 'var(--line)'}`,
          borderRadius: 'var(--r-xl)',
          padding: '2.2rem 2rem',
          margin: '1.2rem 0 2rem',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <span 
          className="category-hero-icon"
          aria-hidden="true"
          style={{
            display: 'inline-grid',
            placeItems: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            background: theme?.iconBg || 'rgba(108,76,241,0.14)',
            fontSize: '2.4rem',
            flexShrink: 0
          }}
        >
          {c.icon || '📁'}
        </span>
        
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', margin: '0 0 0.35rem', color: theme?.text || 'var(--fg)' }}>
            {c.name}
          </h1>
          <p style={{ margin: '0 0 0.8rem', color: 'color-mix(in srgb, ' + (theme?.text || '#20213A') + ' 80%, transparent)', maxWidth: '64ch', fontSize: '1.02rem' }}>
            {c.desc}
          </p>
          <div className="head-meta">
            <span className="badge sub" style={{ background: 'rgba(255,255,255,0.7)', color: theme?.text || 'var(--fg)', fontWeight: 700 }}>
              {totalCategoryTools} tools
            </span>
            {c.subcategories?.length ? (
              <span className="badge sub" style={{ background: 'rgba(255,255,255,0.5)', color: theme?.text || 'var(--fg)', fontWeight: 700 }}>
                {c.subcategories.length} subcategories
              </span>
            ) : null}
            <span className="badge sub" style={{ background: 'var(--ok-soft)', color: 'var(--ok)', fontWeight: 700 }}>
              100% Client-Side Privacy
            </span>
          </div>
        </div>
      </header>

      <div style={{ margin: '1.5rem 0' }}>
        <input 
          className="big" 
          type="search" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder={`Search ${totalCategoryTools} tools in ${c.name}...`} 
          aria-label={`Search tools in ${c.name}`} 
        />
      </div>

      {/* Subcategory quick filter tabs */}
      {c.subcategories?.length > 0 && (
        <div className="chips" style={{ marginBottom: '1.8rem' }}>
          <button 
            type="button" 
            className={'chip' + (!activeSubcat ? ' active-chip' : '')} 
            onClick={() => setActiveSubcat('')}
          >
            All Tools ({totalCategoryTools})
          </button>
          {c.subcategories.map(s => {
            const count = tools.filter(t => t.cat === c.slug && t.subcat === s.slug).length
            return (
              <button 
                key={s.slug} 
                type="button" 
                className={'chip' + (activeSubcat === s.slug ? ' active-chip' : '')} 
                onClick={() => setActiveSubcat(activeSubcat === s.slug ? '' : s.slug)}
              >
                {s.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {!list.length && (
        <div className="empty">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🔍</span>
          <h3>No tools found in {c.name}</h3>
          <p>No tools matched "{q}". Try a different term or clear your search.</p>
          <button className="btn primary" style={{ marginTop: '0.8rem' }} onClick={() => { setQ(''); setActiveSubcat('') }}>
            Reset Filters
          </button>
        </div>
      )}

      {list.length > 0 && showGrouped ? (
        c.subcategories.map((s) => {
          const subTools = list.filter((t) => t.subcat === s.slug)
          if (!subTools.length) return null
          return (
            <section key={s.slug}>
              <div className="subhead">
                <span className="dot" aria-hidden="true" style={{ background: theme?.accent || 'var(--brand)' }}></span>
                <h2>{s.name}</h2>
                <span>({subTools.length} tools)</span>
              </div>
              <div className="grid">
                {subTools.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}
              </div>
            </section>
          )
        })
      ) : list.length > 0 ? (
        <div className="grid">
          {list.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}
        </div>
      ) : null}
    </>
  )
}
