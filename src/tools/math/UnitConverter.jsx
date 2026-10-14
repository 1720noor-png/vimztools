import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { convertUnit, UNIT_CATEGORIES } from '@tool-core/conversion/unitConverter.js'

export default function UnitConverter() {
  const autoParams = useAutoFillParams({
    cat: 'length',
    from: 'km',
    to: 'mi',
    val: '10'
  })

  const [catKey, setCatKey] = useState(autoParams.cat && UNIT_CATEGORIES[autoParams.cat] ? autoParams.cat : 'length')
  const [fromUnit, setFromUnit] = useState(autoParams.from || 'km')
  const [toUnit, setToUnit] = useState(autoParams.to || 'mi')
  const [val, setVal] = useState(autoParams.val || '10')

  const category = UNIT_CATEGORIES[catKey] || UNIT_CATEGORIES.length
  const units = category.units

  const handleCategoryChange = (key) => {
    setCatKey(key)
    const uKeys = Object.keys(UNIT_CATEGORIES[key].units)
    setFromUnit(uKeys[0])
    setToUnit(uKeys[1] || uKeys[0])
  }

  const numVal = Number(val) || 0

  let resultStr = '0'
  let formulaStr = ''
  try {
    const calc = convertUnit({
      category: catKey,
      value: numVal,
      fromUnit,
      toUnit
    })
    resultStr = calc.resultFormatted
    formulaStr = calc.formula
  } catch {
    resultStr = '0'
  }

  const swap = () => {
    const tmp = fromUnit
    setFromUnit(toUnit)
    setToUnit(tmp)
  }

  const targetUnitName = units[toUnit]?.name || toUnit
  const sourceUnitName = units[fromUnit]?.name || fromUnit

  const reportText = `Unit Conversion Result
-----------------------------------------
Category: ${category.name}
Input Value: ${val} ${sourceUnitName}
Converted Output: ${resultStr} ${targetUnitName}`

  return (
    <div className="tool-body">
      <div className="actions" style={{ marginBottom: '1.2rem' }}>
        {Object.keys(UNIT_CATEGORIES).map((key) => (
          <button
            key={key}
            type="button"
            className={`btn ${catKey === key ? '' : 'ghost'}`}
            onClick={() => handleCategoryChange(key)}
          >
            {UNIT_CATEGORIES[key].name}
          </button>
        ))}
      </div>

      <div className="row">
        <Field label="Input Value">
          <input type="number" value={val} onChange={(e) => setVal(e.target.value)} />
        </Field>
        <Field label="From Unit">
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {Object.entries(units).map(([uKey, uObj]) => (
              <option key={uKey} value={uKey}>
                {uObj.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To Unit">
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {Object.entries(units).map(([uKey, uObj]) => (
              <option key={uKey} value={uKey}>
                {uObj.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="actions" style={{ margin: '0.6rem 0 1rem' }}>
        <button type="button" className="btn ghost" onClick={swap}>
          🔄 Swap Units
        </button>
      </div>

      <div className="out">
        <div>Converted Result: <strong>{resultStr} {targetUnitName}</strong></div>
        {formulaStr && (
          <div className="hint" style={{ marginTop: '0.4rem' }}>
            Formula: {formulaStr}
          </div>
        )}
      </div>

      <div className="actions" style={{ marginTop: '1rem' }}>
        <CopyBtn text={reportText} label="Copy Result" />
        <button type="button" className="btn ghost" onClick={() => download('unit-conversion.txt', reportText)}>
          Download (.txt)
        </button>
      </div>
    </div>
  )
}
