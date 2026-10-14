import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateSalaryToHourly } from '@tool-core/finance/salaryToHourly.js'

export default function SalaryToHourly() {
  const [salary, setSalary] = useState('')
  const [hoursWeek, setHoursWeek] = useState('')
  const [weeksYear, setWeeksYear] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const calculate = () => {
    setErr('')
    setResult(null)
    try {
      const outcome = calculateSalaryToHourly({ salary, hoursWeek, weeksYear })
      setResult({
        hourly: outcome.formattedHourly,
        daily: outcome.formattedDaily,
        weekly: outcome.formattedWeekly,
        monthly: outcome.formattedMonthly
      })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  return (
    <div>
      <div className="row">
        <Field label="Annual Salary ($)"><input type="number" value={salary} onChange={e=>setSalary(e.target.value)} placeholder="60000" /></Field>
        <Field label="Hours/Week"><input type="number" value={hoursWeek} onChange={e=>setHoursWeek(e.target.value)} placeholder="40" /></Field>
        <Field label="Weeks/Year"><input type="number" value={weeksYear} onChange={e=>setWeeksYear(e.target.value)} placeholder="52" /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calculate}>Calculate</button></div>
      <Msg>{err}</Msg>
      {result && <div className="out" role="status"><p><strong>Hourly:</strong> ${result.hourly}</p><p><strong>Daily:</strong> ${result.daily}</p><p><strong>Weekly:</strong> ${result.weekly}</p><p><strong>Monthly:</strong> ${result.monthly}</p></div>}
      <p className="hint">Based on standard work schedule.</p>
    </div>
  )
}
