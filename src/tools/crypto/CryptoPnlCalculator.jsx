import { useState, useEffect } from 'react'
import { calculateCryptoPnl } from '@tool-core/crypto/cryptoPnl.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams'

export default function CryptoPnlCalculator() {
  const { params } = useAutoFillParams({
    buy: '50000',
    sell: '65000',
    amount: '1',
    buyFee: '0.1',
    sellFee: '0.1'
  })

  const [buyPrice, setBuyPrice] = useState(params.buy || '50000')
  const [sellPrice, setSellPrice] = useState(params.sell || '65000')
  const [amount, setAmount] = useState(params.amount || '1')
  const [buyFee, setBuyFee] = useState(params.buyFee || '0.1')
  const [sellFee, setSellFee] = useState(params.sellFee || '0.1')

  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const compute = () => {
    try {
      setErr('')
      if (!buyPrice || !sellPrice || !amount) {
        setRes(null)
        return
      }
      const result = calculateCryptoPnl({
        buyPrice: parseFloat(buyPrice),
        sellPrice: parseFloat(sellPrice),
        amount: parseFloat(amount),
        buyFeePercent: parseFloat(buyFee) || 0,
        sellFeePercent: parseFloat(sellFee) || 0
      })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error')
      setRes(null)
    }
  }

  useEffect(() => {
    compute()
  }, [buyPrice, sellPrice, amount, buyFee, sellFee])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Crypto Profit & Loss (P&L) Calculator
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
          Calculate your net cryptocurrency trading profit, return on investment (ROI), exchange trading fees, and break-even sell price.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Buy / Entry Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="e.g. 50000"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Sell / Exit Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="e.g. 65000"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Coin Quantity / Units
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1.5"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Buy Exchange Fee (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={buyFee}
              onChange={(e) => setBuyFee(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Sell Exchange Fee (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellFee}
              onChange={(e) => setSellFee(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {err && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {res && (
        <div style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: '1rem',
              background: res.isProfit ? '#dcfce7' : '#fee2e2',
              color: res.isProfit ? '#15803d' : '#b91c1c'
            }}>
              {res.isProfit ? '📈 NET PROFIT' : '📉 NET LOSS'}: {res.isProfit ? '+' : ''}${res.netPnl.toLocaleString()} ({res.roiPercent > 0 ? '+' : ''}{res.roiPercent}%)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Capital Invested</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${res.totalCost.toLocaleString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Net Proceeds</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${res.netProceeds.toLocaleString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Fees Paid</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b91c1c' }}>${res.totalFees.toLocaleString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Break-Even Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1' }}>${res.breakEvenPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
