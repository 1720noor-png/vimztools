import { useState, useEffect } from 'react'
import { calculatePakistanTax, FBR_SALARIED_SLABS } from '@tool-core/finance/pakistanTax.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams'

export default function TaxBracketCalc() {
  const { params } = useAutoFillParams({
    salary: '150000',
    type: 'monthly'
  })

  const [incomeType, setIncomeType] = useState(params.type || 'monthly')
  const [incomeValue, setIncomeValue] = useState(params.salary || '150000')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const compute = () => {
    try {
      setErr('')
      const num = parseFloat(incomeValue)
      if (isNaN(num) || num < 0) {
        setErr('Please enter a valid positive income amount.')
        setRes(null)
        return
      }

      const args = incomeType === 'monthly' ? { monthlySalary: num } : { annualIncome: num }
      const calculation = calculatePakistanTax(args)
      setRes(calculation)
    } catch (e) {
      setErr(e.message || 'Tax calculation error')
      setRes(null)
    }
  }

  useEffect(() => {
    compute()
  }, [incomeType, incomeValue])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Income Tax Bracket & Salary Deductions Calculator
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
          Compute progressive income tax brackets, monthly payroll withholding, and net take-home salary based on official FBR salaried tax slabs.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              Income Frequency
            </label>
            <select
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            >
              <option value="monthly">Monthly Salary (Rs.)</option>
              <option value="annual">Annual Income (Rs.)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
              {incomeType === 'monthly' ? 'Monthly Gross Salary (Rs.)' : 'Annual Gross Income (Rs.)'}
            </label>
            <input
              type="number"
              min="0"
              value={incomeValue}
              onChange={(e) => setIncomeValue(e.target.value)}
              placeholder="e.g. 150000"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {err && (
          <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      {res && (
        <div style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Estimated Monthly Tax Withholding</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#dc2626' }}>
              Rs. {res.monthlyTax.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '600', marginTop: '0.25rem' }}>
              Net Monthly Take-Home: Rs. {res.monthlyTakeHome.toLocaleString()} (Effective Tax Rate: {res.effectiveTaxRate}%)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Annual Gross Income</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Rs. {res.annualIncome.toLocaleString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Annual Tax</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>Rs. {res.annualTax.toLocaleString()}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Annual Take-Home Pay</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>Rs. {res.annualTakeHome.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            <strong>Active Tax Bracket:</strong> {res.taxSlab}
          </div>
        </div>
      )}
    </div>
  )
}
