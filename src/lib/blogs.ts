import { allBlogArticles, blogCategories as defaultCategories } from './blogsData'

export interface BlogBlock {
  type: 'p' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'tip' | 'warning'
  text?: string
  items?: string[]
}

export interface Blog {
  slug: string
  title: string
  category: string
  tags: string[]
  excerpt: string
  author: string
  authorRole: string
  date: string
  readingMinutes: number
  thumbnail?: string
  badge?: string
  theme?: string
  relatedTool?: { name: string; path: string }
  content: BlogBlock[]
}

export const blogCategories = defaultCategories

export const blogs: Blog[] = allBlogArticles

export function getBlog(slug: string): Blog | undefined {
  return blogs.find((b) => b.slug === slug)
}

export function getBlogsByCategory(category: string): Blog[] {
  return blogs.filter((b) => b.category === category)
}

export function getRelatedBlogs(slug: string, count = 3): Blog[] {
  const current = getBlog(slug)
  if (current) {
    const sameCat = blogs.filter((b) => b.slug !== slug && b.category === current.category)
    if (sameCat.length >= count) {
      return sameCat.slice(0, count)
    }
    const others = blogs.filter((b) => b.slug !== slug && b.category !== current.category)
    return [...sameCat, ...others].slice(0, count)
  }
  return blogs.filter((b) => b.slug !== slug).slice(0, count)
}

export interface SubmittedBlog {
  id: string
  title: string
  category: string
  tags: string[]
  excerpt: string
  author: string
  content: string
  date: string
}

const STORAGE_KEY = 'vimz-submitted-blogs'

export function getSubmittedBlogs(): SubmittedBlog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SubmittedBlog[]) : []
  } catch {
    return []
  }
}

export function saveSubmittedBlog(blog: SubmittedBlog) {
  const all = getSubmittedBlogs()
  all.unshift(blog)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)))
}