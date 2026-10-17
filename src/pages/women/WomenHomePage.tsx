import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import {
  womenSubcategories,
  womenToolCount,
  WOMEN_TOTAL_TOOLS,
} from './womenConfig'

export default function WomenHomePage() {
  return (
    <>
      <Seo
        title="Women Tools - Fitness, Health, Beauty, Home & FemCare | vimz Tools"
        description={`Browse ${WOMEN_TOTAL_TOOLS} women-focused tools across fitness, health & life, beauty & care, household and femhealth - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Women</span>
        </nav>

<div className="mb-8">
          <CategoryHero
            title="Women"
            description="Curated daily-use tools for women — from a women's health calculator to vision boards and printable planners. Private, simple and always free."
            accent={getCategoryAccent('/women')!}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {womenSubcategories.map((sub, i) => {
            const count = womenToolCount(sub.id)
            const Icon = sub.icon
            return (
              <Link
                key={sub.id}
                to={`/women/${sub.id}`}
                className="animate-fade-up group flex flex-col rounded-2xl border border-rose-100/90 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10 dark:border-rose-950/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-rose-950/20 dark:hover:border-rose-500/50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${sub.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-rose-100 bg-rose-50/80 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                    {count} {count === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-rose-700 dark:text-slate-100 dark:group-hover:text-rose-300">
                  {sub.title}
                </h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-rose-500/80 dark:text-rose-400/80">
                  {sub.tagline}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {sub.description}
                </p>
                <div className="mt-5 flex items-center justify-end">
                  <span className="flex items-center gap-1 text-sm font-bold text-rose-600 transition group-hover:gap-2 dark:text-rose-400">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}