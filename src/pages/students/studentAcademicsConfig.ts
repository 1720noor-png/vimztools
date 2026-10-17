import {
  Award,
  Banknote,
  BookMarked,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Code2,
  Compass,
  Feather,
  FlaskConical,
  Languages,
  Library,
  LineChart,
  Microscope,
  NotebookPen,
  Presentation,
  Quote,
  Sigma,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { studentSpecs } from './specs'
import type { Tool } from '../../lib/catalog'

export const STUDENT_ACADEMICS_CATEGORY = 'students-academics'
export const STUDENT_ACADEMICS_CATEGORY_NAME = 'Students & Academics'

export interface AcademicSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'of', 'to', 'a', 'an', 'in', 'on', 'with', 'by', 'from',
  'vs', 'or', 'at', 'as', 'per', 'tool', 'tools', 'your', 'you', 'it', 'is',
  'are', 'this', 'that', 'a', 'my', 'me', 'i', 'out', 'up',
])

function deriveKeywords(name: string, subject: string): string[] {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  const subjectWords = subject
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  return Array.from(new Set([...words, ...subjectWords])).slice(0, 12)
}

export const STUDENT_ACADEMICS_TOOLS: Tool[] = studentSpecs.map((spec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: STUDENT_ACADEMICS_CATEGORY,
  category: STUDENT_ACADEMICS_CATEGORY_NAME,
  description: spec.blurb,
  keywords: deriveKeywords(spec.name, spec.subject),
  path: `/tools/${STUDENT_ACADEMICS_CATEGORY}/${spec.id}`,
  icon: 'GraduationCap',
  subcategory: spec.subject,
}))

export const academicSubcategories: AcademicSubcategory[] = [
  {
    id: 'acad-general-utilities',
    title: 'General & Quick Utilities',
    tagline: 'Count, convert, encode & measure in seconds',
    description:
      'Word and sentence counts, reading time, case conversion, QR and barcode payloads, Base64, number bases, unit conversion, percentage and quick text utilities.',
    icon: Zap,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    id: 'acad-ai-study',
    title: 'AI Study & Summarization',
    tagline: 'Plans, summaries, flashcards, quizzes & explainers',
    description:
      'Study plan builders, chapter and lecture summarizers, flashcard and quiz generators, question papers, answer explainers and revision prompts you can paste straight into any assistant.',
    icon: Compass,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  {
    id: 'acad-writing-assignments',
    title: 'Writing & Assignment Helpers',
    tagline: 'Essays, paragraphs, grammar, paraphrasing & letters',
    description:
      'Essay and assignment outlining, thesis statements, paragraph frameworks, grammar and readability checks, paraphrasing, sentence combination, transitions, tone shifts and formal letters.',
    icon: Feather,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'acad-research-academic',
    title: 'Research & Academic Tools',
    tagline: 'Topics, questions, methods, reviews & abstracts',
    description:
      'Research topic and question generation, methodology selection, literature review scaffolding, gap finders, abstracts, hypotheses, survey and questionnaire design and research summaries.',
    icon: Library,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'acad-citations-referencing',
    title: 'Citations & Referencing',
    tagline: 'APA, MLA, Harvard, IEEE & reference hygiene',
    description:
      'Citation formatters and converters, reference list builders, in-text citation placement, DOI and source checks, bibliography sorting and plagiarism-risk explanations.',
    icon: Quote,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'acad-math-science-calculators',
    title: 'Math & Science Calculators',
    tagline: 'Solvers, graphs, percentages & equations',
    description:
      'Percentage and ratio calculators, equation and inequality solvers, quadratics, sequences, graph interpretation, trigonometry helpers, scientific notation and unit-aware conversions.',
    icon: Sigma,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'acad-chemistry-physics',
    title: 'Chemistry & Physics Tools',
    tagline: 'Balancing, moles, units, waves & circuits',
    description:
      'Chemical equation balancing, mole and stoichiometry helpers, pH and concentration maths, significant figures, unit dimensions, projectile and wave calculators and circuit Ohm-law tools.',
    icon: FlaskConical,
    accent: 'text-teal-600 bg-teal-50 border-teal-200',
  },
  {
    id: 'acad-statistics-data',
    title: 'Statistics & Data Analysis',
    tagline: 'Descriptives, distributions, tests & charts',
    description:
      'Mean, median, mode, spread and percentiles, z-scores, standard error, confidence intervals, correlation and regression, distribution fits, sampling checks and chart data preparation.',
    icon: LineChart,
    accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  {
    id: 'acad-study-planning',
    title: 'Study Planning & Revision',
    tagline: 'Timetables, sessions, focus plans & revision cycles',
    description:
      'Study schedules and timetables, revision planners, focus and Pomodoro planning, reading lists, past-paper triage, revision timetables and workload-versus-deadline checks.',
    icon: CalendarDays,
    accent: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'acad-exams-tests',
    title: 'Exams, Tests & Quizzes',
    tagline: 'Question banks, marking schemes & answer keys',
    description:
      'MCQ and question generators, Bloom-level checks, distractor design, answer keys, marking schemes, rubric builders, test assembly and post-exam question analysis.',
    icon: ClipboardList,
    accent: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    id: 'acad-gpa-performance',
    title: 'GPA, CGPA & Academic Performance',
    tagline: 'Averages, projections, credit loads & requirements',
    description:
      'GPA and CGPA calculators, credit-weighted loads, grade projections, class rank, requirement checks against major entry and honours, grade improvement and curve analysis.',
    icon: Award,
    accent: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    id: 'acad-attendance-calendar',
    title: 'Attendance & Academic Calendar',
    tagline: 'Attendance records, credit tracking & term dates',
    description:
      'Attendance calculators and trackers, shortage warnings, recovery planning, credit-hour tracking against degree requirements, semester and academic-year calendars and deadline maps.',
    icon: BookMarked,
    accent: 'text-lime-600 bg-lime-50 border-lime-200',
  },
  {
    id: 'acad-career-readiness',
    title: 'Career & Readiness Tools',
    tagline: 'CVs, cover letters, portfolios & negotiation',
    description:
      'CV and resume builders, cover letters, LinkedIn bios, interview question sets and practice scoring, salary negotiation, portfolio checklists, CV gap analysis and freelance rate setting.',
    icon: Briefcase,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'acad-coding-developer',
    title: 'Coding & Developer Tools',
    tagline: 'Formatters, testers, SQL, APIs & complexity',
    description:
      'JSON, SQL and regex builders, code formatters and explainers, diff reviewers, complexity and test-coverage planning, API request builders, stack trace analysis and algorithm selection.',
    icon: Code2,
    accent: 'text-slate-700 bg-slate-100 border-slate-300',
  },
  {
    id: 'acad-thesis-fyp',
    title: 'Thesis & Final Year Project',
    tagline: 'Proposals, methodology, defence & supervision',
    description:
      'Topic narrowing, proposal and outline builders, methodology pickers, literature review structures, abstract compressors, supervisor meeting agendas and defence question banks.',
    icon: Microscope,
    accent: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
  },
  {
    id: 'acad-presentation-speaking',
    title: 'Presentation & Public Speaking',
    tagline: 'Storylines, slides, delivery & nerves',
    description:
      'Presentation storylines and slide planners, timing budgets, speaker notes, audience analysis, Q&A preparation, voice and body-language checks and nervous-taper routines.',
    icon: Presentation,
    accent: 'text-pink-600 bg-pink-50 border-pink-200',
  },
  {
    id: 'acad-notes-organization',
    title: 'Notes & Organization',
    tagline: 'Cornell notes, filing systems & to-do lists',
    description:
      'Cornell and outline note templates, note reorganisation, folder and filename conventions, lecture note structures, to-do lists, weekly planners and knowledge-base layouts.',
    icon: NotebookPen,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'acad-language-translation',
    title: 'Language Learning & Translation',
    tagline: 'Vocabulary, grammar, reading & translation quality',
    description:
      'Vocabulary builders with spaced bands, grammar drills, reading-level checks, translation and back-translation comparisons, idiom and false-friend notes and language study logging.',
    icon: Languages,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'acad-memory-learning',
    title: 'Memory & Learning',
    tagline: 'Spaced repetition, mnemonics & recall practice',
    description:
      'Spaced repetition schedules, active recall and memory quizzes, mnemonics, study-technique selection, learning-preference assessment, memorisation plans and formula flashcards.',
    icon: Timer,
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'acad-student-finance',
    title: 'Student Finance & Budget',
    tagline: 'Budgets, fees, scholarships, loans & living costs',
    description:
      'Monthly and daily budgets, course and tuition cost models, semester cash curves, scholarship valuation and eligibility audits, student loan and EMI planning, halls versus flat costs and study-abroad budgets.',
    icon: Banknote,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
]

export function findAcademicSubcategory(subId: string): AcademicSubcategory | undefined {
  return academicSubcategories.find((s) => s.id === subId)
}

export function academicToolsFor(subId: string): Tool[] {
  const sub = findAcademicSubcategory(subId)
  if (!sub) return []
  return STUDENT_ACADEMICS_TOOLS.filter((t) => t.subcategory === sub.title)
}

export function academicToolCount(subId: string): number {
  return academicToolsFor(subId).length
}

export const STUDENT_ACADEMICS_TOTAL_TOOLS = STUDENT_ACADEMICS_TOOLS.length

export const STUDENT_ACADEMICS_TOTAL_FOLDERS = academicSubcategories.length
