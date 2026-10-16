import { Link } from 'react-router-dom'
import { categories } from '../data/registry.js'
import { useFavorites } from '../utils/userPrefs.js'
import { getCategoryTheme } from '../utils/categoryColors.js'
import { isAdvancedTool, getToolMonetization } from '../data/monetizationCatalog.js'
import { downloadToolOfflineFile } from '../services/offline/offlineExportService.js'

export const PAID_TOOL_SLUGS = new Set([])

export default function ToolCard({ t, variant = 'default', onFavoriteChange }) {
  if (!t) return null
  const c = categories.find((x) => x.slug === t.cat) || { accent: 'blue', name: t.cat }
  const catTheme = getCategoryTheme(t.cat)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favored = t.slug ? isFavorite(t.slug) : false
  const isPaidExport = t.isPaid || t.is_paid || (t.slug && isAdvancedTool(t.slug))

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (t.slug) toggleFavorite(t.slug)
    if (onFavoriteChange && t.slug) onFavoriteChange(t.slug)
  }

  const isLavender = variant === 'lavender'
  const isFeatured = variant === 'featured'

  return (
    <div 
      className={`tool-card-premium ${isLavender ? 'tool-card-lavender' : ''} ${isFeatured ? 'tool-card-featured' : ''}`}
      style={{
        '--card-cat-accent': catTheme.accent,
        '--card-cat-icon-bg': catTheme.iconBg,
      }}
    >
      <div className="tool-card-header">
        <span 
          className="tool-card-icon-container" 
          aria-hidden="true"
          style={{ background: catTheme.bg, color: catTheme.text, border: `1px solid ${catTheme.border}` }}
        >
          {t.icon || '🛠️'}
        </span>

        <div className="tool-card-badges">
          {isPaidExport ? (
            <span className="tool-badge badge-pro">
              💎 Pro
            </span>
          ) : (
            <span className="tool-badge badge-free">
              Free
            </span>
          )}
          {t.popular && <span className="tool-badge badge-popular">Popular</span>}
          
          <button 
            type="button" 
            className={`fav-btn ${favored ? 'active' : ''}`} 
            onClick={handleFavoriteClick} 
            title={favored ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={favored ? `Remove ${t.name} from favorites` : `Add ${t.name} to favorites`}
          >
            {favored ? '★' : '☆'}
          </button>
        </div>
      </div>

      <Link 
        to={`/${t.cat}/${t.slug}`} 
        className="tool-card-body"
        aria-label={`Open ${t.name}`}
      >
        <h3 className="tool-card-title">{t.name}</h3>
        <p className="tool-card-desc">{t.desc}</p>
        
        {t.subcatName && (
          <div className="tool-card-subcat">
            <span>{t.subcatName}</span>
          </div>
        )}

        {t.why && (
          <p className="tool-card-why">
            <b>Why useful:</b> {t.why}
          </p>
        )}

        <div className="tool-card-footer">
          <span className="tool-card-cta">
            Launch tool <span className="arrow-icon">→</span>
          </span>
          <button
            type="button"
            className="tool-card-dl-btn"
            title={!isPaidExport ? `Download ${t.name} offline (.html)` : `Unlock & Download ${t.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!isPaidExport) {
                downloadToolOfflineFile(t, false)
              } else {
                window.location.href = `/${t.cat}/${t.slug}?unlock=1`
              }
            }}
          >
            📥 {!isPaidExport ? 'Free .html' : 'Pro .html'}
          </button>
        </div>
      </Link>
    </div>
  )
}
