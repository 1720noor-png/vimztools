import { useParams } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import ArchetypeRenderer from '../../office/archetypes/Dispatcher'
import { getOfficeSpec } from '../../office/specs'
import { officeToolById } from '../../office/officeConfig'

export default function OfficeToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const info = toolSlug ? officeToolById(toolSlug) : undefined
  const spec = toolSlug ? getOfficeSpec(toolSlug) : undefined

  if (!info || !spec) return <NotFoundPage />
  const { tool, module, subcategory } = info

  return (
    <>
      <Seo title={`${tool.name} - vimz Tools`} description={tool.description} />
      <ToolShell
        title={tool.name}
        description={tool.description}
        icon={<Briefcase className="h-6 w-6" />}
        breadcrumb={module.name}
        instruction={`Part of ${module.label}: ${module.name} / ${subcategory.name}. Adjust the inputs below and the metrics recompute instantly.`}
      >
        <div className="mx-auto max-w-5xl">
          <ArchetypeRenderer key={spec.id} spec={spec} />
        </div>
      </ToolShell>
    </>
  )
}