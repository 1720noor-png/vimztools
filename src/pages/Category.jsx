import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import NotFound from './NotFound.jsx'

export default function Category() {
  const { cat } = useParams()
  const c = categories.find((x) => x.slug === cat)
  const [q, setQ] = useState('')
  const [activeSubcat, setActiveSubcat] = useState('')

  useEffect(() => { 
    if (c) {
      document.title = `${c.name} Utilities – Vimz.ai`
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

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / <span>{c.name}</span>
      </nav>

      <header className={'head accent-' + c.accent}>
        <span className="ico big" aria-hidden="true">{c.icon}</span>
        <div>
          <h1>{c.name}</h1>
          <p>{c.desc}</p>
          <div className="head-meta">
            <span className="badge sub">{tools.filter((t) => t.cat === c.slug).length} tools</span>
            {c.subcategories?.length ? <span className="badge sub">{c.subcategories.length} subcategories</span> : null}
            <span className="badge sub" style={{ background: 'rgba(16,185,129,.14)', color: 'var(--ok)' }}>100% Client-Side</span>
          </div>
        </div>
      </header>

      <div style={{ margin: '1.5rem 0' }}>
        <input 
          className="big" 
          type="search" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder={`Search ${tools.filter((t) => t.cat === c.slug).length} tools in ${c.name}...`} 
          aria-label={`Search tools in ${c.name}`} 
        />
      </div>

      {/* Subcategory quick filter tabs */}
      {c.subcategories?.length > 0 && (
        <div className="chips" style={{ marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            className={'chip' + (!activeSubcat ? ' active-chip' : '')} 
            onClick={() => setActiveSubcat('')}
          >
            All Tools ({tools.filter(t => t.cat === c.slug).length})
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
          <h3>No tools found</h3>
          <p>No tools in {c.name} match "{q}".</p>
          <button className="btn" style={{ marginTop: '0.8rem' }} onClick={() => { setQ(''); setActiveSubcat('') }}>
            Clear search filters
          </button>
        </div>
      )}

      {list.length > 0 && showGrouped ? (
        c.subcategories.map((s) => {
          const subTools = list.filter((t) => t.subcat === s.slug)
          if (!subTools.length) return null
          return (
            <section key={s.slug}>
              <div className={'subhead accent-' + c.accent}>
                <span className="dot" aria-hidden="true"></span>
                <h2>{s.name}</h2>
                <span>{subTools.length} tools</span>
              </div>
              <div className="grid">{subTools.map((t) => <ToolCard key={t.slug} t={t} />)}</div>
            </section>
          )
        })
      ) : list.length > 0 ? (
        <div className="grid">{list.map((t) => <ToolCard key={t.slug} t={t} />)}</div>
      ) : null}

      <p className="back">
        <Link to="/categories">← Browse all categories</Link> · <Link to="/">Back to Home</Link>
      </p>
    </>
  )
}
