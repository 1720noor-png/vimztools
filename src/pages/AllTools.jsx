import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'

export default function AllTools() {
  const [p, setP] = useSearchParams()
  const q = p.get('q') || ''
  const cat = p.get('cat') || ''
  const popularOnly = p.get('popular') === '1'
  const [sortBy, setSortBy] = useState('popular')

  useEffect(() => { 
    document.title = `All ${tools.length}+ Free Online Tools – Vimz.ai` 
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = `Complete directory of ${tools.length}+ free, browser-based web tools across ${categories.length} categories on Vimz.ai.`
  }, [])

  let list = search(q, cat || undefined)
  if (popularOnly && !q) list = list.filter((t) => t.popular)

  // Sort options
  if (sortBy === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'popular') {
    list = [...list].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
  }

  const update = (patch) => {
    const next = { q, cat, popular: popularOnly ? '1' : '' , ...patch }
    const obj = {}
    if (next.q) obj.q = next.q
    if (next.cat) obj.cat = next.cat
    if (next.popular) obj.popular = '1'
    setP(obj, { replace: true })
  }

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span>All Tools</span>
      </nav>

      <section className="section-head">
        <div>
          <span className="eyebrow-sm">Master Directory</span>
          <h1>{popularOnly && !q ? 'Popular Tools' : `All ${tools.length}+ Tools`}</h1>
          <p>
            Showing {list.length} of {tools.length} total registered tools
            {cat ? ` in ${categories.find((c) => c.slug === cat)?.name || cat}` : ''}.
          </p>
        </div>
      </section>

      <div className="filter-controls-bar">
        <label className="field" style={{ flex: 2, minWidth: '240px', margin: 0 }}>
          <span>Search by name, slug or keyword</span>
          <input 
            type="search" 
            value={q} 
            placeholder="Type to filter tools…" 
            onChange={(e) => update({ q: e.target.value })} 
            aria-label="Search all tools" 
          />
        </label>

        <label className="field" style={{ flex: 1.5, minWidth: '180px', margin: 0 }}>
          <span>Category Filter</span>
          <select value={cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Filter by category">
            <option value="">All {categories.length} Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({tools.filter(t => t.cat === c.slug).length})
              </option>
            ))}
          </select>
        </label>

        <label className="field" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
          <span>Sort Order</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort tools by">
            <option value="popular">Popular First</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </label>
      </div>

      <div style={{ margin: '1rem 0 1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          type="button" 
          className={'chip' + (!popularOnly && !cat ? ' active-chip' : '')} 
          onClick={() => setP({})}
        >
          All ({tools.length})
        </button>
        <button 
          type="button" 
          className={'chip' + (popularOnly ? ' active-chip' : '')} 
          onClick={() => update({ popular: popularOnly ? '' : '1' })}
        >
          ⭐ Popular Only ({tools.filter(t => t.popular).length})
        </button>
      </div>

      {list.length ? (
        <div className="grid">{list.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}</div>
      ) : (
        <div className="empty">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🔍</span>
          <h3>No tools match your criteria</h3>
          <p>Try clearing your search terms or selecting a different category filter.</p>
          <button className="btn" style={{ marginTop: '0.8rem' }} onClick={() => setP({})}>
            Reset All Filters
          </button>
        </div>
      )}
    </>
  )
}
