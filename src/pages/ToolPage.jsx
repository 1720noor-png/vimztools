import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categories, tools, related } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import { useFavorites, useRecentTools } from '../utils/userPrefs.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toolsApi } from '../api/client.js'

export default function ToolPage() {
  const { cat, tool } = useParams()
  
  // Resilient tool lookup by slug
  const t = tools.find((x) => x?.slug === tool) ||
            tools.find((x) => x?.cat === cat && x?.slug === tool) ||
            tools.find((x) => x?.slug === cat)

  // Safe category lookup with fallback
  const toolCatSlug = t?.cat || cat || 'tools'
  const c = categories.find((x) => x.slug === toolCatSlug) ||
            categories.find((x) => x.slug === cat) || {
              slug: toolCatSlug,
              name: toolCatSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
              accent: 'blue',
              icon: '🛠️',
            }

  const { isFavorite, toggleFavorite } = useFavorites()
  const { addRecent } = useRecentTools()
  const { user, isLoggedIn } = useAuth()

  const [copiedLink, setCopiedLink] = useState(false)
  const [toolMeta, setToolMeta] = useState(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [purchaseSuccess, setPurchaseSuccess] = useState(null)

  const favored = t ? isFavorite(t.slug) : false

  useEffect(() => {
    if (!t) return
    document.title = `${t.name} – Free Online Utility | Vimz.ai`
    
    // Track in recently used tools
    addRecent(t.slug)

    // Load backend metadata for pricing & purchase state
    toolsApi.getTool(t.slug)
      .then((res) => {
        if (res?.tool) setToolMeta(res.tool)
        if (res?.is_purchased) setIsPurchased(true)
      })
      .catch(() => {})

    // Meta description
    let m = document.querySelector('meta[name="description"]')
    if (!m) { 
      m = document.createElement('meta')
      m.name = 'description'
      document.head.appendChild(m) 
    }
    m.content = `${t.desc || ''} ${t.why || ''}`

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = window.location.href
  }, [t?.slug])

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // fallback
    }
  }

  const shareTool = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t?.name || 'Tool'} | Vimz.ai`,
          text: t?.desc || '',
          url: window.location.href,
        })
      } catch (err) {
        if (err.name !== 'AbortError') copyUrl()
      }
    } else {
      copyUrl()
    }
  }

  const handlePurchase = async (method = 'sandbox') => {
    if (!t) return
    setPurchasing(true)
    try {
      const email = isLoggedIn ? user.email : guestEmail
      const res = await toolsApi.purchaseOneTime(t.slug, method, email)
      if (res?.status === 'success') {
        setIsPurchased(true)
        setPurchaseSuccess(res.purchase)
      }
    } catch (err) {
      alert(err.message || 'Payment processing error.')
    } finally {
      setPurchasing(false)
    }
  }

  // Safe Handling: If tool does not exist, show professional Not Found UI
  if (!t) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center', padding: '2rem 1rem' }}>
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>Tool Not Found</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.8rem', lineHeight: 1.6 }}>
          We could not find the requested tool at this URL. The tool might have been moved or updated.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/tools" className="btn primary">Browse All 1,000+ Tools</Link>
          <Link to="/" className="btn sub">Return to Home</Link>
        </div>
      </div>
    )
  }

  const Tool = t.Component || (() => (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
      Interactive tool preview loading…
    </div>
  ))

  const stepsList = t.steps && Array.isArray(t.steps) && t.steps.length > 0 
    ? t.steps 
    : [
        `Input your parameters or values into the ${t.name} fields above.`,
        "Review or adjust calculation settings as needed.",
        "Copy, export, or apply the generated output directly in your workflow."
      ]

  const relatedList = related(t)

  return (
    <div className="tool-view-wrapper">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to={'/' + c.slug}>{c.name}</Link> / <span>{t.name}</span>
      </nav>

      <header className={'head accent-' + (c.accent || 'blue')}>
        <span className="ico big" aria-hidden="true">{t.icon || '🛠️'}</span>
        <div style={{ flex: 1 }}>
          <div className="tool-headline-row">
            <h1>{t.name}</h1>
            <div className="tool-actions-bar">
              <button 
                type="button" 
                className={'btn ghost fav-action-btn' + (favored ? ' active' : '')} 
                onClick={() => toggleFavorite(t.slug)}
                aria-label={favored ? "Remove from favorites" : "Save to favorites"}
              >
                {favored ? '★ Favorited' : '☆ Favorite'}
              </button>
              <button 
                type="button" 
                className="btn ghost share-action-btn" 
                onClick={shareTool}
                aria-label="Share tool"
              >
                {copiedLink ? '✓ Link Copied' : '🔗 Share'}
              </button>
            </div>
          </div>
          <p>{t.desc}</p>
          <div className="head-meta">
            <small>{c.name}</small>
            {t.subcatName && <span className="badge sub">{t.subcatName}</span>}
            {t.popular && <span className="badge popular">Popular</span>}
            <span className="badge sub" style={{ background: 'rgba(16,185,129,.12)', color: 'var(--ok)' }}>100% Client-Side Free Base</span>
            {toolMeta?.is_paid && (
              <span className="badge" style={{ background: 'rgba(239,68,68,.12)', color: '#ef4444' }}>
                💎 Pro Export (${toolMeta.price})
              </span>
            )}
          </div>
        </div>
      </header>

      {/* One-Time Purchase Banner for Paid Export Tools */}
      {toolMeta?.is_paid && (
        <div className="paid-tool-banner">
          <div>
            <h3 style={{ margin: '0 0 0.3rem 0', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💎</span>
              {isPurchased ? 'Pro Export License Unlocked!' : `Unlock Pro High-Res Export ($${toolMeta.price} one-time)`}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', maxWidth: '640px' }}>
              {toolMeta.preview_summary || 'Get unlimited high-resolution vector PDF and raw data exports without watermark.'}
              {' '}<strong>No subscriptions. One-time payment only.</strong>
            </p>
          </div>

          <div>
            {isPurchased ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge" style={{ background: 'var(--ok-soft)', color: 'var(--ok)', padding: '0.4rem 0.8rem' }}>
                  ✓ Unlocked (Token Active)
                </span>
                {purchaseSuccess && (
                  <small style={{ color: 'var(--muted)' }}>Txn: {purchaseSuccess.transaction_id}</small>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!isLoggedIn && (
                  <input
                    type="email"
                    placeholder="Your email for receipt"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', width: '180px' }}
                  />
                )}
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => handlePurchase('sandbox')}
                  disabled={purchasing}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {purchasing ? 'Processing…' : `Unlock for $${toolMeta.price}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {t.why && (
        <section className="note">
          <h2>Why is {t.name} useful?</h2>
          <p>{t.why}</p>
        </section>
      )}

      <section className="panel" aria-label={t.name}>
        <Tool key={t.slug} />
      </section>

      <section className="how-to-section">
        <h2>How to use</h2>
        <ol className="steps-list">
          {stepsList.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      </section>

      {relatedList.length > 0 && (
        <section>
          <div className="section-head">
            <div>
              <span className="eyebrow-sm">Recommended</span>
              <h2>Related tools</h2>
              <p>Similar and complementary tools in {c.name}.</p>
            </div>
          </div>
          <div className="grid">
            {relatedList.map((r) => <ToolCard key={r.slug} t={r} />)}
          </div>
        </section>
      )}

      <p className="back">
        <Link to={'/' + c.slug}>← Back to {c.name}</Link> · <Link to="/">Back to Home</Link>
      </p>
    </div>
  )
}
