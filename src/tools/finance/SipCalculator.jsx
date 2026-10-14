import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { calculateSipInvestment } from '@tool-core/finance/sipInvestment.js'

export default function SipCalculator() {
  const [mode, setMode] = useState('sip') // 'sip' or 'lump'
  const [amount, setAmount] = useState(500)
  const [rate, setRate] = useState(12)
  const [years, setYears] = useState(15)

  const {
    invested,
    estimatedReturns,
    totalValue,
    reportText
  } = calculateSipInvestment({
    mode,
    amount,
    rate,
    years
  })

  const fmt = (val) => '$' + Math.round(val).toLocaleString('en-US')

  return (
    <div className="tool-body">
      <div className="actions" style={{ marginBottom: '1.2rem' }}>
        <button
          type="button"
          className={`btn ${mode === 'sip' ? '' : 'ghost'}`}
          onClick={() => setMode('sip')}
        >
          Monthly SIP Mode
        </button>
        <button
          type="button"
          className={`btn ${mode === 'lump' ? '' : 'ghost'}`}
          onClick={() => setMode('lump')}
        >
          Lump Sum Investment Mode
        </button>
      </div>

      <div className="row">
        <Field label={mode === 'sip' ? 'Monthly Investment ($)' : 'One-Time Investment ($)'}>
          <input type="number" min="10" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Expected Annual Return Rate (%)">
          <input type="number" step="0.5" min="1" max="40" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Investment Horizon (Years)">
          <input type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>

      <div className="out">
        <div>Expected Future Value: <strong>{fmt(totalValue)}</strong></div>
        <div className="hint" style={{ marginTop: '0.4rem' }}>
          Invested Amount: {fmt(invested)} | Est. Wealth Growth: <span className="good">{fmt(estimatedReturns)}</span>
        </div>
      </div>

      <div className="meter" style={{ marginTop: '1rem' }}>
        <span
          style={{ width: `${totalValue ? Math.min(100, (invested / totalValue) * 100) : 0}%` }}
          title="Invested capital proportion"
        />
      </div>
      <div className="hint" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span>🔵 Invested: {totalValue ? Math.round((invested / totalValue) * 100) : 0}%</span>
        <span>🟢 Growth: {totalValue ? Math.round((estimatedReturns / totalValue) * 100) : 0}%</span>
      </div>

      <div className="actions">
        <CopyBtn text={reportText} label="Copy Investment Report" />
        <button type="button" className="btn ghost" onClick={() => download('sip-investment-report.txt', reportText)}>
          Download Report (.txt)
        </button>
      </div>
    </div>
  )
}
