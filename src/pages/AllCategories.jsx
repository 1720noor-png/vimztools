import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, tools } from '../data/registry.js'
import CategoryCard from '../components/CategoryCard.jsx'

export default function AllCategories() {
  const [filter, setFilter] = useState('')

  useEffect(() => { 
    document.title = `All ${categories.length} Tool Categories – Vimz.ai` 
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
        <Link to="/">Home</Link> <span>/</span> <span>All Categories</span>
      </nav>

      <section className="section-head">
        <div>
          <span className="eyebrow-sm">Master Directory</span>
          <h1>All {categories.length} Categories</h1>
          <p>
            {categories.length} organized categories, {totalSub} curated subcategories, and {tools.length}+ tools — engineered for instant discovery.
          </p>
        </div>
      </section>

      <div style={{ margin: '1.2rem 0 2.2rem', maxWidth: '520px' }}>
        <input 
          type="search" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          placeholder="Filter categories (e.g. developer, finance, audio, marketing)..." 
          aria-label="Filter categories" 
          className="big"
        />
      </div>

      <section>
        {filteredCategories.length ? (
          <div className="grid">
            {filteredCategories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>📁</span>
            <h3>No categories match "{filter}"</h3>
            <p>Try searching for a different keyword or reset your filter.</p>
            <button className="btn primary" style={{ marginTop: '0.8rem' }} onClick={() => setFilter('')}>
              Show All {categories.length} Categories
            </button>
          </div>
        )}
      </section>
    </>
  )
}
