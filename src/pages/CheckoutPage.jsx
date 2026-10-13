import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { checkoutApi } from '../api/client.js'
import { tools } from '../data/registry.js'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const { user, isLoggedIn, isPro, reloadUser } = useAuth()

  const tierParam = searchParams.get('tier') || 'pro_monthly'
  const slugParam = searchParams.get('slug') || ''
  const isSuccess = searchParams.get('success') === '1'
  const isCanceled = searchParams.get('canceled') === '1'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  useEffect(() => {
    document.title = isSuccess ? 'Payment Successful – Vimz.ai' : 'Secure Checkout – Vimz.ai'
    if (isSuccess && isLoggedIn) {
      // Reload user profile to fetch fresh entitlement status
      reloadUser().catch(() => {})
    }
  }, [isSuccess, isLoggedIn])

  // Resolve target tool if single-tool purchase
  const selectedTool = slugParam ? tools.find((t) => t.slug === slugParam) : null

  const getPlanDetails = () => {
    if (tierParam === 'pro_annual') {
      return {
        title: 'Vimz.ai Pro Annual Membership',
        price: '$89.00',
        billing: 'Billed annually ($7.41/mo)',
        badge: 'Best Value — Save 18%',
        features: [
          'All 700 advanced tools unlocked',
          'Unlimited watermark-free & white-label exports',
          'Ultra HD 4K, Vector PDF & Excel/CSV downloads',
          'Chrome Extension Pro offline sync',
          'Priority support and cloud workspace saves',
        ]
      }
    }
    if (tierParam === 'single_tool') {
      return {
        title: selectedTool ? `${selectedTool.name} — Lifetime License` : 'Single Tool Lifetime License',
        price: '$19.00',
        billing: 'One-time payment — Never recurs',
        badge: 'Perpetual Access',
        features: [
          `Permanent license for ${selectedTool ? selectedTool.name : 'selected tool'}`,
          'Watermark-free ultra HD & vector downloads',
          'Unbranded deliverables for commercial use',
          'Instant license binding to your account',
          'Zero recurring monthly charges',
        ]
      }
    }
    return {
      title: 'Vimz.ai Pro Monthly Membership',
      price: '$9.00',
      billing: 'Billed monthly — Cancel anytime',
      badge: 'Popular Choice',
      features: [
        'All 700 advanced tools unlocked',
        'Unlimited watermark-free & white-label exports',
        'Ultra HD 4K, Vector PDF & Excel/CSV downloads',
        'Chrome Extension Pro offline sync',
        'Unlimited cloud saved computations',
      ]
    }
  }

  const plan = getPlanDetails()

  const handleStartCheckout = async () => {
    setError('')
    setLoading(true)

    const emailToUse = isLoggedIn ? user?.email : guestEmail
    if (!emailToUse) {
      setError('Please provide an email address or sign in so we can assign your license.')
      setLoading(false)
      return
    }

    try {
      const returnUrl = `${window.location.origin}/checkout?success=1&tier=${tierParam}${slugParam ? `&slug=${slugParam}` : ''}`
      const res = await checkoutApi.createSession({
        tier: tierParam,
        tool_slug: slugParam || null,
        guest_email: emailToUse,
        redirect_url: returnUrl,
      })

      if (res?.checkout_url && res?.payments_enabled !== false) {
        window.location.href = res.checkout_url
        return
      }

      // Payments are deferred
      setError('Online payments (Google Pay & Card) are currently deferred while merchant verification is completed. No charges were made. All 1,059 tools remain available for free calculations!')
    } catch (err) {
      setError(err.message || 'Online payments are currently deferred. All 1,059 tools remain free for calculations.')
    } finally {
      setLoading(false)
    }
  }

  // Success or Deferred View
  if (isSuccess) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(234,179,8,0.12)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem auto' }}>
          ℹ️
        </div>
        <div style={{ display: 'inline-block', padding: '0.35rem 0.9rem', borderRadius: '99px', background: 'rgba(234,179,8,0.1)', color: '#ca8a04', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Payments Deferred
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>Online Payments Are Coming Soon</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Payment provider integration has been deferred at this stage. No credit card was charged, and no paid entitlement was granted. You can continue using all 1,059 tools for free calculations and standard exports!
        </p>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem' }}>Selected Plan Information</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--line)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--muted)' }}>Product:</span>
            <strong>{plan.title}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--line)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--muted)' }}>Status:</span>
            <span style={{ color: '#ca8a04', fontWeight: 600 }}>● Deferred (No Charge)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--muted)' }}>Platform Access:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>100% Free Calculations</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/tools" className="btn primary" style={{ padding: '0.75rem 1.8rem' }}>
            Explore 1,059 Free Tools
          </Link>
          <Link to="/pricing" className="btn sub" style={{ padding: '0.75rem 1.5rem' }}>
            View Plans & Pricing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '880px', margin: '2rem auto 5rem auto', padding: '0 1rem' }}>
      <nav className="crumbs" style={{ marginBottom: '1.5rem' }}>
        <Link to="/">Home</Link> <span>/</span> <Link to="/pricing">Pricing</Link> <span>/</span> <span>Checkout</span>
      </nav>

      {isCanceled && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#ef4444' }}>Checkout was canceled.</strong>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
              No charges were made to your account. You can complete your purchase whenever you are ready.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
        
        {/* Left Column: Order Summary */}
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Order Summary</h2>
          
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--c-indigo)', marginBottom: '0.5rem' }}>
                  {plan.badge}
                </span>
                <h3 style={{ margin: '0.3rem 0 0.2rem 0', fontSize: '1.2rem' }}>{plan.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{plan.billing}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{plan.price}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', margin: '1.5rem 0', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', margin: '0 0 0.8rem 0' }}>
                What&apos;s Included:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                <span>{plan.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--muted)' }}>VAT / Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, borderTop: '1px solid var(--line)', paddingTop: '0.8rem' }}>
                <span>Total Due Today</span>
                <span>{plan.price}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: '0.85rem' }}>
            <span>🔒 256-Bit SSL Encrypted Checkout</span>
            <span>•</span>
            <span>Merchant: Lemon Squeezy</span>
          </div>
        </div>

        {/* Right Column: Checkout Execution */}
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Payment & Account</h2>

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '2rem' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            {isLoggedIn ? (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Active Workspace Account
                </span>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{user?.email}</div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="guestEmail" style={{ fontSize: '0.9rem', fontWeight: 600 }}>License Email Address</label>
                  <Link to="/login" style={{ fontSize: '0.85rem' }}>Already have an account? Sign in</Link>
                </div>
                <input
                  id="guestEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '0.95rem' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.4rem', display: 'block' }}>
                  Your digital receipt and license entitlement will be sent to this address.
                </span>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#ca8a04', fontSize: '0.88rem', display: 'block', marginBottom: '0.2rem' }}>Online Payments Deferred</strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.4, margin: 0 }}>
                  Billing integration is deferred at this stage. All tools remain available for free calculations.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={true}
              className="btn sub"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'var(--line)',
                color: 'var(--muted)',
                border: '1px solid var(--line)',
                cursor: 'not-allowed',
                opacity: 0.8
              }}
            >
              Payments Coming Soon
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                <span>✓ 100% Free Tool Access</span>
                <span>✓ Zero Payment Required</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/pricing" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              ← Return to Plans & Feature Comparison
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
