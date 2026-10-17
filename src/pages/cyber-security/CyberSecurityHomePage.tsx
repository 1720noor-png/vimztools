import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShieldAlert } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  cyberSubcategories,
  CYBER_SECURITY_CATEGORY_NAME,
} from './cyberSecurityConfig'

export default function CyberSecurityHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cyberSubcategories
    return cyberSubcategories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [query])

  const totalTools = useMemo(() => {
    return cyberSubcategories.reduce((acc, s) => acc + s.toolIds.length, 0)
  }, [])

  return (
    <>
      <Seo
        title={`${CYBER_SECURITY_CATEGORY_NAME} — Fast, Private Client-Side Tools`}
        description="Zero-trust cryptographic utilities, password entropy sizers, CVSS scoring, and PII redactors. 100% private in-browser security analysis."
      />

      <div className="min-h-screen pb-20">
        <CategoryHero
          title="Cybersecurity, Privacy & Cryptography Suite"
          description={`High-assurance, client-side security utilities for AppSec engineers, sysadmins, and privacy officers. All ${totalTools} utilities execute strictly in-browser without sending sensitive keys or text to any remote server.`}
          accent={{
            name: CYBER_SECURITY_CATEGORY_NAME,
            path: '/cyber-security',
            icon: ShieldAlert,
            bg: '#FEF2F2',
            bgDark: '#450a0a',
            accent: '#EF4444',
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-rose-600 dark:hover:text-rose-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Cybersecurity &amp; Privacy Suite
            </span>
          </nav>

          {/* Sticky Search Bar */}
          <div className="sticky top-20 z-30 mb-8 bg-white/80 py-2 backdrop-blur-md dark:bg-slate-900/80">
            <CategoryTopSearchBar
              placeholder="Search cybersecurity tools, entropy, cvss, openssl, totp, hashing, pii..."
              value={query}
              onChange={setQuery}
            />
          </div>

          {/* 20 Subcategory Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSubs.map((sub) => {
              const Icon = sub.icon
              return (
                <Link
                  key={sub.id}
                  to={`/cyber-security/${sub.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-lg dark:border-rose-900/30 dark:bg-slate-800/80 dark:hover:border-rose-500"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-rose-100/70 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                        {sub.toolIds.length} tools
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                      {sub.title}
                    </h3>
                    <p className="mb-3 text-xs font-medium text-rose-700 dark:text-rose-300/90">
                      {sub.tagline}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center text-sm font-semibold text-rose-600 dark:text-rose-400">
                    <span>Explore folder</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredSubs.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-base text-slate-500 dark:text-slate-400">
                No security subcategories matched &quot;{query}&quot;. Try searching for another keyword.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
