import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import {
  AI_SUBCATEGORIES,
  AI_TOTAL_TOOLS,
} from './aiToolsConfig'

export default function AiToolsHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return AI_SUBCATEGORIES
    return AI_SUBCATEGORIES.filter((sub) =>
      [sub.title, sub.tagline, sub.description].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  const accent = getCategoryAccent('/ai-tools') ?? {
    name: 'AI & Machine Learning',
    path: '/ai-tools',
    icon: AI_SUBCATEGORIES[0].icon,
    bg: '#F5F3FF',
    bgDark: '#1e1b4b',
    accent: '#8B5CF6',
  }

  return (
    <>
      <Seo
        title="AI & Machine Learning Tools — Prompt Engineering, LLM Tokens & Vector Math | vimz Tools"
        description={`Explore ${AI_TOTAL_TOOLS} specialized browser-based AI tools across prompt optimization, token estimation, VRAM sizers, RAG architectures, and synthetic data.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>AI &amp; Machine Learning</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="AI & Machine Learning Suite"
            description={`High-performance, private, client-side tools for AI engineers, prompt designers, and LLM practitioners. All ${AI_TOTAL_TOOLS} utilities run directly in your browser with zero server uploads.`}
            accent={accent}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search AI tools, prompt engineering, token counters, VRAM sizers, RAG..."
            categoryName="AI & Machine Learning"
            toolCount={filteredSubs.length}
          />
        </div>

        {filteredSubs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching AI subcategories</p>
            <p className="mt-1 text-xs text-slate-400">Try searching for tokens, VRAM, prompt, RAG, or embeddings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSubs.map((sub, i) => (
              <SubcategoryCard
                key={sub.id}
                to={`/ai-tools/${sub.id}`}
                title={sub.title}
                count={sub.toolIds.length}
                icon={sub.icon}
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
