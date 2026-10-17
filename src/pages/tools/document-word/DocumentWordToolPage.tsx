import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Download,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  Eye,
  RefreshCw,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import Dropzone, { FileChip } from '../../../components/ui/Dropzone'
import NotFoundPage from '../../NotFoundPage'
import {
  getDocxToolItem,
  DOC_ICON_MAP,
} from '../../document-word/documentWordConfig'
import {
  loadDocxZip,
  scanDocxStats,
  getDocxMetadata,
  applyWordFixer,
  renderDocxToHtml,
  extractDocxRawText,
  createStarterDocx,
  registerDocxUrl,
  revokeAllDocxUrls,
  type DocxStats,
  type DocxMetadata,
} from '../../document-word/engine/docxEngine'

export default function DocumentWordToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const item = toolSlug ? getDocxToolItem(toolSlug) : undefined

  const [file, setFile] = useState<File | null>(null)
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [extractedText, setExtractedText] = useState<string>('')
  const [stats, setStats] = useState<DocxStats | null>(null)
  const [metadata, setMetadata] = useState<DocxMetadata | null>(null)

  // Download Output
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState<string>('processed.docx')
  const [copied, setCopied] = useState(false)

  // Dynamic Parameter Inputs
  const [selectedFont, setSelectedFont] = useState('Times New Roman')
  const [selectedSpacing, setSelectedSpacing] = useState('1.5')
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [customHeader, setCustomHeader] = useState('')
  const [customFooter, setCustomFooter] = useState('')
  const [customStamp, setCustomStamp] = useState('')

  useEffect(() => {
    return () => {
      revokeAllDocxUrls()
    }
  }, [])

  // Reset states on tool switch
  useEffect(() => {
    setFile(null)
    setArrayBuffer(null)
    setError(null)
    setSuccess(null)
    setDownloadUrl(null)
    setPreviewHtml('')
    setExtractedText('')
    setStats(null)
    setMetadata(null)
  }, [toolSlug])

  const analyzeBuffer = useCallback(async (buffer: ArrayBuffer, fileName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { zip, docXml } = await loadDocxZip(buffer)
      const st = scanDocxStats(docXml, zip)
      const meta = await getDocxMetadata(zip)
      const prev = await renderDocxToHtml(buffer)
      const raw = await extractDocxRawText(buffer)

      setStats(st)
      setMetadata(meta)
      setPreviewHtml(prev.html)
      setExtractedText(raw)
      setDownloadName(`processed-${fileName}`)
    } catch (err: any) {
      setError(err.message || 'Failed to inspect DOCX file.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const picked = incoming[0]
      if (!picked) return
      if (!picked.name.toLowerCase().endsWith('.docx')) {
        setError('Please upload a valid .docx file.')
        return
      }
      setFile(picked)
      const buf = await picked.arrayBuffer()
      setArrayBuffer(buf)
      await analyzeBuffer(buf, picked.name)
    },
    [analyzeBuffer]
  )

  const handleTemplateGenerate = async (type: 'academic' | 'executive' | 'resume') => {
    setLoading(true)
    setError(null)
    try {
      const blob = await createStarterDocx(type)
      const generatedFile = new File([blob], `${type}-template.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      setFile(generatedFile)
      const buf = await blob.arrayBuffer()
      setArrayBuffer(buf)
      await analyzeBuffer(buf, generatedFile.name)
      const url = registerDocxUrl(URL.createObjectURL(blob))
      setDownloadUrl(url)
      setDownloadName(generatedFile.name)
      setSuccess(`Generated ${type} template successfully! Click download below.`)
    } catch (err: any) {
      setError(err.message || 'Failed to generate template.')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!arrayBuffer) {
      setError('Please upload a document to proceed.')
      return
    }
    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const op = item?.op || ''
      const options: any = {
        removeBlankParagraphs: true,
        removeDoubleSpaces: true,
      }

      if (op === 'line-spacing' || op === 'quick-normalizer' || op === 'apa-format') {
        options.lineSpacing = selectedSpacing as any
        options.normalizeParagraphSpacing = true
      }
      if (op === 'apa-format') {
        options.lineSpacing = '2.0'
        options.addPageNumbers = true
        options.pageNumberPosition = 'top-right'
        options.differentFirstPage = false
        options.headerText = customHeader || 'RUNNING HEAD'
      }
      if (op === 'mla-format') {
        options.lineSpacing = '2.0'
        options.addPageNumbers = true
        options.pageNumberPosition = 'top-right'
        options.headerText = customHeader || 'Author 1'
      }
      if (op === 'toc-generate' || op === 'all-in-one-fixer') {
        options.generateToc = true
        options.tocDepth = 3
      }
      if (op === 'header-footer') {
        options.headerText = customHeader
        options.footerText = customFooter
        options.classificationStamp = customStamp
      }
      if (op === 'page-numbers') {
        options.addPageNumbers = true
        options.pageNumberPosition = 'bottom-center'
      }
      if (op === 'clean-metadata') {
        options.cleanMetadata = true
      }

      const res = await applyWordFixer(arrayBuffer, options)
      setDownloadUrl(res.url)
      setStats(res.stats)

      // Refresh preview
      const previewBuf = await res.blob.arrayBuffer()
      const updatedPreview = await renderDocxToHtml(previewBuf)
      setPreviewHtml(updatedPreview.html)

      setSuccess('Processing complete! Processed document is ready for download.')
    } catch (err: any) {
      setError(err.message || 'An error occurred during processing.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!item) {
    return <NotFoundPage />
  }

  const IconComp = DOC_ICON_MAP[item.icon] || FileText
  const isTemplateTool = item.op.startsWith('gen-')
  const isExportTool = item.op.startsWith('docx-to-')

  return (
    <>
      <Seo
        title={`${item.name} - Free In-Browser Word Tool | Vimz.ai`}
        description={item.blurb}
      />

      <ToolShell
        title={item.name}
        description={item.blurb}
        icon={<IconComp className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        breadcrumb={`MS Word & Document Suite > ${item.sub} > ${item.name}`}
        instruction={`Execute ${item.name} 100% in your browser with zero remote file uploads.`}
        tipsTitle="Word Automation Tip"
        guideTips={[
          'All document parsing and generation occurs directly in browser memory without sending data to servers.',
          'Always review the live preview below to confirm formatting changes before downloading your finalized .docx.',
          'For complete document standardization, visit the All-in-One MS Word Document Fixer in the Document Editor category.',
        ]}
        guideSteps={[
          {
            title: '1. Select Document or Template',
            text: 'Upload your .docx file or generate a fresh starter template with one click.',
          },
          {
            title: '2. Fine-tune Parameters',
            text: 'Adjust tool-specific formatting controls, styles, or options.',
          },
          {
            title: '3. Instant Download',
            text: 'Download your processed document or copy exported text with a single click.',
          },
        ]}
      >
        <div className="space-y-6">
          {/* Main Action Frame */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
            {/* Header / Mode Indicator */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {item.sub} Module
              </span>
              <Link
                to="/tools/document-word"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Back to All Word Tools
              </Link>
            </div>

            {/* Template Generator Quick Action if applicable */}
            {isTemplateTool ? (
              <div className="rounded-xl border border-blue-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-800/80">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Generate Fresh {item.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Create a structured, pre-formatted Microsoft Word (.docx) starter document instantly.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleTemplateGenerate(
                        item.op === 'gen-academic-template'
                          ? 'academic'
                          : item.op === 'gen-executive-template'
                            ? 'executive'
                            : 'resume'
                      )
                    }
                    disabled={loading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate & Download {item.name}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Dropzone
                  onFiles={handleFiles}
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  label="Drag & drop your Word (.docx) file here to run tool"
                />

                {file && (
                  <div className="mt-3 space-y-2">
                    <FileChip
                      file={file}
                      onRemove={() => {
                        setFile(null)
                        setArrayBuffer(null)
                        setStats(null)
                        setMetadata(null)
                      }}
                    />
                    {stats && (
                      <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {stats.words.toLocaleString()} words
                        </span>
                        <span>·</span>
                        <span>{stats.characters.toLocaleString()} chars</span>
                        <span>·</span>
                        <span>{stats.paragraphs} paragraphs</span>
                        {metadata?.title && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-xs">Title: {metadata.title}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tool Specific Parameter Controls */}
            {arrayBuffer && (
              <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tool Parameters & Options
                </h4>

                {/* Font Changer Parameters */}
                {item.op === 'font-change' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target Font Family
                    </label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Times New Roman">Times New Roman (Academic)</option>
                      <option value="Calibri">Calibri (Standard Word)</option>
                      <option value="Arial">Arial (Clean Sans-Serif)</option>
                      <option value="Aptos">Aptos (Modern Office 365)</option>
                      <option value="Georgia">Georgia (Editorial Serif)</option>
                    </select>
                  </div>
                )}

                {/* Line Spacing Parameters */}
                {(item.op === 'line-spacing' || item.op === 'quick-normalizer') && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Line Spacing Preset
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {['1.0', '1.15', '1.5', '2.0'].map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setSelectedSpacing(sp)}
                          className={`rounded-xl border py-2 text-xs font-bold transition ${
                            selectedSpacing === sp
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {sp} Spacing
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Header & Footer Parameters */}
                {item.op === 'header-footer' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Header Text</label>
                      <input
                        type="text"
                        value={customHeader}
                        onChange={(e) => setCustomHeader(e.target.value)}
                        placeholder="Document Title"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Footer Text</label>
                      <input
                        type="text"
                        value={customFooter}
                        onChange={(e) => setCustomFooter(e.target.value)}
                        placeholder="Author or Company"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Classification</label>
                      <select
                        value={customStamp}
                        onChange={(e) => setCustomStamp(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="">None</option>
                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="INTERNAL">INTERNAL ONLY</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Find & Replace Parameters */}
                {item.op === 'find-replace' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Find Word / Term</label>
                      <input
                        type="text"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        placeholder="Text to locate..."
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Replace With</label>
                      <input
                        type="text"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        placeholder="Replacement text..."
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={processing}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Execute {item.name}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success & Download CTA */}
            {success && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={downloadName}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Section 2: Conversion / Text Output Display */}
          {isExportTool && extractedText && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Exported Content Result
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(extractedText)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Result'}
                </button>
              </div>
              <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100 dark:bg-slate-950">
                {extractedText}
              </pre>
            </div>
          )}

          {/* Section 3: Live Preview Canvas */}
          {previewHtml && (
            <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Document Preview
                </span>
              </div>
              <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div
                  className="prose prose-sm prose-slate max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          )}
        </div>
      </ToolShell>
    </>
  )
}
