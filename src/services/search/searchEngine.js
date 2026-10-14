import MiniSearch from 'minisearch'
import defaultToolIndex from '@data/tool-index.json'

let miniSearchInstance = null
let toolMap = new Map()

/**
 * Configure and initialize MiniSearch with BM25 ranking, fuzzy search, and Roman Urdu support.
 *
 * @param {Array<Object>} [toolsData] - Array of indexed tools
 * @returns {MiniSearch} Initialized MiniSearch instance
 */
export function initSearchEngine(toolsData = defaultToolIndex) {
  const validTools = (toolsData || []).filter((t) => t && t.slug)
  toolMap = new Map()
  validTools.forEach((tool) => {
    toolMap.set(tool.slug, tool)
  })

  miniSearchInstance = new MiniSearch({
    fields: ['name', 'keywords', 'keywords_ur', 'desc', 'cat', 'subcatName'],
    storeFields: ['id', 'slug', 'name', 'cat', 'subcat', 'subcatName', 'desc', 'icon', 'level'],
    searchOptions: {
      boost: {
        name: 4,
        keywords: 2.5,
        keywords_ur: 2.5,
        subcatName: 1.5,
        cat: 1,
        desc: 1
      },
      prefix: true,
      fuzzy: 0.2
    }
  })

  miniSearchInstance.addAll(validTools)
  return miniSearchInstance
}

/**
 * Get or lazily initialize the singleton search engine instance.
 *
 * @returns {MiniSearch}
 */
export function getSearchEngine() {
  if (!miniSearchInstance) {
    initSearchEngine()
  }
  return miniSearchInstance
}

/**
 * Perform smart search with typo-tolerance, prefix matching, and category filtering.
 *
 * @param {string} query - User search query (English or Roman Urdu)
 * @param {Object} [options]
 * @param {string} [options.category] - Filter by specific category slug
 * @param {number} [options.limit=10] - Maximum number of results to return
 * @param {boolean} [options.fuzzy=true] - Enable fuzzy typo tolerance
 * @returns {Array<Object>} Ranked search results with metadata
 */
export function searchTools(query, options = {}) {
  const q = (query || '').trim()
  if (!q) return []

  const engine = getSearchEngine()
  const { category, limit = 10, fuzzy = true } = options

  const searchParams = {
    prefix: true,
    fuzzy: fuzzy ? 0.2 : false,
    combineWith: 'AND',
    filter: category ? (result) => result.cat === category : undefined
  }

  // 1. Try precise AND search first
  let results = engine.search(q, searchParams)

  // 2. If no results, fallback to OR search to handle long multi-word queries
  if (!results.length && q.includes(' ')) {
    results = engine.search(q, {
      ...searchParams,
      combineWith: 'OR'
    })
  }

  // 3. Map results back to full tool records
  return results.slice(0, limit).map((r) => {
    const full = toolMap.get(r.slug) || r
    return {
      ...full,
      score: r.score,
      match: r.match
    }
  })
}

/**
 * Look up a tool by its unique slug.
 *
 * @param {string} slug
 * @returns {Object|null}
 */
export function getToolBySlug(slug) {
  if (!miniSearchInstance) getSearchEngine()
  return toolMap.get(slug) || null
}

/**
 * Get all available categories from the index.
 *
 * @returns {Array<{cat: string, count: number}>}
 */
export function getCategoryCounts() {
  if (!miniSearchInstance) getSearchEngine()
  const counts = new Map()
  toolMap.forEach((tool) => {
    const c = tool.cat || 'uncategorized'
    counts.set(c, (counts.get(c) || 0) + 1)
  })
  return Array.from(counts.entries()).map(([cat, count]) => ({ cat, count }))
}
