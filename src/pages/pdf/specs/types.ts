export type PdfParamType = 'text' | 'number' | 'slider' | 'select' | 'toggle' | 'color' | 'textarea'

export interface PdfParamOption {
  label: string
  value: string
}

export interface PdfToolParam {
  id: string
  label: string
  type: PdfParamType
  defaultValue: string | number | boolean
  placeholder?: string
  options?: PdfParamOption[]
  min?: number
  max?: number
  step?: number
}

export interface PdfToolSpec {
  id: string
  name: string
  sub: string
  icon: string
  description: string
  blurb: string
  op: string
  proTip: string
  params: PdfToolParam[]
  accept: string
  multiple?: boolean
}
