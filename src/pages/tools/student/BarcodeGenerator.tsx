import { useMemo, useState } from 'react'
import { Barcode as BarcodeIcon, RefreshCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const L_PATTERNS = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const PARITY: Record<string, string> = {
  '0': 'LLLLLL', '1': 'LLGLGG', '2': 'LLGGLG', '3': 'LLGGGL', '4': 'LGLLGG',
  '5': 'LGGLLG', '6': 'LGGGLL', '7': 'LGLGLG', '8': 'LGLGGL', '9': 'LGGLGL',
}
const complement = (s: string) =>
  [...s].map((c) => (c === '0' ? '1' : '0')).join('')

function ean13Code(input: string): { ok: boolean; code?: string; digits?: string; error?: string } {
  const clean = input.replace(/\s+/g, '')
  if (!/^\d{12,13}$/.test(clean)) {
    return { ok: false, error: 'Enter 12 or 13 digits.' }
  }
  const digits = clean.slice(0, 12)
  const sum = [...digits].reduce(
    (acc, c, i) => acc + parseInt(c, 10) * (i % 2 === 0 ? 1 : 3),
    0,
  )
  const check = (10 - (sum % 10)) % 10
  if (clean.length === 13 && parseInt(clean[12], 10) !== check) {
    return { ok: false, error: 'The check digit is invalid for those first 12 digits.' }
  }
  const first = digits[0]
  const parity = PARITY[first]
  let bits = '101'
  for (let i = 0; i < 6; i++) {
    const table = parity[i] === 'L' ? L_PATTERNS : L_PATTERNS.map(complement)
    bits += table[parseInt(digits[i + 1], 10)]
  }
  bits += '01010'
  for (let i = 6; i < 12; i++) {
    bits += L_PATTERNS.map(complement)[parseInt(digits[i], 10)]
  }
  bits += '101'
  return { ok: true, code: bits, digits: digits + check }
}

const C128: string[] = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
]

function code128Code(input: string): { ok: boolean; code?: string; raw?: string; error?: string } {
  const text = input.trim()
  if (!text) return { ok: false, error: 'Enter some text to encode.' }
  if ([...text].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)) {
    return { ok: false, error: 'Only printable ASCII characters (32-126) are supported.' }
  }
  const values = [...text].map((c) => c.charCodeAt(0) - 32)
  const check = (104 + values.reduce((acc, v, i) => acc + v * (i + 1), 0)) % 103
  const widths = ['212222', ...values.map((v) => C128[v]), C128[check], '2331112']
  const bits = widths
    .map((w, i) => {
      const run: string[] = []
      for (const d of w) {
        run.push(i % 2 === 0 ? '1'.repeat(parseInt(d, 10)) : '0'.repeat(parseInt(d, 10)))
      }
      return run.join('')
    })
    .join('')
  return { ok: true, code: bits, raw: text }
}

function BarSvg({ bits, digits }: { bits: string; digits?: string }) {
  const module = 2
  const height = 84
  const mh = Math.min(height, 60)
  const guardZone = 10
  const width = bits.length * module + guardZone * 2
  const bars: Array<{ x: number; w: number; h: number }> = []
  let i = 0
  while (i < bits.length) {
    if (bits[i] === '1') {
      let j = i
      while (j < bits.length && bits[j] === '1') j++
      const isGuard = i < 3 || i > bits.length - 4 || (i > bits.length / 2 - 7 && i < bits.length / 2 + 4)
      bars.push({ x: guardZone + i * module, w: (j - i) * module, h: isGuard ? height : mh })
      i = j
    } else {
      i++
    }
  }
  return (
    <svg viewBox={`0 0 ${width} ${height + (digits ? 22 : 0)}`} className="w-full" style={{ maxWidth: 560 }} role="img" aria-label={digits ?? 'barcode'}>
      <rect x={0} y={0} width={width} height={height + (digits ? 22 : 0)} fill="#fff" />
      {bars.map((b, idx) => (
        <rect key={idx} x={b.x} y={height - b.h} width={b.w} height={b.h} fill="#0f172a" />
      ))}
      {digits &&
        [...digits].map((d, idx) => (
          <text key={idx} x={guardZone + idx * 7 * module + 3.5 * module} y={height + 15} fontSize={10} textAnchor="middle" fill="#0f172a" fontFamily="monospace">
            {d}
          </text>
        ))}
    </svg>
  )
}

export default function BarcodeGenerator() {
  const [type, setType] = useState<'ean13' | 'code128'>('ean13')
  const [input, setInput] = useState('5901234123457')
  const [tick, setTick] = useState(0)

  const result = useMemo<{ ok: boolean; bits?: string; capture?: string; error?: string }>(() => {
    void tick
    if (type === 'ean13') {
      const r = ean13Code(input)
      if (!r.ok) return { ok: false, error: r.error }
      return { ok: true, bits: r.code, capture: r.digits }
    }
    const r = code128Code(input)
    if (!r.ok) return { ok: false, error: r.error }
    return { ok: true, bits: r.code, capture: r.raw ?? input }
  }, [type, input, tick])

  return (
    <>
      <Seo
        title="Barcode Generator - vimz Tools"
        description="Generate EAN-13 and Code128 barcodes for products and labels directly in your browser."
      />
      <ToolShell
        title="Barcode Generator"
        description="Create crisp EAN-13 product codes and Code128 labels, rendered live as vector SVG."
        icon={<BarcodeIcon className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a format, enter digits or text, and copy the barcode or its raw value."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Barcode type">
              <Select value={type} onChange={(e) => setType(e.target.value as 'ean13' | 'code128')}>
                <option value="ean13">EAN-13 (product numbers)</option>
                <option value="code128">Code 128 (alphanumeric text)</option>
              </Select>
            </Field>
            <Field label={type === 'ean13' ? 'Digits (12 or 13)' : 'Text to encode'}>
              <TextInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={type === 'ean13' ? 'e.g. 5901234123457' : 'e.g. 7-LB-8833'}
                spellCheck={false}
              />
            </Field>
            {!result.ok && result.error && <p className="text-sm font-medium text-rose-600">{result.error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setTick((t) => t + 1)}>
                <RefreshCcw className="h-4 w-4" /> Regenerate
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {result.ok && result.bits ? (
                <BarSvg bits={result.bits} digits={type === 'ean13' ? String(result.capture) : undefined} />
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">Fix the input to see the barcode.</p>
              )}
            </div>
            <CodeBlock
              title={type === 'ean13' ? 'Value (digits + check digit)' : 'Encoded text'}
              code={result.ok && result.capture ? String(result.capture) : ''}
              lang="plain"
            />
          </div>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-slate-400">
          Barcodes are generated locally as vector graphics - accurate to the EAN-13 and Code 128
          specifications, ready for printing on labels and packaging.
        </p>
      </ToolShell>
    </>
  )
}