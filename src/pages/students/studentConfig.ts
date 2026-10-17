import { FileText, Boxes, Image as ImageIcon, type LucideIcon } from 'lucide-react'
import { tools, type Tool } from '../../lib/catalog'

export interface StudentSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  categoryId: string
  subcategory?: string
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
    tagline: 'Create, convert, secure & manage PDFs',
    description:
      'Convert images and Word files to and from PDF, merge, split, compress, watermark, reorder pages, protect with passwords and extract text, tables and summaries.',
    icon: FileText,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    subcategories: [
      {
        id: 'core-pdf-tools',
        title: 'Core PDF Tools',
        tagline: 'Convert, merge, split, compress & watermark',
        description:
          'Images to PDF, PDF to images, merge and split, compression, Word conversion, watermark overlay and page-range splitting.',
        categoryId: 'pdf',
        subcategory: 'Core PDF Tools',
      },
      {
        id: 'advanced-page-management-editing',
        title: 'Advanced Page Management & Editing',
        tagline: 'Reorder, rotate, number, stamp, erase & crop',
        description:
          'Rearrange pages, number and stamp pages with headers, erase content and crop margins for clean PDFs.',
        categoryId: 'pdf',
        subcategory: 'Advanced Page Management & Editing',
      },
      {
        id: 'security-privacy-utilities',
        title: 'Security & Privacy Utilities',
        tagline: 'Protect, unlock & redact sensitive content',
        description:
          'Password protect documents, remove passwords and black out personal details with the PII redactor.',
        categoryId: 'pdf',
        subcategory: 'Security & Privacy Utilities',
      },
      {
        id: 'extraction-smart-tools',
        title: 'Extraction & Smart Tools',
        tagline: 'OCR, tables, forms & summaries',
        description:
          'Extract text via OCR, convert tables to CSV or Excel, fill and sign forms and generate key notes and summaries.',
        categoryId: 'pdf',
        subcategory: 'Extraction & Smart Tools',
      },
    ],
  },
  {
    id: 'digital',
    title: 'Digital Utilities & Converters',
    tagline: 'Study, writing, research, math & productivity',
    description:
      'The complete student toolbox: quick utilities, AI study and summarization, essay and assignment helpers, research aids, math and science calculators, career prep and daily planning.',
    icon: Boxes,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
    subcategories: [
      {
        id: 'general-quick-utilities',
        title: 'General & Quick Utilities',
        tagline: 'Read, count, encode & convert quickly',
        description:
          'Text-to-speech, word counting and case conversion, QR codes, barcodes, base64 and number-base conversion and unit conversions.',
        categoryId: 'student-tools',
        subcategory: 'General & Quick Utilities',
      },
      {
        id: 'ai-study-summarization-tools',
        title: 'AI Study & Summarization Tools',
        tagline: 'Plans, summaries, flashcards, quizzes & MCQs',
        description:
          'AI study planners, notes and PDF summarization, lecture notes, flashcards, quizzes, MCQs, question papers, answer explainers and chapter summaries.',
        categoryId: 'student-tools',
        subcategory: 'AI Study & Summarization Tools',
      },
      {
        id: 'writing-assignment-helpers',
        title: 'Writing & Assignment Helpers',
        tagline: 'Essays, grammar, citations & letters',
        description:
          'Essay writing, assignment help, grammar checking, paraphrasing, citations and references, emails and letters and presentation content.',
        categoryId: 'student-tools',
        subcategory: 'Writing & Assignment Helpers',
      },
      {
        id: 'research-academic-tools',
        title: 'Research & Academic Tools',
        tagline: 'Topics, questions, reviews & abstracts',
        description:
          'Research topics and questions, literature reviews, abstracts, thesis statements and survey or questionnaire generators.',
        categoryId: 'student-tools',
        subcategory: 'Research & Academic Tools',
      },
      {
        id: 'math-science-calculators',
        title: 'Math & Science Calculators',
        tagline: 'Solvers, equations & graphs',
        description:
          'Math and equation solvers, chemistry equation balancers, physics problem solvers, unit conversions, statistics and graph generators.',
        categoryId: 'student-tools',
        subcategory: 'Math & Science Calculators',
      },
      {
        id: 'career-readiness-tools',
        title: 'Career & Readiness Tools',
        tagline: 'Resumes, interviews & career paths',
        description:
          'CV and resume builders, cover letters, LinkedIn bios, interview questions and practice simulations and career path finders.',
        categoryId: 'student-tools',
        subcategory: 'Career & Readiness Tools',
      },
      {
        id: 'student-productivity-planning',
        title: 'Student Productivity & Planning',
        tagline: 'Plans, timers, lists & calculators',
        description:
          'Timetables and study schedules, pomodoro timers, to-do lists, exam countdowns, GPA or CGPA and attendance calculators.',
        categoryId: 'student-tools',
        subcategory: 'Student Productivity & Planning',
      },
    ],
  },
  {
    id: 'image',
    title: 'Image Tools',
    tagline: 'Resize, convert, remove & watermark images',
    description:
      'Passport size photo generation, AI background removal, resizing and compression, watermark overlays and image format conversion.',
    icon: ImageIcon,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
    subcategories: [
      {
        id: 'image-utilities',
        title: 'Image Utilities',
        tagline: 'Prepare, convert & polish images',
        description:
          'Passport and ID photo generation, AI background removal, resizing and compression, watermarking and format conversion.',
        categoryId: 'image',
      },
    ],
  },
]

export const STUDENT_TOTAL_TOOLS = tools.filter((t) =>
  ['pdf', 'student-tools', 'image'].includes(t.categoryId),
).length

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

export function studentToolsFor(mainId: string, subId: string): Tool[] {
  const found = findStudentSub(mainId, subId)
  if (!found) return []
  const { categoryId, subcategory } = found.sub
  return tools.filter(
    (t) =>
      t.categoryId === categoryId &&
      (subcategory === undefined || t.subcategory === subcategory),
  )
}

export function studentMainToolCount(mainId: string): number {
  const main = findStudentMain(mainId)
  if (!main) return 0
  return main.subcategories.reduce(
    (sum, sub) => sum + studentToolsFor(main.id, sub.id).length,
    0,
  )
}