import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { calculateGeometry } from '@tool-core/math/geometryCalculator.js'

export default function GeometryCalculator() {
  const autoParams = useAutoFillParams({
    shape: 'circle',
    a: 10,
    b: 5,
    c: 8
  })

  const [shape, setShape] = useState(autoParams.shape || 'circle')
  const [valA, setValA] = useState(autoParams.a ?? 10) // radius, length, etc
  const [valB, setValB] = useState(autoParams.b ?? 5) // width, height, etc
  const [valC, setValC] = useState(autoParams.c ?? 8) // height depth

  let area = 0
  let perimeter = 0
  let volume = 0
  let surfaceArea = 0
  let formulaStr = ''
  let is3D = false

  try {
    const calc = calculateGeometry({
      shape,
      a: valA,
      b: valB,
      c: valC
    })
    area = calc.area || 0
    perimeter = calc.perimeter || 0
    volume = calc.volume || 0
    surfaceArea = calc.surfaceArea || 0
    formulaStr = calc.formula
    is3D = calc.is3D
  } catch {
    // fallback defaults
  }

  const fmt = (num) => (Number.isInteger(num) ? num.toString() : num.toFixed(4).replace(/\.?0+$/, ''))

  const reportText = `Geometry Calculation (${shape.toUpperCase()})
---------------------------------------------
Shape: ${shape}
Formula: ${formulaStr}

Results:
${is3D ? `• Volume: ${fmt(volume)}\n• Total Surface Area: ${fmt(surfaceArea)}` : `• Area: ${fmt(area)}\n• Perimeter / Circumference: ${fmt(perimeter)}`}`

  return (
    <div className="tool-body">
      <div className="row">
        <Field label="Select Geometric Shape">
          <select value={shape} onChange={(e) => setShape(e.target.value)}>
            <option value="circle">Circle (2D)</option>
            <option value="rectangle">Rectangle (2D)</option>
            <option value="triangle">Right Triangle (2D)</option>
            <option value="sphere">Sphere (3D)</option>
            <option value="cylinder">Cylinder (3D)</option>
            <option value="prism">Rectangular Prism (3D)</option>
          </select>
        </Field>

        {shape === 'circle' && (
          <Field label="Radius (r)">
            <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
          </Field>
        )}

        {shape === 'rectangle' && (
          <>
            <Field label="Length (l)">
              <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
            </Field>
            <Field label="Width (w)">
              <input type="number" min="0" value={valB} onChange={(e) => setValB(e.target.value)} />
            </Field>
          </>
        )}

        {shape === 'triangle' && (
          <>
            <Field label="Base (b)">
              <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
            </Field>
            <Field label="Height (h)">
              <input type="number" min="0" value={valB} onChange={(e) => setValB(e.target.value)} />
            </Field>
          </>
        )}

        {shape === 'sphere' && (
          <Field label="Radius (r)">
            <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
          </Field>
        )}

        {shape === 'cylinder' && (
          <>
            <Field label="Radius (r)">
              <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
            </Field>
            <Field label="Height (h)">
              <input type="number" min="0" value={valB} onChange={(e) => setValB(e.target.value)} />
            </Field>
          </>
        )}

        {shape === 'prism' && (
          <>
            <Field label="Length (l)">
              <input type="number" min="0" value={valA} onChange={(e) => setValA(e.target.value)} />
            </Field>
            <Field label="Width (w)">
              <input type="number" min="0" value={valB} onChange={(e) => setValB(e.target.value)} />
            </Field>
            <Field label="Height (h)">
              <input type="number" min="0" value={valC} onChange={(e) => setValC(e.target.value)} />
            </Field>
          </>
        )}
      </div>

      <div className="out">
        {is3D ? (
          <>
            <div>Volume: <strong>{fmt(volume)} unit³</strong></div>
            <div className="hint" style={{ marginTop: '0.4rem' }}>
              Surface Area: <strong>{fmt(surfaceArea)} unit²</strong>
            </div>
          </>
        ) : (
          <>
            <div>Area: <strong>{fmt(area)} unit²</strong></div>
            <div className="hint" style={{ marginTop: '0.4rem' }}>
              Perimeter / Circumference: <strong>{fmt(perimeter)} units</strong>
            </div>
          </>
        )}
      </div>

      <div className="hint" style={{ marginTop: '0.8rem' }}>
        ℹ️ <strong>Formula:</strong> {formulaStr}
      </div>

      <div className="actions" style={{ marginTop: '1.2rem' }}>
        <CopyBtn text={reportText} label="Copy Geometry Result" />
        <button type="button" className="btn ghost" onClick={() => download('geometry-report.txt', reportText)}>
          Download (.txt)
        </button>
      </div>
    </div>
  )
}
