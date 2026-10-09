import { useState, useEffect } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'

export default function StairRiserTreadCalcTool() {
  const [unit, setUnit] = useState('cm') // 'cm' | 'inches'
  const [totalRise, setTotalRise] = useState('270') // Total vertical floor-to-floor height
  const [targetRiser, setTargetRiser] = useState('17.5') // Target comfortable riser height
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const computeStairs = (riseVal, targetRiserVal, currentUnit) => {
    const rise = parseFloat(riseVal)
    const targetR = parseFloat(targetRiserVal)

    if (!riseVal || isNaN(rise) || rise <= 0) {
      setErr('Please enter a valid positive floor-to-floor total rise.')
      setRes(null)
      return
    }

    if (!targetRiserVal || isNaN(targetR) || targetR <= 0) {
      setErr('Please enter a valid positive target riser height.')
      setRes(null)
      return
    }

    if (targetR > rise) {
      setErr('Target riser height cannot exceed total vertical rise.')
      setRes(null)
      return
    }

    setErr('')

    // 1. Calculate integer number of risers
    const numRisers = Math.max(1, Math.round(rise / targetR))
    
    // 2. Exact Riser Height (R) = Total Rise / Number of Risers
    const exactRiser = rise / numRisers

    // 3. Number of Treads = Number of Risers - 1
    const numTreads = Math.max(1, numRisers - 1)

    // 4. Calculate Ideal Tread Depth (T) using Blondel's Formula (2R + T = 63 cm / 25 in)
    const idealConstant = currentUnit === 'cm' ? 63 : 25
    let exactTread = idealConstant - 2 * exactRiser
    if (exactTread <= 0) {
      exactTread = currentUnit === 'cm' ? 25.0 : 10.0
    }

    // 5. Total Staircase Horizontal Run (Length)
    const totalRun = numTreads * exactTread

    // 6. Diagonal Stringer Length (Pythagorean Theorem: sqrt(Rise^2 + Run^2))
    const stringerLength = Math.sqrt(Math.pow(rise, 2) + Math.pow(totalRun, 2))

    // 7. Stair Incline Angle (Pitch): arctan(Riser / Tread)
    const pitchRad = Math.atan(exactRiser / exactTread)
    const pitchDeg = (pitchRad * 180) / Math.PI

    // 8. Building Code & Safety Checks (IRC/IBC standards)
    const maxRiserCode = currentUnit === 'cm' ? 19.5 : 7.75
    const minTreadCode = currentUnit === 'cm' ? 25.0 : 10.0
    const blondelRatio = 2 * exactRiser + exactTread
    const minBlondel = currentUnit === 'cm' ? 60 : 24
    const maxBlondel = currentUnit === 'cm' ? 64 : 25.5

    const passesRiser = exactRiser <= maxRiserCode
    const passesTread = exactTread >= minTreadCode
    const passesAngle = pitchDeg >= 25 && pitchDeg <= 42
    const passesBlondel = blondelRatio >= minBlondel && blondelRatio <= maxBlondel
    const passesCode = passesRiser && passesTread && passesAngle

    const copyText = `Staircase Design Plan (${rise} ${currentUnit} Total Rise):
• Risers: ${numRisers} @ ${exactRiser.toFixed(2)} ${currentUnit} each
• Treads: ${numTreads} @ ${exactTread.toFixed(2)} ${currentUnit} depth
• Total Horizontal Run: ${totalRun.toFixed(1)} ${currentUnit}
• Stringer Length: ${stringerLength.toFixed(1)} ${currentUnit}
• Pitch Angle: ${pitchDeg.toFixed(1)}°
• Blondel Ratio (2R+T): ${blondelRatio.toFixed(1)} ${currentUnit} (${passesBlondel ? 'Ideal Comfort' : 'Acceptable'})
• Compliance: ${passesCode ? 'Standard Building Code Compliant' : 'Review Dimensions'}`

    setRes({
      numRisers,
      numTreads,
      exactRiser: exactRiser.toFixed(2),
      exactTread: exactTread.toFixed(2),
      totalRun: totalRun.toFixed(1),
      stringerLength: stringerLength.toFixed(1),
      pitchDeg: pitchDeg.toFixed(1),
      blondelVal: blondelRatio.toFixed(1),
      unit: currentUnit,
      passesCode,
      passesRiser,
      passesTread,
      passesAngle,
      passesBlondel,
      copyText,
    })
  }

  // Initial calculation on load & when inputs change
  useEffect(() => {
    computeStairs(totalRise, targetRiser, unit)
  }, [totalRise, targetRiser, unit])

  const handleUnitSwitch = (newUnit) => {
    if (newUnit === unit) return
    if (newUnit === 'inches') {
      const convertedRise = (parseFloat(totalRise) / 2.54 || 106.3).toFixed(1)
      setUnit('inches')
      setTotalRise(convertedRise)
      setTargetRiser('7.0')
    } else {
      const convertedRise = (parseFloat(totalRise) * 2.54 || 270).toFixed(0)
      setUnit('cm')
      setTotalRise(convertedRise)
      setTargetRiser('17.5')
    }
  }

  const handleReset = () => {
    setErr('')
    if (unit === 'cm') {
      setTotalRise('270')
      setTargetRiser('17.5')
    } else {
      setTotalRise('106.3')
      setTargetRiser('7.0')
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
        Calculate compliant staircase riser heights, tread depths, total stringer run, and slope pitch using international architectural safety standards and Blondel's formula (2R + T = 63 cm / 25 in).
      </p>

      {/* Unit Selection Toggle */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${unit === 'cm' ? 'primary' : 'sub'}`}
          onClick={() => handleUnitSwitch('cm')}
        >
          Metric (Centimeters)
        </button>
        <button
          type="button"
          className={`btn ${unit === 'inches' ? 'primary' : 'sub'}`}
          onClick={() => handleUnitSwitch('inches')}
        >
          Imperial (Inches)
        </button>
      </div>

      {/* Input Fields */}
      <div className="row">
        <Field label={`Total Vertical Rise (Floor-to-Floor Height in ${unit})`}>
          <input
            type="number"
            step={unit === 'cm' ? '1' : '0.25'}
            min="10"
            value={totalRise}
            onChange={(e) => setTotalRise(e.target.value)}
            placeholder={unit === 'cm' ? 'e.g. 270' : 'e.g. 106.3'}
          />
        </Field>
        <Field label={`Target Riser Height (${unit})`}>
          <input
            type="number"
            step={unit === 'cm' ? '0.25' : '0.125'}
            min="1"
            value={targetRiser}
            onChange={(e) => setTargetRiser(e.target.value)}
            placeholder={unit === 'cm' ? 'e.g. 17.5' : 'e.g. 7.0'}
          />
        </Field>
      </div>

      <div className="actions" style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn primary" onClick={() => computeStairs(totalRise, targetRiser, unit)}>
          Calculate Staircase
        </button>
        <button type="button" className="btn sub" onClick={handleReset}>
          Reset Defaults
        </button>
      </div>

      {err && <Msg kind="error">{err}</Msg>}

      {/* Results Box */}
      {res && (
        <div className="out" role="status" style={{ marginTop: '1.5rem', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '1.4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Risers Count & Height</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--brand)' }}>
                {res.numRisers} @ {res.exactRiser} {res.unit}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Individual vertical step</span>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Treads Count & Depth</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--ok)' }}>
                {res.numTreads} @ {res.exactTread} {res.unit}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Individual step run</span>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Horizontal Run</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--fg)' }}>
                {res.totalRun} {res.unit}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Stringer Length: {res.stringerLength} {res.unit}</span>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Stair Pitch & Angle</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--c-purple)' }}>
                {res.pitchDeg}°
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Standard optimal: 30° – 38°</span>
            </div>
          </div>

          {/* Safety & Compliance Card */}
          <div style={{
            padding: '0.9rem 1.1rem',
            background: res.passesCode ? 'var(--ok-soft)' : 'var(--warn-soft)',
            border: `1px solid ${res.passesCode ? 'var(--ok)' : 'var(--warn)'}`,
            borderRadius: 'var(--r)',
            fontSize: '0.9rem',
            marginBottom: '1.2rem',
            color: 'var(--fg)',
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: res.passesCode ? 'var(--ok)' : 'var(--warn)' }}>
              {res.passesCode ? '✓ Standard Architectural Building Code Compliant (IRC/IBC)' : '⚠️ Dimension Notice: Please review code limits'}
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.84rem', color: 'var(--muted)' }}>
              <strong>Blondel Comfort Formula (2R + T):</strong> {res.blondelVal} {res.unit} (Recommended standard: {res.unit === 'cm' ? '60–64 cm' : '24–25.5 in'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <CopyBtn text={res.copyText} label="Copy Staircase Specs" />
          </div>
        </div>
      )}
    </div>
  )
}
