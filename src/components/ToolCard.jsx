import { Link } from 'react-router-dom'
import { categories } from '../data/registry.js'
import { useFavorites } from '../utils/userPrefs.js'
import { getCategoryTheme } from '../utils/categoryColors.js'

export const PAID_TOOL_SLUGS = new Set([
  'invoice-generator',
  'meeting-minutes-generator',
  'business-letter-generator',
  'expense-report-generator',
  'client-onboarding-checklist-generator',
  'nda-generator',
  'resignation-letter-generator',
  'project-brief-generator',
  'employee-timesheet-generator',
  'business-proposal-generator',
  'job-offer-letter-generator',
  'discounted-cash-flow-dcf-valuation-tool',
  'saas-churn-retention-calculator',
  'customer-lifetime-value-ltv-calculator',
  'customer-acquisition-cost-cac-calculator',
  'property-tax-escrow-estimator',
  'gross-net-rental-yield-calculator',
  'commercial-lease-rent-calculator',
  'personal-net-worth-calculator',
  'debt-to-income-dti-ratio-calculator',
  'college-savings-529-calculator',
])

export default function ToolCard({ t, variant = 'default', onFavoriteChange }) {
  if (!t) return null
  const c = categories.find((x) => x.slug === t.cat) || { accent: 'blue', name: t.cat }
  const catTheme = getCategoryTheme(t.cat)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favored = t.slug ? isFavorite(t.slug) : false
  const isPaidExport = t.isPaid || t.is_paid || (t.slug && PAID_TOOL_SLUGS.has(t.slug))

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
        </div>
      </Link>
    </div>
  )
}
