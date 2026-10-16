import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import BuyNoticeModal from '../components/BuyNoticeModal.jsx'

export default function PricingPage() {
  const { isLoggedIn, isPro, user } = useAuth()
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'annual'
  const [faqOpen, setFaqOpen] = useState({ 0: true })
  const [showBuyNotice, setShowBuyNotice] = useState(false)
  const [noticePlan, setNoticePlan] = useState('Vimz Pro')

  useEffect(() => {
    document.title = 'Pricing & Plans – Vimz.ai'
  }, [])

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const faqs = [
    {
      q: 'Will basic everyday tools ever become paid?',
      a: 'Never. All 359 basic everyday tools (including unit converters, text case formatters, hash generators, timestamp converters, and math tools) remain 100% free forever without subscriptions, ads, or logins.'
    },
    {
      q: 'How does the hybrid model work on the 700 advanced tools?',
      a: 'On all 700 advanced tools, you can perform full calculations and preview results directly on-screen for free. Upgrading to Pro or purchasing a single-tool license unlocks unbranded white-label reports, watermark-free 4K/vector PDF exports, and raw batch CSV/JSON/Excel deliverables.'
    },
    {
      q: 'What is the difference between Pro and a Single-Tool purchase?',
      a: 'A Single-Tool purchase ($19 one-time) gives you permanent lifetime export access to one specific tool. Pro ($9/month or $89/year) unlocks all 700 advanced tools simultaneously, plus Chrome extension synchronization and priority cloud computation backups.'
    },
    {
      q: 'What payment methods do you support?',
      a: 'Payments are processed through Lemon Squeezy, our global Merchant of Record. We accept all major Credit/Debit Cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and localized bank transfers in 135+ currencies.'
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, absolutely. You can cancel your subscription with a single click from your account workspace dashboard at any time. You will continue to have Pro access until the end of your billing cycle.'
    },
    {
      q: 'Does Vimz.ai store my files or calculation data?',
      a: 'No. Vimz.ai processes computations and client-side deliverables directly inside your modern browser sandbox. Your inputs and generated outputs are never uploaded to our servers unless you explicitly choose to save a calculation to your private workspace.'
    }
  ]

  return (
    <div className="pricing-page-wrapper" style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1rem 5rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.35rem 0.9rem', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', color: 'var(--c-indigo)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.2)' }}>
          <span>💎</span> Transparent, Creator-Friendly Pricing
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
          Predictable Pricing for High-Output Workflows
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--muted)', maxWidth: '680px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Keep 359 everyday tools 100% free forever. Upgrade to Pro to unlock white-label deliverables, unbranded exports, and batch data files across 700 advanced tools.
        </p>

        {/* Billing Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--card)', padding: '4px', borderRadius: '99px', border: '1px solid var(--line)', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '99px',
              border: 'none',
              background: billingCycle === 'monthly' ? 'var(--brand)' : 'transparent',
              color: billingCycle === 'monthly' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '99px',
              border: 'none',
              background: billingCycle === 'annual' ? 'var(--brand)' : 'transparent',
              color: billingCycle === 'annual' ? '#fff' : 'var(--muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Annual Billing</span>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '99px', fontWeight: 700 }}>
              Save 18%
            </span>
          </button>
        </div>
      </div>

      {/* Current Pro Status Notice if Logged In */}
      {isPro && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600 }}>
            🎉 You have an active Pro membership ({user?.email}). All 700 advanced tools and white-label exports are fully unlocked!
          </p>
        </div>
      )}

      {/* Deferred Payments Notice Banner */}
      <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
        <div>
          <strong style={{ color: '#ca8a04', fontSize: '0.95rem' }}>Payment Gateway Status: Online Payments Deferred</strong>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            We have deferred configuring a payment provider at this stage. All 359 everyday tools and interactive calculations across all 700 advanced tools are 100% free with unlimited calculations.
          </p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* Tier 1: Free Forever */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Starter
            </span>
            <h2 style={{ fontSize: '1.6rem', margin: '0.4rem 0 0.8rem 0' }}>Free Forever</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>$0</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>/ forever</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
              Essential utilities for everyday math, conversion, text manipulation, and casual productivity.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.5rem', flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span><strong>359 Everyday Tools</strong> 100% free forever</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Standard calculations on all 1,059 tools</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>100% Client-side browser privacy</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>No login or credit card required</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                <span style={{ color: '#94a3b8' }}>–</span>
                <span>Exports include subtle "Created with Vimz.ai" watermark</span>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/tools" className="btn sub" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.75rem' }}>
              Browse Free Tools
            </Link>
          </div>
        </div>

        {/* Tier 2: Pro (Featured) */}
        <div style={{ background: 'var(--card)', border: '2px solid #6366f1', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 12px 30px rgba(99,102,241,0.12)' }}>
          <div style={{ position: 'absolute', top: '-14px', right: '24px', background: 'linear-gradient(135deg, #6366f1, #9333ea)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Most Popular
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-indigo)' }}>
              Vimz Pro
            </span>
            <h2 style={{ fontSize: '1.6rem', margin: '0.4rem 0 0.8rem 0' }}>All-Access Pro</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>
                {billingCycle === 'monthly' ? '$9' : '$89'}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                {billingCycle === 'monthly' ? '/ month' : '/ year ($7.41/mo)'}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
              For professionals, creators, and teams needing unbranded high-res assets, datasets, and bulk processing.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.5rem', flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span><strong>All 700 Advanced Tools</strong> fully unlocked</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span><strong>100% Watermark-Free & White-Label</strong> exports</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Ultra-HD 4K PNG, SVG vector & multi-page PDF outputs</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Bulk CSV, Excel & structured JSON data downloads</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Offline Chrome Extension catalog sync</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Unlimited cloud computation saves & priority support</span>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => {
                setNoticePlan(billingCycle === 'monthly' ? 'Vimz Pro ($9.00/mo)' : 'Vimz Pro ($89.00/yr)')
                setShowBuyNotice(true)
              }}
              className="btn primary"
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'block',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Payments Coming Soon — View Notice
            </button>
          </div>
        </div>

        {/* Tier 3: Single-Tool Lifetime */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Perpetual License
            </span>
            <h2 style={{ fontSize: '1.6rem', margin: '0.4rem 0 0.8rem 0' }}>Single Tool Lifetime</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>$19</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>/ one-time</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
              Only need one specific advanced utility? Unlock lifetime watermark-free deliverables with zero recurring fees.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.5rem', flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Lifetime Pro access for <strong>1 selected advanced tool</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Watermark-free exports & deliverables for chosen tool</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>No recurring subscriptions or renewals</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Permanent download license stored in your profile</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                <span style={{ color: '#94a3b8' }}>–</span>
                <span>Other advanced tools require individual purchase or Pro</span>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/tools" className="btn sub" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.75rem' }}>
              Browse 700 Advanced Tools
            </Link>
          </div>
        </div>

      </div>

      {/* Feature Comparison Matrix */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '2.5rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>Full Feature Breakdown</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Compare features across our tiers to pick the right workflow setup.
        </p>

        <div className="table-responsive">
          <table className="saas-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--line)' }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid var(--line)' }}>Free Forever</th>
                <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid var(--line)' }}>Single Tool ($19)</th>
                <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid var(--line)', color: 'var(--c-indigo)' }}>Vimz Pro ($9/mo)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>359 Everyday Base Tools</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ Unlimited</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ Unlimited</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>✓ Unlimited</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>700 Advanced Tools (Calculations & UI)</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ Free Preview</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ Free Preview</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>✓ Unlimited Full</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Watermark Removal / White-Label Rights</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>✕</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ 1 Tool</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ All 700 Tools</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Vector PDF & 4K PNG Deliverables</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>Standard</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ Ultra HD (1 Tool)</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ Ultra HD (All Tools)</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Bulk CSV & Excel Dataset Downloads</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>✕</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>✓ 1 Tool</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ All Tools</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Cloud Saved Workspaces & Calculations</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Up to 5</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Up to 25</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ Unlimited</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Chrome Extension Sync</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Offline Catalog</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Offline Catalog</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ Pro Cloud Sync</td>
              </tr>
              <tr>
                <td style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--line)' }}>Customer Support</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Community</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)' }}>Standard</td>
                <td style={{ textAlign: 'center', padding: '0.9rem', borderBottom: '1px solid var(--line)', fontWeight: 600, color: '#10b981' }}>✓ Priority</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>Frequently Asked Questions</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Everything you need to know about Vimz.ai licensing and monetization.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((f, i) => (
            <div
              key={i}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1.2rem 1.5rem',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--fg)'
                }}
              >
                <span>{f.q}</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>{faqOpen[i] ? '−' : '+'}</span>
              </button>
              {faqOpen[i] && (
                <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.06))', border: '1px solid var(--line)', borderRadius: '16px', padding: '2.5rem 1.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>🔒 100% Risk-Free Guarantee</h3>
        <p style={{ color: 'var(--muted)', maxWidth: '580px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Try Vimz Pro risk-free. If you are not completely satisfied with our exports and productivity tools within 14 days, contact our team for a prompt, hassle-free refund.
        </p>
        <button
          type="button"
          onClick={() => {
            setNoticePlan(billingCycle === 'monthly' ? 'Vimz Pro ($9.00/mo)' : 'Vimz Pro ($89.00/yr)')
            setShowBuyNotice(true)
          }}
          className="btn primary"
          style={{ padding: '0.8rem 2rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--brand)', color: '#fff' }}
        >
          Payments Coming Soon — View Notice →
        </button>
      </div>

      <BuyNoticeModal
        isOpen={showBuyNotice}
        onClose={() => setShowBuyNotice(false)}
        toolName={noticePlan}
        plannedPrice={billingCycle === 'monthly' ? '$9.00/mo' : '$89.00/yr'}
      />
    </div>
  )
}
