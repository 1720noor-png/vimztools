import type { Tool } from '../../lib/catalog.ts'
import { pdfSpecsData } from './specs/pdfSpecsData.ts'
import {
  FileText,
  Layers,
  ShieldCheck,
  Search,
  PenTool,
  CheckSquare,
  Feather,
  Stamp,
  Eye,
  GitCompare,
  Wrench,
  Bookmark,
  Hash,
  Sparkles,
  Globe,
  Printer,
  Boxes,
  Info,
  Archive,
  Receipt,
  GraduationCap,
  CreditCard,
  Smartphone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface PdfSubcategory {
  id: string
  title: string
  icon: LucideIcon
  toolIds: string[]
}

export const PDF_ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Layers,
  ShieldCheck,
  Search,
  PenTool,
  CheckSquare,
  Feather,
  Stamp,
  Eye,
  GitCompare,
  Wrench,
  Bookmark,
  Hash,
  Sparkles,
  Globe,
  Printer,
  Boxes,
  Info,
  Archive,
  Receipt,
  GraduationCap,
  CreditCard,
  Smartphone,
}

export const PDF_SUBCATEGORIES: PdfSubcategory[] = [
  {
    id: "pdf-sub-01",
    title: "Core PDF Tools",
    icon: PDF_ICON_MAP["FileText"] || FileText,
    toolIds: [
    "image-to-pdf",
    "pdf-to-image",
    "pdf-merge-split",
    "pdf-compress",
    "word-to-pdf",
    "pdf-to-word",
    "pdf-to-text",
    "pdf-to-html",
    "pdf-to-csv",
    "pdf-to-webp",
    "pdf-to-svg",
    "pdf-to-pdfa",
    "html-to-pdf-converter",
    "text-to-pdf-converter",
    "markdown-to-pdf-tool",
    "epub-to-pdf-tool"
]
  },
  {
    id: "pdf-sub-02",
    title: "Advanced Page Management & Editing",
    icon: PDF_ICON_MAP["Layers"] || FileText,
    toolIds: [
    "pdf-split",
    "pdf-page-reorder",
    "pdf-page-crop",
    "delete-pdf-pages",
    "extract-selected-pages",
    "insert-pdf-pages",
    "add-blank-pdf-page",
    "duplicate-pdf-pages",
    "flip-pdf-pages",
    "pdf-page-size-changer",
    "pdf-page-margin-adjuster",
    "pdf-resize-pages",
    "pdf-landscape-portrait-converter",
    "pdf-poster-tiled-printing",
    "split-pdf-by-size-chunk"
]
  },
  {
    id: "pdf-sub-03",
    title: "Security & Privacy Utilities",
    icon: PDF_ICON_MAP["ShieldCheck"] || FileText,
    toolIds: [
    "pdf-password-protect",
    "pdf-password-remove",
    "pdf-redactor",
    "remove-pdf-restrictions",
    "change-pdf-password",
    "change-pdf-permissions",
    "remove-pdf-metadata",
    "pdf-sanitizer",
    "remove-hidden-data",
    "remove-embedded-files",
    "remove-javascript-from-pdf",
    "remove-annotations-sec",
    "pdf-privacy-checker"
]
  },
  {
    id: "pdf-sub-04",
    title: "Extraction & Smart Tools",
    icon: PDF_ICON_MAP["Search"] || FileText,
    toolIds: [
    "pdf-ocr",
    "pdf-table-extract",
    "extract-all-text-layer",
    "extract-document-metadata",
    "extract-images-from-pdf",
    "extract-embedded-fonts",
    "extract-file-attachments",
    "extract-all-links",
    "extract-email-addresses",
    "extract-phone-numbers",
    "extract-keywords-from-pdf",
    "extract-document-headings",
    "pdf-word-counter"
]
  },
  {
    id: "pdf-sub-05",
    title: "PDF Editing & Annotation",
    icon: PDF_ICON_MAP["PenTool"] || FileText,
    toolIds: [
    "add-text-to-pdf",
    "edit-existing-pdf-text",
    "pdf-highlighter-tool",
    "pdf-underline-tool",
    "strikethrough-pdf-tool",
    "add-shapes-to-pdf",
    "add-arrow-to-pdf",
    "add-sticky-notes-pdf",
    "pdf-comment-tool",
    "remove-annotations-edit",
    "pdf-freehand-drawing",
    "insert-floating-image-pdf"
]
  },
  {
    id: "pdf-sub-06",
    title: "PDF Forms",
    icon: PDF_ICON_MAP["CheckSquare"] || FileText,
    toolIds: [
    "pdf-form-fill",
    "create-fillable-pdf",
    "edit-pdf-form",
    "add-text-field-pdf",
    "add-checkbox-pdf",
    "add-radio-button-pdf",
    "add-dropdown-field-pdf",
    "add-signature-field-pdf",
    "remove-form-fields-pdf",
    "flatten-pdf-form",
    "extract-form-data-pdf",
    "reset-pdf-form"
]
  },
  {
    id: "pdf-sub-07",
    title: "PDF Signatures & E-Sign",
    icon: PDF_ICON_MAP["Feather"] || FileText,
    toolIds: [
    "sign-pdf-tool",
    "draw-signature-pdf",
    "type-signature-pdf",
    "signature-image-creator-pdf",
    "add-signature-to-pdf",
    "add-initials-to-pdf",
    "certificate-signature-pdf",
    "signature-verification-tool",
    "remove-signature-from-pdf",
    "digital-signature-audit"
]
  },
  {
    id: "pdf-sub-08",
    title: "Watermark, Stamp & Branding",
    icon: PDF_ICON_MAP["Stamp"] || FileText,
    toolIds: [
    "pdf-watermark",
    "pdf-page-numberer",
    "watermark-remover-tool",
    "opacity-watermark-adjuster",
    "rotate-watermark-angle",
    "positioned-watermark-tool",
    "image-watermark-stamper",
    "pdf-official-stamps",
    "custom-text-stamper",
    "batch-pdf-branding-tool"
]
  },
  {
    id: "pdf-sub-09",
    title: "Page Numbering, Header & Footer",
    icon: PDF_ICON_MAP["Hash"] || FileText,
    toolIds: [
    "add-page-numbers-standard",
    "roman-numerals-numbering",
    "bates-numbering-system",
    "custom-format-numberer",
    "start-at-page-number",
    "numbering-position-tool",
    "add-running-header-pdf",
    "add-running-footer-pdf",
    "edit-headers-and-footers",
    "date-timestamp-footer",
    "legal-bates-stamper"
]
  },
  {
    id: "pdf-sub-10",
    title: "Bookmarks & Table of Contents",
    icon: PDF_ICON_MAP["Bookmark"] || FileText,
    toolIds: [
    "create-pdf-table-of-contents",
    "add-pdf-bookmark",
    "auto-bookmark-generator",
    "remove-pdf-bookmarks",
    "edit-bookmark-titles",
    "extract-all-bookmarks",
    "nested-bookmark-organizer",
    "chapter-bookmark-maker",
    "hyperlinked-table-of-contents",
    "bookmark-to-page-linker"
]
  },
  {
    id: "pdf-sub-11",
    title: "PDF Comparison & Inspection",
    icon: PDF_ICON_MAP["GitCompare"] || FileText,
    toolIds: [
    "compare-pdf-side-by-side",
    "pdf-text-diff-tool",
    "pdf-visual-diff-checker",
    "pdf-content-similarity-checker",
    "pdf-structure-inspector",
    "pdf-object-stream-inspector",
    "pdf-font-analyzer",
    "pdf-color-profile-analyzer",
    "pdf-dpi-checker",
    "pdf-file-info-inspector"
]
  },
  {
    id: "pdf-sub-12",
    title: "PDF Optimization & Repair",
    icon: PDF_ICON_MAP["Wrench"] || FileText,
    toolIds: [
    "pdf-optimizer-tool",
    "pdf-stream-compressor",
    "pdf-image-downsampler",
    "remove-unused-pdf-objects",
    "pdf-linearization-tool",
    "repair-corrupted-pdf",
    "pdf-syntax-validator",
    "pdf-health-diagnostic",
    "pdf-font-subsetter",
    "pdf-deduplication-engine"
]
  },
  {
    id: "pdf-sub-13",
    title: "PDF Accessibility & Standards",
    icon: PDF_ICON_MAP["CheckSquare"] || FileText,
    toolIds: [
    "wcag-accessibility-checker",
    "pdf-ua-accessibility-validator",
    "screen-reader-preview-pdf",
    "pdf-tag-tree-inspector",
    "alt-text-checker-pdf",
    "tab-order-accessibility-checker",
    "reading-order-editor",
    "document-language-tag-validator",
    "color-contrast-checker-pdf",
    "accessible-form-elements-auditor"
]
  },
  {
    id: "pdf-sub-14",
    title: "AI PDF Tools",
    icon: PDF_ICON_MAP["Sparkles"] || FileText,
    toolIds: [
    "pdf-ai-summarizer",
    "ai-pdf-key-points",
    "ai-pdf-qa-tool",
    "ai-pdf-chat",
    "ai-pdf-translator",
    "ai-pdf-rewriter",
    "ai-pdf-simplifier",
    "ai-pdf-outline-generator",
    "ai-study-notes-generator-pdf",
    "ai-flashcard-generator-pdf",
    "ai-quiz-generator-pdf",
    "ai-question-paper-generator-pdf",
    "ai-action-items-extractor",
    "ai-important-dates-extractor",
    "ai-important-names-extractor"
]
  },
  {
    id: "pdf-sub-15",
    title: "Web & URL to PDF",
    icon: PDF_ICON_MAP["Globe"] || FileText,
    toolIds: [
    "webpage-to-pdf",
    "website-screenshot-to-pdf",
    "web-article-to-pdf",
    "webpage-archive-pdf",
    "multiple-urls-to-pdf",
    "blog-post-to-pdf",
    "email-to-pdf-web",
    "rss-feed-to-pdf",
    "documentation-to-pdf",
    "social-post-to-pdf"
]
  },
  {
    id: "pdf-sub-16",
    title: "Print & Layout Tools",
    icon: PDF_ICON_MAP["Printer"] || FileText,
    toolIds: [
    "pdf-print-layout",
    "multiple-pages-per-sheet-print",
    "booklet-printing",
    "poster-printing",
    "print-margin-calculator-pdf",
    "a4-to-letter-converter",
    "custom-page-size-pdf",
    "two-sided-duplex-print-helper",
    "crop-marks-printer-tool",
    "foldable-brochure-maker"
]
  },
  {
    id: "pdf-sub-17",
    title: "Batch PDF Utilities",
    icon: PDF_ICON_MAP["Boxes"] || FileText,
    toolIds: [
    "batch-pdf-merge",
    "batch-pdf-compress",
    "batch-pdf-convert",
    "batch-pdf-rename",
    "batch-pdf-watermark",
    "batch-pdf-numbering",
    "batch-pdf-rotate",
    "batch-pdf-split",
    "batch-pdf-password-protect",
    "batch-pdf-unlock",
    "batch-pdf-ocr",
    "batch-pdf-metadata-cleaner",
    "batch-pdf-image-extraction"
]
  },
  {
    id: "pdf-sub-18",
    title: "PDF Metadata & Document Information",
    icon: PDF_ICON_MAP["Info"] || FileText,
    toolIds: [
    "pdf-metadata-viewer",
    "edit-pdf-metadata",
    "remove-pdf-metadata-doc",
    "document-properties-editor",
    "pdf-reading-statistics-tool",
    "pdf-font-list-inspector",
    "pdf-color-space-inspector",
    "pdf-version-compatibility-info",
    "pdf-page-geometry-inspector",
    "pdf-attachment-list-inspector"
]
  },
  {
    id: "pdf-sub-19",
    title: "Archival & Compliance",
    icon: PDF_ICON_MAP["Archive"] || FileText,
    toolIds: [
    "pdfa-archival-generator",
    "pdf-a-validator-archive",
    "pdf-version-converter-tool",
    "long-term-archive-pdf-creator",
    "embedded-font-archive-checker",
    "pdf-xmp-metadata-validator",
    "pdf-linearization-checker",
    "digital-preservation-audit",
    "iso-conformance-reporter",
    "archival-checksum-validator"
]
  },
  {
    id: "pdf-sub-20",
    title: "Invoice & Business PDF",
    icon: PDF_ICON_MAP["Receipt"] || FileText,
    toolIds: [
    "invoice-pdf-generator-tool",
    "quotation-pdf-generator",
    "receipt-pdf-generator",
    "purchase-order-pdf-generator",
    "delivery-note-pdf-generator",
    "business-letter-pdf-generator",
    "salary-slip-pdf-generator",
    "expense-report-pdf-generator",
    "commercial-contract-template",
    "meeting-minutes-pdf-generator"
]
  },
  {
    id: "pdf-sub-21",
    title: "Student & Academic PDF",
    icon: PDF_ICON_MAP["GraduationCap"] || FileText,
    toolIds: [
    "assignment-pdf-maker",
    "notes-to-pdf",
    "question-paper-pdf-generator",
    "answer-sheet-generator",
    "worksheet-pdf-generator",
    "study-planner-pdf",
    "flashcards-to-pdf",
    "certificate-generator-pdf",
    "student-id-pdf-generator",
    "research-paper-formatter",
    "thesis-cover-page-generator",
    "bibliography-pdf-generator"
]
  },
  {
    id: "pdf-sub-22",
    title: "ID & Document PDF",
    icon: PDF_ICON_MAP["CreditCard"] || FileText,
    toolIds: [
    "passport-size-photo-to-pdf",
    "cnic-id-card-to-pdf",
    "id-card-scanner-to-pdf",
    "document-scanner-to-pdf",
    "multiple-id-cards-on-one-page",
    "passport-document-pdf-maker",
    "visa-document-pdf-organizer",
    "document-checklist-pdf",
    "official-document-cover-generator",
    "driver-license-pdf-organizer"
]
  },
  {
    id: "pdf-sub-23",
    title: "Scanner & Camera PDF Utilities",
    icon: PDF_ICON_MAP["Smartphone"] || FileText,
    toolIds: [
    "camera-to-pdf",
    "multi-page-scanner",
    "receipt-scanner-to-pdf",
    "business-card-to-pdf",
    "document-deskew-tool",
    "scan-cleanup-tool",
    "scan-contrast-enhancer",
    "scan-background-cleaner",
    "scan-to-searchable-pdf",
    "book-page-split-scanner"
]
  },
]

// 244 clean deduplicated PDF catalog tools mapped cleanly into /tools/pdf/<id>
export const PDF_NEW_TOOLS: Tool[] = pdfSpecsData.map((spec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: 'pdf',
  category: 'PDF Utilities',
  description: spec.blurb,
  keywords: [spec.name, spec.sub, 'pdf', spec.op, 'document', 'convert'],
  path: '/tools/pdf/' + spec.id,
  icon: spec.icon,
  subcategory: spec.sub,
}))

export const PDF_PRESERVED_IDS = [
  "image-to-pdf",
  "pdf-to-image",
  "pdf-merge-split",
  "pdf-compress",
  "word-to-pdf",
  "pdf-to-word",
  "pdf-watermark",
  "pdf-split",
  "pdf-page-reorder",
  "pdf-page-numberer",
  "pdf-page-crop",
  "pdf-password-protect",
  "pdf-password-remove",
  "pdf-redactor",
  "pdf-ocr",
  "pdf-table-extract",
  "pdf-form-fill",
  "pdf-ai-summarizer"
]
export const PDF_TOTAL_TOOLS_COUNT = 262
