import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, tools } from '../data/registry.js'

export default function AllCategories() {
  const [filter, setFilter] = useState('')

  useEffect(() => { 
    document.title = `All ${categories.length} Categories – Vimz.ai` 
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = `Explore all ${categories.length} categories in Vimz.ai spanning developer tools, business, finance, health, math, writing, and everyday life utilities.`
  }, [])

  const totalSub = categories.reduce((n, c) => n + (c.subcategories?.length || 0), 0)

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.desc.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span>All Categories</span>
      </nav>

      <section className="section-head">
        <div>
          <span className="eyebrow-sm">Directory</span>
          <h1>All {categories.length} Categories</h1>
          <p>
            {categories.length} organized categories, {totalSub} subcategories, and {tools.length}+ tools — engineered for instant discovery.
          </p>
        </div>
      </section>

      <div style={{ margin: '1.2rem 0 2rem', maxWidth: '480px' }}>
        <input 
          type="search" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          placeholder="Filter categories (e.g., developer, finance, audio)..." 
          aria-label="Filter categories" 
        />
      </div>

      <section>
        {filteredCategories.length ? (
          <div className="grid">
            {filteredCategories.map((c) => (
              <Link key={c.slug} to={'/' + c.slug} className={'cat-card accent-' + c.accent}>
                <span className="cat-ico" aria-hidden="true">{c.icon}</span>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <div className="cat-meta">
                  <span>{tools.filter((t) => t.cat === c.slug).length} tools</span>
                  {c.subcategories?.length ? <span>{c.subcategories.length} subcategories</span> : null}
                </div>
                <span className="cat-arrow">Browse category →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>📁</span>
            <h3>No categories match "{filter}"</h3>
            <button className="btn" style={{ marginTop: '0.8rem' }} onClick={() => setFilter('')}>
              Show all categories
            </button>
          </div>
        )}
      </section>
    </>
  )
}
