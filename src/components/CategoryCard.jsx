import { Link } from 'react-router-dom'
import { getCategoryTheme } from '../utils/categoryColors.js'
import { tools } from '../data/registry.js'

export default function CategoryCard({ category }) {
  if (!category) return null
  const theme = getCategoryTheme(category.slug)
  const toolCount = tools.filter(t => t.cat === category.slug).length

  return (
    <Link 
      to={`/${category.slug}`} 
      className="category-card-premium"
      style={{
        '--cat-bg': theme.bg,
        '--cat-border': theme.border,
        '--cat-text': theme.text,
        '--cat-icon-bg': theme.iconBg,
        '--cat-accent': theme.accent
      }}
    >
      <div className="category-card-icon" aria-hidden="true">
        {category.icon || '📁'}
      </div>
      
      <div className="category-card-content">
        <h3 className="category-card-title">{category.name}</h3>
        <p className="category-card-desc">{category.desc}</p>
      </div>

      <div className="category-card-meta">
        <span className="category-card-count">
          {toolCount} tools
        </span>
        {category.subcategories?.length > 0 && (
          <span className="category-card-subcount">
            {category.subcategories.length} subcategories
          </span>
        )}
      </div>

      <div className="category-card-arrow">
        Browse category <span className="arrow-glyph">→</span>
      </div>
    </Link>
  )
}
