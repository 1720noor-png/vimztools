import type { Tool } from '../../lib/catalog'
import {
  FileEdit,
  Type,
  AlignLeft,
  ListOrdered,
  Layout,
  PanelTop,
  Hash,
  Palette,
  BookOpen,
  Table,
  Image,
  Square,
  Link2,
  Search,
  Scissors,
  Sparkles,
  GraduationCap,
  Quote,
  FileText,
  Tag,
  Calculator,
  Columns,
  Split,
  ShieldCheck,
  Download,
  FileCheck,
  CheckSquare,
  MessageSquare,
  History,
  BarChart2,
  Lock,
  Eye,
  Printer,
  Boxes,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface DocSubcategory {
  id: string
  title: string
  icon: LucideIcon
  description: string
  toolIds: string[]
}

export const DOC_ICON_MAP: Record<string, LucideIcon> = {
  FileEdit,
  Type,
  AlignLeft,
  ListOrdered,
  Layout,
  PanelTop,
  Hash,
  Palette,
  BookOpen,
  Table,
  Image,
  Square,
  Link2,
  Search,
  Scissors,
  Sparkles,
  GraduationCap,
  Quote,
  FileText,
  Tag,
  Calculator,
  Columns,
  Split,
  ShieldCheck,
  Download,
  FileCheck,
  CheckSquare,
  MessageSquare,
  History,
  BarChart2,
  Lock,
  Eye,
  Printer,
  Boxes,
  Zap,
}

export interface DocxToolItem {
  id: string
  name: string
  blurb: string
  sub: string
  icon: string
  op: string
  preset?: string
}

export const DOCUMENT_WORD_TOOL_ITEMS: DocxToolItem[] = [
  // 1. Document Editor
  {
    id: 'word-document-fixer',
    name: 'All-in-One MS Word Document Fixer',
    blurb: 'Flagship suite: Automated Table of Contents, line spacing, paragraph normalization, page numbering & header/footer controller.',
    sub: 'Document Editor',
    icon: 'Sparkles',
    op: 'all-in-one-fixer',
  },
  {
    id: 'docx-viewer-editor',
    name: 'Online DOCX Document Viewer & Editor',
    blurb: 'View, inspect and edit Microsoft Word documents directly in your browser without MS Office installation.',
    sub: 'Document Editor',
    icon: 'FileEdit',
    op: 'docx-editor',
  },
  {
    id: 'docx-auto-save-exporter',
    name: 'DOCX Draft Saver & Exporter',
    blurb: 'Recover, autosave drafts and export pristine .docx files with zero server storage.',
    sub: 'Document Editor',
    icon: 'Download',
    op: 'docx-export',
  },

  // 2. Font & Text Formatting
  {
    id: 'global-font-changer',
    name: 'Global Document Font Family Changer',
    blurb: 'Swap all document fonts to Times New Roman, Calibri, Arial, Aptos, or Georgia in a single click.',
    sub: 'Font & Text Formatting',
    icon: 'Type',
    op: 'font-change',
  },
  {
    id: 'font-size-scaler',
    name: 'Proportional Font Size Scaler',
    blurb: 'Scale document body and heading font sizes proportionally across all sections and pages.',
    sub: 'Font & Text Formatting',
    icon: 'Type',
    op: 'font-scale',
  },
  {
    id: 'text-case-converter-word',
    name: 'Title, Upper, Lower & Sentence Case Tool',
    blurb: 'Standardize text casing across document headings, paragraphs, and list items.',
    sub: 'Font & Text Formatting',
    icon: 'Type',
    op: 'case-convert',
  },
  {
    id: 'bold-italic-styler',
    name: 'Mass Bold & Italic Emphasis Styler',
    blurb: 'Clear or harmonize bold, italic, and underline formatting across inconsistent document sections.',
    sub: 'Font & Text Formatting',
    icon: 'Type',
    op: 'style-emphasis',
  },

  // 3. Paragraph Formatting
  {
    id: 'line-spacing-adjuster',
    name: 'Global Line Spacing Adjuster (1.0 / 1.15 / 1.5 / 2.0)',
    blurb: 'Set document line spacing to Single, 1.15, 1.5 or Double spacing without breaking tables or code blocks.',
    sub: 'Paragraph Formatting',
    icon: 'AlignLeft',
    op: 'line-spacing',
  },
  {
    id: 'paragraph-spacing-normalizer',
    name: 'Paragraph Spacing & Margin Normalizer',
    blurb: 'Standardize irregular before/after paragraph gaps to clean 0pt before and 8pt after spacing.',
    sub: 'Paragraph Formatting',
    icon: 'AlignLeft',
    op: 'paragraph-spacing',
  },
  {
    id: 'paragraph-indentation-styler',
    name: 'First-Line & Hanging Indent Formatter',
    blurb: 'Apply standard academic 0.5-inch first-line indents or reference list hanging indents globally.',
    sub: 'Paragraph Formatting',
    icon: 'AlignLeft',
    op: 'indentation',
  },
  {
    id: 'paragraph-alignment-tool',
    name: 'Mass Left, Center, Right, Justify Aligner',
    blurb: 'Align body text to Justified or Left-aligned while preserving centered titles and headings.',
    sub: 'Paragraph Formatting',
    icon: 'AlignLeft',
    op: 'alignment',
  },

  // 4. Bullets & Numbering
  {
    id: 'bullet-list-styler',
    name: 'Custom Bullet Point Creator & Styler',
    blurb: 'Harmonize bullet symbols (dots, checkmarks, arrows) and standardize tab indents across all lists.',
    sub: 'Bullets & Numbering',
    icon: 'ListOrdered',
    op: 'bullet-styler',
  },
  {
    id: 'multilevel-list-generator',
    name: 'Multilevel Outline & Numbering Generator',
    blurb: 'Build formal 1.0, 1.1, 1.1.1 multilevel outlines synchronized with document heading structures.',
    sub: 'Bullets & Numbering',
    icon: 'ListOrdered',
    op: 'multilevel-outline',
  },
  {
    id: 'list-renumbering-fixer',
    name: 'Corrupted List Numbering Sequencer',
    blurb: 'Fix broken list sequences that restart unexpectedly and re-chain numbered lists.',
    sub: 'Bullets & Numbering',
    icon: 'ListOrdered',
    op: 'list-renumber',
  },

  // 5. Page Layout
  {
    id: 'paper-size-converter-word',
    name: 'A4, US Letter & Legal Size Converter',
    blurb: 'Switch page geometry between A4, US Letter, and Legal with automatic margin compensation.',
    sub: 'Page Layout',
    icon: 'Layout',
    op: 'paper-size',
  },
  {
    id: 'document-margin-preset',
    name: 'Normal, Narrow, Wide & Custom Margin Preset',
    blurb: 'Set 1-inch Normal, 0.5-inch Narrow, or 2-inch Wide margins across the entire document.',
    sub: 'Page Layout',
    icon: 'Layout',
    op: 'margins',
  },
  {
    id: 'orientation-changer-word',
    name: 'Portrait & Landscape Orientation Changer',
    blurb: 'Switch orientation to Landscape for wide data tables or Portrait for standard reading.',
    sub: 'Page Layout',
    icon: 'Layout',
    op: 'orientation',
  },

  // 6. Headers & Footers
  {
    id: 'header-footer-manager',
    name: 'Header & Footer Master Controller',
    blurb: 'Insert titles, author details, dates, and classification stamps into document headers and footers.',
    sub: 'Headers & Footers',
    icon: 'PanelTop',
    op: 'header-footer',
  },
  {
    id: 'different-first-page-header',
    name: 'Unlink First Page Header/Footer Tool',
    blurb: 'Enable Different First Page to keep your cover page and title page free of headers and footers.',
    sub: 'Headers & Footers',
    icon: 'PanelTop',
    op: 'first-page-header',
  },
  {
    id: 'odd-even-header-styler',
    name: 'Independent Odd & Even Header Configurator',
    blurb: 'Configure book-style alternating headers for odd (chapter name) and even (book title) pages.',
    sub: 'Headers & Footers',
    icon: 'PanelTop',
    op: 'odd-even-header',
  },

  // 7. Page Numbers
  {
    id: 'page-number-inserter',
    name: 'Top/Bottom & Left/Center/Right Page Numberer',
    blurb: 'Insert dynamic automated page numbers with customizable position and alignment.',
    sub: 'Page Numbers',
    icon: 'Hash',
    op: 'page-numbers',
  },
  {
    id: 'roman-arabic-numbering',
    name: 'Roman (i, ii) & Arabic (1, 2) Section Numberer',
    blurb: 'Format preliminary pages in lowercase Roman numerals and body chapters in standard Arabic numbers.',
    sub: 'Page Numbers',
    icon: 'Hash',
    op: 'roman-arabic',
  },
  {
    id: 'page-x-of-y-styler',
    name: '“Page X of Y” Dynamic Footer Numberer',
    blurb: 'Add dynamic Page X of Y footer counters that update automatically as pages are added or removed.',
    sub: 'Page Numbers',
    icon: 'Hash',
    op: 'page-x-of-y',
  },

  // 8. Styles
  {
    id: 'heading-style-preset',
    name: 'Heading 1 to 6 Standard Hierarchy Styler',
    blurb: 'Enforce standard typographic sizing, weights, and color hierarchy on all document headings.',
    sub: 'Styles',
    icon: 'Palette',
    op: 'heading-hierarchy',
  },
  {
    id: 'academic-style-pack',
    name: 'APA & IEEE Heading & Typography Styler',
    blurb: 'Apply academic journal typography standards (Times 12pt, Title Case, bold center/left headings).',
    sub: 'Styles',
    icon: 'Palette',
    op: 'academic-styles',
  },
  {
    id: 'corporate-style-pack',
    name: 'Modern Business & Corporate Style Styler',
    blurb: 'Style documents with modern corporate fonts (Aptos / Calibri, Navy primary headings, clean line rules).',
    sub: 'Styles',
    icon: 'Palette',
    op: 'corporate-styles',
  },

  // 9. Table of Contents
  {
    id: 'toc-auto-generator',
    name: 'Auto Heading 1-3 Table of Contents Builder',
    blurb: 'Scan all document headings and generate a dynamic Table of Contents with precise dot leaders.',
    sub: 'Table of Contents',
    icon: 'BookOpen',
    op: 'toc-generate',
  },
  {
    id: 'toc-depth-customizer',
    name: 'Customizable TOC Depth & Dot Leader Styler',
    blurb: 'Choose whether TOC indexes up to Heading 1, 2, or 3, with customizable dot leader styling.',
    sub: 'Table of Contents',
    icon: 'BookOpen',
    op: 'toc-depth',
  },
  {
    id: 'toc-refresh-updater',
    name: 'Dynamic TOC Page Number Refresher',
    blurb: 'Recalculate and synchronize Table of Contents page numbers following document edits.',
    sub: 'Table of Contents',
    icon: 'BookOpen',
    op: 'toc-refresh',
  },

  // 10. Tables
  {
    id: 'table-cell-padding-styler',
    name: 'Table Cell Margin & Padding Adjuster',
    blurb: 'Increase or normalize cell padding and row heights across all embedded tables.',
    sub: 'Tables',
    icon: 'Table',
    op: 'table-padding',
  },
  {
    id: 'table-border-styler',
    name: 'Table Border, Gridline & Accent Styler',
    blurb: 'Apply clean borders, modern header row shading, and zebra stripes to tables.',
    sub: 'Tables',
    icon: 'Table',
    op: 'table-borders',
  },
  {
    id: 'table-autofit-tool',
    name: 'Auto-Fit Table to Window & Column Styler',
    blurb: 'Fix overflowing tables by auto-fitting widths to document margins and text columns.',
    sub: 'Tables',
    icon: 'Table',
    op: 'table-autofit',
  },

  // 11. Images & Pictures
  {
    id: 'docx-image-extractor',
    name: 'Extract All Embedded Images from DOCX',
    blurb: 'Extract all high-resolution embedded photos, diagrams, and figures into downloadable files.',
    sub: 'Images & Pictures',
    icon: 'Image',
    op: 'extract-images',
  },
  {
    id: 'image-alignment-wrapper',
    name: 'Inline & Center Image Alignment Styler',
    blurb: 'Center-align embedded illustrations and configure inline text wrapping margins.',
    sub: 'Images & Pictures',
    icon: 'Image',
    op: 'image-align',
  },
  {
    id: 'docx-image-compressor',
    name: 'Image Resolution & Size Optimizer for DOCX',
    blurb: 'Optimize embedded image sizes to reduce bulky .docx document file size by up to 70%.',
    sub: 'Images & Pictures',
    icon: 'Image',
    op: 'image-compress',
  },

  // 12. Shapes & Drawing
  {
    id: 'callout-box-generator',
    name: 'Callout & Sidebar Highlight Box Generator',
    blurb: 'Insert professional tinted note boxes, warning callouts, and key takeaways into document body.',
    sub: 'Shapes & Drawing',
    icon: 'Square',
    op: 'callout-boxes',
  },
  {
    id: 'shape-text-aligner',
    name: 'Text Box Shape & Margin Aligner',
    blurb: 'Align embedded text boxes, normalize internal padding, and standardize border radii.',
    sub: 'Shapes & Drawing',
    icon: 'Square',
    op: 'shape-align',
  },

  // 13. Links & Bookmarks
  {
    id: 'hyperlink-auditor-word',
    name: 'Hyperlink Validator & URL Inspector',
    blurb: 'Inspect all hyperlinks embedded in the document, highlight broken URLs, and export link catalog.',
    sub: 'Links & Bookmarks',
    icon: 'Link2',
    op: 'link-audit',
  },
  {
    id: 'bookmark-navigator-word',
    name: 'Internal Section Bookmark Generator',
    blurb: 'Create cross-reference anchor bookmarks for instant jumping across lengthy chapters.',
    sub: 'Links & Bookmarks',
    icon: 'Link2',
    op: 'bookmark-maker',
  },

  // 14. Find & Replace
  {
    id: 'batch-find-replace-word',
    name: 'Batch Text & Word Find and Replace Tool',
    blurb: 'Find and replace multiple terms, acronyms, or names across the entire document simultaneously.',
    sub: 'Find & Replace',
    icon: 'Search',
    op: 'find-replace',
  },
  {
    id: 'case-sensitive-replacer',
    name: 'Case-Sensitive Terminology Standardizer',
    blurb: 'Perform case-sensitive replacements to ensure consistent company branding and product capitalization.',
    sub: 'Find & Replace',
    icon: 'Search',
    op: 'case-replacer',
  },

  // 15. Editing Tools
  {
    id: 'whitespace-cleaner-word',
    name: 'Irregular Space & Tab Normalizer',
    blurb: 'Replace non-standard tabs, non-breaking spaces, and irregular margins with clean typography.',
    sub: 'Editing Tools',
    icon: 'Scissors',
    op: 'clean-whitespace',
  },
  {
    id: 'paragraph-splitter-joiner',
    name: 'Paragraph Break Splitter & Joiner',
    blurb: 'Merge accidentally split paragraph lines or split overly dense text blocks automatically.',
    sub: 'Editing Tools',
    icon: 'Scissors',
    op: 'split-join-paragraphs',
  },

  // 16. Document Cleanup
  {
    id: 'double-space-remover',
    name: 'Double Space & Multiple Return Cleaner',
    blurb: 'Instantly purge accidental double spaces between words and remove redundant blank lines.',
    sub: 'Document Cleanup',
    icon: 'Sparkles',
    op: 'remove-double-spaces',
  },
  {
    id: 'blank-page-remover-word',
    name: 'Blank Page & Trailing Line Cleaner',
    blurb: 'Eliminate unwanted trailing blank pages caused by excess page breaks or trailing blank lines.',
    sub: 'Document Cleanup',
    icon: 'Sparkles',
    op: 'remove-blank-pages',
  },
  {
    id: 'empty-paragraph-cleaner',
    name: 'Empty Paragraph (<w:p>) Sweeper',
    blurb: 'Remove hidden empty paragraphs that create irregular vertical gaps throughout the document.',
    sub: 'Document Cleanup',
    icon: 'Sparkles',
    op: 'remove-empty-paragraphs',
  },

  // 17. Academic / Thesis Formatting
  {
    id: 'apa-7-formatter',
    name: 'APA 7th Edition Document Layout Formatter',
    blurb: 'Format document to APA 7th standards: 1-inch margins, Times/Calibri 12pt, double spacing, 0.5-in indents.',
    sub: 'Academic / Thesis Formatting',
    icon: 'GraduationCap',
    op: 'apa-format',
  },
  {
    id: 'mla-9-formatter',
    name: 'MLA 9th Edition Document Layout Formatter',
    blurb: 'Apply MLA 9th style: Lastname & page number header, double spacing, 1-inch margins, left alignment.',
    sub: 'Academic / Thesis Formatting',
    icon: 'GraduationCap',
    op: 'mla-format',
  },
  {
    id: 'ieee-academic-styler',
    name: 'IEEE Conference & Journal Layout Styler',
    blurb: 'Apply IEEE publication standards with numbered section headers and concise reference typography.',
    sub: 'Academic / Thesis Formatting',
    icon: 'GraduationCap',
    op: 'ieee-format',
  },

  // 18. Citations & References
  {
    id: 'alphabetical-references-sorter',
    name: 'Reference List Alphabetical Sorter',
    blurb: 'Sort bibliography and reference citations in alphabetical order by author last name.',
    sub: 'Citations & References',
    icon: 'Quote',
    op: 'sort-references',
  },
  {
    id: 'hanging-indent-citations',
    name: 'References Hanging Indent (0.5 in) Tool',
    blurb: 'Apply standard 0.5-inch hanging indents to bibliography and reference lists in seconds.',
    sub: 'Citations & References',
    icon: 'Quote',
    op: 'hanging-indent',
  },

  // 19. Footnotes & Endnotes
  {
    id: 'footnote-renumberer',
    name: 'Footnote Sequence & Numbering Fixer',
    blurb: 'Repair corrupted footnote sequences and ensure continuous 1, 2, 3 numbering across sections.',
    sub: 'Footnotes & Endnotes',
    icon: 'FileText',
    op: 'footnote-renumber',
  },
  {
    id: 'footnote-to-endnote-converter',
    name: 'Footnote to Endnote Text Converter',
    blurb: 'Collect all page footnotes and convert them into consolidated endnotes at the end of the document.',
    sub: 'Footnotes & Endnotes',
    icon: 'FileText',
    op: 'footnote-to-endnote',
  },

  // 20. Captions & Cross References
  {
    id: 'figure-table-captioner',
    name: 'Figure & Table Auto-Caption Generator',
    blurb: 'Standardize figure and table captions to uniform format (e.g. Figure 1: Title, Table 2: Data).',
    sub: 'Captions & Cross References',
    icon: 'Tag',
    op: 'caption-styler',
  },
  {
    id: 'table-of-figures-builder',
    name: 'Table of Figures & List of Tables Builder',
    blurb: 'Extract all figure and table captions into a dedicated List of Figures page.',
    sub: 'Captions & Cross References',
    icon: 'Tag',
    op: 'list-of-figures',
  },

  // 21. Equations & Symbols
  {
    id: 'equation-box-builder',
    name: 'LaTeX to Word Math Equation Inserter',
    blurb: 'Convert standard LaTeX mathematical notation into clean native Word equation blocks.',
    sub: 'Equations & Symbols',
    icon: 'Calculator',
    op: 'latex-equation',
  },
  {
    id: 'symbol-palette-inserter',
    name: 'Greek & Mathematical Symbol Helper',
    blurb: 'Insert Greek letters, calculus symbols, and currency marks into document text runs.',
    sub: 'Equations & Symbols',
    icon: 'Calculator',
    op: 'symbols',
  },

  // 22. Columns
  {
    id: 'two-column-layout-styler',
    name: 'Multi-Column (1, 2, 3) Newspaper Styler',
    blurb: 'Convert single-column document sections into professional two-column or three-column layouts.',
    sub: 'Columns',
    icon: 'Columns',
    op: 'columns-styler',
  },
  {
    id: 'column-break-inserter',
    name: 'Column Balance & Break Inserter',
    blurb: 'Balance text columns evenly and insert explicit column breaks before section headings.',
    sub: 'Columns',
    icon: 'Columns',
    op: 'column-breaks',
  },

  // 23. Document Sections & Breaks
  {
    id: 'section-break-manager',
    name: 'Continuous & Next-Page Section Break Tool',
    blurb: 'Manage continuous and next-page section breaks to enable independent layouts per chapter.',
    sub: 'Document Sections & Breaks',
    icon: 'Split',
    op: 'section-breaks',
  },
  {
    id: 'page-break-normalizer',
    name: 'Page Break & Section Splitter',
    blurb: 'Clean up accidental mid-sentence page breaks and place clean breaks before major headings.',
    sub: 'Document Sections & Breaks',
    icon: 'Split',
    op: 'page-break-clean',
  },

  // 24. Document Protection
  {
    id: 'read-only-protection-checker',
    name: 'DOCX Protection & Read-Only Inspector',
    blurb: 'Inspect document editing locks, form protection flags, and read-only attributes.',
    sub: 'Document Protection',
    icon: 'ShieldCheck',
    op: 'protection-check',
  },
  {
    id: 'document-editing-lock',
    name: 'Document Editing Restriction Configurator',
    blurb: 'Configure comments-only or track-changes-only restrictions to safeguard corporate templates.',
    sub: 'Document Protection',
    icon: 'ShieldCheck',
    op: 'editing-lock',
  },

  // 25. Import & Export
  {
    id: 'docx-to-html-converter',
    name: 'High-Fidelity DOCX to HTML Converter',
    blurb: 'Convert Word document contents, headings, tables, and images into clean HTML markup.',
    sub: 'Import & Export',
    icon: 'Download',
    op: 'docx-to-html',
  },
  {
    id: 'docx-to-markdown-converter',
    name: 'DOCX to Markdown (.md) Converter',
    blurb: 'Convert DOCX text, lists, code, and tables into clean GitHub-flavored Markdown.',
    sub: 'Import & Export',
    icon: 'Download',
    op: 'docx-to-md',
  },
  {
    id: 'docx-to-txt-converter',
    name: 'Clean DOCX to Plain Text (.txt) Extractor',
    blurb: 'Extract pure unformatted text from Word documents with clean UTF-8 paragraph breaks.',
    sub: 'Import & Export',
    icon: 'Download',
    op: 'docx-to-txt',
  },

  // 26. PDF & Document Conversion
  {
    id: 'docx-to-pdf-converter-suite',
    name: 'Direct In-Browser DOCX to PDF Converter',
    blurb: 'Render DOCX document layout directly into a downloadable high-resolution PDF file.',
    sub: 'PDF & Document Conversion',
    icon: 'FileCheck',
    op: 'docx-to-pdf',
  },
  {
    id: 'document-thumbnail-preview',
    name: 'Multi-Page Document Thumbnail Renderer',
    blurb: 'Generate responsive visual preview cards for every page in your Word document.',
    sub: 'PDF & Document Conversion',
    icon: 'FileCheck',
    op: 'document-preview',
  },

  // 27. Review & Proofreading
  {
    id: 'duplicate-word-checker',
    name: 'Consecutive Duplicate Word Detector',
    blurb: 'Detect accidental duplicate words (e.g., “the the”, “in in”, “and and”) throughout the document.',
    sub: 'Review & Proofreading',
    icon: 'CheckSquare',
    op: 'check-duplicate-words',
  },
  {
    id: 'passive-voice-highlighter',
    name: 'Writing Clarity & Readability Auditor',
    blurb: 'Analyze document reading grade level, paragraph length distribution, and vocabulary density.',
    sub: 'Review & Proofreading',
    icon: 'CheckSquare',
    op: 'readability-audit',
  },

  // 28. Comments & Collaboration
  {
    id: 'docx-comment-extractor',
    name: 'Extract All Comments to Summary Report',
    blurb: 'Extract all reviewer comments, author tags, and timestamps into an organized audit report.',
    sub: 'Comments & Collaboration',
    icon: 'MessageSquare',
    op: 'extract-comments',
  },
  {
    id: 'docx-comment-remover',
    name: 'Strip All Review Comments from Document',
    blurb: 'Safely remove all draft review comments and feedback bubbles before publishing final client copies.',
    sub: 'Comments & Collaboration',
    icon: 'MessageSquare',
    op: 'remove-comments',
  },

  // 29. Track Changes / Revision
  {
    id: 'revision-accept-all',
    name: 'Accept All Tracked Changes & Revisions',
    blurb: 'Accept all tracked insertions and deletions to produce a finalized clean document copy.',
    sub: 'Track Changes / Revision',
    icon: 'History',
    op: 'accept-revisions',
  },
  {
    id: 'track-changes-inspector',
    name: 'Revision History & Markup Summary Viewer',
    blurb: 'Inspect all tracked insertions, deletions, and markup changes with detailed author attributions.',
    sub: 'Track Changes / Revision',
    icon: 'History',
    op: 'inspect-revisions',
  },

  // 30. Document Information
  {
    id: 'word-char-paragraph-counter',
    name: 'Detailed Word, Character & Sentence Counter',
    blurb: 'Count exact words, characters with/without spaces, sentences, paragraphs, and reading duration.',
    sub: 'Document Information',
    icon: 'BarChart2',
    op: 'doc-counters',
  },
  {
    id: 'reading-speaking-time',
    name: 'Reading & Speaking Duration Estimator',
    blurb: 'Calculate estimated silent reading time (220 wpm) and spoken presentation time (130 wpm).',
    sub: 'Document Information',
    icon: 'BarChart2',
    op: 'time-estimator',
  },

  // 31. Metadata & Privacy
  {
    id: 'docx-metadata-inspector',
    name: 'Document Author, Company & Edit Time Inspector',
    blurb: 'View hidden author names, last modified tags, company info, and edit revision counts.',
    sub: 'Metadata & Privacy',
    icon: 'Lock',
    op: 'inspect-metadata',
  },
  {
    id: 'docx-metadata-cleaner',
    name: 'One-Click Personal Metadata & History Wiper',
    blurb: 'Strip author names, editing duration, and organization metadata for absolute privacy.',
    sub: 'Metadata & Privacy',
    icon: 'Lock',
    op: 'clean-metadata',
  },

  // 32. Accessibility
  {
    id: 'docx-accessibility-checker',
    name: 'Document Structure & Heading Order Checker',
    blurb: 'Verify that headings follow logical H1 -> H2 -> H3 progression and highlight skipped levels.',
    sub: 'Accessibility',
    icon: 'Eye',
    op: 'check-accessibility',
  },
  {
    id: 'alt-text-auditor-docx',
    name: 'Embedded Image Alt-Text Auditor',
    blurb: 'Identify all embedded illustrations lacking alternative descriptions for screen reader accessibility.',
    sub: 'Accessibility',
    icon: 'Eye',
    op: 'alt-text-audit',
  },

  // 33. Printing
  {
    id: 'print-preview-styler',
    name: 'High-Res Print Preview & Pagination Viewer',
    blurb: 'Preview document pages side-by-side with accurate print margins before physical printing.',
    sub: 'Printing',
    icon: 'Printer',
    op: 'print-preview',
  },
  {
    id: 'booklet-sheet-calculator',
    name: 'Booklet & Signature Print Sheet Calculator',
    blurb: 'Calculate front-and-back sheet folding order and pagination for booklet printing.',
    sub: 'Printing',
    icon: 'Printer',
    op: 'booklet-calculator',
  },

  // 34. Templates
  {
    id: 'academic-paper-template',
    name: 'APA/IEEE Academic Paper Starter DOCX',
    blurb: 'Generate a pre-formatted research paper DOCX template with abstract, headings, and references.',
    sub: 'Templates',
    icon: 'Boxes',
    op: 'gen-academic-template',
  },
  {
    id: 'executive-report-template',
    name: 'Professional Corporate Report Starter DOCX',
    blurb: 'Generate a polished corporate quarterly report template with cover page and executive summary.',
    sub: 'Templates',
    icon: 'Boxes',
    op: 'gen-executive-template',
  },
  {
    id: 'clean-resume-template-docx',
    name: 'ATS-Friendly Professional Resume DOCX',
    blurb: 'Download a clean, modern ATS-optimized Microsoft Word resume template ready for customization.',
    sub: 'Templates',
    icon: 'Boxes',
    op: 'gen-resume-template',
  },

  // 35. Quick Formatting Presets
  {
    id: 'one-click-document-normalizer',
    name: 'One-Click Master Document Normalizer',
    blurb: 'Apply standard A4 geometry, 1.5 line spacing, 8pt paragraph after-spacing, and clean double spaces in 1 click.',
    sub: 'Quick Formatting Presets',
    icon: 'Zap',
    op: 'quick-normalizer',
  },
  {
    id: 'business-formal-preset',
    name: 'Corporate Formal Layout Preset',
    blurb: 'Instantly format document with Calibri typography, 1.15 line spacing, navy headers, and centered footers.',
    sub: 'Quick Formatting Presets',
    icon: 'Zap',
    op: 'quick-business',
  },
  {
    id: 'clean-minimal-preset',
    name: 'Clean Minimalist Modern Layout Preset',
    blurb: 'Apply minimalist formatting: Generous margins, subtle dividers, and clean typography hierarchy.',
    sub: 'Quick Formatting Presets',
    icon: 'Zap',
    op: 'quick-minimal',
  },
]

// 35 Subcategories Definitions
export const DOCUMENT_WORD_SUBCATEGORIES: DocSubcategory[] = [
  {
    id: 'doc-sub-01',
    title: 'Document Editor',
    icon: DOC_ICON_MAP['FileEdit'] || FileEdit,
    description: 'Online DOCX Editor, Viewer, Auto-save, and All-in-One Fixer.',
    toolIds: ['word-document-fixer', 'docx-viewer-editor', 'docx-auto-save-exporter'],
  },
  {
    id: 'doc-sub-02',
    title: 'Font & Text Formatting',
    icon: DOC_ICON_MAP['Type'] || Type,
    description: 'Global font changer, font sizes, styles, and capitalization.',
    toolIds: ['global-font-changer', 'font-size-scaler', 'text-case-converter-word', 'bold-italic-styler'],
  },
  {
    id: 'doc-sub-03',
    title: 'Paragraph Formatting',
    icon: DOC_ICON_MAP['AlignLeft'] || AlignLeft,
    description: 'Alignments, indents, 1.15/1.5/2.0 line spacing, and spacing normalizer.',
    toolIds: ['line-spacing-adjuster', 'paragraph-spacing-normalizer', 'paragraph-indentation-styler', 'paragraph-alignment-tool'],
  },
  {
    id: 'doc-sub-04',
    title: 'Bullets & Numbering',
    icon: DOC_ICON_MAP['ListOrdered'] || ListOrdered,
    description: 'Custom bullet creators, multilevel lists, and renumbering.',
    toolIds: ['bullet-list-styler', 'multilevel-list-generator', 'list-renumbering-fixer'],
  },
  {
    id: 'doc-sub-05',
    title: 'Page Layout',
    icon: DOC_ICON_MAP['Layout'] || Layout,
    description: 'A4, Letter, Legal sizes, standard margins, and orientation.',
    toolIds: ['paper-size-converter-word', 'document-margin-preset', 'orientation-changer-word'],
  },
  {
    id: 'doc-sub-06',
    title: 'Headers & Footers',
    icon: DOC_ICON_MAP['PanelTop'] || PanelTop,
    description: 'Custom text, dates, classification stamps, and different first page support.',
    toolIds: ['header-footer-manager', 'different-first-page-header', 'odd-even-header-styler'],
  },
  {
    id: 'doc-sub-07',
    title: 'Page Numbers',
    icon: DOC_ICON_MAP['Hash'] || Hash,
    description: 'Top/bottom positioning, Roman/Arabic formats, and dynamic Page X of Y.',
    toolIds: ['page-number-inserter', 'roman-arabic-numbering', 'page-x-of-y-styler'],
  },
  {
    id: 'doc-sub-08',
    title: 'Styles',
    icon: DOC_ICON_MAP['Palette'] || Palette,
    description: 'Heading 1-6 presets, Academic and Business typography styles.',
    toolIds: ['heading-style-preset', 'academic-style-pack', 'corporate-style-pack'],
  },
  {
    id: 'doc-sub-09',
    title: 'Table of Contents',
    icon: DOC_ICON_MAP['BookOpen'] || BookOpen,
    description: 'Auto-generate, update, refresh, and customize heading level depth.',
    toolIds: ['toc-auto-generator', 'toc-depth-customizer', 'toc-refresh-updater'],
  },
  {
    id: 'doc-sub-10',
    title: 'Tables',
    icon: DOC_ICON_MAP['Table'] || Table,
    description: 'Cell padding, border styling, auto-fit, and header formatting.',
    toolIds: ['table-cell-padding-styler', 'table-border-styler', 'table-autofit-tool'],
  },
  {
    id: 'doc-sub-11',
    title: 'Images & Pictures',
    icon: DOC_ICON_MAP['Image'] || Image,
    description: 'Extract embedded images, center alignment, and file size optimization.',
    toolIds: ['docx-image-extractor', 'image-alignment-wrapper', 'docx-image-compressor'],
  },
  {
    id: 'doc-sub-12',
    title: 'Shapes & Drawing',
    icon: DOC_ICON_MAP['Square'] || Square,
    description: 'Geometric shapes, callout boxes, text boxes, and margin aligners.',
    toolIds: ['callout-box-generator', 'shape-text-aligner'],
  },
  {
    id: 'doc-sub-13',
    title: 'Links & Bookmarks',
    icon: DOC_ICON_MAP['Link2'] || Link2,
    description: 'Hyperlink auditing, broken link detection, and section bookmarks.',
    toolIds: ['hyperlink-auditor-word', 'bookmark-navigator-word'],
  },
  {
    id: 'doc-sub-14',
    title: 'Find & Replace',
    icon: DOC_ICON_MAP['Search'] || Search,
    description: 'Batch find and replace, case-sensitive terminology standardizer.',
    toolIds: ['batch-find-replace-word', 'case-sensitive-replacer'],
  },
  {
    id: 'doc-sub-15',
    title: 'Editing Tools',
    icon: DOC_ICON_MAP['Scissors'] || Scissors,
    description: 'Whitespace cleaner, tab normalizer, and paragraph splitters.',
    toolIds: ['whitespace-cleaner-word', 'paragraph-splitter-joiner'],
  },
  {
    id: 'doc-sub-16',
    title: 'Document Cleanup',
    icon: DOC_ICON_MAP['Sparkles'] || Sparkles,
    description: 'Double-space remover, blank page cleanup, and empty paragraph sweeper.',
    toolIds: ['double-space-remover', 'blank-page-remover-word', 'empty-paragraph-cleaner'],
  },
  {
    id: 'doc-sub-17',
    title: 'Academic / Thesis Formatting',
    icon: DOC_ICON_MAP['GraduationCap'] || GraduationCap,
    description: 'APA 7th, MLA 9th, and IEEE academic layout standards.',
    toolIds: ['apa-7-formatter', 'mla-9-formatter', 'ieee-academic-styler'],
  },
  {
    id: 'doc-sub-18',
    title: 'Citations & References',
    icon: DOC_ICON_MAP['Quote'] || Quote,
    description: 'Reference list alphabetical sorter and hanging indent formatter.',
    toolIds: ['alphabetical-references-sorter', 'hanging-indent-citations'],
  },
  {
    id: 'doc-sub-19',
    title: 'Footnotes & Endnotes',
    icon: DOC_ICON_MAP['FileText'] || FileText,
    description: 'Footnote sequence renumbering and footnote-to-endnote conversion.',
    toolIds: ['footnote-renumberer', 'footnote-to-endnote-converter'],
  },
  {
    id: 'doc-sub-20',
    title: 'Captions & Cross References',
    icon: DOC_ICON_MAP['Tag'] || Tag,
    description: 'Figure & table auto-captioning and list of figures generator.',
    toolIds: ['figure-table-captioner', 'table-of-figures-builder'],
  },
  {
    id: 'doc-sub-21',
    title: 'Equations & Symbols',
    icon: DOC_ICON_MAP['Calculator'] || Calculator,
    description: 'LaTeX to Word math equation inserter and mathematical symbols palette.',
    toolIds: ['equation-box-builder', 'symbol-palette-inserter'],
  },
  {
    id: 'doc-sub-22',
    title: 'Columns',
    icon: DOC_ICON_MAP['Columns'] || Columns,
    description: 'One, two, three column layouts, custom widths, and column breaks.',
    toolIds: ['two-column-layout-styler', 'column-break-inserter'],
  },
  {
    id: 'doc-sub-23',
    title: 'Document Sections & Breaks',
    icon: DOC_ICON_MAP['Split'] || Split,
    description: 'Continuous, next page breaks, and section layout splits.',
    toolIds: ['section-break-manager', 'page-break-normalizer'],
  },
  {
    id: 'doc-sub-24',
    title: 'Document Protection',
    icon: DOC_ICON_MAP['ShieldCheck'] || ShieldCheck,
    description: 'Read-only flags, permission inspection, and editing locks.',
    toolIds: ['read-only-protection-checker', 'document-editing-lock'],
  },
  {
    id: 'doc-sub-25',
    title: 'Import & Export',
    icon: DOC_ICON_MAP['Download'] || Download,
    description: 'DOCX to HTML, Markdown (.md), and clean Plain Text (.txt).',
    toolIds: ['docx-to-html-converter', 'docx-to-markdown-converter', 'docx-to-txt-converter'],
  },
  {
    id: 'doc-sub-26',
    title: 'PDF & Document Conversion',
    icon: DOC_ICON_MAP['FileCheck'] || FileCheck,
    description: 'DOCX to PDF conversion and multi-page thumbnail previews.',
    toolIds: ['docx-to-pdf-converter-suite', 'document-thumbnail-preview'],
  },
  {
    id: 'doc-sub-27',
    title: 'Review & Proofreading',
    icon: DOC_ICON_MAP['CheckSquare'] || CheckSquare,
    description: 'Duplicate word detection, writing clarity, and readability auditing.',
    toolIds: ['duplicate-word-checker', 'passive-voice-highlighter'],
  },
  {
    id: 'doc-sub-28',
    title: 'Comments & Collaboration',
    icon: DOC_ICON_MAP['MessageSquare'] || MessageSquare,
    description: 'Extract comments to audit report and strip all review comments.',
    toolIds: ['docx-comment-extractor', 'docx-comment-remover'],
  },
  {
    id: 'doc-sub-29',
    title: 'Track Changes / Revision',
    icon: DOC_ICON_MAP['History'] || History,
    description: 'Accept all tracked revisions and inspect revision history.',
    toolIds: ['revision-accept-all', 'track-changes-inspector'],
  },
  {
    id: 'doc-sub-30',
    title: 'Document Information',
    icon: DOC_ICON_MAP['BarChart2'] || BarChart2,
    description: 'Word, character, paragraph counters, and reading/speaking duration.',
    toolIds: ['word-char-paragraph-counter', 'reading-speaking-time'],
  },
  {
    id: 'doc-sub-31',
    title: 'Metadata & Privacy',
    icon: DOC_ICON_MAP['Lock'] || Lock,
    description: 'Inspect author details and one-click personal metadata wiper.',
    toolIds: ['docx-metadata-inspector', 'docx-metadata-cleaner'],
  },
  {
    id: 'doc-sub-32',
    title: 'Accessibility',
    icon: DOC_ICON_MAP['Eye'] || Eye,
    description: 'Heading structure hierarchy check and image alt-text auditing.',
    toolIds: ['docx-accessibility-checker', 'alt-text-auditor-docx'],
  },
  {
    id: 'doc-sub-33',
    title: 'Printing',
    icon: DOC_ICON_MAP['Printer'] || Printer,
    description: 'High-res print preview and booklet sheet folding calculator.',
    toolIds: ['print-preview-styler', 'booklet-sheet-calculator'],
  },
  {
    id: 'doc-sub-34',
    title: 'Templates',
    icon: DOC_ICON_MAP['Boxes'] || Boxes,
    description: 'Starter DOCX templates for Academic Papers, Corporate Reports, and Resumes.',
    toolIds: ['academic-paper-template', 'executive-report-template', 'clean-resume-template-docx'],
  },
  {
    id: 'doc-sub-35',
    title: 'Quick Formatting Presets',
    icon: DOC_ICON_MAP['Zap'] || Zap,
    description: 'One-click full document normalizer, Corporate Formal, and Minimal presets.',
    toolIds: ['one-click-document-normalizer', 'business-formal-preset', 'clean-minimal-preset'],
  },
]

export const DOCUMENT_WORD_CATEGORY_ID = 'document-word'
export const DOCUMENT_WORD_CATEGORY_NAME = 'MS Word & Document Suite'

// Map tool items to main Tool format
export const DOCUMENT_WORD_TOOLS: Tool[] = DOCUMENT_WORD_TOOL_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  categoryId: DOCUMENT_WORD_CATEGORY_ID,
  category: DOCUMENT_WORD_CATEGORY_NAME,
  description: item.blurb,
  keywords: [item.name, item.sub, 'word', 'docx', 'document', 'ms word', item.op],
  path: `/tools/${DOCUMENT_WORD_CATEGORY_ID}/${item.id}`,
  icon: item.icon,
  subcategory: item.sub,
}))

export function getDocxToolItem(id: string): DocxToolItem | undefined {
  return DOCUMENT_WORD_TOOL_ITEMS.find((t) => t.id === id)
}
