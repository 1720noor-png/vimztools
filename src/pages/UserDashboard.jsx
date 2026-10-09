import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { userApi } from '../api/client.js'
import { tools } from '../data/registry.js'
import { useRecentTools } from '../utils/userPrefs.js'

export default function UserDashboard() {
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [favorites, setFavorites] = useState([])
  const [savedResults, setSavedResults] = useState([])
  const [activeTab, setActiveTab] = useState('purchases')
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
      const [purchasesRes, favsRes, resultsRes] = await Promise.allSettled([
        userApi.getPurchases(),
        userApi.getFavorites(),
        userApi.getSavedResults(),
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

  return (
    <div className="dashboard-layout">
      {/* Workspace Header */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--c-indigo)', border: '1px solid rgba(99,102,241,0.25)' }}>
              {user?.role === 'admin' ? '⚡ Workspace Administrator' : '✨ Pro Workspace'}
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
          <Link to="/tools" className="btn primary sm">
            + New Tool Task
          </Link>
          <button onClick={logout} className="btn sub sm">Sign Out</button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Unlocked Pro Tools</span>
          <span className="kpi-value" style={{ color: 'var(--c-indigo)' }}>{purchases.length}</span>
          <span className="kpi-sub">Lifetime export licenses</span>
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
        <div className="kpi-card">
          <span className="kpi-label">Recent Activity</span>
          <span className="kpi-value">{recents.length}</span>
          <span className="kpi-sub">Tools accessed locally</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          💳 Unlocked Tools ({purchases.length})
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
