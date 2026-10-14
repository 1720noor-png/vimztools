import { useState, useEffect } from 'react'
import { computeColumnStats } from '@tool-core/data/csvColumnStats.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams'

const SAMPLE_CSV = `Employee,Department,Salary,YearsExperience,Rating
Alice Smith,Engineering,95000,5,4.8
Bob Johnson,Marketing,72000,3,4.2
Charlie Lee,Engineering,115000,8,4.9
Diana Patel,Finance,88000,4,4.5
Evan Wright,Marketing,68000,2,3.9
Fiona Chen,Engineering,125000,10,5.0
George Miller,HR,62000,3,4.1
Hannah Davis,Finance,94000,6,4.7`

export default function CsvColumnStats() {
  const { params } = useAutoFillParams({ text: '', src: '' })
  const [csvText, setCsvText] = useState(params.text || params.src || '')
  const [hasHeader, setHasHeader] = useState(true)
  const [fileName, setFileName] = useState('')
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const analyze = (textToAnalyze = csvText) => {
    setError('')
    if (!textToAnalyze || !textToAnalyze.trim()) {
      setError('Please upload a CSV file or paste CSV text.')
      setStats(null)
      return
    }

    try {
      const res = computeColumnStats(textToAnalyze, { hasHeader })
      setStats(res)
    } catch (err) {
      setError(err.message || 'Failed to parse and profile CSV.')
      setStats(null)
    }
  }

  useEffect(() => {
    if (params.text || params.src) {
      const initialText = params.text || params.src
      setCsvText(initialText)
      analyze(initialText)
    }
  }, [params.text, params.src])

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      setCsvText(content)
      analyze(content)
    }
    reader.readAsText(file)
  }

  const loadSample = () => {
    setFileName('sample_company_data.csv')
    setCsvText(SAMPLE_CSV)
    analyze(SAMPLE_CSV)
  }

  const copySummaryJson = () => {
    if (!stats) return
    navigator.clipboard.writeText(JSON.stringify(stats, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          CSV Column Statistics & Data Profiler
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
          Upload or paste any comma-delimited CSV to compute descriptive statistical summaries, missing value ratios, and distributions across all columns.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary, #2563eb)',
            color: '#fff',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            📁 Upload CSV File
            <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            type="button"
            onClick={loadSample}
            style={{
              padding: '0.5rem 1rem',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Load Sample Dataset
          </button>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => {
                setHasHeader(e.target.checked)
                if (csvText.trim()) analyze(csvText)
              }}
            />
            First row contains column headers
          </label>

          {fileName && (
            <span style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
              ✓ Loaded: {fileName}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>
            Or Paste Raw CSV Data:
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="paste CSV data here..."
            rows={5}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => analyze()}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--primary, #2563eb)',
              color: '#fff',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Calculate Column Statistics
          </button>

          {csvText && (
            <button
              type="button"
              onClick={() => { setCsvText(''); setStats(null); setFileName(''); setError(''); }}
              style={{
                padding: '0.625rem 1rem',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {stats && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontWeight: '600', marginRight: '1rem' }}>
                Rows: <strong>{stats.rowCount.toLocaleString()}</strong>
              </span>
              <span style={{ fontWeight: '600' }}>
                Columns: <strong>{stats.columnCount}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={copySummaryJson}
              style={{
                padding: '0.375rem 0.75rem',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.8125rem'
              }}
            >
              {copied ? '✓ Copied JSON' : 'Copy Stats JSON'}
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Column</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Count (Valid / Null)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Distinct</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Summary Metrics</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Top Values</th>
                </tr>
              </thead>
              <tbody>
                {stats.columns.map((col, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{col.column}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: col.type === 'numeric' ? '#e0f2fe' : '#fef3c7',
                        color: col.type === 'numeric' ? '#0369a1' : '#92400e'
                      }}>
                        {col.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {col.nonNullCount} / {col.nullCount > 0 ? (
                        <span style={{ color: '#dc2626' }}>{col.nullCount} ({col.nullPercentage}%)</span>
                      ) : (
                        <span style={{ color: '#16a34a' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{col.distinctCount}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {col.type === 'numeric' ? (
                        <div style={{ lineHeight: '1.4' }}>
                          <div>Mean: <strong>{col.mean}</strong> | Median: <strong>{col.median}</strong></div>
                          <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                            Range: [{col.min} – {col.max}] | Sum: {col.sum.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                          Avg length: {col.avgLength} chars (min {col.minLength}, max {col.maxLength})
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {col.topValues.slice(0, 3).map((v, vIdx) => (
                        <div key={vIdx} style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                          • {v.value || '""'}: <strong>{v.count}</strong> ({v.percentage}%)
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
