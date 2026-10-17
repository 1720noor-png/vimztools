import { useEffect, useMemo, useState } from 'react'
import { categories as staticCategories, tools as staticTools, type Tool, type ToolCategory } from './catalog'
import { getApiCategories, getApiTool, getApiTools, toCatalogTool } from './api'

export interface RegistryTool extends Tool {
  templateType: string
  targetUser?: string
}

export interface RegistryState {
  tools: RegistryTool[]
  categories: ToolCategory[]
  loading: boolean
  source: 'api' | 'static'
}

const STATIC_REGISTRY: RegistryState = {
  tools: staticTools.map((t) => ({ ...t, templateType: (t as Partial<RegistryTool>).templateType ?? 'static' })),
  categories: staticCategories,
  loading: false,
  source: 'static',
}

let hydratePromise: Promise<RegistryState> | null = null

function hydrate(): Promise<RegistryState> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    try {
      const [apiTools] = await Promise.all([getApiTools(), getApiCategories()])
      if (apiTools.length === 0) return STATIC_REGISTRY

      const byId = new Map<string, RegistryTool>()
      for (const t of staticTools) {
        byId.set(t.id, { ...t, templateType: (t as Partial<RegistryTool>).templateType ?? 'static' })
      }
      for (const t of apiTools.map((raw) => toCatalogTool(raw))) {
        if (!byId.has(t.id)) byId.set(t.id, t)
      }

      return { tools: [...byId.values()], categories: staticCategories, loading: false, source: 'api' }
    } catch {
      return STATIC_REGISTRY
    }
  })()
  return hydratePromise
}

export function useToolRegistry(): RegistryState {
  const [state, setState] = useState<RegistryState>(STATIC_REGISTRY)

  useEffect(() => {
    let mounted = true
    hydrate().then((next) => {
      if (mounted) setState(next)
    })
    return () => {
      mounted = false
    }
  }, [])

  return state
}

export function useSearch(
  registry: RegistryState,
  query: string,
  categoryId?: string,
): RegistryTool[] {
  return useMemo(() => {
    let list: RegistryTool[] = registry.tools
    if (categoryId) list = list.filter((t) => t.categoryId === categoryId)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((t) =>
        [t.name, t.category, t.description, ...t.keywords].join(' ').toLowerCase().includes(q),
      )
    }
    return list
  }, [registry, query, categoryId])
}

export async function findRegistryTool(toolId: string): Promise<RegistryTool | null> {
  const staticHit = staticTools.find((t) => t.id === toolId || t.path.endsWith(`/${toolId}`))
  if (staticHit) {
    return {
      ...staticHit,
      id: staticHit.id,
      templateType: (staticHit as RegistryTool).templateType ?? 'static',
    }
  }
  const apiTool = await getApiTool(toolId)
  if (apiTool) return toCatalogTool(apiTool)
  return null
}

export function toolCountByCategory(tools: RegistryTool[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of tools) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + 1)
  return map
}