import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'WebAssembly & Low-Level Byte Math'

export const MOD09_SPECS: DevCloudSpec[] = [
  {
    id: 'wasm-binary-module-size-estimator',
    name: 'WebAssembly (Wasm) Memory Pages & Heap Sizer',
    subject: SUBJECT,
    blurb: 'Calculate WebAssembly linear memory pages (64 KiB each), max memory ceiling, and instantiation heap footprint.',
    tip: 'Each WebAssembly memory page is exactly 65,536 bytes (64 KiB). Set max pages to prevent memory exhaustion in browser sandboxes.',
    usage: [
      'Enter initial memory required by your application in MB.',
      'Enter maximum memory limit in MB.',
      'View calculated Wasm page counts and compilation flags.',
    ],
    method: [
      'Page Count = ceil(Bytes / 65536).',
      'Calculates Emscripten / Rust wasm-bindgen flags: `-sINITIAL_MEMORY` and `-sMAXIMUM_MEMORY`.',
    ],
    fields: [
      n('initMb', 'Initial Heap Memory (MB)', 16, 1, 2048, 1),
      n('maxMb', 'Maximum Heap Memory (MB)', 64, 4, 4096, 4),
      sel('toolchain', 'Wasm Toolchain', ['Rust wasm-bindgen / wasm-pack', 'Emscripten C/C++', 'AssemblyScript / Go Wasm']),
    ],
    compute: (v) => {
      const initMb = asNum(v, 'initMb', 16)
      const maxMb = Math.max(initMb, asNum(v, 'maxMb', 64))
      const tc = asSel(v, 'toolchain', 'Rust')

      const PAGE_BYTES = 65536
      const initBytes = initMb * 1024 * 1024
      const maxBytes = maxMb * 1024 * 1024

      const initPages = Math.ceil(initBytes / PAGE_BYTES)
      const maxPages = Math.ceil(maxBytes / PAGE_BYTES)

      let flags = ''
      if (tc.includes('Emscripten')) {
        flags = `-s INITIAL_MEMORY=${initBytes} -s MAXIMUM_MEMORY=${maxBytes} -s ALLOW_MEMORY_GROWTH=1`
      } else if (tc.includes('Rust')) {
        flags = `// Rust wasm-bindgen / web-sys memory initialization\nconst memory = new WebAssembly.Memory({ initial: ${initPages}, maximum: ${maxPages} });`
      } else {
        flags = `--initialMemory ${initPages} --maximumMemory ${maxPages}`
      }

      return [
        res('Initial Linear Pages', `${fmtNum(initPages)} pages (${fmtBytes(initBytes)})`, 'good', 'Reserved on WebAssembly.instantiate()'),
        res('Maximum Linear Pages', `${fmtNum(maxPages)} pages (${fmtBytes(maxBytes)})`, 'neutral', 'Hard browser sandbox ceiling'),
        pctres('Memory Growth Room', `${Math.round((initMb / maxMb) * 100)}% Initial Allocation`, Math.round((initMb / maxMb) * 100), 'good'),
        docres('Toolchain Memory Flags', flags, `Configured for ${tc}`),
      ]
    },
  },
  {
    id: 'hex-dump-to-ascii-byte-inspector',
    name: 'Hex Dump & Binary Byte Inspector',
    subject: SUBJECT,
    blurb: 'Format raw hexadecimal byte strings into canonical hexdump format with 16-byte offsets, hex pairs, and printable ASCII representation.',
    tip: 'Unprintable control characters (ASCII < 32 or > 126) are conventionally rendered as a period `.` in binary inspectors.',
    usage: [
      'Paste a hex string with or without spaces (e.g. `48656c6c6f20576f726c64`).',
      'Inspect 16-byte aligned binary offsets and printable ASCII characters.',
      'Copy the canonical hexdump report.',
    ],
    method: [
      'Parses hex pairs, formats 8-digit hexadecimal offset addresses, and decodes ASCII values.',
    ],
    fields: [
      txt('hexInput', 'Raw Hexadecimal String', '48656c6c6f20576f726c64212056696d7a2e61692053797374656d7320456e67696e656572696e67', 3),
    ],
    compute: (v) => {
      const raw = asStr(v, 'hexInput', '').replace(/[^0-9a-fA-F]/g, '')
      if (raw.length === 0) return [res('Inspection Error', 'No hexadecimal characters found', 'bad')]

      const bytes: number[] = []
      for (let i = 0; i < raw.length; i += 2) {
        bytes.push(parseInt(raw.slice(i, i + 2), 16))
      }

      const lines: string[] = []
      for (let i = 0; i < bytes.length; i += 16) {
        const chunk = bytes.slice(i, i + 16)
        const offset = i.toString(16).padStart(8, '0')
        const hexParts = chunk.map((b) => b.toString(16).padStart(2, '0')).join(' ')
        const paddedHex = hexParts.padEnd(48, ' ')
        const ascii = chunk.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('')
        lines.push(`${offset}  ${paddedHex}  |${ascii}|`)
      }

      const dump = lines.join('\n')

      return [
        res('Total Bytes Inspected', `${bytes.length} bytes`, 'good'),
        res('Binary Lines Formatted', `${lines.length} rows (16 bytes/row)`, 'neutral'),
        docres('Canonical Hexdump', dump, 'Standard `xxd` / `hexdump -C` format'),
      ]
    },
  },
]
