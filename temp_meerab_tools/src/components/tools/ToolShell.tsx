import { useState, useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ShieldCheck, Lightbulb, ListOrdered, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getCategoryAccent, DEFAULT_CATEGORY_ACCENT } from '../../lib/categoryAccents'
import { useAuth } from '../../context/AuthContext'

const guideSteps = [
  {
    title: 'Enter your details or upload your file',
    text: 'Use the form or drag-and-drop area above — everything happens right in your browser.',
  },
  {
    title: 'Adjust the options to fit your need',
    text: 'Tweak the settings, units or quality until the result looks just right for you.',
  },
  {
    title: 'Download, copy or save your result',
    text: 'Your output is ready on the spot and never leaves your device.',
  },
]
const defaultGuideSteps = guideSteps

const guideTips = [
  'Everything runs 100% in your browser — no account, no uploads and no waiting.',
  'Use the search bar in the top header to jump straight to any other tool.',
  'Unsure? Start with the default values, then fine-tune step by step.',
]
const defaultGuideTips = guideTips

interface CrumbItem {
  label: string
  to?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function unslug(text: string): string {
  return text
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getCategoryRoute(slugOrName: string, hintName?: string): { label: string; to: string } {
  const s = slugify(slugOrName)
  if (s === 'pdf' || s === 'pdf-utilities') return { label: 'PDF Utilities', to: '/tools/pdf' }
  if (s === 'document-word' || s === 'ms-word-tools' || s.includes('word')) return { label: 'MS Word & Document Suite', to: '/tools/document-word' }
  if (s === 'image' || s === 'image-tools' || s === 'images') return { label: 'Image Tools', to: '/image-tools' }
  if (s === 'health') return { label: 'Health', to: '/health' }
  if (s === 'household') return { label: 'Household', to: '/household' }
  if (s.includes('student') || s.includes('academic')) return { label: 'Students & Academics', to: '/students-academics' }
  if (s.includes('market') || s.includes('seo')) return { label: 'Marketers & SEO', to: '/marketers-seo' }
  if (s.includes('office') && s.includes('corporate')) return { label: 'Office & Corporate', to: '/office-corporate' }
  if (s === 'women') return { label: 'Women', to: '/women' }
  if (s === 'documents') return { label: 'Document Generators', to: '/tools/documents' }
  if (s === 'office-utilities') return { label: 'Office Utilities', to: '/tools/office-utilities' }
  if (s === 'blogs' || s === 'blog') return { label: 'Blogs', to: '/blogs' }
  return { label: hintName || unslug(slugOrName), to: `/tools/${slugOrName}` }
}

function getSubcategoryRoute(catSlug: string, subName: string): string {
  const cat = slugify(catSlug)
  const subSlug = slugify(subName)
  if (cat === 'pdf') return '/tools/pdf'
  if (cat === 'document-word' || cat === 'ms-word-tools') return '/tools/document-word'
  if (cat === 'health') return `/health/${subSlug}`
  if (cat === 'household') return `/household/${subSlug}`
  if (cat === 'image-tools' || cat === 'image') return `/image-tools/${subSlug}`
  if (cat.includes('student')) return '/students-academics'
  if (cat.includes('market')) return '/marketers-seo'
  if (cat === 'women') return `/women/${subSlug}`
  return `/tools/${catSlug}`
}

function resolveBreadcrumbs(
  pathname: string,
  rawBreadcrumb?: string,
  title?: string,
): CrumbItem[] {
  const crumbs: CrumbItem[] = [{ label: 'Home', to: '/' }]

  const rawParts = rawBreadcrumb
    ? rawBreadcrumb
        .split(/\s*[>/]\s*/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  if (rawParts.length > 0 && rawParts[0].toLowerCase() === 'home') {
    rawParts.shift()
  }

  if (
    rawParts.length > 0 &&
    title &&
    rawParts[rawParts.length - 1].toLowerCase() === title.trim().toLowerCase()
  ) {
    rawParts.pop()
  }

  const imgMatch = pathname.match(/^\/image-tools(?:\/([^/]+))?(?:\/([^/]+))?/)
  if (imgMatch) {
    crumbs.push({ label: 'Image Tools', to: '/image-tools' })
    const subSlug = imgMatch[1]
    const subLabel = rawParts[1] || rawParts[0] || (subSlug ? unslug(subSlug) : undefined)
    if (subSlug && subLabel && subLabel !== 'Image Tools') {
      crumbs.push({ label: subLabel, to: `/image-tools/${subSlug}` })
    }
    if (title) crumbs.push({ label: title })
    return crumbs
  }

  const toolsMatch = pathname.match(/^\/tools\/([^/]+)(?:\/([^/]+))?/)
  if (toolsMatch) {
    const catSlug = toolsMatch[1]
    const catInfo = getCategoryRoute(catSlug, rawParts[0])
    crumbs.push({ label: catInfo.label, to: catInfo.to })

    const subCandidate = rawParts.find(
      (p) =>
        p.toLowerCase() !== catInfo.label.toLowerCase() &&
        p.toLowerCase() !== catSlug.toLowerCase() &&
        p.toLowerCase() !== 'tools',
    )
    if (subCandidate) {
      const subTo = getSubcategoryRoute(catSlug, subCandidate)
      crumbs.push({ label: subCandidate, to: subTo })
    }

    if (title) crumbs.push({ label: title })
    return crumbs
  }

  const hhMatch = pathname.match(/^\/household(?:\/([^/]+))?/)
  if (hhMatch) {
    crumbs.push({ label: 'Household', to: '/household' })
    const subSlug = hhMatch[1]
    const subCandidate =
      rawParts.find((p) => p.toLowerCase() !== 'household') ||
      (subSlug ? unslug(subSlug) : undefined)
    if (subCandidate) {
      const subTo = subSlug ? `/household/${subSlug}` : `/household/${slugify(subCandidate)}`
      crumbs.push({ label: subCandidate, to: subTo })
    }
    if (title) crumbs.push({ label: title })
    return crumbs
  }

  const saMatch = pathname.match(/^\/students-academics(?:\/([^/]+))?/)
  if (saMatch) {
    crumbs.push({ label: 'Students & Academics', to: '/students-academics' })
    const subSlug = saMatch[1]
    const subCandidate =
      rawParts.find((p) => !p.toLowerCase().includes('student')) ||
      (subSlug ? unslug(subSlug) : undefined)
    if (subCandidate) {
      crumbs.push({
        label: subCandidate,
        to: subSlug ? `/students-academics/${subSlug}` : '/students-academics',
      })
    }
    if (title) crumbs.push({ label: title })
    return crumbs
  }

  const mkMatch = pathname.match(/^\/marketers-seo(?:\/([^/]+))?/)
  if (mkMatch) {
    crumbs.push({ label: 'Marketers & SEO', to: '/marketers-seo' })
    const subSlug = mkMatch[1]
    const subCandidate =
      rawParts.find(
        (p) => !p.toLowerCase().includes('marketer') && !p.toLowerCase().includes('seo'),
      ) || (subSlug ? unslug(subSlug) : undefined)
    if (subCandidate) {
      crumbs.push({ label: subCandidate, to: subSlug ? `/marketers-seo/${subSlug}` : '/marketers-seo' })
    }
    if (title) crumbs.push({ label: title })
    return crumbs
  }

  const hlMatch = pathname.match(/^\/health(?:\/([^/]+))?/)
  if (hlMatch) {
    crumbs.push({ label: 'Health', to: '/health' })
    const subSlug = hlMatch[1]
    const subCandidate =
      rawParts.find((p) => p.toLowerCase() !== 'health') ||
      (subSlug ? unslug(subSlug) : undefined)
    if (subCandidate) {
      crumbs.push({
        label: subCandidate,
        to: subSlug ? `/health/${subSlug}` : `/health/${slugify(subCandidate)}`,
      })
    }
    if (title) crumbs.push({ label: title })
    return crumbs
  }

  if (rawParts.length > 0) {
    for (let i = 0; i < rawParts.length; i++) {
      const part = rawParts[i]
      const catInfo = getCategoryRoute(part, part)
      crumbs.push({ label: part, to: i === 0 ? catInfo.to : undefined })
    }
  } else {
    crumbs.push({ label: 'Tools', to: '/tools' })
  }

  if (title) crumbs.push({ label: title })
  return crumbs
}

export default function ToolShell({
  title,
  description,
  icon,
  children,
  breadcrumb,
  instruction,
  toolId,
  guideSteps = defaultGuideSteps,
  guideTips = defaultGuideTips,
  tipsTitle = 'Quick Tips & Suggestions',
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  breadcrumb?: string
  instruction?: string
  toolId?: string
  guideSteps?: { title: string; text: string }[]
  guideTips?: string[]
  tipsTitle?: string
}) {
  const { pathname } = useLocation()
  const { toggleFavorite, isFavorite, addRecentTool } = useAuth()
  const [guideOpen, setGuideOpen] = useState(true)
  const catMatch = pathname.match(/\/tools\/([a-z0-9-]+)/)
  const accent =
    getCategoryAccent(pathname) ||
    (catMatch ? getCategoryAccent(`/tools/${catMatch[1]}`) : undefined) ||
    DEFAULT_CATEGORY_ACCENT
  const wsTint = {
    '--ws-accent': accent.accent,
    '--ws-bg': accent.bg,
    '--ws-bg-dark': accent.bgDark,
  } as CSSProperties
  const crumbs = resolveBreadcrumbs(pathname, breadcrumb, title)
  const categoryBadge =
    crumbs.length > 1 && crumbs[1].label !== title ? crumbs[1].label : undefined

  const resolvedToolId = toolId || pathname.split('/').filter(Boolean).pop() || slugify(title)
  const isFav = isFavorite(resolvedToolId)

  useEffect(() => {
    if (resolvedToolId) {
      addRecentTool(resolvedToolId)
    }
  }, [resolvedToolId, addRecentTool])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Vibrant Category-Tinted Tool Header Banner */}
      <div
        className="relative mb-6 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--ws-accent)_32%,#e2e8f0)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--ws-bg)_85%,#ffffff)_0%,rgba(255,255,255,0.95)_100%)] p-6 shadow-sm sm:p-8 dark:border-[color-mix(in_srgb,var(--ws-accent)_40%,#1f2937)] dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--ws-bg-dark)_70%,#0b0f17)_0%,#111827_100%)]"
        style={wsTint}
      >
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1
              return (
                <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="transition hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? 'font-semibold text-slate-800 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                      &gt;
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="flex items-start gap-4">
          <div className="ws-icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-2xs" style={wsTint}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                {categoryBadge && (
                  <div className="mb-2">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-2xs"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${accent.accent} 14%, #ffffff)`,
                        color: accent.accent,
                        border: `1px solid color-mix(in srgb, ${accent.accent} 30%, transparent)`,
                      }}
                    >
                      {categoryBadge}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {title}
                </h1>
              </div>

              {/* Favorite Toggle Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(resolvedToolId)}
                title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isFav
                    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{isFav ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            {instruction && (
              <p
                className="mt-2 text-sm font-semibold sm:text-base"
                style={{ color: accent.accent }}
              >
                {instruction}
              </p>
            )}
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/60 dark:bg-emerald-950/25">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          Your files are processed 100% locally in your browser and are never uploaded.
        </p>
      </div>

      <div
        className="ws-frame relative overflow-hidden rounded-3xl border-2 p-5 shadow-lg sm:p-7"
        style={wsTint}
      >
        <div className="ws-strip absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
        {children}
      </div>

      {/* Collapsible How-To Guide & Pro Tips */}
      <section
        className="mt-10 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--ws-accent)_25%,#e2e8f0)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,color-mix(in_srgb,var(--ws-bg)_35%,#ffffff)_100%)] dark:border-[color-mix(in_srgb,var(--ws-accent)_35%,#1f2937)] dark:bg-[linear-gradient(180deg,#111827_0%,color-mix(in_srgb,var(--ws-bg-dark)_35%,#111827)_100%)]"
        style={wsTint}
      >
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between border-b border-slate-200/70 bg-white/60 px-6 py-4 text-left transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:bg-slate-800"
        >
          <div className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-white">
            <ListOrdered className="h-5 w-5 text-brand" />
            <span>How to Use This Tool & Practical Guidelines</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{guideOpen ? 'Collapse' : 'Expand guide'}</span>
            {guideOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {guideOpen && (
          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-3 animate-fade-in">
            <div className="lg:col-span-2">
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Step-by-Step Instructions
              </h3>
              <ol className="mt-5 space-y-4">
                {guideSteps.map((step, i) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white shadow-sm shadow-brand/30">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                {tipsTitle}
              </h3>
              <ul className="mt-5 space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-900/20">
                {guideTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-amber-500">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}