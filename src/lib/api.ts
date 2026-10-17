import type { Blog, BlogBlock } from './blogs'
import type { Tool } from './catalog'

export const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export interface ApiTool {
  id: number
  tool_id: string
  name: string
  category: string
  category_id: string
  description: string
  template_type: string
  target_user: string | null
  icon: string | null
  keywords: string[] | null
  seo_title: string | null
  seo_description: string | null
  is_active: boolean
}

export interface ApiCategory {
  category_id: string
  name: string
  tool_count: number
}

export interface ApiBlog {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  author: string
  cover_image: string | null
  published_at: string
}

interface ApiPage<T> {
  data: T[]
  total: number
  last_page: number
}

let availability: boolean | null = null

export async function apiAvailable(): Promise<boolean> {
  if (availability !== null) return availability
  try {
    await fetchJson<{ status: string }>('/health')
    availability = true
  } catch {
    availability = false
  }
  return availability
}

async function fetchJson<T>(path: string, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function getApiTools(opts: { search?: string; category?: string } = {}): Promise<ApiTool[]> {
  const params = new URLSearchParams({ per_page: '200' })
  if (opts.search) params.set('search', opts.search)
  if (opts.category) params.set('category', opts.category)
  const page = await fetchJson<ApiPage<ApiTool>>(`/tools?${params.toString()}`)
  return page.data
}

export async function getApiCategories(): Promise<ApiCategory[]> {
  const res = await fetchJson<{ data: ApiCategory[] }>('/tools/categories')
  return res.data
}

export async function getApiTool(toolId: string): Promise<ApiTool | null> {
  try {
    const res = await fetchJson<{ data: ApiTool }>(`/tools/${encodeURIComponent(toolId)}`)
    return res.data
  } catch {
    return null
  }
}

export async function getApiBlogs(): Promise<ApiBlog[]> {
  const params = new URLSearchParams({ per_page: '50' })
  const page = await fetchJson<ApiPage<ApiBlog>>(`/blogs?${params.toString()}`)
  return page.data
}

export async function getApiBlog(slug: string): Promise<ApiBlog | null> {
  try {
    const res = await fetchJson<{ data: ApiBlog }>(`/blogs/${encodeURIComponent(slug)}`)
    return res.data
  } catch {
    return null
  }
}

export async function trackToolView(toolId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/tools/${encodeURIComponent(toolId)}/track`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
  } catch {
    /* analytics are best-effort */
  }
}

export function toCatalogTool(api: ApiTool): Tool & { templateType: string; targetUser?: string } {
  return {
    id: api.tool_id,
    name: api.name,
    categoryId: api.category_id,
    category: api.category,
    description: api.description,
    keywords: api.keywords ?? [],
    path: catalogPath(api.category_id, api.tool_id),
    icon: api.icon ?? 'Wrench',
    templateType: api.template_type,
    targetUser: api.target_user ?? undefined,
  }
}

export function catalogPath(categoryId: string, toolId: string): string {
  return `/tools/${categoryId}/${toolId}`
}

/** Minimal Markdown -> BlogBlock[] parser for API content. */
export function markdownToBlocks(md: string, maxBlocks = 100): BlogBlock[] {
  const blocks: BlogBlock[] = []
  const lines = md.split('\n')
  let listStack: BlogBlock | null = null

  const flushList = () => {
    if (listStack && (listStack.items?.length ?? 0) > 0) {
      blocks.push(listStack)
      listStack = null
    }
  }

  for (const raw of lines) {
    if (blocks.length >= maxBlocks) break
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      flushList()
      blocks.push({ type: 'h2', text: inline(h2[1]) })
      continue
    }
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      flushList()
      blocks.push({ type: 'h3', text: inline(h3[1]) })
      continue
    }
    const li = line.match(/^-+\s+(.+)$/)
    if (li) {
      if (!listStack) listStack = { type: 'ul', items: [] }
      listStack.items!.push(inline(li[1]))
      continue
    }
    const num = line.match(/^\d+[.)]\s+(.+)$/)
    if (num) {
      if (!listStack) listStack = { type: 'ol', items: [] }
      listStack.items!.push(inline(num[1]))
      continue
    }
    const table = line.match(/^\|.*\|$/)
    if (table) {
      flushList()
      continue
    }
    const quote = line.match(/^>\s+(.+)$/)
    if (quote) {
      flushList()
      blocks.push({ type: 'quote', text: inline(quote[1]) })
      continue
    }
    flushList()
    blocks.push({ type: 'p', text: inline(line) })
  }
  flushList()
  return blocks
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
}

export function apiToLocalBlog(api: ApiBlog): Blog {
  const content = markdownToBlocks(api.content ?? '')
  const words = (api.content ?? '').split(/\s+/).length
  const readingMinutes = Math.max(1, Math.round(words / 220))
  const thumb = gradientThumb()
  return {
    slug: api.slug,
    title: api.title,
    category: api.category || 'Guides',
    tags: [api.category, 'Guides'].filter(Boolean),
    excerpt: api.excerpt || api.title,
    author: api.author || 'vimz Team',
    authorRole: 'Editor',
    date: (api.published_at ?? new Date().toISOString()).slice(0, 10),
    readingMinutes,
    thumbnail: thumb,
    relatedTool: { name: '', path: '' },
    content,
  }
}

function gradientThumb(from = '#6d28d9', to = '#4c1d95'): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="600" height="340" fill="url(#g)"/><circle cx="480" cy="80" r="120" fill="rgba(255,255,255,0.12)"/><circle cx="80" cy="300" r="160" fill="rgba(255,255,255,0.10)"/><text x="40" y="200" font-family="Arial" font-size="40" font-weight="bold" fill="rgba(255,255,255,0.9)">vimz Tools</text></svg>`,
  )}`
}

export function toEditorialBlog(
  api: ApiBlog,
  fallback: Blog,
): Blog {
  const mapped = apiToLocalBlog(api)
  return {
    ...mapped,
    tags: fallback.tags.length ? fallback.tags : mapped.tags,
    authorRole: fallback.authorRole,
    thumbnail: fallback.thumbnail,
    relatedTool: fallback.relatedTool,
  }
}