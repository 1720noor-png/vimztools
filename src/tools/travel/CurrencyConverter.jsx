import { useState, useEffect } from 'react'
import { convertCurrency, BASELINE_FOREX_RATES, CURRENCY_NAMES } from '@tool-core/finance/currencyConverter.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams'

const CACHE_KEY = 'vimz_forex_rates_cache'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export default function CurrencyConverter() {
  const { params } = useAutoFillParams({ amount: '100', from: 'USD', to: 'PKR' })

  const [amount, setAmount] = useState(params.amount || '100')
  const [from, setFrom] = useState(params.from?.toUpperCase() || 'USD')
  const [to, setTo] = useState(params.to?.toUpperCase() || 'PKR')
  const [liveRates, setLiveRates] = useState(null)
  const [rateSource, setRateSource] = useState('baseline') // 'live' | 'baseline'
  const [isFetching, setIsFetching] = useState(false)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  // Try to load cached rates on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.rates) {
          setLiveRates(parsed.rates)
          setRateSource('live')
        }
      }
    } catch (_) {}
  }, [])

  const fetchLiveRates = async () => {
    setIsFetching(true)
    setErr('')
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD')
      if (!response.ok) throw new Error('Live forex API error')
      const data = await response.json()
      if (data && data.rates) {
        setLiveRates(data.rates)
        setRateSource('live')
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            rates: data.rates,
            timestamp: Date.now()
          }))
        } catch (_) {}
      }
    } catch (e) {
      setRateSource('baseline')
      setErr('Could not fetch live rates; using authoritative offline baseline rates.')
    } finally {
      setIsFetching(false)
    }
  }

  const compute = () => {
    try {
      setErr('')
      const result = convertCurrency({
        amount: parseFloat(amount) || 0,
        from,
        to,
        customRates: liveRates
      })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Conversion error')
      setRes(null)
    }
  }

  useEffect(() => {
    compute()
  }, [amount, from, to, liveRates])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const currencyKeys = Object.keys(BASELINE_FOREX_RATES)

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Universal World Currency Converter
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
          Convert between 35+ major world currencies with instant calculation, reciprocal exchange rates, and optional live forex updates.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: rateSource === 'live' ? '#059669' : '#64748b', fontWeight: '500' }}>
            ● Rate Source: {rateSource === 'live' ? 'Live Forex API (1-hr Cached)' : 'Authoritative Baseline Rates'}
          </span>
          <button
            type="button"
            onClick={fetchLiveRates}
            disabled={isFetching}
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.8125rem',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              cursor: isFetching ? 'wait' : 'pointer'
            }}
          >
            {isFetching ? 'Refreshing...' : '🔄 Update Live Rates'}
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
            Amount to Convert
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', fontSize: '1.125rem', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              From Currency
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            >
              {currencyKeys.map((c) => (
                <option key={c} value={c}>{c} - {CURRENCY_NAMES[c] || c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            title="Swap currencies"
            style={{
              padding: '0.55rem 0.85rem',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            ⇄
          </button>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              To Currency
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            >
              {currencyKeys.map((c) => (
                <option key={c} value={c}>{c} - {CURRENCY_NAMES[c] || c}</option>
              ))}
            </select>
          </div>
        </div>

        {err && (
          <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {res && (
        <div style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '0.25rem' }}>
            {res.amount.toLocaleString()} {res.fromName} =
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary, #2563eb)', marginBottom: '0.75rem' }}>
            {res.resultFormatted} {res.to}
          </div>
          <div style={{ display: 'inline-flex', gap: '1.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', color: '#475569' }}>
            <span>1 {res.from} = <strong>{res.exchangeRate}</strong> {res.to}</span>
            <span>1 {res.to} = <strong>{res.inverseRate}</strong> {res.from}</span>
          </div>
        </div>
      )}
    </div>
  )
}
