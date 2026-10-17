import JSZip from 'jszip'
import mammoth from 'mammoth'
import { Document, Paragraph, Packer, HeadingLevel, AlignmentType } from 'docx'

export interface HeadingItem {
  id: string
  text: string
  level: number // 1, 2, 3
  paragraphIndex: number
}

export interface DocxStats {
  words: number
  characters: number
  paragraphs: number
  headings: number
  images: number
  tables: number
}

export interface DocxMetadata {
  title?: string
  creator?: string
  lastModifiedBy?: string
  revision?: string
  created?: string
  modified?: string
}

export interface FixerOptions {
  // TOC
  generateToc?: boolean
  tocDepth?: number // 1, 2, 3
  tocTitle?: string

  // Spacing
  lineSpacing?: '1.0' | '1.15' | '1.5' | '2.0' | 'keep'
  normalizeParagraphSpacing?: boolean // removes irregular spacing before/after
  removeBlankParagraphs?: boolean

  // Page Numbers
  addPageNumbers?: boolean
  pageNumberPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  pageNumberFormat?: 'arabic' | 'roman' | 'page-of-pages'
  differentFirstPage?: boolean

  // Headers & Footers
  headerText?: string
  footerText?: string
  classificationStamp?: string // e.g. "CONFIDENTIAL", "DRAFT", "INTERNAL USE"
  excludeFirstPageHeader?: boolean

  // Cleanup
  removeDoubleSpaces?: boolean
  cleanMetadata?: boolean
}

// Memory tracking for Object URLs to guarantee 0 leaks
const activeDocxUrls = new Set<string>()

export function registerDocxUrl(url: string): string {
  activeDocxUrls.add(url)
  return url
}

export function revokeAllDocxUrls(): void {
  for (const url of activeDocxUrls) {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }
  activeDocxUrls.clear()
}

export function revokeDocxUrl(url: string): void {
  try {
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
  activeDocxUrls.delete(url)
}

/**
 * Utility: Convert ArrayBuffer to HTML string via Mammoth for live browser preview
 */
export async function renderDocxToHtml(buffer: ArrayBuffer): Promise<{ html: string; messages: string[] }> {
  try {
    const res = await mammoth.convertToHtml({ arrayBuffer: buffer })
    return {
      html: res.value || '<p className="text-slate-400 italic">Document contains no readable text layer.</p>',
      messages: res.messages.map((m) => m.message),
    }
  } catch (err: any) {
    return {
      html: `<div class="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">Unable to generate live HTML preview: ${err.message || 'Corrupt or encrypted file.'}</div>`,
      messages: [String(err)],
    }
  }
}

/**
 * Utility: Extract raw text from DOCX
 */
export async function extractDocxRawText(buffer: ArrayBuffer): Promise<string> {
  try {
    const res = await mammoth.extractRawText({ arrayBuffer: buffer })
    return res.value || ''
  } catch {
    return ''
  }
}

/**
 * Parse DOCX ZIP and return document DOM
 */
export async function loadDocxZip(buffer: ArrayBuffer): Promise<{ zip: JSZip; docXml: XMLDocument; rawXml: string }> {
  const zip = await JSZip.loadAsync(buffer)
  const docFile = zip.file('word/document.xml')
  if (!docFile) {
    throw new Error('Invalid DOCX file: word/document.xml not found.')
  }
  const rawXml = await docFile.async('text')
  const parser = new DOMParser()
  const docXml = parser.parseFromString(rawXml, 'application/xml')

  // Check for parser errors
  const parseError = docXml.querySelector('parsererror')
  if (parseError) {
    throw new Error('Failed to parse document XML: ' + parseError.textContent)
  }

  return { zip, docXml, rawXml }
}

/**
 * Scan all headings in the document (Heading 1, 2, 3)
 */
export function scanDocxHeadings(docXml: XMLDocument): HeadingItem[] {
  const headings: HeadingItem[] = []
  const paragraphs = Array.from(docXml.getElementsByTagName('w:p'))

  paragraphs.forEach((p, idx) => {
    // Check pStyle
    const pStyle = p.querySelector('w\\:pStyle, pStyle')
    const val = pStyle?.getAttribute('w:val') || pStyle?.getAttribute('val') || ''

    let level = 0
    if (/heading\s*1/i.test(val) || val === 'Heading1' || val === '1') level = 1
    else if (/heading\s*2/i.test(val) || val === 'Heading2' || val === '2') level = 2
    else if (/heading\s*3/i.test(val) || val === 'Heading3' || val === '3') level = 3

    if (level > 0) {
      // Collect all text runs inside this paragraph
      const textNodes = Array.from(p.querySelectorAll('w\\:t, t'))
      const text = textNodes.map((t) => t.textContent || '').join('').trim()
      if (text) {
        headings.push({
          id: `heading-${idx}`,
          text,
          level,
          paragraphIndex: idx,
        })
      }
    }
  })

  return headings
}

/**
 * Scan document statistics (words, characters, paragraphs, headings, tables, images)
 */
export function scanDocxStats(docXml: XMLDocument, zip: JSZip): DocxStats {
  const paragraphs = docXml.getElementsByTagName('w:p')
  const tables = docXml.getElementsByTagName('w:tbl')
  const textNodes = Array.from(docXml.querySelectorAll('w\\:t, t'))
  const fullText = textNodes.map((t) => t.textContent || '').join(' ')

  const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0
  const characters = fullText.length
  const headings = scanDocxHeadings(docXml).length

  // Count images in media folder
  let imageCount = 0
  zip.folder('word/media')?.forEach(() => {
    imageCount++
  })

  return {
    words,
    characters,
    paragraphs: paragraphs.length,
    headings,
    images: imageCount,
    tables: tables.length,
  }
}

/**
 * Inspect document metadata from docProps/core.xml
 */
export async function getDocxMetadata(zip: JSZip): Promise<DocxMetadata> {
  const coreFile = zip.file('docProps/core.xml')
  if (!coreFile) return {}

  try {
    const xmlText = await coreFile.async('text')
    const parser = new DOMParser()
    const xml = parser.parseFromString(xmlText, 'application/xml')

    const getVal = (tag: string) => xml.querySelector(tag)?.textContent?.trim() || undefined

    return {
      title: getVal('dc\\:title') || getVal('title'),
      creator: getVal('dc\\:creator') || getVal('creator'),
      lastModifiedBy: getVal('cp\\:lastModifiedBy') || getVal('lastModifiedBy'),
      revision: getVal('cp\\:revision') || getVal('revision'),
      created: getVal('dcterms\\:created') || getVal('created'),
      modified: getVal('dcterms\\:modified') || getVal('modified'),
    }
  } catch {
    return {}
  }
}

/**
 * Strip metadata for privacy
 */
export function cleanDocxMetadata(zip: JSZip): void {
  const cleanCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Document</dc:title>
  <dc:creator>Anonymous</dc:creator>
  <cp:lastModifiedBy>Anonymous</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
</cp:coreProperties>`
  zip.file('docProps/core.xml', cleanCoreXml)
}

/**
 * CORE ALL-IN-ONE FIXER ENGINE
 * Performs AST and XML transformations on the document
 */
export async function applyWordFixer(
  buffer: ArrayBuffer,
  options: FixerOptions
): Promise<{ blob: Blob; url: string; headings: HeadingItem[]; stats: DocxStats }> {
  const { zip, docXml } = await loadDocxZip(buffer)
  const body = docXml.getElementsByTagName('w:body')[0]
  if (!body) {
    throw new Error('word/document.xml does not contain a valid w:body.')
  }

  const headings = scanDocxHeadings(docXml)

  // 1. Table of Contents (TOC) Engine
  if (options.generateToc && headings.length > 0) {
    const maxDepth = options.tocDepth || 3
    const filteredHeadings = headings.filter((h) => h.level <= maxDepth)

    if (filteredHeadings.length > 0) {
      // Create TOC container paragraph
      const tocTitleP = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:p')
      const tocTitlePPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:pPr')
      const tocTitlePStyle = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:pStyle')
      tocTitlePStyle.setAttribute('w:val', 'Heading1')
      tocTitlePPr.appendChild(tocTitlePStyle)
      tocTitleP.appendChild(tocTitlePPr)

      const tocTitleRun = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r')
      const tocTitleRPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:rPr')
      const tocTitleB = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:b')
      tocTitleRPr.appendChild(tocTitleB)
      tocTitleRun.appendChild(tocTitleRPr)
      const tocTitleText = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:t')
      tocTitleText.textContent = options.tocTitle || 'Table of Contents'
      tocTitleRun.appendChild(tocTitleText)
      tocTitleP.appendChild(tocTitleRun)

      // Insert TOC Title at the very start of the body
      body.insertBefore(tocTitleP, body.firstChild)

      // Generate TOC entry paragraphs with dot leaders
      let currentAnchor = tocTitleP.nextSibling
      filteredHeadings.forEach((h) => {
        const entryP = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:p')
        const entryPPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:pPr')

        // Indent based on depth
        if (h.level > 1) {
          const ind = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:ind')
          ind.setAttribute('w:left', String((h.level - 1) * 360))
          entryPPr.appendChild(ind)
        }
        entryP.appendChild(entryPPr)

        // Text run
        const textRun = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r')
        const entryText = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:t')
        entryText.setAttribute('xml:space', 'preserve')
        entryText.textContent = `${h.text} `
        textRun.appendChild(entryText)
        entryP.appendChild(textRun)

        // Dot leader run
        const dotsRun = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r')
        const dotsRPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:rPr')
        const dotsColor = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:color')
        dotsColor.setAttribute('w:val', '94A3B8')
        dotsRPr.appendChild(dotsColor)
        dotsRun.appendChild(dotsRPr)
        const dotsText = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:t')
        dotsText.setAttribute('xml:space', 'preserve')
        dotsText.textContent = ' ................................................................ '
        dotsRun.appendChild(dotsText)
        entryP.appendChild(dotsRun)

        // Page number placeholder
        const pageRun = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r')
        const pageRPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:rPr')
        const pageB = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:b')
        pageRPr.appendChild(pageB)
        pageRun.appendChild(pageRPr)
        const pageText = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:t')
        // Page estimation based on paragraph position
        const estPage = Math.max(1, Math.ceil((h.paragraphIndex + 1) / 8))
        pageText.textContent = String(estPage)
        pageRun.appendChild(pageText)
        entryP.appendChild(pageRun)

        body.insertBefore(entryP, currentAnchor)
      })

      // Add a page break after TOC
      const breakP = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:p')
      const breakR = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r')
      const br = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:br')
      br.setAttribute('w:type', 'page')
      breakR.appendChild(br)
      breakP.appendChild(breakR)
      body.insertBefore(breakP, currentAnchor)
    }
  }

  // 2. Global Line Spacing & Paragraph Formatter
  const lineSpacingValues: Record<string, string> = {
    '1.0': '240',
    '1.15': '276',
    '1.5': '360',
    '2.0': '480',
  }

  const targetLineVal = options.lineSpacing && options.lineSpacing !== 'keep' ? lineSpacingValues[options.lineSpacing] : null
  const paragraphs = Array.from(docXml.getElementsByTagName('w:p'))

  for (const p of paragraphs) {
    // Blank paragraph removal
    if (options.removeBlankParagraphs) {
      const texts = Array.from(p.querySelectorAll('w\\:t, t'))
      const isEmpty = texts.every((t) => !t.textContent || t.textContent.trim().length === 0)
      const hasDrawing = !!p.querySelector('w\\:drawing, drawing, w\\:pict, pict')
      const hasTable = !!p.querySelector('w\\:tbl, tbl')

      if (isEmpty && !hasDrawing && !hasTable) {
        p.parentNode?.removeChild(p)
        continue
      }
    }

    // Ensure pPr
    let pPr = p.querySelector('w\\:pPr, pPr')
    if (!pPr && (targetLineVal || options.normalizeParagraphSpacing)) {
      pPr = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:pPr')
      p.insertBefore(pPr, p.firstChild)
    }

    if (pPr) {
      // Apply Line Spacing
      let spacing = pPr.querySelector('w\\:spacing, spacing')
      if (targetLineVal) {
        if (!spacing) {
          spacing = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:spacing')
          pPr.appendChild(spacing)
        }
        spacing.setAttribute('w:line', targetLineVal)
        spacing.setAttribute('w:lineRule', 'auto')
      }

      // Normalize paragraph before/after spacing
      if (options.normalizeParagraphSpacing) {
        if (!spacing) {
          spacing = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:spacing')
          pPr.appendChild(spacing)
        }
        spacing.setAttribute('w:before', '0')
        spacing.setAttribute('w:after', '160') // 8pt
      }
    }

    // 3. Double spaces remover in text nodes
    if (options.removeDoubleSpaces) {
      const textNodes = Array.from(p.querySelectorAll('w\\:t, t'))
      for (const t of textNodes) {
        if (t.textContent && t.textContent.includes('  ')) {
          t.textContent = t.textContent.replace(/ {2,}/g, ' ')
        }
      }
    }
  }

  // 4. Page Numbers, Headers & Footers
  // Inject / update footer1.xml in zip for Page Numbers & Footers
  if (options.addPageNumbers || options.footerText || options.classificationStamp) {
    const jcMap: Record<string, string> = {
      'bottom-left': 'left',
      'bottom-center': 'center',
      'bottom-right': 'right',
      'top-left': 'left',
      'top-center': 'center',
      'top-right': 'right',
    }
    const align = jcMap[options.pageNumberPosition || 'bottom-center'] || 'center'
    const isRoman = options.pageNumberFormat === 'roman'
    const isPageOfPages = options.pageNumberFormat === 'page-of-pages'

    const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="${align}"/>
    </w:pPr>
    ${
      options.footerText
        ? `<w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">${options.footerText}  |  </w:t></w:r>`
        : ''
    }
    ${
      options.classificationStamp
        ? `<w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="1E40AF"/></w:rPr><w:t xml:space="preserve">[${options.classificationStamp}]  </w:t></w:r>`
        : ''
    }
    ${
      options.addPageNumbers
        ? isPageOfPages
          ? `<w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">Page </w:t></w:r>
             <w:fldSimple w:instr="PAGE"/>
             <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve"> of </w:t></w:r>
             <w:fldSimple w:instr="NUMPAGES"/>`
          : isRoman
            ? `<w:fldSimple w:instr="PAGE \\* Roman"/>`
            : `<w:fldSimple w:instr="PAGE"/>`
        : ''
    }
  </w:p>
</w:ftr>`

    zip.file('word/footer1.xml', footerXml)

    // Ensure relationships in word/_rels/document.xml.rels
    let relsXml = (await zip.file('word/_rels/document.xml.rels')?.async('text')) || ''
    if (!relsXml.includes('footer1.xml')) {
      relsXml = relsXml.replace(
        '</Relationships>',
        `<Relationship Id="rIdFtr1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`
      )
      zip.file('word/_rels/document.xml.rels', relsXml)
    }

    // Link footer in sectPr
    const sectPr = docXml.querySelector('w\\:sectPr, sectPr')
    if (sectPr) {
      if (!sectPr.querySelector('w\\:footerReference[w\\:type="default"], footerReference[type="default"]')) {
        const ftrRef = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:footerReference')
        ftrRef.setAttribute('w:type', 'default')
        ftrRef.setAttribute('r:id', 'rIdFtr1')
        sectPr.appendChild(ftrRef)
      }
      if (options.differentFirstPage) {
        if (!sectPr.querySelector('w\\:titlePg, titlePg')) {
          const titlePg = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:titlePg')
          sectPr.appendChild(titlePg)
        }
      }
    }
  }

  // 5. Header Controller
  if (options.headerText || options.classificationStamp) {
    const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="right"/>
    </w:pPr>
    ${
      options.classificationStamp
        ? `<w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="DC2626"/></w:rPr><w:t xml:space="preserve">[${options.classificationStamp}]  </w:t></w:r>`
        : ''
    }
    ${
      options.headerText
        ? `<w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">${options.headerText}</w:t></w:r>`
        : ''
    }
  </w:p>
</w:hdr>`

    zip.file('word/header1.xml', headerXml)

    let relsXml = (await zip.file('word/_rels/document.xml.rels')?.async('text')) || ''
    if (!relsXml.includes('header1.xml')) {
      relsXml = relsXml.replace(
        '</Relationships>',
        `<Relationship Id="rIdHdr1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>`
      )
      zip.file('word/_rels/document.xml.rels', relsXml)
    }

    const sectPr = docXml.querySelector('w\\:sectPr, sectPr')
    if (sectPr && !sectPr.querySelector('w\\:headerReference[w\\:type="default"], headerReference[type="default"]')) {
      const hdrRef = docXml.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:headerReference')
      hdrRef.setAttribute('w:type', 'default')
      hdrRef.setAttribute('r:id', 'rIdHdr1')
      sectPr.appendChild(hdrRef)
    }
  }

  // 6. Clean metadata if enabled
  if (options.cleanMetadata) {
    cleanDocxMetadata(zip)
  }

  // Serialize modified document.xml back into zip
  const serializer = new XMLSerializer()
  const modifiedXml = serializer.serializeToString(docXml)
  zip.file('word/document.xml', modifiedXml)

  // Generate output blob
  const outBytes = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const ab = outBytes.buffer.slice(outBytes.byteOffset, outBytes.byteOffset + outBytes.byteLength) as ArrayBuffer
  const blob = new Blob([ab], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const url = registerDocxUrl(URL.createObjectURL(blob))
  const finalStats = scanDocxStats(docXml, zip)

  return { blob, url, headings, stats: finalStats }
}

/**
 * Generate starter template documents using `docx` library
 */
export async function createStarterDocx(
  templateType: 'academic' | 'executive' | 'resume' | 'blank'
): Promise<Blob> {
  const children: Paragraph[] = []

  if (templateType === 'academic') {
    children.push(
      new Paragraph({
        text: 'Title of Academic Research Paper',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: 'Author Name | Department of Computer Science | University Name',
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Abstract',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'This paper investigates automated document processing pipelines directly inside modern client-side browser engines. By removing server upload bottlenecks, users achieve 100% data privacy and instant turnaround times.',
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: '1. Introduction',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Modern document management demands robust client-side capabilities. Standard word processors require complex installations, whereas lightweight browser engines offer zero-friction editing.',
      }),
      new Paragraph({
        text: '1.1 System Architecture',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: 'The architecture parses OpenXML documents using DOM tree traversal, applying typography corrections and generating dynamic Table of Contents with precise dot-leader alignments.',
      }),
      new Paragraph({
        text: '2. Conclusion',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Client-side processing preserves full document fidelity while eliminating remote server privacy liabilities.',
      })
    )
  } else if (templateType === 'executive') {
    children.push(
      new Paragraph({
        text: 'Executive Business Report',
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({
        text: 'CONFIDENTIAL & PROPRIETARY — PREPARED FOR EXECUTIVE BOARD',
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Executive Summary',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'This quarterly report summarizes strategic operational milestones, resource allocation efficiencies, and next-generation workflow automation targets.',
      }),
      new Paragraph({
        text: 'Key Performance Indicators (KPIs)',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Operational turnaround speed improved by 42% following the deployment of client-side browser document processing suites.',
      }),
      new Paragraph({
        text: 'Next Quarter Roadmap',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Scale browser-based document automation across all enterprise operational teams.',
      })
    )
  } else if (templateType === 'resume') {
    children.push(
      new Paragraph({
        text: 'Alex Morgan',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: 'Senior Software Architect | San Francisco, CA | alex.morgan@example.com | (555) 019-2834',
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        text: 'Professional Summary',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Results-driven software architect with 8+ years of expertise in client-side high-performance web systems, document rendering engines, and scalable distributed architectures.',
      }),
      new Paragraph({
        text: 'Core Competencies',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: '• Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Web Workers\n• Systems: OpenXML DOCX, PDF Engines, Memory Safety, Canvas API\n• Leadership: Team Mentorship, Agile Execution, Zero-Regression Architecture',
      }),
      new Paragraph({
        text: 'Professional Experience',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Lead Document Systems Engineer — Tech Innovations Inc. (2022 - Present)',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: 'Architected browser-based document fixer processing over 100k files monthly with 0 server uploads.',
      })
    )
  } else {
    children.push(
      new Paragraph({
        text: 'Untitled Document',
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({
        text: 'Start typing your document or use the All-in-One MS Word Document Fixer to format and polish your text.',
      })
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  return buffer
}
