import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { convertPxToUnits } from '@tool-core/conversion/pxRemConverter.js'

export default function PxRemEmConverter() {
  const autoParams = useAutoFillParams({
    base: '16',
    target: '24',
    px: '24'
  })

  const [basePx, setBasePx] = useState(autoParams.base ?? '16')
  const [targetPx, setTargetPx] = useState(autoParams.px ?? autoParams.target ?? '24')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const b = parseFloat(basePx)
      const t = parseFloat(targetPx)
      if (isNaN(b) || isNaN(t) || b <= 0 || t < 0) {
        return setErr('Enter valid positive pixel values.')
      }
      setErr('')

      const result = convertPxToUnits({ px: t, basePx: b })
      setRes({
        val: `${result.formattedRem} (${result.px}px / ${result.basePx}px) | ${result.formattedEm} | ${result.formattedPt}`,
        copyText: result.formattedRem
      })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => {
    setBasePx('16')
    setTargetPx('24')
    setRes(null)
    setErr('')
  }

  return (
    <div>
      <div className="row">
        <Field label="Base Root Font Size (px)">
          <input type="number" value={basePx} onChange={(e) => setBasePx(e.target.value)} placeholder="" />
        </Field>
        <Field label="Target Size (px)">
          <input type="number" value={targetPx} onChange={(e) => setTargetPx(e.target.value)} placeholder="" />
        </Field>
      </div>
      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={calc}>Calculate / Process</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg>
      {res && (
        <div className="out" role="status" style={{ marginTop: '1rem' }}>
          <div>
            <p>Result: <strong>{res.val}</strong></p>
          </div>
          <CopyBtn text={typeof res === 'string' ? res : (res.copyText || JSON.stringify(res))} />
        </div>
      )}
    </div>
  )
}