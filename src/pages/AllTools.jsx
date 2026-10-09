import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, tools, search } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'

export default function AllTools() {
  const [p, setP] = useSearchParams()
  const q = p.get('q') || ''
  const cat = p.get('cat') || ''
  const popularOnly = p.get('popular') === '1'
  const [sortBy, setSortBy] = useState('popular')
  const [limit, setLimit] = useState(48) // Progressive disclosure for performance on mobile

  useEffect(() => { 
    document.title = `All ${tools.length}+ Free Online Tools – Vimz.ai Directory` 
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = `Complete directory of ${tools.length}+ free, browser-based web tools across ${categories.length} categories on Vimz.ai.`
  }, [])

  // Reset pagination limit on search or category filter change
  useEffect(() => {
    setLimit(48)
  }, [q, cat, popularOnly, sortBy])

  let list = useMemo(() => {
    let result = search(q, cat || undefined)
    if (popularOnly && !q) result = result.filter((t) => t.popular)

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    }
    return result
  }, [q, cat, popularOnly, sortBy])

  const displayedList = list.slice(0, limit)
  const hasMore = list.length > limit

  const update = (patch) => {
    const next = { q, cat, popular: popularOnly ? '1' : '', ...patch }
    const obj = {}
    if (next.q) obj.q = next.q
    if (next.cat) obj.cat = next.cat
    if (next.popular) obj.popular = '1'
    setP(obj, { replace: true })
  }

  const activeCategory = categories.find((c) => c.slug === cat)

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <span>All Tools</span>
      </nav>

      <section className="section-head">
        <div>
          <span className="eyebrow-sm">Master Directory</span>
          <h1>{popularOnly && !q ? 'Popular Tools' : `All ${tools.length}+ Tools`}</h1>
          <p>
            Showing {list.length} of {tools.length} total registered tools
            {activeCategory ? ` in ${activeCategory.name}` : ''}.
          </p>
        </div>
      </section>

      <div className="filter-controls-bar">
        <label className="field" style={{ flex: 2, minWidth: '240px', margin: 0 }}>
          <span>Search tools by name, category or keyword</span>
          <input 
            type="search" 
            value={q} 
            placeholder="Type to filter tools (e.g. invoice, regex, GPA, SEO)..." 
            onChange={(e) => update({ q: e.target.value })} 
            aria-label="Search all tools" 
          />
        </label>

        <label className="field" style={{ flex: 1.5, minWidth: '200px', margin: 0 }}>
          <span>Filter by Category</span>
          <select value={cat} onChange={(e) => update({ cat: e.target.value })} aria-label="Filter by category">
            <option value="">All {categories.length} Categories ({tools.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({tools.filter(t => t.cat === c.slug).length})
              </option>
            ))}
          </select>
        </label>

        <label className="field" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
          <span>Sort Order</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort tools by">
            <option value="popular">Popular First</option>
            <option value="name">Alphabetical (A–Z)</option>
          </select>
        </label>
      </div>

      <div style={{ margin: '1rem 0 1.6rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          type="button" 
          className={'chip' + (!popularOnly && !cat ? ' active-chip' : '')} 
          onClick={() => setP({})}
        >
          All Tools ({tools.length})
        </button>
        <button 
          type="button" 
          className={'chip' + (popularOnly ? ' active-chip' : '')} 
          onClick={() => update({ popular: popularOnly ? '' : '1' })}
        >
          ⭐ Popular ({tools.filter(t => t.popular).length})
        </button>
        {cat && (
          <button 
            type="button" 
            className="chip active-chip" 
            onClick={() => update({ cat: '' })}
          >
            ✕ {activeCategory?.name || cat}
          </button>
        )}
      </div>

      {list.length ? (
        <>
          <div className="grid">
            {displayedList.map((t) => <ToolCard key={t.cat + t.slug} t={t} />)}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                Showing {displayedList.length} of {list.length} tools
              </p>
              <button 
                type="button" 
                className="btn primary" 
                onClick={() => setLimit(prev => prev + 48)}
                style={{ padding: '0.7rem 1.6rem' }}
              >
                Load More Tools ({list.length - displayedList.length} remaining) ↓
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🔍</span>
          <h3>No tools match your criteria</h3>
          <p>We couldn't find a tool matching your search. Try resetting filters or using a broader keyword.</p>
          <button className="btn primary" style={{ marginTop: '0.8rem' }} onClick={() => setP({})}>
            Reset All Filters
          </button>
        </div>
      )}
    </>
  )
}
