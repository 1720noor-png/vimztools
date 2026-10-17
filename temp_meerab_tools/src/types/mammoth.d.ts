declare module 'mammoth' {
  export interface MammothConvertOptions {
    arrayBuffer?: ArrayBuffer
    path?: string
    styleMap?: string[]
    includeDefaultStyleMap?: boolean
    includeEmbeddedStyleMap?: boolean
    transformDocument?: (element: unknown) => unknown
  }

  export interface MammothMessage {
    type: string
    message: string
  }

  export interface MammothResult {
    value: string
    messages: MammothMessage[]
  }

  export function convertToHtml(input: MammothConvertOptions): Promise<MammothResult>
  export function convertToMarkdown(input: MammothConvertOptions): Promise<MammothResult>
  export function extractRawText(input: MammothConvertOptions): Promise<MammothResult>

  const mammoth: {
    convertToHtml: typeof convertToHtml
    convertToMarkdown: typeof convertToMarkdown
    extractRawText: typeof extractRawText
  }

  export default mammoth
}