import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  FileDown,
  ShieldCheck,
  Table2,
  Wand2,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'

type Tab = 'json' | 'csv' | 'schema'

interface ParseOutcome {
  error: string | null
  json: string
  sql: string
  csv: string
  summary: string
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuote = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 2
          continue
        }
        inQuote = false
        i += 1
        continue
      }
      cell += ch
      i += 1
      continue
    }
    if (ch === '"' && cell === '') {
      inQuote = true
      i += 1
      continue
    }
    if (ch === ',') {
      row.push(cell)
      cell = ''
      i += 1
      continue
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      i += 1
      continue
    }
    cell += ch
    i += 1
  }
  row.push(cell)
  rows.push(row)
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function toSqlRows(rows: Record<string, string>[], table: string): string {
  if (!rows.length) return '-- no rows to insert'
  const cols = Object.keys(rows[0])
  const esc = (v: string) => `'${v.replace(/'/g, "''")}'`
  const header = `INSERT INTO ${table.trim() || 'your_table'} (${cols.join(', ')}) VALUES`
  const lines = rows.map((r) => `  (${cols.map((c) => esc(r[c] ?? '')).join(', ')}),`)
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, ';')
  return `${header}\n${lines.join('\n')}`
}

function parseOutcome(input: string, table: string): ParseOutcome {
  const base: ParseOutcome = { error: null, json: '', sql: '', csv: '', summary: '' }
  try {
    const data = JSON.parse(input)
    const isArray = Array.isArray(data)
    base.json = JSON.stringify(data, null, 2)
    base.summary = isArray
      ? `Valid JSON array with ${data.length} item${data.length === 1 ? '' : 's'}.`
      : `Valid JSON ${data === null ? 'null' : typeof data}.`
    if (isArray && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      base.csv = data.map((r) => Object.values(r as Record<string, unknown>).join(',')).join('\n')
      base.sql = toSqlRows(data as Record<string, string>[], table)
    }
    return base
  } catch (e) {
    base.error = e instanceof Error ? e.message : 'Invalid JSON.'
    return base
  }
}

function parseCsvOutcome(input: string, table: string): ParseOutcome {
  const base: ParseOutcome = { error: null, json: '', sql: '', csv: '', summary: '' }
  const quotes = (input.match(/"/g) ?? []).length
  if (quotes % 2 !== 0) {
    base.error = 'Unbalanced double quotes - a quoted field never closed, so parsing stopped.'
    return base
  }
  const rows = parseCsv(input)
  const [header, ...body] = rows
  if (!header || header.length === 0) {
    base.error = 'The CSV has no header row.'
    return base
  }
  const objects = body.map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => {
      obj[h.trim()] = (r[idx] ?? '').trim()
    })
    return obj
  })
  base.json = JSON.stringify(objects, null, 2)
  base.summary = `Parsed ${objects.length} rows across ${header.length} columns.`
  base.sql = toSqlRows(objects, table)
  return base
}

function validateValue(
  value: unknown,
  schema: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  const type = schema.type as string | undefined
  if (type) {
    const ok =
      value === null
        ? type === 'null'
        : type === 'array'
          ? Array.isArray(value)
          : type === 'object'
            ? typeof value === 'object' && !Array.isArray(value) && value !== null
            : typeof value === type
    if (!ok) {
      const got = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
      errors.push(`${path}: expected ${type}, got ${got}`)
      return
    }
  }
  const enumList = schema.enum as unknown[] | undefined
  if (enumList && !enumList.includes(value)) {
    errors.push(`${path}: value is not one of the allowed options`)
  }
  if (typeof value === 'number') {
    const min = schema.minimum as number | undefined
    const max = schema.maximum as number | undefined
    if (min !== undefined && (value as number) < min) errors.push(`${path}: below minimum ${min}`)
    if (max !== undefined && (value as number) > max) errors.push(`${path}: above maximum ${max}`)
  }
  if (typeof value === 'string') {
    const minL = schema.minLength as number | undefined
    const maxL = schema.maxLength as number | undefined
    if (minL !== undefined && (value as string).length < minL) errors.push(`${path}: shorter than minLength ${minL}`)
    if (maxL !== undefined && (value as string).length > maxL) errors.push(`${path}: longer than maxLength ${maxL}`)
    const pattern = schema.pattern as string | undefined
    if (pattern) {
      try {
        if (!new RegExp(pattern).test(value as string)) errors.push(`${path}: does not match the schema pattern`)
      } catch {
        errors.push(`${path}: the schema pattern is not a valid regular expression`)
      }
    }
  }
  if (Array.isArray(value)) {
    const items = schema.items as Record<string, unknown> | undefined
    if (items) (value as unknown[]).forEach((item, i) => validateValue(item, items, `${path}[${i}]`, errors))
  } else if (typeof value === 'object' && value !== null) {
    const required = schema.required as string[] | undefined
    if (required) {
      for (const k of required) {
        if (!(k in (value as Record<string, unknown>))) errors.push(`${path}: missing required property "${k}"`)
      }
    }
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined
    if (props) {
      for (const k of Object.keys(props)) {
        if (k in (value as Record<string, unknown>)) {
          validateValue((value as Record<string, unknown>)[k], props[k], `${path}.${k}`, errors)
        }
      }
    }
  }
}

function schemaCheck(dataInput: string, schemaInput: string): string[] {
  let data: unknown
  let schema: Record<string, unknown>
  try {
    data = JSON.parse(dataInput)
  } catch {
    return ['The data input is not valid JSON.']
  }
  try {
    schema = JSON.parse(schemaInput)
  } catch {
    return ['The schema input is not valid JSON.']
  }
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return ['The schema must be a JSON object.']
  }
  const errors: string[] = []
  try {
    validateValue(data, schema, 'data', errors)
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'Schema validation crashed unexpectedly.')
  }
  return errors
}

export default function JsonCsvParserValidator() {
  const [tab, setTab] = useState<Tab>('json')
  const [jsonInput, setJsonInput] = useState('')
  const [csvInput, setCsvInput] = useState('')
  const [tableName, setTableName] = useState('imported_rows')
  const [jsonResult, setJsonResult] = useState<ParseOutcome | null>(null)
  const [csvResult, setCsvResult] = useState<ParseOutcome | null>(null)

  const [dataInput, setDataInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [schemaErrors, setSchemaErrors] = useState<string[]>([])
  const [schemaChecked, setSchemaChecked] = useState(false)

  const minified = useMemo(() => {
    if (!jsonInput.trim()) return ''
    try {
      return JSON.stringify(JSON.parse(jsonInput))
    } catch {
      return ''
    }
  }, [jsonInput])

  const runJson = (mode: 'format' | 'minify' | 'csv' | 'sql') => {
    const outcome = parseOutcome(jsonInput, tableName)
    if (outcome.error) {
      setJsonResult(outcome)
      return
    }
    if (mode === 'minify') {
      outcome.json = JSON.stringify(JSON.parse(jsonInput))
    }
    if (mode === 'csv' && !outcome.csv) {
      outcome.summary = 'Only a JSON array of objects can be converted to CSV.'
    }
    if (mode === 'sql' && !outcome.sql) {
      outcome.summary = 'Only a JSON array of objects can be converted to SQL inserts.'
    }
    setJsonResult(outcome)
  }

  const runCsv = () => setCsvResult(parseCsvOutcome(csvInput, tableName))

  const runSchema = () => {
    setSchemaErrors(schemaCheck(dataInput, schemaInput))
    setSchemaChecked(true)
  }

  return (
    <>
      <Seo
        title="JSON / CSV Parser & Schema Validator - vimz Tools"
        description="Validate JSON schemas, format payloads and convert between JSON, CSV and SQL inserts entirely in the browser."
      />
      <ToolShell
        title="JSON / CSV Parser & Schema Validator"
        description="Format and validate JSON, run a draft-07 style schema check, and convert data between JSON, CSV and SQL insert statements."
        icon={<Braces className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Paste data in one tab and convert or validate it without uploading anything"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ['json', 'JSON Tools'],
              ['csv', 'CSV Tools'],
              ['schema', 'Schema Check'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === key ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'json' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">JSON input</h3>
              <TextArea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"id": 1, "name": "vimz", "active": true}'
                className="font-mono"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="primary" className="px-3 py-2 text-xs" onClick={() => runJson('format')}>
                  <Wand2 className="h-3.5 w-3.5" /> Format
                </Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={() => runJson('minify')}>
                  <Wand2 className="h-3.5 w-3.5" /> Minify
                </Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={() => runJson('csv')}>
                  <Table2 className="h-3.5 w-3.5" /> To CSV
                </Button>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={() => runJson('sql')}>
                  <FileDown className="h-3.5 w-3.5" /> To SQL
                </Button>
              </div>
              <div className="mt-3">
                <Field label="SQL table name (for insert)">
                  <TextInput value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="imported_rows" />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              {jsonResult?.error ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm font-bold text-rose-800">Parse failed</p>
                    <p className="mt-0.5 break-all text-xs text-rose-700">{jsonResult.error}</p>
                  </div>
                </div>
              ) : jsonResult?.summary ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {jsonResult.summary}
                </div>
              ) : minified ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Input is valid JSON.
                </div>
              ) : null}
              <CodeBlock title="JSON output" code={jsonResult?.json ?? minified ?? 'Paste JSON and click a button...'} lang="json" />
              {jsonResult?.csv && <CodeBlock title="CSV output" code={jsonResult.csv} />}
              {jsonResult?.sql && <CodeBlock title="SQL inserts" code={jsonResult.sql} lang="sql" />}
            </section>
          </div>
        )}

        {tab === 'csv' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">CSV input</h3>
              <TextArea
                rows={12}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={'name,amount,status\nAlice,120,paid\nBob,45,pending'}
                className="font-mono"
              />
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="flex-1">
                  <Field label="SQL table name (for insert)">
                    <TextInput value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="imported_rows" />
                  </Field>
                </div>
                <Button variant="primary" onClick={runCsv}>
                  <Table2 className="h-4 w-4" /> Parse CSV
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              {csvResult?.error ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <p className="text-xs text-rose-700">{csvResult.error}</p>
                </div>
              ) : csvResult?.summary ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {csvResult.summary}
                </div>
              ) : null}
              <CodeBlock title="Rows as JSON" code={csvResult?.json ?? 'Paste CSV and click Parse CSV...'} lang="json" />
              {csvResult?.sql && <CodeBlock title="SQL inserts" code={csvResult.sql} lang="sql" />}
            </section>
          </div>
        )}

        {tab === 'schema' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Data to check</h3>
                <TextArea rows={8} value={dataInput} onChange={(e) => setDataInput(e.target.value)} placeholder='{"name": "vimz", "age": 30}' className="font-mono" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">JSON Schema</h3>
                <TextArea
                  rows={8}
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  placeholder={'{"type": "object", "required": ["name"], "properties": {"name": {"type": "string"}}}'}
                  className="font-mono"
                />
                <Button variant="primary" className="mt-3 w-full" onClick={runSchema}>
                  <ShieldCheck className="h-4 w-4" /> Run schema check
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              {schemaChecked && schemaErrors.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Data satisfies the schema.
                </div>
              )}
              {schemaChecked && schemaErrors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="mb-2 text-sm font-bold text-rose-800">
                    {schemaErrors.length} issue{schemaErrors.length === 1 ? '' : 's'} found
                  </p>
                  <ul className="space-y-1.5">
                    {schemaErrors.map((err) => (
                      <li key={err} className="flex items-start gap-2 text-xs text-rose-700">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="break-all">{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                This validator covers the common draft-07 keywords: type, required, properties, items, enum, minimum,
                maximum, minLength, maxLength and pattern. Deeper keywords such as $ref and oneOf are not resolved here.
              </p>
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}