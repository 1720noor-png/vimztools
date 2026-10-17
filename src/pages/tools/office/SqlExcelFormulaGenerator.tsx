import { useMemo, useState } from 'react'
import { Database, FileSpreadsheet, Info, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'

type Tab = 'sql' | 'excel'

interface FnArg {
  key: string
  label: string
  placeholder: string
}

interface ExcelFn {
  key: string
  label: string
  args: FnArg[]
  sample: Record<string, string>
  build: (vals: Record<string, string>) => string
}

function q(v: string): string {
  const t = v.trim()
  if (!t) return '""'
  if (/^".*"$/.test(t) || /^'.*'$/.test(t)) return t
  if (/^-?\d+(\.\d+)?$/.test(t)) return t
  if (/^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(t)) return t
  if (/^(TRUE|FALSE)$/i.test(t)) return t.toUpperCase()
  if (/^\(.*\)$/.test(t)) return t
  return `"${t}"`
}

const EXCEL_FNS: ExcelFn[] = [
  {
    key: 'xlookup',
    label: 'XLOOKUP',
    args: [
      { key: 'lookup_value', label: 'Lookup value', placeholder: 'A2' },
      { key: 'lookup_array', label: 'Lookup array', placeholder: 'Sheet2!A:A' },
      { key: 'return_array', label: 'Return array', placeholder: 'Sheet2!B:B' },
      { key: 'not_found', label: 'Not found text', placeholder: 'Not found' },
    ],
    sample: { lookup_value: 'A2', lookup_array: 'Sheet2!A:A', return_array: 'Sheet2!B:B', not_found: 'Not found' },
    build: (v) =>
      `=XLOOKUP(${v.lookup_value || 'A2'}, ${v.lookup_array || 'lookup_range'}, ${v.return_array || 'return_range'}${v.not_found ? `, "${v.not_found}"` : ''})`,
  },
  {
    key: 'index-match',
    label: 'INDEX + MATCH',
    args: [
      { key: 'lookup_value', label: 'Lookup value', placeholder: 'B2' },
      { key: 'lookup_array', label: 'Lookup column', placeholder: 'Sheet2!A:A' },
      { key: 'return_array', label: 'Return column', placeholder: 'Sheet2!C:C' },
    ],
    sample: { lookup_value: 'B2', lookup_array: 'Sheet2!A:A', return_array: 'Sheet2!C:C' },
    build: (v) =>
      `=INDEX(${v.return_array || 'return_range'}, MATCH(${v.lookup_value || 'B2'}, ${v.lookup_array || 'lookup_range'}, 0))`,
  },
  {
    key: 'vlookup',
    label: 'VLOOKUP',
    args: [
      { key: 'lookup_value', label: 'Lookup value', placeholder: 'A2' },
      { key: 'table_array', label: 'Table array', placeholder: 'Sheet2!A:C' },
      { key: 'col_index', label: 'Column index', placeholder: '3' },
    ],
    sample: { lookup_value: 'A2', table_array: 'Sheet2!A:C', col_index: '3' },
    build: (v) =>
      `=VLOOKUP(${v.lookup_value || 'A2'}, ${v.table_array || 'table'}, ${v.col_index || '2'}, FALSE)`,
  },
  {
    key: 'sumif',
    label: 'SUMIF',
    args: [
      { key: 'range', label: 'Criteria range', placeholder: 'A2:A100' },
      { key: 'criteria', label: 'Criteria', placeholder: 'Paid' },
      { key: 'sum_range', label: 'Sum range', placeholder: 'B2:B100' },
    ],
    sample: { range: 'A2:A100', criteria: 'Paid', sum_range: 'B2:B100' },
    build: (v) =>
      `=SUMIF(${v.range || 'A:A'}, ${q(v.criteria || 'criteria')}, ${v.sum_range || 'B:B'})`,
  },
  {
    key: 'countif',
    label: 'COUNTIF',
    args: [
      { key: 'range', label: 'Range', placeholder: 'A2:A100' },
      { key: 'criteria', label: 'Criteria', placeholder: 'Overdue' },
    ],
    sample: { range: 'A2:A100', criteria: 'Overdue' },
    build: (v) => `=COUNTIF(${v.range || 'A:A'}, ${q(v.criteria || 'criteria')})`,
  },
  {
    key: 'if',
    label: 'IF',
    args: [
      { key: 'test', label: 'Logical test', placeholder: 'B2>1000' },
      { key: 'yes', label: 'Value if true', placeholder: '"High"' },
      { key: 'no', label: 'Value if false', placeholder: '"Low"' },
    ],
    sample: { test: 'B2>1000', yes: '"High"', no: '"Low"' },
    build: (v) => {
      const yes = v.yes && /^".*"$/.test(v.yes.trim()) ? v.yes.trim() : q(v.yes || 'TRUE')
      const no = v.no && /^".*"$/.test(v.no.trim()) ? v.no.trim() : q(v.no || 'FALSE')
      return `=IF(${v.test || 'A2>0'}, ${yes}, ${no})`
    },
  },
  {
    key: 'textjoin',
    label: 'TEXTJOIN',
    args: [
      { key: 'delimiter', label: 'Delimiter', placeholder: '", "' },
      { key: 'range', label: 'Range', placeholder: 'A2:A10' },
    ],
    sample: { delimiter: '", "', range: 'A2:A10' },
    build: (v) => `=TEXTJOIN(${q(v.delimiter || '", "')}, TRUE, ${v.range || 'A2:A10'})`,
  },
  {
    key: 'filter',
    label: 'FILTER',
    args: [
      { key: 'array', label: 'Array', placeholder: 'A2:C100' },
      { key: 'include', label: 'Include condition', placeholder: 'B2:B100="Yes"' },
    ],
    sample: { array: 'A2:C100', include: 'B2:B100="Yes"' },
    build: (v) => `=FILTER(${v.array || 'A2:C100'}, ${v.include || 'B2:B100="Yes"'})`,
  },
  {
    key: 'lambda',
    label: 'LAMBDA + BYROW',
    args: [
      { key: 'param', label: 'Param name', placeholder: 'x' },
      { key: 'expression', label: 'Expression', placeholder: 'x*2' },
      { key: 'range', label: 'Input range', placeholder: 'A2:A100' },
    ],
    sample: { param: 'x', expression: 'x*2', range: 'A2:A100' },
    build: (v) =>
      `=BYROW(${v.range || 'A2:A100'}, LAMBDA(${v.param || 'x'}, ${v.expression || 'x*2'}))`,
  },
]

function lintSql(input: string): string[] {
  const issues: string[] = []
  const s = input.trim()
  if (!s) {
    issues.push('The query is empty.')
    return issues
  }
  const lower = s.toLowerCase()
  if (!lower.includes('select') && !lower.includes('with')) {
    issues.push('No SELECT or WITH clause detected.')
  }
  let depth = 0
  for (const ch of s) {
    if (ch === '(') depth += 1
    if (ch === ')') depth -= 1
  }
  if (depth !== 0) issues.push(`Unbalanced parentheses (${Math.abs(depth)} unmatched).`)
  const single = (s.match(/'/g) ?? []).length
  if (single % 2 !== 0) issues.push('Odd number of single quotes - a string literal looks unclosed.')
  if (lower.includes('join') && !lower.includes(' on ')) {
    issues.push('A JOIN clauses is missing its ON condition.')
  }
  if (lower.includes('group by') && !lower.includes('having') && lower.includes(' where ') && /having/.test(lower)) {
    issues.push('HAVING detected without GROUP BY.')
  }
  return issues
}

export default function SqlExcelFormulaGenerator() {
  const [tab, setTab] = useState<Tab>('sql')

  const [table, setTable] = useState('orders')
  const [columns, setColumns] = useState('order_id, customer_id, total')
  const [join, setJoin] = useState('none')
  const [joinTable, setJoinTable] = useState('customers')
  const [joinOn, setJoinOn] = useState('orders.customer_id = customers.id')
  const [agg, setAgg] = useState('none')
  const [aggCol, setAggCol] = useState('total')
  const [groupBy, setGroupBy] = useState('customer_id')
  const [orderCol, setOrderCol] = useState('total')
  const [orderDir, setOrderDir] = useState('DESC')
  const [limit, setLimit] = useState('100')
  const [sqlInput, setSqlInput] = useState('')
  const [issues, setIssues] = useState<string[]>([])
  const [sqlOut, setSqlOut] = useState('')

  const [fnKey, setFnKey] = useState('xlookup')
  const [argValues, setArgValues] = useState<Record<string, string>>({})
  const [formulaOut, setFormulaOut] = useState('')

  const fn = useMemo(() => EXCEL_FNS.find((f) => f.key === fnKey) ?? EXCEL_FNS[0], [fnKey])

  const generateSql = () => {
    const cols = columns.trim() ? columns.trim() : '*'
    const joinClause =
      join === 'none' || !joinTable.trim()
        ? ''
        : `\n${join.toUpperCase()} JOIN ${joinTable.trim()}\n  ON ${joinOn.trim() || '1 = 1'}`
    const selectCols = agg === 'none' ? cols : `${agg.toUpperCase()}(${aggCol.trim() || '*'}${aggCol.trim() ? ` AS ${aggCol.trim()}` : ''})`
    const groupClause = agg !== 'none' && groupBy.trim() ? `\nGROUP BY ${groupBy.trim()}` : ''
    const orderClause = orderCol.trim() ? `\nORDER BY ${orderCol.trim()} ${orderDir}` : ''
    const limitClause = limit.trim() ? `\nLIMIT ${limit.trim()}` : ''
    setSqlOut(`SELECT ${selectCols}\nFROM ${table.trim() || 'your_table'}${joinClause}${groupClause}${orderClause}${limitClause}`)
    setIssues([])
  }

  const checkSql = () => {
    const source = sqlInput.trim() || sqlOut
    if (!source.trim()) {
      setIssues(['Nothing to check. Generate a query first or paste one below.'])
      return
    }
    setIssues(lintSql(source))
    if (!sqlInput.trim()) setSqlInput(source)
  }

  const setArg = (key: string, value: string) => setArgValues((prev) => ({ ...prev, [key]: value }))

  const fillSample = () => {
    setArgValues(fn.sample)
  }

  const generateFormula = () => {
    setFormulaOut(fn.build(argValues))
  }

  return (
    <>
      <Seo
        title="SQL Query & Excel Formula Generator - vimz Tools"
        description="Build SQL queries and nested Excel or Google Sheets formulas from simple inputs, then lint the result."
      />
      <ToolShell
        title="SQL Query & Excel Formula Generator"
        description="Compose JOIN-based SQL queries and nested XLOOKUP, INDEX-MATCH and LAMBDA formulas, then lint both for obvious mistakes."
        icon={<Database className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Pick SQL or Excel, fill the fields, and generate a ready-to-use snippet"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setTab('sql')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'sql' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Database className="h-4 w-4" /> SQL Builder
          </button>
          <button
            onClick={() => setTab('excel')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === 'excel' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel Formula
          </button>
        </div>

        {tab === 'sql' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Query builder</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Table">
                  <TextInput value={table} onChange={(e) => setTable(e.target.value)} placeholder="orders" />
                </Field>
                <Field label="Join type">
                  <Select value={join} onChange={(e) => setJoin(e.target.value)}>
                    <option value="none">No join</option>
                    <option value="inner">INNER</option>
                    <option value="left">LEFT</option>
                    <option value="right">RIGHT</option>
                  </Select>
                </Field>
                <Field label="Columns">
                  <TextInput value={columns} onChange={(e) => setColumns(e.target.value)} placeholder="id, name" />
                </Field>
                <Field label="Join table">
                  <TextInput value={joinTable} onChange={(e) => setJoinTable(e.target.value)} placeholder="customers" />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Join condition">
                  <TextInput value={joinOn} onChange={(e) => setJoinOn(e.target.value)} placeholder="orders.customer_id = customers.id" />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Aggregate">
                  <Select value={agg} onChange={(e) => setAgg(e.target.value)}>
                    <option value="none">None</option>
                    <option value="count">COUNT</option>
                    <option value="sum">SUM</option>
                    <option value="avg">AVG</option>
                    <option value="min">MIN</option>
                    <option value="max">MAX</option>
                  </Select>
                </Field>
                <Field label="Aggregate column">
                  <TextInput value={aggCol} onChange={(e) => setAggCol(e.target.value)} placeholder="total" />
                </Field>
                <Field label="Group by (optional)">
                  <TextInput value={groupBy} onChange={(e) => setGroupBy(e.target.value)} placeholder="customer_id" />
                </Field>
                <Field label="Order by">
                  <TextInput value={orderCol} onChange={(e) => setOrderCol(e.target.value)} placeholder="total" />
                </Field>
                <Field label="Direction">
                  <Select value={orderDir} onChange={(e) => setOrderDir(e.target.value)}>
                    <option value="DESC">DESC</option>
                    <option value="ASC">ASC</option>
                  </Select>
                </Field>
                <Field label="Limit">
                  <TextInput type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="100" />
                </Field>
              </div>
              <Button variant="primary" className="mt-4 w-full" onClick={generateSql}>
                <Wand2 className="h-4 w-4" /> Generate SQL
              </Button>
            </section>

            <section className="space-y-4">
              <CodeBlock title="Generated SQL" code={sqlOut || 'SELECT ... FROM ...'} lang="sql" />
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Info className="h-4 w-4 text-primary-600" /> Query checker
                </h3>
                <TextInput value={sqlInput} onChange={(e) => setSqlInput(e.target.value)} placeholder="Paste any SQL to lint it..." />
                <Button variant="secondary" className="mt-3 w-full" onClick={checkSql}>
                  Check query
                </Button>
                {issues.length > 0 && (
                  <ul className="mt-3 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    {issues.map((issue) => (
                      <li key={issue} className="flex items-start gap-2 text-xs font-medium text-amber-800">
                        <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
                {issues.length === 0 && sqlOut && (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    No obvious issues found in the generated query.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">Formula builder</h3>
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={fillSample}>
                  Insert sample
                </Button>
              </div>
              <Field label="Function">
                <Select value={fnKey} onChange={(e) => setFnKey(e.target.value)}>
                  {EXCEL_FNS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {fn.args.map((a) => (
                  <Field key={a.key} label={a.label}>
                    <TextInput
                      value={argValues[`${fn.key}:${a.key}`] ?? ''}
                      onChange={(e) => setArg(`${fn.key}:${a.key}`, e.target.value)}
                      placeholder={a.placeholder}
                    />
                  </Field>
                ))}
              </div>
              <Button variant="primary" className="mt-4 w-full" onClick={generateFormula}>
                <Wand2 className="h-4 w-4" /> Generate formula
              </Button>
            </section>

            <section className="space-y-4">
              <CodeBlock title={`${fn.label} formula`} code={formulaOut || '=FUNCTION(...)'} />
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                <Info className="mr-1 inline h-3.5 w-3.5" />
                Values you type without quotes are treated as cell references, ranges or numbers. Anything else is
                automatically wrapped in quotes so the formula stays valid in Excel and Google Sheets.
              </p>
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}