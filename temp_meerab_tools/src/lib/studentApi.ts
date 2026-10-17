export const STUDENT_API = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export interface PdfSummary {
  id: number
  label: string | null
  file_name: string
  page_count: number
  word_count: number
  char_count: number
  summary: string
  key_concepts: string[]
  created_at: string
}

export interface QuestionPaper {
  id: number
  title: string | null
  subject: string
  exam_type: string
  total_marks: number
  duration_minutes: number
  difficulty: string
  topics: string[]
  sections: Array<{
    name: string
    type: string
    count: number
    marks_each: number
    total: number
    instructions: string
  }>
  paper_markdown: string
  created_at: string
}

export interface LiteratureReview {
  id: number
  title: string | null
  research_area: string
  themes: string[]
  source_count: number
  purpose: string
  sections: Record<string, string>
  review_markdown: string
  created_at: string
}

export interface CvResume {
  id: number
  name: string
  email: string | null
  phone: string | null
  location: string | null
  headline: string | null
  summary: string | null
  experience: Array<{ role: string; company: string; period?: string; bullets: string[] }>
  education: Array<{ degree: string; school: string; year?: string }>
  skills: string[]
  resume_markdown: string
  created_at: string
}

async function fetchJson<T>(url: string, init?: RequestInit & { timeout?: number }): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), init?.timeout ?? 10000)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      const message = errText ? `${res.status}: ${errText.slice(0, 200)}` : `${res.status}`
      throw new Error(message)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function listPdfSummaries(): Promise<PdfSummary[]> {
  const json = await fetchJson<{ data: PdfSummary[] }>(`${STUDENT_API}/student/pdf-summaries`)
  return json.data
}

export async function createPdfSummary(form: FormData): Promise<PdfSummary> {
  const json = await fetchJson<{ data: PdfSummary }>(`${STUDENT_API}/student/pdf-summaries`, {
    method: 'POST',
    body: form,
    timeout: 30000,
  })
  return json.data
}

export async function deletePdfSummary(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`${STUDENT_API}/student/pdf-summaries/${id}`, {
    method: 'DELETE',
  })
}

export async function listQuestionPapers(): Promise<QuestionPaper[]> {
  const json = await fetchJson<{ data: QuestionPaper[] }>(`${STUDENT_API}/student/question-papers`)
  return json.data
}

export async function createQuestionPaper(
  payload: Partial<QuestionPaper> & { subject: string },
): Promise<QuestionPaper> {
  const json = await fetchJson<{ data: QuestionPaper }>(`${STUDENT_API}/student/question-papers`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    timeout: 12000,
  })
  return json.data
}

export async function deleteQuestionPaper(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`${STUDENT_API}/student/question-papers/${id}`, {
    method: 'DELETE',
  })
}

export async function listLiteratureReviews(): Promise<LiteratureReview[]> {
  const json = await fetchJson<{ data: LiteratureReview[] }>(`${STUDENT_API}/student/literature-reviews`)
  return json.data
}

export async function createLiteratureReview(
  payload: Partial<LiteratureReview> & { research_area: string },
): Promise<LiteratureReview> {
  const json = await fetchJson<{ data: LiteratureReview }>(`${STUDENT_API}/student/literature-reviews`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    timeout: 12000,
  })
  return json.data
}

export async function deleteLiteratureReview(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`${STUDENT_API}/student/literature-reviews/${id}`, {
    method: 'DELETE',
  })
}

export async function listCvResumes(): Promise<CvResume[]> {
  const json = await fetchJson<{ data: CvResume[] }>(`${STUDENT_API}/student/cv-resumes`)
  return json.data
}

export async function createCvResume(payload: Partial<CvResume> & { name: string }): Promise<CvResume> {
  const json = await fetchJson<{ data: CvResume }>(`${STUDENT_API}/student/cv-resumes`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    timeout: 12000,
  })
  return json.data
}

export async function deleteCvResume(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`${STUDENT_API}/student/cv-resumes/${id}`, {
    method: 'DELETE',
  })
}