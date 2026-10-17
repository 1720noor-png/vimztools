import { FileText, Boxes, Image as ImageIcon, type LucideIcon } from 'lucide-react'
import { tools, type Tool } from '../../lib/catalog'

export interface StudentSubcategory {
  id: string
  title: string
  toolIds: string[]
}

export interface StudentMainCategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  subcategories: StudentSubcategory[]
}

export const studentMainCategories: StudentMainCategory[] = [
  {
    id: 'pdf',
    title: 'PDF Utilities',
    tagline: 'Create, edit, secure & extract from PDFs',
    description:
      'Everything PDF: conversions, page management, security, OCR, tables, forms and summaries - all browser-based.',
    icon: FileText,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    subcategories: [
      {
        id: 'core-pdf-tools',
        title: 'Core PDF Tools',
        toolIds: [
          'image-to-pdf',
          'pdf-to-image',
          'pdf-merge-split',
          'pdf-compress',
          'word-to-pdf',
          'pdf-to-word',
          'pdf-watermark',
          'pdf-split',
        ],
      },
      {
        id: 'advanced-page-management-editing',
        title: 'Advanced Page Management & Editing',
        toolIds: ['pdf-page-reorder', 'pdf-page-numberer', 'pdf-page-crop'],
      },
      {
        id: 'security-privacy-utilities',
        title: 'Security & Privacy Utilities',
        toolIds: ['pdf-password-protect', 'pdf-password-remove', 'pdf-redactor'],
      },
      {
        id: 'extraction-smart-tools',
        title: 'Extraction & Smart Tools',
        toolIds: ['pdf-ocr', 'pdf-table-extract', 'pdf-form-fill', 'pdf-ai-summarizer'],
      },
    ],
  },
  {
    id: 'digital',
    title: 'Digital Utilities & Converters',
    tagline: 'Study, writing, research, math & productivity',
    description:
      'The full student toolbox: quick utilities, AI study helpers, writing, research, math and planning tools.',
    icon: Boxes,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
    subcategories: [
      {
        id: 'general-quick-utilities',
        title: 'General & Quick Utilities',
        toolIds: [
          'text-to-speech',
          'word-counter',
          'qr-code',
          'area-unit-converter',
          'barcode-generator',
          'base64-encoder-decoder',
          'binary-decimal-hex-converter',
        ],
      },
      {
        id: 'ai-study-summarization-tools',
        title: 'AI Study & Summarization Tools',
        toolIds: [
          'ai-study-planner',
          'notes-summarizer',
          'pdf-summarizer',
          'lecture-notes-generator',
          'flashcard-generator',
          'quiz-generator',
          'mcq-generator',
          'question-paper-generator',
          'answer-explainer',
          'chapter-summarizer',
        ],
      },
      {
        id: 'writing-assignment-helpers',
        title: 'Writing & Assignment Helpers',
        toolIds: [
          'essay-writer',
          'assignment-helper',
          'grammar-checker',
          'paraphrasing-tool',
          'citation-generator',
          'reference-generator',
          'email-letter-writer',
          'presentation-content-generator',
        ],
      },
      {
        id: 'research-academic-tools',
        title: 'Research & Academic Tools',
        toolIds: [
          'research-topic-generator',
          'research-question-generator',
          'literature-review-helper',
          'abstract-generator',
          'thesis-statement-generator',
          'survey-question-generator',
          'questionnaire-generator',
        ],
      },
      {
        id: 'math-science-calculators',
        title: 'Math & Science Calculators',
        toolIds: [
          'math-problem-solver',
          'equation-solver',
          'chemistry-equation-balancer',
          'physics-problem-solver',
          'unit-converter',
          'statistics-calculator',
          'graph-generator',
        ],
      },
      {
        id: 'career-readiness-tools',
        title: 'Career & Readiness Tools',
        toolIds: [
          'cv-resume-builder',
          'cover-letter-generator',
          'linkedin-bio-generator',
          'student-interview-question-generator',
          'interview-practice-simulator',
          'career-path-finder',
        ],
      },
      {
        id: 'student-productivity-planning',
        title: 'Student Productivity & Planning',
        toolIds: [
          'timetable-generator',
          'study-schedule',
          'student-pomodoro-timer',
          'student-to-do-list',
          'student-exam-countdown',
          'gpa-cgpa-calculator',
          'attendance-calculator',
        ],
      },
    ],
  },
  {
    id: 'image',
    title: 'Image Tools',
    tagline: 'Passport photos, background removal, resizing & more',
    description:
      'Fast image utilities for photos and study material: resize, compress, remove backgrounds and convert formats.',
    icon: ImageIcon,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
    subcategories: [
      {
        id: 'image-utilities',
        title: 'Image Utilities',
        toolIds: [
          'passport-photo',
          'background-remover',
          'image-resizer',
          'watermark',
          'format-converter',
        ],
      },
    ],
  },
]

const BY_ID = new Map<string, Tool>(tools.map((t) => [t.id, t]))

export function findStudentMain(mainId?: string): StudentMainCategory | undefined {
  return studentMainCategories.find((m) => m.id === mainId)
}

export function findStudentSub(
  mainId: string,
  subId: string,
): { main: StudentMainCategory; sub: StudentSubcategory } | undefined {
  const main = findStudentMain(mainId)
  const sub = main?.subcategories.find((s) => s.id === subId)
  if (!main || !sub) return undefined
  return { main, sub }
}

export function toolsForStudentSub(mainId: string, subId: string): Tool[] {
  const found = findStudentSub(mainId, subId)
  if (!found) return []
  return found.sub.toolIds
    .map((id) => BY_ID.get(id))
    .filter((t): t is Tool => Boolean(t))
}

export function studentMainToolCount(mainId: string): number {
  const main = findStudentMain(mainId)
  if (!main) return 0
  return main.subcategories.reduce((sum, s) => sum + s.toolIds.length, 0)
}

export const STUDENT_TOTAL_TOOLS = studentMainCategories.reduce(
  (sum, m) => sum + studentMainToolCount(m.id),
  0,
)