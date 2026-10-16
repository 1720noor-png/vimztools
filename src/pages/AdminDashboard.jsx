import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { adminApi } from '../api/client.js'
import downloadClassification from '../data/downloadClassification.json'
import '../styles/admin-emerald.css'

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [purchases, setPurchases] = useState([])
  
  // Paid Tools screen states
  const [toolSearch, setToolSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all') // 'all', 'free', 'paid'
  const [downloadFilter, setDownloadFilter] = useState('all') // 'all', 'downloadable', 'mixed', 'on-screen'
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  // Local simulated state for audit and governance
  const [toolsState, setToolsState] = useState(downloadClassification)
  const [interestTapsCount, setInterestTapsCount] = useState(48)
  const [selectedToolForContent, setSelectedToolForContent] = useState(downloadClassification[0] || null)
  const [contentForm, setContentForm] = useState({
    summary: 'Calculates the doubling time of an investment using the Rule of 72.',
    steps: '1. Enter expected annual interest rate.\n2. Review approximate and logarithmic doubling times.\n3. Adjust parameters to compare scenarios.',
    execution: 'browser',
    status: 'published'
  })
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '2026-10-16 11:37 UTC', admin: 'Super Admin', action: 'CLASSIFY_CATALOG', entity: '1,059 Tools', reason: 'Phase 1 AST Downloadable Audit Completed', ip: '127.0.0.1' },
    { id: 2, time: '2026-10-16 10:15 UTC', admin: 'Super Admin', action: 'SET_PAYMENTS_MODE', entity: 'Platform', reason: 'Payments Deferred Mode Active (Zero Fabricated Sales)', ip: '127.0.0.1' }
  ])

  // Modals
  const [manualGrantModal, setManualGrantModal] = useState(false)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantTier, setGrantTier] = useState('pro_monthly')
  const [grantReason, setGrantReason] = useState('')

  const nav = useNavigate()

  useEffect(() => {
    document.title = 'Vimz.ai — Admin Control Console (Emerald Prestige)'
    if (!authLoading) {
      if (!user) {
        nav('/login')
      } else if (!isAdmin) {
        alert('Access denied. Administrator privileges required.')
        nav('/dashboard')
      } else {
        loadBackendData()
      }
    }
  }, [user?.id, user?.email, isAdmin, authLoading])

  const loadBackendData = async () => {
    setLoading(true)
    try {
      const [usersRes, purchasesRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getPurchases(),
      ])
      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        setUsers(usersRes.value.users.data || usersRes.value.users || [])
      }
      if (purchasesRes.status === 'fulfilled' && purchasesRes.value?.purchases) {
        setPurchases(purchasesRes.value.purchases.data || purchasesRes.value.purchases || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // Filtered Tools for Paid Tools Screen
  const filteredTools = useMemo(() => {
    return toolsState.filter((t) => {
      const matchesSearch = !toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase()) || t.slug.toLowerCase().includes(toolSearch.toLowerCase());
      const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesTier = tierFilter === 'all' || (tierFilter === 'paid' ? t.is_advanced : !t.is_advanced);
      const matchesDownload = downloadFilter === 'all' || t.download_type === downloadFilter;
      return matchesSearch && matchesCat && matchesTier && matchesDownload;
    })
  }, [toolsState, toolSearch, categoryFilter, tierFilter, downloadFilter])

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTools.slice(start, start + pageSize)
  }, [filteredTools, currentPage])

  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = new Set(toolsState.map((t) => t.category))
    return Array.from(cats).sort()
  }, [toolsState])

  // Handlers
  const togglePaidStatus = (slug) => {
    setToolsState((prev) =>
      prev.map((t) => {
        if (t.slug === slug) {
          const updated = { ...t, is_advanced: !t.is_advanced }
          // Log audit
          setAuditLogs((logs) => [
            {
              id: Date.now(),
              time: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
              admin: user?.name || 'Admin',
              action: updated.is_advanced ? 'ENABLE_PAID_ACCESS' : 'SET_FREE_ACCESS',
              entity: slug,
              reason: 'Admin toggle in Paid Tools screen',
              ip: '127.0.0.1'
            },
            ...logs
          ])
          return updated
        }
        return t
      })
    )
  }

  const handleManualGrantSubmit = (e) => {
    e.preventDefault()
    if (!grantReason.trim()) {
      alert('Mandatory audit requirement: A specific reason must be provided for every manual entitlement adjustment.')
      return
    }

    setAuditLogs((logs) => [
      {
        id: Date.now(),
        time: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        admin: user?.name || 'Admin',
        action: 'MANUAL_GRANT',
        entity: grantEmail,
        reason: `${grantTier.toUpperCase()}: ${grantReason}`,
        ip: '127.0.0.1'
      },
      ...logs
    ])

    alert(`Manual entitlement (${grantTier}) granted to ${grantEmail} and recorded in audit log.`)
    setManualGrantModal(false)
    setGrantEmail('')
    setGrantReason('')
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: '5rem 1rem', textAlign: 'center', background: '#F7F3E8', minHeight: '100vh', color: '#232826' }}>
        <h3>Loading Vimz.ai Emerald Prestige Admin Console…</h3>
      </div>
    )
  }

  return (
    <div className="emerald-admin">
      {/* 1. Left Sidebar Navigation (11 Screens Grouped) */}
      <aside className="emerald-sidebar">
        <div className="emerald-sidebar-brand">
          <span style={{ fontSize: '1.4rem' }}>💎</span>
          <div>
            <h2>Vimz.ai Admin</h2>
            <span className="tag">EMERALD PRESTIGE</span>
          </div>
        </div>

        <nav className="emerald-sidebar-nav">
          <div className="emerald-nav-group-title">Finance & Governance</div>
          <button
            className={`emerald-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="icon">📊</span>
            <span>1. Overview</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <span className="icon">💳</span>
            <span>9. Transactions & Events</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="icon">📈</span>
            <span>10. Reports & Analytics</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <span className="icon">🛡️</span>
            <span>11. Roles & Audit Log</span>
          </button>

          <div className="emerald-nav-group-title">Catalog & Pricing</div>
          <button
            className={`emerald-nav-btn ${activeTab === 'paid_tools' ? 'active' : ''}`}
            onClick={() => { setActiveTab('paid_tools'); setCurrentPage(1); }}
          >
            <span className="icon">🛠️</span>
            <span>2. Paid Tools (1,059)</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <span className="icon">🏷️</span>
            <span>3. Pricing & Features</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <span className="icon">📝</span>
            <span>4. Content & Tool Info</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('discounts')}
          >
            <span className="icon">🎟️</span>
            <span>5. Discounts & Coupons</span>
          </button>

          <div className="emerald-nav-group-title">Subscriptions & Users</div>
          <button
            className={`emerald-nav-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <span className="icon">💎</span>
            <span>6. Premium Subs</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'tool_passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('tool_passes')}
          >
            <span className="icon">⏱️</span>
            <span>7. 30-Day Tool Passes</span>
          </button>
          <button
            className={`emerald-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="icon">👥</span>
            <span>8. Users & Entitlements</span>
          </button>
        </nav>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="emerald-main">
        {/* Top Header Bar */}
        <header className="emerald-topbar">
          <div className="emerald-topbar-left">
            <h1>
              {activeTab === 'overview' && 'Overview & Business Health'}
              {activeTab === 'paid_tools' && 'Paid Tools Catalog & Classification'}
              {activeTab === 'pricing' && 'Pricing Templates & Feature Overrides'}
              {activeTab === 'content' && 'Content & Tool Information CMS'}
              {activeTab === 'discounts' && 'Discounts & Campaign Drafts'}
              {activeTab === 'subscriptions' && 'Premium Monthly & Yearly Subscriptions'}
              {activeTab === 'tool_passes' && '30-Day Individual Tool Passes'}
              {activeTab === 'users' && 'Users Directory & Entitlements'}
              {activeTab === 'transactions' && 'Financial Records & Webhooks'}
              {activeTab === 'reports' && 'Reports, Downloads & Telemetry'}
              {activeTab === 'roles' && 'Roles, Permissions & Append-Only Audit Log'}
            </h1>
            <span className="emerald-badge-payments">
              ● Payments Inactive (Deferred)
            </span>
          </div>

          <div className="emerald-topbar-right">
            <div className="emerald-user-badge">
              <span>👤 {user?.name || 'Administrator'}</span>
              <span className="emerald-role-pill">Super Admin</span>
            </div>
            <Link to="/dashboard" className="emerald-btn emerald-btn-sub emerald-btn-sm">
              User View
            </Link>
            <Link to="/" className="emerald-btn emerald-btn-sub emerald-btn-sm">
              Public Site ↗
            </Link>
          </div>
        </header>

        {/* Dynamic Screen Viewport */}
        <main className="emerald-content">

          {/* SCREEN 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="emerald-kpi-grid">
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Total Catalog Tools</div>
                  <div className="emerald-kpi-val">1,059</div>
                  <div className="emerald-kpi-sub">74 Distinct Categories</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Free Forever Tools</div>
                  <div className="emerald-kpi-val" style={{ color: '#1F9D6B' }}>359</div>
                  <div className="emerald-kpi-sub">100% Free Client-Side</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Advanced Tools (Pro)</div>
                  <div className="emerald-kpi-val" style={{ color: '#B8975A' }}>700</div>
                  <div className="emerald-kpi-sub">Deliverables & Advanced Modes</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Download-Capable Tools</div>
                  <div className="emerald-kpi-val">33</div>
                  <div className="emerald-kpi-sub">PDF, PNG, CSV, XLSX, ZIP</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Registered Accounts</div>
                  <div className="emerald-kpi-val">{users.length || 1}</div>
                  <div className="emerald-kpi-sub">Sanctum Authenticated</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">Purchase Interest Taps</div>
                  <div className="emerald-kpi-val" style={{ color: '#3B82F6' }}>{interestTapsCount}</div>
                  <div className="emerald-kpi-sub">"Payments Coming Soon" Clicks</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">
                    <span>Gross Sales</span>
                    <span className="badge-unavailable" title="Payments layer is deferred until merchant account connection">Not available</span>
                  </div>
                  <div className="emerald-kpi-val" style={{ color: '#9CA3AF' }}>—</div>
                  <div className="emerald-kpi-sub">Payments deferred mode</div>
                </div>
                <div className="emerald-kpi-card">
                  <div className="emerald-kpi-label">
                    <span>Net Revenue</span>
                    <span className="badge-unavailable" title="Payments layer is deferred until merchant account connection">Not available</span>
                  </div>
                  <div className="emerald-kpi-val" style={{ color: '#9CA3AF' }}>—</div>
                  <div className="emerald-kpi-sub">Zero fabricated sales</div>
                </div>
              </div>

              {/* Quick Jump Action Banner */}
              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ep-forest)' }}>Quick Operational Governance</h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--ep-muted-text)', fontSize: '0.9rem' }}>
                  Jump directly to catalog classification, pricing overrides, or manual user entitlement adjustments:
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { setActiveTab('paid_tools'); setTierFilter('paid'); }} className="emerald-btn emerald-btn-primary">
                    Manage 700 Paid Tools ↗
                  </button>
                  <button onClick={() => { setActiveTab('paid_tools'); setDownloadFilter('downloadable'); }} className="emerald-btn emerald-btn-sub">
                    View 33 Downloadable Tools ↗
                  </button>
                  <button onClick={() => setManualGrantModal(true)} className="emerald-btn emerald-btn-sub">
                    + Manual Entitlement Grant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: PAID TOOLS */}
          {activeTab === 'paid_tools' && (
            <div>
              {/* Filter Controls */}
              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1', minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="Search tools by name or slug..."
                    value={toolSearch}
                    onChange={(e) => { setToolSearch(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '0.55rem 0.85rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  >
                    <option value="all">All Categories ({categoriesList.length})</option>
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={tierFilter}
                    onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '0.55rem 0.85rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  >
                    <option value="all">All Tiers</option>
                    <option value="free">Free Forever (359)</option>
                    <option value="paid">Advanced Pro (700)</option>
                  </select>
                </div>
                <div>
                  <select
                    value={downloadFilter}
                    onChange={(e) => { setDownloadFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '0.55rem 0.85rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  >
                    <option value="all">All Download Classes</option>
                    <option value="downloadable">Downloadable Only</option>
                    <option value="mixed">Mixed (On-Screen + Export)</option>
                    <option value="on-screen">On-Screen Only</option>
                  </select>
                </div>
              </div>

              {/* Master Tools Table */}
              <div className="emerald-table-container">
                <div className="emerald-table-header">
                  <strong>Master Catalog List ({filteredTools.length} tools matching)</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ep-muted-text)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <table className="emerald-table">
                  <thead>
                    <tr>
                      <th>Tool Name & Slug</th>
                      <th>Category</th>
                      <th>Tier</th>
                      <th>Download Class</th>
                      <th>Formats</th>
                      <th>Execution</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTools.map((t) => (
                      <tr key={t.slug}>
                        <td>
                          <strong>{t.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--ep-muted-text)', fontFamily: 'monospace' }}>{t.slug}</div>
                        </td>
                        <td><span className="emerald-role-pill">{t.category}</span></td>
                        <td>
                          {t.is_advanced ? (
                            <span className="badge-gold">⭐ Advanced ($19 / Pro)</span>
                          ) : (
                            <span className="badge-emerald">⚡ Free Forever</span>
                          )}
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                            {t.download_type}
                          </span>
                        </td>
                        <td><code>{t.download_formats}</code></td>
                        <td><span style={{ textTransform: 'capitalize' }}>{t.generated_where}</span></td>
                        <td>
                          <button
                            onClick={() => togglePaidStatus(t.slug)}
                            className={`emerald-btn emerald-btn-sm ${t.is_advanced ? 'emerald-btn-sub' : 'emerald-btn-primary'}`}
                          >
                            {t.is_advanced ? 'Set Free' : 'Set Paid'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="emerald-btn emerald-btn-sub emerald-btn-sm"
                >
                  ← Previous
                </button>
                <span style={{ fontSize: '0.88rem', color: 'var(--ep-muted-text)' }}>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTools.length)} of {filteredTools.length}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="emerald-btn emerald-btn-sub emerald-btn-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: PRICING & FEATURE EDITOR */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>📦 Reusable Pricing Templates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid var(--ep-border)', borderRadius: '6px', background: 'var(--ep-sage-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Template A: Advanced Standard</span>
                      <span className="badge-gold">$19.00</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ep-muted-text)', margin: '0.5rem 0' }}>
                      30-Day Tool Pass. Included in Pro Monthly ($9/mo) and Pro Annual ($89/yr). Unbranded deliverables.
                    </p>
                    <span style={{ fontSize: '0.78rem', color: '#1F9D6B', fontWeight: 600 }}>Applied to 620 Advanced Tools</span>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--ep-border)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Template B: Export-Only Pass</span>
                      <span className="badge-gold">$9.00</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ep-muted-text)', margin: '0.5rem 0' }}>
                      Unlocks unwatermarked CSV/PDF/Image downloads only. All math remains free on-screen.
                    </p>
                    <span style={{ fontSize: '0.78rem', color: '#1F9D6B', fontWeight: 600 }}>Applied to 80 Export Tools</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>🛡️ Pricing Safeguards & Rules</h3>
                <ul style={{ fontSize: '0.9rem', color: 'var(--ep-charcoal)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
                  <li><strong>Free Forever Isolation:</strong> The 359 basic tools are strictly protected and cannot be priced by bulk operations.</li>
                  <li><strong>Versioned Edits:</strong> Price edits create a new price version with an effective UTC date; historical quotes remain unchanged.</li>
                  <li><strong>Confirmation Phrase:</strong> Bulk pricing updates require typing <code style={{ color: '#D9480F' }}>CHANGE TOOLS</code> to prevent accidental mass changes.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SCREEN 4: CONTENT & TOOL INFO CMS */}
          {activeTab === 'content' && (
            <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Structured Tool Documentation Editor</h3>
                  <p style={{ margin: 0, color: 'var(--ep-muted-text)', fontSize: '0.88rem' }}>
                    Managing content for: <strong>{selectedToolForContent?.name}</strong> (<code>{selectedToolForContent?.slug}</code>)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="emerald-btn emerald-btn-sub emerald-btn-sm" onClick={() => alert('Draft saved successfully!')}>Save Draft</button>
                  <button className="emerald-btn emerald-btn-primary emerald-btn-sm" onClick={() => alert('Published content live!')}>Publish Live</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Tool Summary (1-2 Sentences)</label>
                  <textarea
                    rows={3}
                    value={contentForm.summary}
                    onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Workflow (3 to 5 Steps)</label>
                  <textarea
                    rows={3}
                    value={contentForm.steps}
                    onChange={(e) => setContentForm({ ...contentForm, steps: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--ep-border)', borderRadius: '6px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: DISCOUNTS & COUPONS */}
          {activeTab === 'discounts' && (
            <div>
              <div style={{ background: '#FFF4E5', border: '1px solid #FFD8A8', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', color: '#D9480F', fontSize: '0.9rem' }}>
                ⚠️ <strong>Coupon Activation Paused:</strong> Coupon creation operates in draft mode. Activation will be enabled when merchant payments go live.
              </div>
              <div className="emerald-table-container">
                <div className="emerald-table-header">
                  <strong>Draft Coupon Campaigns</strong>
                  <button className="emerald-btn emerald-btn-primary emerald-btn-sm" onClick={() => alert('Draft campaign created!')}>+ Create Draft Coupon</button>
                </div>
                <table className="emerald-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount</th>
                      <th>Scope</th>
                      <th>Usage Limit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>LAUNCH2026</code></td>
                      <td>20% Off</td>
                      <td>Pro Annual ($89)</td>
                      <td>500 redemptions</td>
                      <td><span className="badge-unavailable">Draft (Paused)</span></td>
                    </tr>
                    <tr>
                      <td><code>STUDENT50</code></td>
                      <td>50% Off</td>
                      <td>Pro Monthly ($9)</td>
                      <td>1,000 redemptions</td>
                      <td><span className="badge-unavailable">Draft (Paused)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 6: PREMIUM SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Active Subscription Records</h3>
                  <p style={{ margin: 0, color: 'var(--ep-muted-text)', fontSize: '0.88rem' }}>Monthly ($9/mo) and Annual ($89/yr) subscribers</p>
                </div>
                <button onClick={() => setManualGrantModal(true)} className="emerald-btn emerald-btn-primary emerald-btn-sm">
                  + Manual Grant Subscription
                </button>
              </div>

              <div className="emerald-table-container">
                <table className="emerald-table">
                  <thead>
                    <tr>
                      <th>User Account</th>
                      <th>Plan Tier</th>
                      <th>Renews At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Super Admin Account</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ep-muted-text)' }}>admin@vimz.ai</div>
                      </td>
                      <td><span className="badge-gold">Pro All-Access (Annual)</span></td>
                      <td>2027-10-16 UTC</td>
                      <td><span className="badge-emerald">● Active</span></td>
                      <td>
                        <button className="emerald-btn emerald-btn-sub emerald-btn-sm" onClick={() => alert('Cancel at period end set')}>
                          Cancel at Period End
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 7: TOOL PASSES */}
          {activeTab === 'tool_passes' && (
            <div className="emerald-table-container">
              <div className="emerald-table-header">
                <strong>30-Day Individual Tool Passes</strong>
              </div>
              <table className="emerald-table">
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Tool Slug</th>
                    <th>Remaining Days</th>
                    <th>UTC Expiration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>tester@vimz.ai</td>
                    <td><code>dcf-valuation-calc</code></td>
                    <td>24 Days Left</td>
                    <td>2026-11-09 12:00 UTC</td>
                    <td>
                      <button className="emerald-btn emerald-btn-sub emerald-btn-sm" onClick={() => alert('Pass revoked')}>Revoke</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN 8: USERS & ENTITLEMENTS */}
          {activeTab === 'users' && (
            <div className="emerald-table-container">
              <div className="emerald-table-header">
                <strong>Registered Users Directory ({users.length} accounts)</strong>
              </div>
              <table className="emerald-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Subscription</th>
                    <th>Single Passes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td><strong>admin@vimz.ai</strong></td>
                      <td><span className="emerald-role-pill">Super Admin</span></td>
                      <td><span className="badge-gold">Pro</span></td>
                      <td>—</td>
                      <td><button onClick={() => setManualGrantModal(true)} className="emerald-btn emerald-btn-sub emerald-btn-sm">Adjust</button></td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--ep-muted-text)' }}>{u.email}</div>
                        </td>
                        <td><span className="emerald-role-pill">{u.role}</span></td>
                        <td>{u.subscription_tier === 'pro' ? <span className="badge-gold">Pro</span> : 'Free'}</td>
                        <td>{u.purchases_count || 0}</td>
                        <td><button onClick={() => { setGrantEmail(u.email); setManualGrantModal(true); }} className="emerald-btn emerald-btn-sub emerald-btn-sm">Adjust</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN 9: TRANSACTIONS & EVENTS */}
          {activeTab === 'transactions' && (
            <div>
              <div style={{ background: '#FFF4E5', border: '1px solid #FFD8A8', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', color: '#D9480F', fontSize: '0.9rem' }}>
                💳 <strong>Payments Layer Inactive (Deferred Mode):</strong> Live webhooks, provider settlements, and credit card processing are deferred until the payment processor credentials are provided. No real orders are being created.
              </div>
              <div className="emerald-table-container">
                <div className="emerald-table-header">
                  <strong>Provider Events & Idempotency Audit</strong>
                </div>
                <table className="emerald-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Provider</th>
                      <th>Event Name</th>
                      <th>Status</th>
                      <th>Received At</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>evt_sandbox_init_01</code></td>
                      <td>Lemon Squeezy</td>
                      <td><code>subscription_created</code></td>
                      <td><span className="badge-emerald">Processed</span></td>
                      <td>2026-10-14 11:35 UTC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 10: REPORTS & TELEMETRY */}
          {activeTab === 'reports' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>📊 Catalog Downloads Breakdown</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>CSV Tabular Reports</span><strong>8 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>Plain Text (TXT) Documents</span><strong>8 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>PDF Print & Bates Stampers</span><strong>7 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>PNG / Image Assets</span><strong>6 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>JSON Data Structs</span><strong>5 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #EEE' }}>
                    <span>ZIP Archives & Bundles</span><strong>3 Tools</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>XLSX / Excel Workbooks</span><strong>1 Tool</strong>
                  </li>
                </ul>
              </div>

              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>🎯 Purchase Interest Telemetry</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ep-muted-text)', margin: '0 0 1rem 0' }}>
                  Tracks when visitors click buy buttons while payments are deferred:
                </p>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1F9D6B', marginBottom: '0.5rem' }}>
                  {interestTapsCount} Taps Recorded
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ep-muted-text)' }}>
                  Clear distinction: Labelled "No payment taken" and excluded from revenue metrics.
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 11: ROLES & AUDIT LOG */}
          {activeTab === 'roles' && (
            <div>
              <div style={{ background: '#FFF', border: '1px solid var(--ep-border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>🛡️ 3-Tier Server-Side RBAC Architecture</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ep-muted-text)' }}>
                  <strong>Super Admin:</strong> Full catalog, pricing, role assignment, and manual entitlement adjustments.<br />
                  <strong>Billing Manager:</strong> View subscriptions, cancel at period end, manage campaign drafts.<br />
                  <strong>Support Staff:</strong> Read-only access to user records with masked financial credentials.
                </p>
              </div>

              <div className="emerald-table-container">
                <div className="emerald-table-header">
                  <strong>Append-Only Administrative Audit Trail</strong>
                </div>
                <table className="emerald-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Mandatory Reason</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--ep-muted-text)' }}>{log.time}</td>
                        <td><strong>{log.admin}</strong></td>
                        <td><code>{log.action}</code></td>
                        <td><strong>{log.entity}</strong></td>
                        <td>{log.reason}</td>
                        <td><code>{log.ip}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Manual Grant Entitlement Modal */}
      {manualGrantModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#FFF', borderRadius: '10px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Manual Entitlement Grant</h3>
            <form onSubmit={handleManualGrantSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>User Email</label>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--ep-border)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Entitlement Plan</label>
                <select
                  value={grantTier}
                  onChange={(e) => setGrantTier(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--ep-border)', borderRadius: '6px' }}
                >
                  <option value="pro_monthly">Pro Monthly ($9/mo)</option>
                  <option value="pro_annual">Pro Annual ($89/yr)</option>
                  <option value="tool_pass_30">30-Day Tool Pass</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Mandatory Audit Reason <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. VIP Instructor Testing, QA verification, or customer support resolution"
                  required
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--ep-border)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setManualGrantModal(false)} className="emerald-btn emerald-btn-sub">Cancel</button>
                <button type="submit" className="emerald-btn emerald-btn-primary">Confirm Grant & Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
