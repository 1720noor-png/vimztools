import { Link } from 'react-router-dom'
import { categories } from '../data/registry.js'
import { useFavorites } from '../utils/userPrefs.js'

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

export default function ToolCard({ t, onFavoriteChange }) {
  if (!t) return null
  const c = categories.find((x) => x.slug === t.cat) || { accent: 'blue' }
  const accent = c?.accent || 'blue'
  const { isFavorite, toggleFavorite } = useFavorites()
  const favored = t.slug ? isFavorite(t.slug) : false
  const isPaidExport = t.isPaid || t.is_paid || (t.slug && PAID_TOOL_SLUGS.has(t.slug))

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (t.slug) toggleFavorite(t.slug)
    if (onFavoriteChange && t.slug) onFavoriteChange(t.slug)
  }

  return (
    <div className={'tool accent-' + accent}>
      <div className="tool-top">
        <span className="ico" aria-hidden="true">{t.icon || '🛠️'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPaidExport ? (
            <span className="badge" style={{ background: 'rgba(99,102,241,0.14)', color: 'var(--c-indigo)', border: '1px solid rgba(99,102,241,0.25)' }}>
              💎 Pro Export
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--ok)', border: '1px solid rgba(16,185,129,0.22)' }}>
              Free
            </span>
          )}
          {t.popular && <span className="badge popular">Popular</span>}
          <button 
            type="button" 
            className={'fav-btn' + (favored ? ' active' : '')} 
            onClick={handleFavoriteClick} 
            title={favored ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={favored ? `Remove ${t.name} from favorites` : `Add ${t.name} to favorites`}
          >
            {favored ? '★' : '☆'}
          </button>
        </div>
      </div>
      <Link to={`/${t.cat}/${t.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3>{t.name}</h3>
        <p>{t.desc}</p>
        {t.subcatName && (
          <span className="badges" style={{ marginTop: '.5rem' }}>
            <span className="badge sub">{t.subcatName}</span>
          </span>
        )}
        <p className="why"><b>Why useful?</b> {t.why}</p>
        <span className="open">Launch tool →</span>
      </Link>
    </div>
  )
}
