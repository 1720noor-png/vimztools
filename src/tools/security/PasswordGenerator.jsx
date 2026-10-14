import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { generatePassword, CHAR_SETS } from '@tool-core/security/passwordGenerator.js'

export default function PasswordGenerator() {
  const autoParams = useAutoFillParams({
    len: '16'
  })

  const [len, setLen] = useState(Number(autoParams.len) || 16)
  const [on, setOn] = useState({ lower: true, upper: true, digits: true, symbols: true })
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false)
  const [pw, setPw] = useState('')
  const [bits, setBits] = useState(0)
  const [rating, setRating] = useState('')
  const [crackTime, setCrackTime] = useState('')
  const [err, setErr] = useState('')

  const gen = () => {
    try {
      setErr('')
      const res = generatePassword({
        length: Number(len),
        lower: on.lower,
        upper: on.upper,
        digits: on.digits,
        symbols: on.symbols,
        avoidAmbiguous
      })
      setPw(res.password)
      setBits(res.entropy)
      setRating(res.strength)
      setCrackTime(res.crackTime)
    } catch (e) {
      setErr(e.message || 'Error generating password.')
    }
  }

  const reset = () => {
    setLen(16)
    setOn({ lower: true, upper: true, digits: true, symbols: true })
    setAvoidAmbiguous(false)
    setPw('')
    setBits(0)
    setRating('')
    setErr('')
  }

  return (
    <div>
      <Field label={`Length: ${len}`}>
        <input
          type="range"
          min="8"
          max="128"
          value={len}
          onChange={(e) => setLen(e.target.value)}
        />
      </Field>

      <div className="checks">
        {Object.keys(CHAR_SETS).map((k) => (
          <label className="check" key={k}>
            <input
              type="checkbox"
              checked={on[k]}
              onChange={(e) => setOn({ ...on, [k]: e.target.checked })}
            />{' '}
            {k}
          </label>
        ))}
        <label className="check">
          <input
            type="checkbox"
            checked={avoidAmbiguous}
            onChange={(e) => setAvoidAmbiguous(e.target.checked)}
          />{' '}
          Avoid lookalikes (0, O, 1, l, I)
        </label>
      </div>

      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={gen}>Generate Password</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>

      <Msg>{err}</Msg>

      {pw && (
        <div className="out" role="status" style={{ marginTop: '1rem' }}>
          <code style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>{pw}</code>
          <div style={{ marginTop: '0.8rem' }}>
            <CopyBtn text={pw} label="Copy Password" />
          </div>
          <p style={{ marginTop: '0.6rem' }}>
            <small>
              <strong>{bits} bits of entropy</strong> · Strength: <strong>{rating}</strong> · Estimated crack time: {crackTime}
            </small>
          </p>
        </div>
      )}

      <p className="hint" style={{ marginTop: '1rem' }}>
        Generated locally using cryptographic randomness. Never transmitted over the internet or stored anywhere.
      </p>
    </div>
  )
}
