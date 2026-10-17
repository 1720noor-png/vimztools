import type { Blog } from './blogs'
import { privacyBlogs } from './blogs/privacy'
import { pdfDocsBlogs } from './blogs/pdfDocs'
import { imageMediaBlogs } from './blogs/imageMedia'
import { performanceWasmBlogs } from './blogs/performanceWasm'
import { devToolsBlogs } from './blogs/devTools'
import { aiMlBlogs } from './blogs/aiMl'
import { productivityOfficeBlogs } from './blogs/productivityOffice'

export const blogCategories: string[] = [
  'Privacy & Security',
  'PDF & Documents',
  'Image & Media',
  'Web Performance & Wasm',
  'Developer Tools',
  'AI & Machine Learning',
  'Productivity & Office',
]

export const allBlogArticles: Blog[] = [
  ...privacyBlogs,
  ...pdfDocsBlogs,
  ...imageMediaBlogs,
  ...performanceWasmBlogs,
  ...devToolsBlogs,
  ...aiMlBlogs,
  ...productivityOfficeBlogs,
]

// Verify unique slugs
const slugSet = new Set<string>()
for (const article of allBlogArticles) {
  if (slugSet.has(article.slug)) {
    console.warn(`Duplicate blog slug detected: ${article.slug}`)
  }
  slugSet.add(article.slug)
}
