import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { userApi } from '../api/client.js'
import { tools } from '../data/registry.js'
import { useRecentTools } from '../utils/userPrefs.js'

export default function UserDashboard() {
  const { user, isLoggedIn, loading: authLoading, logout, isPro } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [entitlementsData, setEntitlementsData] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [savedResults, setSavedResults] = useState([])
  const [activeTab, setActiveTab] = useState('subscription')
  const [loading, setLoading] = useState(true)
  const { recents } = useRecentTools()
  const nav = useNavigate()

  useEffect(() => {
    document.title = 'My Workspace – Vimz.ai'
    if (!authLoading && !isLoggedIn) {
      nav('/login')
      return
    }

    if (isLoggedIn) {
      loadData()
    }
  }, [isLoggedIn, authLoading])

  const loadData = async () => {
    setLoading(true)
    try {
      const [purchasesRes, favsRes, resultsRes, entitlementsRes] = await Promise.allSettled([
        userApi.getPurchases(),
        userApi.getFavorites(),
        userApi.getSavedResults(),
        userApi.getEntitlements(),
      ])

      if (purchasesRes.status === 'fulfilled' && purchasesRes.value?.purchases) {
        setPurchases(purchasesRes.value.purchases)
      }
      if (favsRes.status === 'fulfilled' && favsRes.value?.favorites) {
        setFavorites(favsRes.value.favorites)
      }
      if (resultsRes.status === 'fulfilled' && resultsRes.value?.results) {
        setSavedResults(resultsRes.value.results)
      }
      if (entitlementsRes.status === 'fulfilled') {
        setEntitlementsData(entitlementsRes.value)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResult = async (id) => {
    if (!confirm('Are you sure you want to delete this saved calculation?')) return
    try {
      await userApi.deleteResult(id)
      setSavedResults((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete calculation')
    }
  }

  if (authLoading || (!isLoggedIn && loading)) {
    return <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading your workspace…</div>
  }

  const favoriteTools = tools.filter((t) => favorites.includes(t.slug))
  const userIsPro = Boolean(isPro || entitlementsData?.is_pro || user?.is_pro || user?.role === 'admin')
  const subTier = entitlementsData?.subscription_tier || user?.subscription_tier || (userIsPro ? 'pro' : 'free')

  return (
    <div className="dashboard-layout">
      {/* Workspace Header */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span className="badge" style={{ background: userIsPro ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)', color: userIsPro ? '#16a34a' : 'var(--c-indigo)', border: userIsPro ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.25)' }}>
              {user?.role === 'admin' ? '⚡ Workspace Administrator' : userIsPro ? '💎 Pro Workspace Active' : '✨ Starter Workspace'}
            </span>
          </div>
          <h1>My Workspace</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Welcome back, <strong>{user?.name}</strong> ({user?.email})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Admin Console
            </Link>
          )}
          {!userIsPro && (
            <Link to="/pricing" className="btn primary sm" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', border: 'none' }}>
              💎 Upgrade to Pro
            </Link>
          )}
          <Link to="/tools" className="btn sub sm">
            + New Tool Task
          </Link>
          <button onClick={logout} className="btn sub sm">Sign Out</button>
        </div>
      </div>

      {/* Subscription Banner */}
      <div style={{
        background: userIsPro 
          ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))' 
          : 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))',
        border: userIsPro ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(99,102,241,0.25)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{userIsPro ? '💎' : '⚡'}</span>
            <strong style={{ fontSize: '1.1rem' }}>
              {userIsPro ? `Active Plan: Vimz Pro (${subTier === 'annual' ? 'Annual' : 'Monthly'})` : 'Active Plan: Free Starter'}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
            {userIsPro
              ? 'All 700 advanced tools unlocked with unbranded watermark-free deliverables and 4K vector downloads.'
              : 'You have unlimited access to 359 basic tools. Upgrade to Pro ($9/mo) to unlock all 700 advanced tools and white-label exports.'}
          </p>
        </div>

        <div>
          {userIsPro ? (
            <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a', padding: '0.45rem 0.9rem', fontWeight: 600 }}>
              ● Pro License Active
            </span>
          ) : (
            <Link to="/pricing" className="btn primary sm" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', border: 'none', padding: '0.5rem 1.1rem' }}>
              Upgrade to Pro ($9/mo) →
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Subscription Tier</span>
          <span className="kpi-value" style={{ color: userIsPro ? '#10b981' : 'var(--c-indigo)' }}>
            {userIsPro ? 'Vimz Pro' : 'Free Tier'}
          </span>
          <span className="kpi-sub">{userIsPro ? 'All 700 Advanced Tools' : '359 Free Forever Tools'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Unlocked Pro Tools</span>
          <span className="kpi-value" style={{ color: 'var(--c-indigo)' }}>
            {userIsPro ? '700' : purchases.length}
          </span>
          <span className="kpi-sub">{userIsPro ? 'Full platform license' : 'Individual tool licenses'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Favorited Tools</span>
          <span className="kpi-value" style={{ color: 'var(--brand)' }}>{favoriteTools.length}</span>
          <span className="kpi-sub">Pinned for quick launch</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Saved Computations</span>
          <span className="kpi-value" style={{ color: 'var(--ok)' }}>{savedResults.length}</span>
          <span className="kpi-sub">Stored in cloud profile</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          💎 Subscription & Licenses
        </button>
        <button
          className={`dash-tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          💳 Single Purchases ({purchases.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐ Saved Favorites ({favoriteTools.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved Computations ({savedResults.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading records…</div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 'subscription' && (
            <div className="dash-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Plan Status Card */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge" style={{ background: userIsPro ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.1)', color: userIsPro ? '#16a34a' : 'var(--c-indigo)', marginBottom: '0.4rem' }}>
                        {userIsPro ? '● Active Pro Subscription' : 'Free Starter Tier'}
                      </span>
                      <h3 style={{ margin: '0.2rem 0', fontSize: '1.3rem' }}>
                        {userIsPro ? `Vimz Pro (${subTier === 'annual' ? 'Annual' : 'Monthly'})` : 'Free Starter Membership'}
                      </h3>
                    </div>
                    <span style={{ fontSize: '1.8rem' }}>{userIsPro ? '💎' : '⚡'}</span>
                  </div>

                  <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                    {userIsPro
                      ? 'Your subscription is managed through Lemon Squeezy. You have unrestricted access to all 700 advanced tools, watermark-free vector PDFs, and bulk data downloads.'
                      : 'You have unlimited access to 359 base tools. Upgrade to Pro for $9/mo to unlock white-label deliverables across 700 advanced tools.'}
                  </p>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pricing:</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                        {userIsPro ? (subTier === 'annual' ? '$89/year' : '$9/month') : '$0 (Free Forever)'}
                      </strong>
                    </div>
                    {userIsPro ? (
                      <Link to="/tools" className="btn primary sm">
                        Browse 700 Tools
                      </Link>
                    ) : (
                      <Link to="/pricing" className="btn primary sm" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', border: 'none' }}>
                        Upgrade Now →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Benefits / Extension Status Card */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1.75rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧩</span> Platform Entitlement Coverage
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                      <span><strong>359 Everyday Tools:</strong> 100% Free Forever</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: userIsPro ? '#10b981' : '#94a3b8', fontWeight: 'bold' }}>{userIsPro ? '✓' : '○'}</span>
                      <span><strong>700 Advanced Tools:</strong> {userIsPro ? 'Fully Unlocked' : 'Free Preview Mode'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: userIsPro ? '#10b981' : '#94a3b8', fontWeight: 'bold' }}>{userIsPro ? '✓' : '○'}</span>
                      <span><strong>Watermark-Free Exports:</strong> {userIsPro ? 'Active' : 'Pro Only'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                      <span><strong>Chrome Extension:</strong> Manifest V3 Ready</span>
                    </li>
                  </ul>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                    Merchant of Record: Lemon Squeezy • Secured by 256-Bit SSL
                  </div>
                </div>

              </div>

              {/* Unlocked Entitlements Table */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Active Entitlement Licenses</h3>
                {userIsPro ? (
                  <div style={{ padding: '1.5rem', background: 'rgba(34,197,94,0.06)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>💎</span>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>Universal Pro All-Access Pass Active</strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                        You hold an all-access entitlement grant. All 700 advanced tools, high-res exports, and downloadable deliverables are immediately accessible across your browser and extension.
                      </p>
                    </div>
                  </div>
                ) : entitlementsData?.entitlements && entitlementsData.entitlements.length > 0 ? (
                  <div className="table-responsive">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>Tool Slug</th>
                          <th>Entitlement Source</th>
                          <th>Granted Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entitlementsData.entitlements.map((e) => (
                          <tr key={e.id}>
                            <td><strong>{e.tool_slug}</strong></td>
                            <td><span className="badge sub">{e.source || 'single_purchase'}</span></td>
                            <td>{new Date(e.created_at).toLocaleDateString()}</td>
                            <td><span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--ok)' }}>● Active</span></td>
                            <td>
                              <Link to={`/tools/${e.tool_slug}`} className="btn sub sm">Open Tool</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--muted)' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>No individual paid tool licenses or active Pro subscriptions on this account yet.</p>
                    <Link to="/pricing" className="btn primary sm">Explore Pro Plans ($9/mo)</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="dash-section">
              {purchases.length === 0 ? (
                <div className="empty-state-card">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                  <h3>No Paid Tools Unlocked Yet</h3>
                  <p>
                    All 1,000+ base tools on Vimz.ai are 100% free forever. If you purchase high-resolution export licenses ($2.99 – $8.99 one-time), your download tokens and receipts will appear here.
                  </p>
                  <Link to="/tools" className="btn primary" style={{ marginTop: '1rem' }}>Browse All Tools</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Tool & License</th>
                        <th>Transaction ID</th>
                        <th>Amount Paid</th>
                        <th>Downloads Used</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.tool?.name || p.tool_slug}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Slug: {p.tool_slug}</div>
                          </td>
                          <td><code>{p.transaction_id}</code></td>
                          <td><strong>${p.amount} {p.currency}</strong></td>
                          <td>{p.download_count} / {p.download_limit}</td>
                          <td>
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--ok)' }}>
                              ● {p.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/tools`} className="btn sub sm">Open Tool</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="dash-section">
              {favoriteTools.length === 0 ? (
                <div className="empty-state-card">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
                  <h3>No Favorites Saved</h3>
                  <p>Click the star icon on any tool card across Vimz.ai to bookmark it in your personal workspace.</p>
                  <Link to="/tools" className="btn primary" style={{ marginTop: '1rem' }}>Explore 1,000+ Tools</Link>
                </div>
              ) : (
                <div className="grid">
                  {favoriteTools.map((t) => (
                    <div key={t.slug} className="tool-card-saas">
                      <div className="card-top">
                        <span className="tool-ico">{t.icon || '🛠️'}</span>
                        <span className="badge sub">{t.cat}</span>
                      </div>
                      <h3 style={{ margin: '0.5rem 0' }}>{t.name}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--muted)', flex: 1 }}>{t.desc}</p>
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to={`/${t.cat}/${t.slug}`} className="btn primary sm">Launch Tool</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="dash-section">
              {savedResults.length === 0 ? (
                <div className="empty-state-card">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💾</div>
                  <h3>No Saved Computations</h3>
                  <p>When running calculators and data processors, you can save outputs directly to your cloud profile for future reference.</p>
                  <Link to="/tools" className="btn sub" style={{ marginTop: '1rem' }}>Find a Calculator</Link>
                </div>
              ) : (
                <div className="saved-list">
                  {savedResults.map((r) => (
                    <div key={r.id} className="saved-item-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4>{r.title}</h4>
                          <span className="badge sub" style={{ marginRight: '0.5rem' }}>{r.tool_slug}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Saved {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteResult(r.id)} className="btn danger sm">Delete</button>
                      </div>
                      <pre className="saved-payload-box">{r.payload}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
