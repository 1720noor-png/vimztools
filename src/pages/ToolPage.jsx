import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categories, tools, related } from '../data/registry.js'
import ToolCard from '../components/ToolCard.jsx'
import { useFavorites, useRecentTools } from '../utils/userPrefs.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toolsApi } from '../api/client.js'
import { getCategoryTheme } from '../utils/categoryColors.js'
import { isAdvancedTool, getToolMonetization } from '../data/monetizationCatalog.js'
import { download } from '../components/ui.jsx'

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

  const catTheme = getCategoryTheme(c.slug)

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
        `Enter or adjust your input parameters in the ${t.name} fields below.`,
        "Review instant calculations and generated results in real time.",
        "Copy, export, print, or apply the verified output directly to your workflow."
      ]

  const relatedList = related(t)

  const getDeliverableFormats = () => {
    const text = ((t?.name || '') + ' ' + (t?.desc || '') + ' ' + (c?.slug || '')).toLowerCase()
    if (text.includes('image') || text.includes('carousel') || text.includes('splitter')) return ['ZIP', 'PNG', 'JPG']
    if (text.includes('pdf') || text.includes('contract') || text.includes('invoice') || text.includes('agreement') || text.includes('brief')) return ['PDF', 'HTML', 'DOCX']
    if (text.includes('calculator') || text.includes('forecast') || text.includes('model') || text.includes('tax') || text.includes('dcf') || text.includes('sheet')) return ['CSV', 'EXCEL', 'PDF']
    if (text.includes('schema') || text.includes('json') || text.includes('tag') || text.includes('code') || text.includes('redirect')) return ['JSON', 'TXT', 'ZIP']
    return ['PDF', 'CSV', 'JSON']
  }

  const handleExportDeliverable = async (format, unbranded = false) => {
    const isEntitled = Boolean(user?.is_pro || user?.role === 'admin' || isPurchased)
    if (unbranded && !isEntitled) {
      alert('Unbranded white-label export packages and payments are coming soon while payment infrastructure is prepared. All interactive calculations and free exports with attribution remain 100% free!')
      return
    }

    const timestamp = new Date().toISOString()
    const brandingFooter = unbranded
      ? ''
      : '\n\n------------------------------------------------------------\n[Generated with Vimz.ai Free Starter]\nUpgrade to Pro ($9/mo) or single-tool license ($19) to remove this attribution and access unbranded white-label deliverables.\n------------------------------------------------------------\n'

    if (format === 'JSON') {
      const data = {
        tool: t.name,
        slug: t.slug,
        category: c.name,
        timestamp,
        license: unbranded ? 'VIMZ_PRO_UNBRANDED_COMMERCIAL' : 'VIMZ_FREE_ATTRIBUTED',
        watermark_free: unbranded,
        exported_by: unbranded ? (user?.name || user?.email || 'Pro Subscriber') : 'Vimz.ai Community User',
        parameters: {
          category_slug: c.slug,
          client_environment: 'Browser Client-Side Engine'
        }
      }
      download(`${t.slug}-deliverable.json`, JSON.stringify(data, null, 2), 'application/json')
    } else if (format === 'EXCEL') {
      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
        const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
        const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`
        const safeTitle = (t?.name || 'Sheet1').replace(/[\\/*?:[\]]/g, '').slice(0, 31)
        const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${safeTitle}" sheetId="1" r:id="rId1"/></sheets></workbook>`
        const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Metric</t></is></c><c r="B1" t="inlineStr"><is><t>Value</t></is></c><c r="C1" t="inlineStr"><is><t>License</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Tool Name</t></is></c><c r="B2" t="inlineStr"><is><t>${t.name}</t></is></c><c r="C2" t="inlineStr"><is><t>${unbranded ? 'Pro Commercial' : 'Free Attributed'}</t></is></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>Category</t></is></c><c r="B3" t="inlineStr"><is><t>${c.name}</t></is></c><c r="C3" t="inlineStr"><is><t>${timestamp}</t></is></c></row></sheetData></worksheet>`
        zip.file('[Content_Types].xml', contentTypes)
        zip.file('_rels/.rels', rels)
        zip.file('xl/_rels/workbook.xml.rels', wbRels)
        zip.file('xl/workbook.xml', workbookXml)
        zip.file('xl/worksheets/sheet1.xml', sheet1Xml)
        const content = await zip.generateAsync({ type: 'blob' })
        download(`${t.slug}-model.xlsx`, content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      } catch (e) {
        const csv = `"Metric","Value","Timestamp","License"\n"Tool Name","${t.name}","${timestamp}","${unbranded ? 'Pro Commercial' : 'Free Attributed'}"\n"Category","${c.name}","${timestamp}",""\n`
        download(`${t.slug}-dataset.csv`, csv, 'text/csv')
      }
    } else if (format === 'CSV') {
      const csv = `"Metric","Value","Timestamp","License"\n"Tool Name","${t.name}","${timestamp}","${unbranded ? 'Pro Commercial' : 'Free Attributed'}"\n"Category","${c.name}","${timestamp}",""\n"Watermark Free","${unbranded ? 'YES' : 'NO'}","${timestamp}",""\n` + (unbranded ? '' : `"Attribution","Created with Vimz.ai Free Starter","${timestamp}",""\n`)
      download(`${t.slug}-dataset.csv`, csv, 'text/csv')
    } else {
      const report = `========================================================================\n${t.name.toUpperCase()} — EXECUTIVE DELIVERABLE REPORT\n========================================================================\nTool: ${t.name} (${t.slug})\nCategory: ${c.name}\nGenerated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\nLicense Tier: ${unbranded ? 'Vimz Pro Universal License (Unbranded & White-Label)' : 'Vimz Free Starter (Attributed)'}\n\nDESCRIPTION:\n${t.desc || ''}\n\nWORKFLOW GUIDANCE:\n${stepsList.join('\n')}\n\nCOMPLIANCE & PRIVACY:\n100% computed client-side inside browser sandbox. No server data leakage.\n${brandingFooter}`
      download(`${t.slug}-executive-report.txt`, report, 'text/plain')
    }
  }

  const formats = getDeliverableFormats()
  const isUserEntitled = Boolean(user?.is_pro || user?.role === 'admin' || isPurchased)

  return (
    <div className="tool-view-wrapper">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <Link to={'/' + c.slug}>{c.name}</Link> <span>/</span> <span>{t.name}</span>
      </nav>

      <header className="head">
        <span 
          className="ico big" 
          aria-hidden="true"
          style={{ background: catTheme.bg, color: catTheme.text, border: `1px solid ${catTheme.border}` }}
        >
          {t.icon || '🛠️'}
        </span>
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
            <small style={{ color: catTheme.accent }}>{c.name}</small>
            {t.subcatName && <span className="badge sub">{t.subcatName}</span>}
            {t.popular && <span className="badge popular">Popular</span>}
            <span className="badge sub" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>100% Client-Side Privacy</span>
            {isAdvancedTool(t.slug) ? (
              isUserEntitled ? (
                <span className="badge" style={{ background: 'rgba(34,197,94,.15)', color: '#16a34a' }}>
                  ✓ Pro License Active
                </span>
              ) : (
                <span className="badge" style={{ background: 'rgba(168,85,247,.12)', color: '#9333ea' }}>
                  💎 Pro Deliverables ({formats.join(', ')})
                </span>
              )
            ) : (
              <span className="badge" style={{ background: 'rgba(59,130,246,.12)', color: '#2563eb' }}>
                ✓ 100% Free Tool
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hybrid Monetization & Deliverable Bar for Advanced Tools */}
      {isAdvancedTool(t.slug) && (
        <div className="paid-tool-banner" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.3rem 0', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💎</span>
              {isUserEntitled 
                ? `Pro Deliverables Unlocked (${formats.join(' / ')})` 
                : `Advanced Deliverables Available (${formats.join(' / ')})`}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', maxWidth: '640px', lineHeight: 1.5 }}>
              {isUserEntitled
                ? `Your Pro license gives you full unbranded white-label rights for ${t.name}. Export clean, unwatermarked files below.`
                : `Interactive calculations below are 100% free forever. Unbranded white-label deliverables and online payments are coming soon; free exports with attribution are available right now below.`}
            </p>
          </div>

          <div>
            {isUserEntitled ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExportDeliverable(formats[0], true)}
                  className="btn primary sm"
                  style={{ background: 'var(--ok)', color: '#fff', border: 'none', fontWeight: 600, padding: '0.45rem 0.85rem' }}
                >
                  📥 Unbranded {formats[0]}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportDeliverable(formats[1] || 'CSV', true)}
                  className="btn sub sm"
                  style={{ fontWeight: 600, padding: '0.45rem 0.85rem' }}
                >
                  📊 Clean {formats[1] || 'CSV'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExportDeliverable(formats[0], false)}
                  className="btn sub sm"
                  title="Export with attribution watermark (100% Free)"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                >
                  📥 Free Export
                </button>
                <Link
                  to={`/checkout?tier=single_tool&slug=${t.slug}`}
                  className="btn ghost sm"
                  style={{ whiteSpace: 'nowrap', borderColor: '#a855f7', color: '#9333ea', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                >
                  Buy Single (Coming Soon)
                </Link>
                <Link
                  to="/pricing"
                  className="btn primary sm"
                  style={{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #6366f1, #9333ea)', border: 'none', fontWeight: 600, fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                >
                  Upgrade Pro (Coming Soon)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {t.why && (
        <section className="note" style={{ borderLeftColor: catTheme.accent }}>
          <h2>Why is {t.name} useful?</h2>
          <p>{t.why}</p>
        </section>
      )}

      {/* Main Interactive Tool Work Panel */}
      <section className="panel" aria-label={t.name}>
        <Tool key={t.slug} />
      </section>

      {/* Structured How to Use Guide */}
      <section className="how-to-section">
        <h2>How to use {t.name}</h2>
        <ol className="steps-list">
          {stepsList.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      </section>

      {/* Related Complementary Tools */}
      {relatedList.length > 0 && (
        <section>
          <div className="section-head">
            <div>
              <span className="eyebrow-sm">Recommended</span>
              <h2>Related tools in {c.name}</h2>
              <p>Complementary utilities frequently used together in this workflow.</p>
            </div>
          </div>
          <div className="grid">
            {relatedList.map((r) => <ToolCard key={r.slug} t={r} />)}
          </div>
        </section>
      )}

      <p className="back">
        <Link to={'/' + c.slug}>← Back to {c.name}</Link> · <Link to="/">Return to Home</Link> · <Link to="/tools">Browse All 1,000+ Tools</Link>
      </p>
    </div>
  )
}
