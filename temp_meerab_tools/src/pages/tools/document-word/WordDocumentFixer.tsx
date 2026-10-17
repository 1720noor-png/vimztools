import { useState, useCallback, useEffect } from 'react'
import {
  FileText,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  BookOpen,
  AlignLeft,
  Hash,
  PanelTop,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import Dropzone, { FileChip } from '../../../components/ui/Dropzone'
import {
  loadDocxZip,
  scanDocxHeadings,
  scanDocxStats,
  getDocxMetadata,
  applyWordFixer,
  renderDocxToHtml,
  createStarterDocx,
  revokeAllDocxUrls,
  type HeadingItem,
  type DocxStats,
  type DocxMetadata,
  type FixerOptions,
} from '../../document-word/engine/docxEngine'

export default function WordDocumentFixer() {
  const [file, setFile] = useState<File | null>(null)
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'toc' | 'spacing' | 'numbers' | 'header'>('toc')
  const [viewMode, setViewMode] = useState<'preview' | 'headings' | 'metadata'>('preview')

  // Stats & Metadata
  const [stats, setStats] = useState<DocxStats | null>(null)
  const [metadata, setMetadata] = useState<DocxMetadata | null>(null)
  const [headings, setHeadings] = useState<HeadingItem[]>([])

  // Download Output
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState<string>('repaired-document.docx')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Options State
  const [options, setOptions] = useState<FixerOptions>({
    generateToc: true,
    tocDepth: 3,
    tocTitle: 'Table of Contents',
    lineSpacing: '1.5',
    normalizeParagraphSpacing: true,
    removeBlankParagraphs: true,
    addPageNumbers: true,
    pageNumberPosition: 'bottom-center',
    pageNumberFormat: 'arabic',
    differentFirstPage: true,
    headerText: '',
    footerText: '',
    classificationStamp: '',
    excludeFirstPageHeader: true,
    removeDoubleSpaces: true,
    cleanMetadata: false,
  })

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      revokeAllDocxUrls()
    }
  }, [])

  // Analyze document when loaded
  const analyzeBuffer = useCallback(async (buffer: ArrayBuffer, fileName: string) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const { zip, docXml } = await loadDocxZip(buffer)
      const st = scanDocxStats(docXml, zip)
      const hd = scanDocxHeadings(docXml)
      const meta = await getDocxMetadata(zip)
      const preview = await renderDocxToHtml(buffer)

      setStats(st)
      setHeadings(hd)
      setMetadata(meta)
      setPreviewHtml(preview.html)
      setDownloadName(`fixed-${fileName.replace(/\.docx$/i, '')}.docx`)

      // Auto-set header text if metadata title exists
      if (meta.title) {
        setOptions((prev) => ({ ...prev, headerText: prev.headerText || meta.title || '' }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to inspect DOCX file. Ensure it is a valid Microsoft Word document.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle uploaded file
  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const picked = incoming[0]
      if (!picked) return
      if (!picked.name.toLowerCase().endsWith('.docx')) {
        setError('Please upload a valid .docx Microsoft Word file.')
        return
      }
      setFile(picked)
      const buf = await picked.arrayBuffer()
      setArrayBuffer(buf)
      await analyzeBuffer(buf, picked.name)
    },
    [analyzeBuffer]
  )

  // Load sample document for zero-friction testing
  const loadSampleDoc = async (type: 'academic' | 'executive') => {
    setLoading(true)
    try {
      const blob = await createStarterDocx(type)
      const sampleFile = new File([blob], `${type}-sample-document.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      setFile(sampleFile)
      const buf = await blob.arrayBuffer()
      setArrayBuffer(buf)
      await analyzeBuffer(buf, sampleFile.name)
    } catch (err: any) {
      setError(err.message || 'Failed to generate sample document.')
    } finally {
      setLoading(false)
    }
  }

  // Execute processing
  const handleProcess = async (customOptions?: Partial<FixerOptions>) => {
    if (!arrayBuffer) {
      setError('Please upload a .docx document first.')
      return
    }
    setProcessing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const activeOpts = { ...options, ...customOptions }
      const res = await applyWordFixer(arrayBuffer, activeOpts)

      setDownloadUrl(res.url)
      setHeadings(res.headings)
      setStats(res.stats)

      // Refresh live preview from the fixed buffer
      const previewBuf = await res.blob.arrayBuffer()
      const updatedPreview = await renderDocxToHtml(previewBuf)
      setPreviewHtml(updatedPreview.html)

      setSuccessMessage('Document successfully processed! Table of contents, typography, and page numbers synchronized.')
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the document.')
    } finally {
      setProcessing(false)
    }
  }

  // One-Click Quick Fix handler
  const handleQuickFix = () => {
    const quickOpts: FixerOptions = {
      generateToc: true,
      tocDepth: 3,
      tocTitle: 'Table of Contents',
      lineSpacing: '1.5',
      normalizeParagraphSpacing: true,
      removeBlankParagraphs: true,
      addPageNumbers: true,
      pageNumberPosition: 'bottom-center',
      pageNumberFormat: 'arabic',
      differentFirstPage: true,
      headerText: metadata?.title || 'Document',
      footerText: 'Confidential',
      classificationStamp: '',
      excludeFirstPageHeader: true,
      removeDoubleSpaces: true,
      cleanMetadata: false,
    }
    setOptions(quickOpts)
    handleProcess(quickOpts)
  }

  return (
    <>
      <Seo
        title="All-in-One MS Word Document Fixer - Free In-Browser Suite | Vimz.ai"
        description="Automated Table of Contents, line spacing (1.0/1.15/1.5/2.0), paragraph normalization, page numbering, and header/footer configuration for Word (.docx) documents."
      />

      <ToolShell
        title="All-in-One MS Word Document Fixer"
        description="Fix formatting, generate dynamic Table of Contents with dot-leaders, adjust global line spacing, configure page numbers, and manage headers & footers entirely in your browser."
        icon={<Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        breadcrumb="MS Word & Document Suite > Document Editor > All-in-One MS Word Document Fixer"
        instruction="Upload your .docx file to inspect headings, spacing, and page layout. Use the One-Click Quick Fix or fine-tune specific modules below."
        tipsTitle="Word Document Pro Tips"
        guideTips={[
          'Word Table of Contents requires paragraphs formatted with standard Heading 1, 2, or 3 styles to index accurately.',
          'Selecting 1.5 line spacing and 8pt paragraph after-spacing provides standard academic and business typography.',
          'The Different First Page option prevents header and page number overlays from cluttering your cover/title page.',
        ]}
        guideSteps={[
          {
            title: '1. Upload DOCX Document',
            text: 'Drop your Word .docx file into the secure workspace. Data remains 100% on your device with zero server uploads.',
          },
          {
            title: '2. Select Tools or 1-Click Quick Fix',
            text: 'Configure the Table of Contents, line spacing, page numbers, and header stamps, or click "One-Click Quick Fix".',
          },
          {
            title: '3. Instant Download',
            text: 'Download the finalized, fully compliant .docx document ready for submission, printing, or client presentation.',
          },
        ]}
      >
        <div className="space-y-6">
          {/* Top Word Navy Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 to-indigo-950 p-4 text-white shadow-md dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">MS Word Engine Controller</h3>
                <p className="text-xs text-blue-200">
                  {file ? file.name : 'No document loaded. Upload a .docx file or load a sample.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuickFix}
                disabled={!arrayBuffer || processing || loading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                One-Click Quick Fix
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Processed DOCX
                </a>
              )}
            </div>
          </div>

          {/* Section 1: Dropzone & Stats Cards */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                1. Document Input & Inspection
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleDoc('academic')}
                  className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Load Academic Sample
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => loadSampleDoc('executive')}
                  className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Load Executive Sample
                </button>
              </div>
            </div>

            <Dropzone
              onFiles={handleFiles}
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              label="Drag & drop your Microsoft Word (.docx) file here, or click to browse"
            />

            {file && (
              <div className="mt-3">
                <FileChip file={file} onRemove={() => { setFile(null); setArrayBuffer(null); setStats(null); }} />
              </div>
            )}

            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing document structure, extracting styles, and generating preview...
              </div>
            )}

            {/* Document Metrics Grid */}
            {stats && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Words</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.words.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Characters</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.characters.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Headings</div>
                  <div className="mt-0.5 text-base font-bold text-blue-600 dark:text-blue-400">
                    {stats.headings}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Paragraphs</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.paragraphs}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tables</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.tables}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Images</div>
                  <div className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.images}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: 4-Core Modular Fixer Tabs */}
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                2. Fixer Configuration Modules
              </span>

              {/* Module Switcher Buttons */}
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('toc')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'toc'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Table of Contents
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('spacing')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'spacing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                  Line & Spacing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('numbers')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'numbers'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" />
                  Page Numbers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('header')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'header'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <PanelTop className="h-3.5 w-3.5" />
                  Header & Footer
                </button>
              </div>
            </div>

            {/* Tab 1: Table of Contents (TOC) Engine */}
            {activeTab === 'toc' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 dark:bg-blue-950/20">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Automated Table of Contents (TOC)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-scan Heading 1, 2, and 3 tags and insert a styled dynamic TOC with dot-leaders.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={options.generateToc}
                      onChange={(e) => setOptions({ ...options, generateToc: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                  </label>
                </div>

                {options.generateToc && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        TOC Index Depth
                      </label>
                      <select
                        value={options.tocDepth}
                        onChange={(e) => setOptions({ ...options, tocDepth: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value={1}>Level 1 Only (Heading 1)</option>
                        <option value={2}>Levels 1 & 2 (Heading 1 - 2)</option>
                        <option value={3}>Levels 1, 2 & 3 (Heading 1 - 3)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        TOC Heading Title
                      </label>
                      <input
                        type="text"
                        value={options.tocTitle}
                        onChange={(e) => setOptions({ ...options, tocTitle: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Table of Contents"
                      />
                    </div>
                  </div>
                )}

                {/* Headings Detected Notification */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Detected Headings: {headings.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'headings' ? 'preview' : 'headings')}
                      className="cursor-pointer font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {viewMode === 'headings' ? 'Show Document Preview' : 'Inspect Heading Hierarchy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Line & Spacing Formatter */}
            {activeTab === 'spacing' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Global Document Line Spacing
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[
                      { val: '1.0', label: '1.0 Single' },
                      { val: '1.15', label: '1.15 Standard' },
                      { val: '1.5', label: '1.5 Recommended' },
                      { val: '2.0', label: '2.0 Double' },
                      { val: 'keep', label: 'Keep Existing' },
                    ].map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => setOptions({ ...options, lineSpacing: s.val as any })}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                          options.lineSpacing === s.val
                            ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={options.normalizeParagraphSpacing}
                      onChange={(e) =>
                        setOptions({ ...options, normalizeParagraphSpacing: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Standardize Paragraph Spacing (0pt Before / 8pt After)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={options.removeBlankParagraphs}
                      onChange={(e) =>
                        setOptions({ ...options, removeBlankParagraphs: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Remove Accidental Blank Paragraphs & Empty Lines
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={options.removeDoubleSpaces}
                      onChange={(e) => setOptions({ ...options, removeDoubleSpaces: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Purge Double Spaces between words (replace with single space)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Page Numbers Suite */}
            {activeTab === 'numbers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 dark:bg-blue-950/20">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Automated Page Numbering
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Inject dynamic field codes (PAGE / NUMPAGES) with custom position and format.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={options.addPageNumbers}
                      onChange={(e) => setOptions({ ...options, addPageNumbers: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                  </label>
                </div>

                {options.addPageNumbers && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Position & Alignment
                      </label>
                      <select
                        value={options.pageNumberPosition}
                        onChange={(e) =>
                          setOptions({ ...options, pageNumberPosition: e.target.value as any })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="bottom-center">Bottom Center (Standard)</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right (MLA/APA)</option>
                        <option value="top-center">Top Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Numbering Format
                      </label>
                      <select
                        value={options.pageNumberFormat}
                        onChange={(e) =>
                          setOptions({ ...options, pageNumberFormat: e.target.value as any })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="arabic">Arabic Numbers (1, 2, 3)</option>
                        <option value="page-of-pages">Dynamic "Page X of Y"</option>
                        <option value="roman">Lowercase Roman (i, ii, iii)</option>
                      </select>
                    </div>
                  </div>
                )}

                <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={options.differentFirstPage}
                    onChange={(e) => setOptions({ ...options, differentFirstPage: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Different First Page (keep Title/Cover Page unnumbered)
                  </span>
                </label>
              </div>
            )}

            {/* Tab 4: Headers & Footers Controller */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Header Text (Document Title / Running Head)
                    </label>
                    <input
                      type="text"
                      value={options.headerText}
                      onChange={(e) => setOptions({ ...options, headerText: e.target.value })}
                      placeholder="e.g. Research Paper Running Head"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Footer Text (Author / Organization)
                    </label>
                    <input
                      type="text"
                      value={options.footerText}
                      onChange={(e) => setOptions({ ...options, footerText: e.target.value })}
                      placeholder="e.g. Confidential · Prepared by Vimz.ai"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Classification / Watermark Stamp
                  </label>
                  <select
                    value={options.classificationStamp}
                    onChange={(e) => setOptions({ ...options, classificationStamp: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">None (Standard Document)</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="INTERNAL USE ONLY">INTERNAL USE ONLY</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="PRELIMINARY">PRELIMINARY</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={options.excludeFirstPageHeader}
                      onChange={(e) =>
                        setOptions({ ...options, excludeFirstPageHeader: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Exclude Header from Cover/First Page
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={options.cleanMetadata}
                      onChange={(e) => setOptions({ ...options, cleanMetadata: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Clean Personal Author Metadata from core.xml for Privacy
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleProcess()}
                disabled={!arrayBuffer || processing || loading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Apply Fixes & Re-build DOCX
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Download Processed DOCX
                </a>
              )}
            </div>

            {successMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                {error}
              </div>
            )}
          </div>

          {/* Section 3: Live Document Preview Canvas */}
          {arrayBuffer && (
            <div className="rounded-2xl border border-blue-100 bg-slate-100/70 p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-950">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Live Document Visual Viewport
                  </span>
                </div>

                <div className="flex gap-1.5 rounded-lg bg-white p-1 text-xs font-semibold shadow-2xs dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`rounded-md px-2.5 py-1 ${
                      viewMode === 'preview'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    HTML Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('headings')}
                    className={`rounded-md px-2.5 py-1 ${
                      viewMode === 'headings'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    Headings ({headings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('metadata')}
                    className={`rounded-md px-2.5 py-1 ${
                      viewMode === 'metadata'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    Metadata
                  </button>
                </div>
              </div>

              {/* Viewport Content */}
              {viewMode === 'preview' && (
                <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div
                    className="prose prose-sm prose-slate max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}

              {viewMode === 'headings' && (
                <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Document Heading Hierarchy (TOC Target Map)
                  </h4>
                  {headings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No headings detected with Heading 1, 2, or 3 styles.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {headings.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                          style={{ paddingLeft: `${(h.level - 1) * 24 + 12}px` }}
                        >
                          <span
                            className={`rounded-md px-1.5 py-0.5 font-bold ${
                              h.level === 1
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                                : h.level === 2
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            H{h.level}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'metadata' && (
                <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Document Metadata Properties (docProps/core.xml)
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="font-semibold text-slate-500">Title:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {metadata?.title || '[Not Specified]'}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="font-semibold text-slate-500">Author / Creator:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {metadata?.creator || '[Not Specified]'}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="font-semibold text-slate-500">Last Modified By:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {metadata?.lastModifiedBy || '[Not Specified]'}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="font-semibold text-slate-500">Revision Count:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {metadata?.revision || '1'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ToolShell>
    </>
  )
}
