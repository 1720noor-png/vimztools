import { useState } from 'react'
import { Field, Msg, CopyBtn, download } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { calculateAge } from '@tool-core/date/ageCalculator.js'

export default function AgeCalculator() {
  const autoParams = useAutoFillParams({
    dob: '1995-01-01',
    birth: '',
    target: ''
  })

  const [birthDate, setBirthDate] = useState(autoParams.dob || autoParams.birth || '1995-01-01')
  const [targetDate, setTargetDate] = useState(autoParams.target || '')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const handleCalculate = () => {
    try {
      if (!birthDate) return setErr('Please select your date of birth.')
      setErr('')

      const calculation = calculateAge({
        birthDate,
        targetDate: targetDate || undefined
      })
      setRes(calculation)
    } catch (e) {
      setErr(e.message || 'Error calculating age.')
    }
  }

  const reportText = res ? `Age Calculation Report
--------------------------------------
Date of Birth: ${birthDate}
Calculation Date: ${targetDate || 'Today'}

Results:
• Exact Age: ${res.years} Years, ${res.months} Months, ${res.days} Days
• Total Days Lived: ${res.totalDays.toLocaleString()} days
• Total Weeks: ${res.totalWeeks.toLocaleString()} weeks
• Total Hours: ${res.totalHours.toLocaleString()} hours
• Next Birthday: ${res.nextBirthday.date} (${res.nextBirthday.daysUntil} days left, ${res.nextBirthday.dayOfWeek})
• Zodiac Sign: ${res.zodiac}` : ''

  return (
    <div className="tool-body">
      <div className="row">
        <Field label="Date of Birth">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>
        <Field label="Age as of Date (Optional, defaults to Today)">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </Field>
      </div>

      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={handleCalculate}>Calculate Age</button>
      </div>

      <Msg>{err}</Msg>

      {res && (
        <div className="out" role="status" style={{ marginTop: '1.2rem' }}>
          <div>
            <h3>Exact Age: <strong>{res.years} Years, {res.months} Months, {res.days} Days</strong></h3>
            <p className="hint" style={{ marginTop: '0.4rem' }}>
              Zodiac Sign: <strong>{res.zodiac}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '1rem' }}>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Total Days</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{res.totalDays.toLocaleString()}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Total Weeks</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{res.totalWeeks.toLocaleString()}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Next Birthday</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{res.nextBirthday.daysUntil} days left</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>{res.nextBirthday.dayOfWeek}</div>
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <CopyBtn text={reportText} label="Copy Age Report" />
            <button type="button" className="btn ghost" onClick={() => download('age-report.txt', reportText)}>
              Download (.txt)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
