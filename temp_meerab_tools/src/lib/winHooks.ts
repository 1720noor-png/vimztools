import { useEffect, useMemo, useState } from 'react'
import {
  loadWinIndex,
  loadWinTools,
  type WinCategoryMeta,
  type WinSubcategoryMeta,
  type WinTool,
} from './winRegistry'
import { useToolRegistry } from './toolRegistry'

export interface WinCategoryState {
  category?: WinCategoryMeta
  loading: boolean
  error: boolean
}

export interface WinSubcategoryState {
  meta?: WinSubcategoryMeta
  tools: WinTool[]
  loading: boolean
  error: boolean
}

const indexState: { promise: Promise<WinCategoryMeta[]> | null } = { promise: null }

export function useWinIndex(): { categories: WinCategoryMeta[]; loading: boolean } {
  const [categories, setCategories] = useState<WinCategoryMeta[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    indexState.promise ??= loadWinIndex()
    indexState.promise.then((cats) => {
      if (!mounted) return
      setCategories(cats)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])
  return { categories, loading }
}

export function useWinCategory(categoryId?: string): WinCategoryState {
  const { categories, loading } = useWinIndex()
  const category = useMemo(
    () => (categoryId && categories.find((c) => c.id === categoryId)) || undefined,
    [categories, categoryId],
  )
  return { category, loading, error: !loading && !category }
}

export function useWinSubcategory(categoryId?: string, subcategoryId?: string): WinSubcategoryState {
  const { category, loading } = useWinCategory(categoryId)
  const meta = useMemo(
    () =>
      (subcategoryId && category?.subcategories.find((s) => s.id === subcategoryId)) || undefined,
    [category, subcategoryId],
  )
  const [tools, setTools] = useState<WinTool[]>([])
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    if (!categoryId || !subcategoryId) return
    let mounted = true
    loadWinTools(categoryId, subcategoryId).then((list) => {
      if (!mounted) return
      setTools(list)
      setBusy(false)
    })
    return () => {
      mounted = false
    }
  }, [categoryId, subcategoryId])

  return {
    meta,
    tools,
    loading: loading || busy,
    error: !loading && !busy && !meta,
  }
}

export function useWinTool(
  categoryId?: string,
  subcategoryId?: string,
  toolSlug?: string,
): { tool?: WinTool; loading: boolean; error: boolean } {
  const { tools, loading, error } = useWinSubcategory(categoryId, subcategoryId)
  const tool = useMemo(
    () => (toolSlug && tools.find((t) => t.slug === toolSlug)) || undefined,
    [tools, toolSlug],
  )
  return { tool, loading, error: error || (!loading && tools.length > 0 && !tool) }
}

export interface GlobalSearchResult {
  id: string
  name: string
  description: string
  category: string
  path: string
  keywords: string[]
  group: 'featured' | 'wins'
}

export function useGlobalSearch(query: string, limit = 8): GlobalSearchResult[] {
  const registry = useToolRegistry()
  const [winTools, setWinTools] = useState<WinTool[]>([])

  useEffect(() => {
    let mounted = true
    loadWinIndex().then(async (categories) => {
      const all = await Promise.all(
        categories.flatMap((c) => c.subcategories.map((s) => loadWinTools(c.id, s.id))),
      )
      if (mounted) setWinTools(all.flat())
    })
    return () => {
      mounted = false
    }
  }, [])

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const featured: GlobalSearchResult[] = registry.tools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      path: t.path,
      keywords: t.keywords,
      group: 'featured',
    }))
    const wins: GlobalSearchResult[] = winTools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.purpose,
      category: t.categoryName,
      path: t.path,
      keywords: t.keywords,
      group: 'wins',
    }))
    return [...featured, ...wins]
      .filter((t) =>
        [t.name, t.category, t.description, ...t.keywords].join(' ').toLowerCase().includes(q),
      )
      .slice(0, limit)
  }, [query, limit, registry.tools, winTools])
}