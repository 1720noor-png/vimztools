import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { calculateLoanPayoff } from '@tool-core/finance/loanPayoff.js'

export default function LoanPayoffCalculator() {
  const [balance, setBalance] = useState(20000)
  const [rate, setRate] = useState(12)
  const [monthlyPayment, setMonthlyPayment] = useState(450)
  const [extraPayment, setExtraPayment] = useState(100)

  let outcome = null
  let errorMsg = ''
  try {
    outcome = calculateLoanPayoff({
      balance,
      rate,
      monthlyPayment,
      extraPayment
    })
  } catch (e) {
    errorMsg = e.message
  }

  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const fmtMonths = (m) => {
    if (m === Infinity) return 'Never (payment too low to cover interest)'
    const y = Math.floor(m / 12)
    const rem = m % 12
    return `${m} months (${y} yrs ${rem} mos)`
  }

  const P = Number(monthlyPayment) || 0
  const E = Number(extraPayment) || 0

  return (
    <div className="tool-body">
      <div className="row">
        <Field label="Current Loan Balance ($)">
          <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </Field>
        <Field label="Interest Rate (%)">
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Standard Monthly Payment ($)">
          <input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} />
        </Field>
        <Field label="Extra Monthly Contribution ($)">
          <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} />
        </Field>
      </div>

      {!outcome ? (
        <div className="msg error">
          {errorMsg || 'Invalid loan parameters.'}
        </div>
      ) : (
        <>
          <div className="out">
            <div>Accelerated Payoff Time: <strong>{fmtMonths(outcome.accelerated.months)}</strong></div>
            <div className="good" style={{ fontWeight: 600, marginTop: '0.4rem' }}>
              🎉 Time Saved: {outcome.monthsSaved} months ({(outcome.monthsSaved / 12).toFixed(1)} yrs) | Interest Saved: {fmt(outcome.interestSaved)}
            </div>
          </div>

          <div className="scroll" style={{ marginTop: '1rem' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Monthly Payment</th>
                  <th>Payoff Time</th>
                  <th>Total Interest Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Plan</td>
                  <td>{fmt(P)}</td>
                  <td>{fmtMonths(outcome.standard.months)}</td>
                  <td>{fmt(outcome.standard.totalInterest)}</td>
                </tr>
                <tr className="best">
                  <td>With Extra Payment</td>
                  <td>{fmt(P + E)}</td>
                  <td>{fmtMonths(outcome.accelerated.months)}</td>
                  <td>{fmt(outcome.accelerated.totalInterest)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="actions">
            <CopyBtn text={outcome.reportText} label="Copy Payoff Summary" />
            <button type="button" className="btn ghost" onClick={() => download('loan-payoff-report.txt', outcome.reportText)}>
              Download Report (.txt)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
