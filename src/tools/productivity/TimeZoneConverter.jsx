import { useMemo, useState } from 'react'
import { useStored, today } from '../../components/hooks.js'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import ZoneSelect from '../../components/ZoneSelect.jsx'
import { localZone, zoneName, zoneOk, zonedToUtc, offsetMs, fmtOffset, fmtZoned, dayDiff, validDay } from '../../utils/time.js'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'

const nowTime = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
export default function TimeZoneConverter() {
  const autoParams = useAutoFillParams({
    from: '',
    time: '',
    date: ''
  })

  const [date, setDate] = useState(autoParams.date || today())
  const [time, setTime] = useState(autoParams.time || '09:00')
  const [from, setFrom] = useState(autoParams.from && zoneOk(autoParams.from) ? autoParams.from : localZone())
  const [targets, setTargets] = useStored('toolhub.tzconv.targets', ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'])

  const [add, setAdd] = useState('Asia/Dubai')
  const [h12, setH12] = useState(false)
  const [err, setErr] = useState('')
  const list = targets.filter(zoneOk)
  const res = useMemo(() => {
    if (!validDay(date)) return { error: 'Pick a valid date.' }
    if (!/^\d{2}:\d{2}$/.test(time)) return { error: 'Pick a valid time.' }
    if (!zoneOk(from)) return { error: 'The source time zone is not supported by this browser.' }
    const [y, m, d] = date.split('-').map(Number), [h, mi] = time.split(':').map(Number)
    const r = zonedToUtc(y, m, d, h, mi, from)
    if (!r.exists) return { error: `${time} on ${date} does not exist in ${zoneName(from)}: clocks skip forward at that moment. Try a different time.` }
    return { instant: r.date, ambiguous: r.ambiguous, rows: list.map((z) => ({ z, when: fmtZoned(r.date, z, h12), off: fmtOffset(offsetMs(r.date, z)), diff: dayDiff(r.date, z, from) })) }
  }, [date, time, from, list.join('|'), h12])
  const addZone = () => {
    if (!zoneOk(add)) return setErr('That time zone is not supported by this browser.')
    if (list.includes(add)) return setErr('That time zone is already in the list.')
    setTargets([...list, add]); setErr('')
  }
  const text = res.rows ? [`${date} ${time} in ${zoneName(from)} (${fmtOffset(offsetMs(res.instant, from))}) is:`, ...res.rows.map((r) => `${zoneName(r.z)}: ${r.when} (${r.off})${r.diff ? (r.diff > 0 ? ' – next day' : ' – previous day') : ''}`)].join('\n') : ''
  return (
    <div>
      <div className="row">
        <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Time"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        <button className="btn ghost" onClick={() => { setDate(today()); setTime(nowTime()); setFrom(localZone()) }}>Use current time</button>
      </div>
      <ZoneSelect label="Convert from" value={from} onChange={setFrom} />
      <h2>Convert to</h2>
      <ZoneSelect label="Add a time zone" value={add} onChange={setAdd} exclude={list} />
      <div className="actions">
        <button className="btn" onClick={addZone}>Add time zone</button>
        <label className="check"><input type="checkbox" checked={h12} onChange={(e) => setH12(e.target.checked)} /> 12-hour format</label>
      </div>
      <Msg>{err}</Msg>
      <Msg>{res.error}</Msg>
      {res.ambiguous && <Msg kind="ok">Note: that local time happens twice today in {zoneName(from)} because clocks go back. The first occurrence is used.</Msg>}
      {res.rows && (list.length ? <div className="out" role="status">
        <div className="scroll"><table className="tbl">
          <thead><tr><th>Time zone</th><th>Local time</th><th>Offset</th><th /></tr></thead>
          <tbody>{res.rows.map((r) => (
            <tr key={r.z}><td>{zoneName(r.z)}<br /><small>{r.z}</small></td>
              <td><strong>{r.when}</strong>{r.diff !== 0 && <><br /><small>{r.diff > 0 ? 'Next day' : 'Previous day'}</small></>}</td>
              <td>{r.off}</td>
              <td><button className="btn ghost" onClick={() => setTargets(list.filter((x) => x !== r.z))} aria-label={`Remove ${zoneName(r.z)}`}>Remove</button></td></tr>))}</tbody>
        </table></div>
        <CopyBtn text={text} label="Copy result" />
      </div> : <div className="empty"><p>Add at least one time zone to convert to.</p></div>)}
      <p className="hint">Uses your browser’s built-in time-zone rules (including daylight saving) for the date you pick. Nothing is fetched online.</p>
    </div>
  )
}
