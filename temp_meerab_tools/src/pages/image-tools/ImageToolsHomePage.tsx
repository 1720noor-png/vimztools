import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import {
  imageSubcategories,
  IMAGE_PORTAL_IDENTITY_COUNT,
  IMAGE_PORTAL_PLACEMENT_COUNT,
  IMAGE_TOTAL_FOLDERS,
} from './imageToolsConfig'

export default function ImageToolsHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubcategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return imageSubcategories
    return imageSubcategories.filter((sub) =>
      [sub.title, sub.tagline, sub.description, ...sub.toolIds].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <Seo
        title="Image Tools - Resize, Compress, Convert & Edit in Browser | vimz Tools"
        description={`Browse ${IMAGE_PORTAL_IDENTITY_COUNT} free image tools across ${IMAGE_TOTAL_FOLDERS} categories - resize, compress, convert, remove backgrounds, watermark, OCR, QR codes and print layouts. 100% in your browser.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Image Tools</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Image Tools"
            description={`Pick a category to open ${IMAGE_PORTAL_IDENTITY_COUNT} image tools (${IMAGE_PORTAL_PLACEMENT_COUNT} placements across ${IMAGE_TOTAL_FOLDERS} folders). Every one runs entirely in your browser - no uploads, no accounts, no waiting.`}
            accent={getCategoryAccent('/image-tools')!}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search image tools, categories, and utilities..."
            categoryName="Image Tools"
            toolCount={filteredSubcategories.length}
          />
        </div>

        {filteredSubcategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching image categories</p>
            <p className="mt-1 text-xs text-slate-400">Try a different keyword or browse all folders above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSubcategories.map((sub, i) => (
              <SubcategoryCard
                key={sub.id}
                to={`/image-tools/${sub.id}`}
                title={sub.title}
                count={sub.toolIds.length}
                icon={sub.icon}
                tagline={sub.tagline}
                description={sub.description}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
