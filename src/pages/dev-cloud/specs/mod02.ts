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

export const SUBJECT = 'Data Serialization & Schemas'

export const MOD02_SPECS: DevCloudSpec[] = [
  {
    id: 'json-to-typescript-interface-generator',
    name: 'JSON to TypeScript Interface & Type Generator',
    subject: SUBJECT,
    blurb: 'Generate strongly-typed TypeScript interfaces and nested types from sample raw JSON payloads.',
    tip: 'Make sure your sample JSON contains representative values (non-null) so primitive types like string and number are accurately inferred.',
    usage: [
      'Paste your representative JSON object.',
      'Specify root interface name (e.g. UserProfile, ApiResponse).',
      'Copy the generated TypeScript definition code.',
    ],
    method: [
      'Recursively traverses JSON key-value pairs.',
      'Infers string, number, boolean, arrays (T[]), and nested interface records.',
    ],
    fields: [
      txt('rootName', 'Root Interface Name', 'UserProfile', 1),
      sel('outputKind', 'Output Definition Kind', ['interface', 'type']),
      txt('jsonInput', 'Sample JSON Object', '{\n  "id": 14201,\n  "name": "Alex Mercer",\n  "email": "alex@enterprise.io",\n  "isActive": true,\n  "scores": [98.5, 92.0, 95.4],\n  "address": {\n    "city": "Austin",\n    "state": "TX",\n    "zipCode": 78701\n  }\n}'),
    ],
    compute: (v) => {
      const root = asStr(v, 'rootName', 'RootType').replace(/[^a-zA-Z0-9_]/g, '') || 'RootType'
      const kind = asSel(v, 'outputKind', 'interface')
      const jsonStr = asStr(v, 'jsonInput', '{}')

      try {
        const obj = JSON.parse(jsonStr)

        const nestedDefs: string[] = []

        function inferType(val: unknown, keyName: string): string {
          if (val === null || val === undefined) return 'unknown'
          if (typeof val === 'string') return 'string'
          if (typeof val === 'number') return 'number'
          if (typeof val === 'boolean') return 'boolean'
          if (Array.isArray(val)) {
            if (val.length === 0) return 'unknown[]'
            return `${inferType(val[0], keyName)}[]`
          }
          if (typeof val === 'object') {
            const nestedName = keyName.charAt(0).toUpperCase() + keyName.slice(1)
            const fields: string[] = []
            for (const [k, nestedVal] of Object.entries(val as Record<string, unknown>)) {
              fields.push(`  ${k}: ${inferType(nestedVal, k)};`)
            }
            if (kind === 'interface') {
              nestedDefs.push(`export interface ${nestedName} {\n${fields.join('\n')}\n}`)
            } else {
              nestedDefs.push(`export type ${nestedName} = {\n${fields.join('\n')}\n};`)
            }
            return nestedName
          }
          return 'unknown'
        }

        const topFields: string[] = []
        for (const [k, val] of Object.entries(obj)) {
          topFields.push(`  ${k}: ${inferType(val, k)};`)
        }

        let mainDef = ''
        if (kind === 'interface') {
          mainDef = `export interface ${root} {\n${topFields.join('\n')}\n}`
        } else {
          mainDef = `export type ${root} = {\n${topFields.join('\n')}\n};`
        }

        const fullCode = [...nestedDefs, mainDef].join('\n\n')

        return [
          res('Inferred Types', `${nestedDefs.length + 1} interfaces`, 'good'),
          res('Root Identifier', root, 'neutral'),
          docres('Generated TypeScript Code', fullCode, 'Ready for direct copy into .ts file'),
        ]
      } catch (e) {
        return [res('JSON Parsing Error', (e as Error).message, 'bad')]
      }
    },
  },
  {
    id: 'protobuf-binary-overhead-sizer',
    name: 'Protobuf vs JSON vs MsgPack Serialization Sizer',
    subject: SUBJECT,
    blurb: 'Simulate wire size compression and bandwidth savings comparing JSON against binary Protobuf and MessagePack serialization.',
    tip: 'Protobuf strips repeated ASCII keys and packs integers into varints, saving 60-80% over plain JSON in high-throughput microservices.',
    usage: [
      'Enter average JSON payload size in bytes or KB.',
      'Enter total API requests per second (RPS).',
      'Inspect monthly network egress bandwidth and cost savings.',
    ],
    method: [
      'Protobuf typically yields 65% reduction for structured records.',
      'MessagePack averages 40% reduction without requiring schema precompilation.',
    ],
    fields: [
      n('jsonBytes', 'Average Raw JSON Payload (Bytes)', 3200, 100, 1000000, 100),
      n('rps', 'Requests Per Second (RPS)', 500, 1, 100000, 50),
    ],
    compute: (v) => {
      const rawJson = asNum(v, 'jsonBytes', 3200)
      const rps = asNum(v, 'rps', 500)

      const protoBytes = Math.round(rawJson * 0.35)
      const msgPackBytes = Math.round(rawJson * 0.60)

      const monthlyRequests = rps * 60 * 60 * 24 * 30
      const jsonMonthlyGb = (monthlyRequests * rawJson) / (1024 * 1024 * 1024)
      const protoMonthlyGb = (monthlyRequests * protoBytes) / (1024 * 1024 * 1024)
      const savedGb = jsonMonthlyGb - protoMonthlyGb

      // Cloud egress average $0.09 per GB
      const monthlySavings = savedGb * 0.09

      return [
        res('Protobuf Wire Size', `${fmtBytes(protoBytes)} (65% smaller)`, 'good', `vs ${fmtBytes(rawJson)} JSON`),
        res('MessagePack Wire Size', `${fmtBytes(msgPackBytes)} (40% smaller)`, 'neutral'),
        pctres('Protobuf Compression Ratio', '65% Wire Savings', 65, 'good'),
        res('Monthly Bandwidth Saved', `${fmtNum(savedGb)} GB / month`, 'good', `Across ${fmtNum(monthlyRequests)} requests`),
        res('Est. Cloud Egress Savings', `$${fmtNum(monthlySavings)} / month`, 'good', 'At $0.09/GB egress rate'),
      ]
    },
  },
]
