import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { adminApi } from '../api/client.js'

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [toolsList, setToolsList] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingTool, setEditingTool] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        nav('/login')
      } else if (!isAdmin) {
        alert('Access denied. Admin rights required.')
        nav('/dashboard')
      } else {
        loadData()
      }
    }
  }, [user, isAdmin, authLoading])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, toolsRes, usersRes, purchasesRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getTools({ search }),
        adminApi.getUsers(),
        adminApi.getPurchases(),
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats)
      if (toolsRes.status === 'fulfilled') setToolsList(toolsRes.value.tools?.data || toolsRes.value.tools || [])
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users?.data || usersRes.value.users || [])
      if (purchasesRes.status === 'fulfilled') setPurchases(purchasesRes.value.purchases?.data || purchasesRes.value.purchases || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTool = async (e) => {
    e.preventDefault()
    if (!editingTool) return

    try {
      await adminApi.updateTool(editingTool.id, {
        is_paid: editingTool.is_paid,
        price: editingTool.price,
        download_enabled: editingTool.download_enabled,
        download_type: editingTool.download_type,
        preview_summary: editingTool.preview_summary,
      })
      alert('Tool pricing and settings updated successfully!')
      setEditingTool(null)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to update tool')
    }
  }

  if (authLoading || loading) {
    return <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading Admin Console…</div>
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <div>
          <span className="badge" style={{ background: 'var(--brand)', color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>
            ⚡ Superadmin Control Center
          </span>
          <h1>Vimz.ai Platform Administration</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Manage 1,000+ tools, one-time sales, user access, and telemetry</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/dashboard" className="btn sub">User View</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Tools Catalog</span>
          <span className="kpi-value">{stats?.total_tools || 1015}</span>
          <span className="kpi-sub">100% Client-Side Free Base</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Premium Unlocked Tools</span>
          <span className="kpi-value" style={{ color: 'var(--brand)' }}>{stats?.paid_tools || 21}</span>
          <span className="kpi-sub">One-Time License Enabled</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Registered Accounts</span>
          <span className="kpi-value">{stats?.total_users || 2}</span>
          <span className="kpi-sub">Cloud Synced Users</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Platform Revenue</span>
          <span className="kpi-value" style={{ color: 'var(--ok)' }}>${stats?.total_revenue?.toFixed(2) || '0.00'}</span>
          <span className="kpi-sub">{stats?.total_purchases || 0} One-Time Sales (No Subs)</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview & Revenue
        </button>
        <button className={`dash-tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
          🛠️ Tool Monetization ({toolsList.length})
        </button>
        <button className={`dash-tab ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
          💳 Transactions & Invoices ({purchases.length})
        </button>
        <button className={`dash-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Users ({users.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="saas-box">
              <h3>Recent Unlocked Transactions</h3>
              {purchases.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No purchases recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Tool</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td><code>{p.transaction_id}</code></td>
                          <td><strong>{p.tool_slug}</strong></td>
                          <td>${p.amount}</td>
                          <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="saas-box">
              <h3>Monetization Guidelines</h3>
              <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--muted)' }}>
                <li><strong>One-Time Payments Only:</strong> Strictly no recurring subscriptions or hidden memberships.</li>
                <li><strong>Free Client-Side Usage:</strong> Users can always calculate and preview without paying.</li>
                <li><strong>Premium Unlock:</strong> High-res vector exports, clean PDF watermark-removal, and batch Excel models.</li>
                <li><strong>Transparent Rates:</strong> Micro-pricing between \$2.99 – \$8.99 for lifetime tool export access.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="dash-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="search"
                placeholder="Search tools by name or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadData() }}
                style={{ maxWidth: '340px' }}
              />
              <button onClick={loadData} className="btn sub">Search Tools</button>
            </div>

            <div className="table-responsive">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Tool Name & Slug</th>
                    <th>Category</th>
                    <th>Monetization</th>
                    <th>Price</th>
                    <th>Export Type</th>
                    <th>Purchases</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {toolsList.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>/{t.category_slug}/{t.slug}</div>
                      </td>
                      <td><span className="badge sub">{t.category_slug || 'General'}</span></td>
                      <td>
                        {t.is_paid ? (
                          <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                            💎 Paid Export
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--ok)' }}>
                            Free Base
                          </span>
                        )}
                      </td>
                      <td><strong>${t.price ? Number(t.price).toFixed(2) : '0.00'}</strong></td>
                      <td><code>{t.download_type || 'default'}</code></td>
                      <td>{t.purchase_count || 0}</td>
                      <td>
                        <button onClick={() => setEditingTool(t)} className="btn sub sm">Edit Pricing</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="dash-section">
            <div className="table-responsive">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>User / Guest</th>
                    <th>Tool Slug</th>
                    <th>Amount</th>
                    <th>Gateway</th>
                    <th>Downloads</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.transaction_id}</code></td>
                      <td>{p.user?.email || p.guest_email || 'guest@example.com'}</td>
                      <td><strong>{p.tool_slug}</strong></td>
                      <td><strong>${p.amount} {p.currency}</strong></td>
                      <td><span className="badge sub">{p.payment_gateway}</span></td>
                      <td>{p.download_count} / {p.download_limit}</td>
                      <td>{new Date(p.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dash-section">
            <div className="table-responsive">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Purchases</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'accent' : 'sub'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.purchases_count || 0}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Tool Modal */}
      {editingTool && (
        <div className="modal-backdrop" onClick={() => setEditingTool(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Tool Monetization: {editingTool.name}</h3>
              <button className="icon-btn" onClick={() => setEditingTool(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateTool} className="auth-form" style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <input
                  type="checkbox"
                  id="is_paid_check"
                  checked={editingTool.is_paid}
                  onChange={(e) => setEditingTool({ ...editingTool, is_paid: e.target.checked })}
                />
                <label htmlFor="is_paid_check" style={{ margin: 0 }}>Enable Paid Export (One-Time Payment)</label>
              </div>

              <div className="form-group">
                <label>One-Time Unlock Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingTool.price}
                  onChange={(e) => setEditingTool({ ...editingTool, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Download Export Format</label>
                <select
                  value={editingTool.download_type || 'pdf'}
                  onChange={(e) => setEditingTool({ ...editingTool, download_type: e.target.value })}
                >
                  <option value="pdf">Vector PDF</option>
                  <option value="excel">Excel XLSX</option>
                  <option value="svg">Vector SVG</option>
                  <option value="zip">ZIP Bundle</option>
                  <option value="json">JSON Schema</option>
                </select>
              </div>

              <div className="form-group">
                <label>Export Description / Feature Summary</label>
                <textarea
                  rows={3}
                  value={editingTool.preview_summary || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, preview_summary: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingTool(null)} className="btn sub">Cancel</button>
                <button type="submit" className="btn primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
