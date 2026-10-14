/**
 * Pure Engine: CSV Column Statistics Profiler
 * Computes descriptive statistics for both numeric and categorical columns.
 */
import Papa from 'papaparse'

export function computeColumnStats(csvText, options = {}) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    throw new Error('CSV text must be a non-empty string')
  }

  const { hasHeader = true, delimiter = '' } = options

  const parsed = Papa.parse(csvText.trim(), {
    header: hasHeader,
    skipEmptyLines: true,
    delimiter: delimiter || undefined,
    dynamicTyping: false
  })

  if (parsed.errors && parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    throw new Error(`CSV parsing error: ${parsed.errors[0].message}`)
  }

  const rows = parsed.data
  if (!rows || rows.length === 0) {
    throw new Error('No valid data rows found in CSV')
  }

  let headers = []
  let rowData = []

  if (hasHeader) {
    headers = parsed.meta.fields || Object.keys(rows[0] || {})
    rowData = rows
  } else {
    // Array of arrays
    const colCount = Array.isArray(rows[0]) ? rows[0].length : Object.keys(rows[0]).length
    headers = Array.from({ length: colCount }, (_, i) => `Column_${i + 1}`)
    rowData = rows.map(r => {
      if (Array.isArray(r)) {
        const obj = {}
        r.forEach((val, i) => { obj[`Column_${i + 1}`] = val })
        return obj
      }
      return r
    })
  }

  const totalRows = rowData.length
  const columns = headers.map(header => {
    const rawValues = rowData.map(r => r[header])
    const nonNullValues = rawValues.filter(v => v !== null && v !== undefined && String(v).trim() !== '')
    const nullCount = totalRows - nonNullValues.length

    // Detect if column is mostly numeric
    const numericValues = []
    let isNumeric = nonNullValues.length > 0

    for (const val of nonNullValues) {
      const cleanStr = String(val).replace(/[$,]/g, '').trim()
      const num = Number(cleanStr)
      if (!isNaN(num) && cleanStr !== '') {
        numericValues.push(num)
      } else {
        isNumeric = false
      }
    }

    // Distinct values count and frequency map
    const freqMap = new Map()
    nonNullValues.forEach(v => {
      const s = String(v).trim()
      freqMap.set(s, (freqMap.get(s) || 0) + 1)
    })

    const distinctCount = freqMap.size
    const topValues = Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Number(((count / totalRows) * 100).toFixed(1))
      }))

    if (isNumeric && numericValues.length > 0) {
      numericValues.sort((a, b) => a - b)
      const count = numericValues.length
      const min = numericValues[0]
      const max = numericValues[count - 1]
      const sum = numericValues.reduce((acc, n) => acc + n, 0)
      const mean = sum / count

      const mid = Math.floor(count / 2)
      const median = count % 2 !== 0 ? numericValues[mid] : (numericValues[mid - 1] + numericValues[mid]) / 2

      const variance = numericValues.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count
      const stdDev = Math.sqrt(variance)

      return {
        column: header,
        type: 'numeric',
        totalRows,
        nonNullCount: nonNullValues.length,
        nullCount,
        nullPercentage: Number(((nullCount / totalRows) * 100).toFixed(1)),
        distinctCount,
        min: Number(min.toFixed(4)),
        max: Number(max.toFixed(4)),
        sum: Number(sum.toFixed(4)),
        mean: Number(mean.toFixed(4)),
        median: Number(median.toFixed(4)),
        stdDev: Number(stdDev.toFixed(4)),
        topValues
      }
    } else {
      // Categorical / Text stats
      const lengths = nonNullValues.map(v => String(v).length)
      const minLen = lengths.length > 0 ? Math.min(...lengths) : 0
      const maxLen = lengths.length > 0 ? Math.max(...lengths) : 0
      const avgLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0

      return {
        column: header,
        type: 'text',
        totalRows,
        nonNullCount: nonNullValues.length,
        nullCount,
        nullPercentage: Number(((nullCount / totalRows) * 100).toFixed(1)),
        distinctCount,
        minLength: minLen,
        maxLength: maxLen,
        avgLength: Number(avgLen.toFixed(1)),
        topValues
      }
    }
  })

  return {
    rowCount: totalRows,
    columnCount: columns.length,
    columns
  }
}
