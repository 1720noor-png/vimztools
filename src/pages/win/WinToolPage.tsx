import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import NotFoundPage from '../NotFoundPage'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { type WinTool } from '../../lib/winRegistry'
import { useWinTool } from '../../lib/winHooks'
import { fallbackTemplate, templateRegistry } from '../../components/templates'
import { trackToolView } from '../../lib/api'
import type { RegistryTool } from '../../lib/toolRegistry'

function toRegistryTool(tool: WinTool): RegistryTool {
  return {
    id: tool.id,
    name: tool.name,
    categoryId: tool.categoryId,
    category: tool.categoryName,
    description: tool.purpose,
    keywords: tool.keywords,
    path: tool.path,
    icon: 'Wrench',
    templateType: tool.templateType,
    targetUser: tool.targetUser,
  }
}

export default function WinToolPage() {
  const { category: categorySlug, subcategory: subcategorySlug, tool: toolSlug } = useParams<{
    category: string
    subcategory: string
    tool: string
  }>()
  const { tool, loading, error } = useWinTool(categorySlug, subcategorySlug, toolSlug)

  useEffect(() => {
    if (!tool) return
    trackToolView(tool.id)
  }, [tool])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" /> Loading tool…
        </div>
      </div>
    )
  }

  if (error || !tool) {
    return <NotFoundPage />
  }

  const winTool = toRegistryTool(tool)
  const Template = templateRegistry[winTool.templateType] ?? fallbackTemplate

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Collections', to: '/category' },
          { label: tool.categoryName, to: `/category/${categorySlug}` },
          { label: tool.subcategoryName, to: `/category/${categorySlug}/${subcategorySlug}` },
          { label: tool.name },
        ]}
      />
      <Template key={winTool.id} tool={winTool} />
    </div>
  )
}