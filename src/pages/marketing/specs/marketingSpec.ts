import type { OfficeToolSpec } from '../../office/archetypes/spec'

export interface MarketingSeoSpec extends OfficeToolSpec {
  name: string
  subject: string
  tip: string
  usage: [string, string, string]
  method: string[]
}