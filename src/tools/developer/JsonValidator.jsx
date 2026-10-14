import TextTool from '../../components/TextTool.jsx'
import { validateJson } from '@tool-core/developer/jsonFormatter.js'

const run = (t) => {
  const result = validateJson(t)
  if (result.valid) {
    return result.summary
  }
  const posMsg = result.positionDescription ? ` (${result.positionDescription})` : ''
  throw new Error(`Invalid JSON: ${result.error}${posMsg}`)
}

export default function JsonValidator() {
  return <TextTool actions={[{ label: 'Validate', run, report: true }]} placeholder='{"valid": true}' />
}
