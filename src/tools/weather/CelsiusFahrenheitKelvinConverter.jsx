import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { convertTemperature } from '@tool-core/conversion/temperatureConverter.js'

export default function CelsiusFahrenheitKelvinConverter() {
  const autoParams = useAutoFillParams({
    val: '25',
    from: 'c'
  })

  const [tempVal, setTempVal] = useState(autoParams.val ?? '25')
  const [fromUnit, setFromUnit] = useState(autoParams.from || 'c')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const v = parseFloat(tempVal)
      if (isNaN(v)) return setErr('Enter a valid temperature.')
      setErr('')

      const result = convertTemperature({ value: v, fromUnit })
      setRes({
        val: `${result.celsius} °C | ${result.fahrenheit} °F | ${result.kelvin} K`,
        copyText: `${result.celsius}°C = ${result.fahrenheit}°F = ${result.kelvin}K`
      })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => {
    setTempVal('25')
    setFromUnit('c')
    setRes(null)
    setErr('')
  }

  return (
    <div>
      <div className="row">
        <Field label="From Unit">
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
            <option value="k">Kelvin (K)</option>
          </select>
        </Field>
        
        <Field label="Temperature Value">
          <input type="number" value={tempVal} onChange={(e) => setTempVal(e.target.value)} placeholder="" />
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