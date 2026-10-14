import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { calculateCompoundInterest } from '@tool-core/finance/compoundInterest.js'

export default function CompoundInterestCalculator() {
  const [initial, setInitial] = useState(5000)
  const [monthly, setMonthly] = useState(250)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)
  const [frequency, setFrequency] = useState(12) // monthly compounding

  const {
    totalDeposited,
    finalInterest,
    finalBalance,
    yearlyData,
    reportText
  } = calculateCompoundInterest({
    initial,
    monthly,
    rate,
    years,
    frequency
  })

  const fmt = (val) => '$' + Math.round(val).toLocaleString('en-US')

  return (
    <div className="tool-body">
      <div className="row">
        <Field label="Initial Principal ($)">
          <input type="number" value={initial} onChange={(e) => setInitial(e.target.value)} />
        </Field>
        <Field label="Monthly Contribution ($)">
          <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Annual Interest Rate (%)">
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Investment Period (Years)">
          <input type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field label="Compounding Frequency">
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="1">Annually (1x / yr)</option>
            <option value="4">Quarterly (4x / yr)</option>
            <option value="12">Monthly (12x / yr)</option>
            <option value="365">Daily (365x / yr)</option>
          </select>
        </Field>
      </div>

      <div className="out">
        <div>Future Portfolio Value: <strong>{fmt(finalBalance)}</strong></div>
        <div className="hint" style={{ marginTop: '0.4rem' }}>
          Total Deposited: {fmt(totalDeposited)} | Interest Earned: <span className="good">{fmt(finalInterest)}</span>
        </div>
      </div>

      <div className="meter" style={{ marginTop: '1rem' }}>
        <span
          style={{ width: `${finalBalance ? Math.min(100, (totalDeposited / finalBalance) * 100) : 0}%` }}
          title="Principal deposited"
        />
      </div>
      <div className="hint" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span>🔵 Deposits: {finalBalance ? Math.round((totalDeposited / finalBalance) * 100) : 0}%</span>
        <span>🟢 Interest: {finalBalance ? Math.round((finalInterest / finalBalance) * 100) : 0}%</span>
      </div>

      <div className="scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>Year</th>
              <th>Total Deposited</th>
              <th>Total Interest</th>
              <th>End of Year Balance</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((d) => (
              <tr key={d.year}>
                <td>Year {d.year}</td>
                <td>{fmt(d.deposited)}</td>
                <td className="good">{fmt(d.interest)}</td>
                <td><strong>{fmt(d.balance)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <CopyBtn text={reportText} label="Copy Projection" />
        <button type="button" className="btn ghost" onClick={() => download('compound-interest-report.txt', reportText)}>
          Download Projection (.txt)
        </button>
      </div>
    </div>
  )
}
