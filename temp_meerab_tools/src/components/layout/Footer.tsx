import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Search, Sparkles, X } from 'lucide-react'
import Logo from '../ui/Logo'

export default function Footer() {
  const navigate = useNavigate()
  const [cookieModalOpen, setCookieModalOpen] = useState(false)

  const handleGlobalSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    )
  }

  return (
    <>
      <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {/* Column 1: Brand */}
          <div className="flex flex-col">
            <Link
              to="/"
              className="inline-flex items-center transition-opacity duration-200 hover:opacity-85"
              aria-label="vimz.ai homepage"
            >
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The all-in-one privacy-first utility platform for creators, students, and professionals.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Client-Side · Zero Server Uploads
            </div>
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} Vimz.ai. All rights reserved.
            </p>
          </div>

          {/* Column 2: Active Portals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Active Portals
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/health"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Health Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/household"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Household &amp; Living
                </Link>
              </li>
              <li>
                <Link
                  to="/image-tools"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Image Processing
                </Link>
              </li>
              <li>
                <Link
                  to="/students-academics"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Students &amp; Academics
                </Link>
              </li>
              <li>
                <Link
                  to="/marketers-seo"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  SEO &amp; Marketers
                </Link>
              </li>
              <li>
                <Link
                  to="/tools/pdf"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  PDF Utilities
                </Link>
              </li>
              <li>
                <Link
                  to="/tools/document-word"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  MS Word &amp; Document Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Platform &amp; Resources
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/blogs"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Blogs &amp; Guides
                </Link>
              </li>
              <li>
                <button
                  onClick={handleGlobalSearch}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  Global Search (Ctrl+K)
                </button>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                  Release Notes &amp; Updates
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  All Tools Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Privacy */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Legal &amp; Privacy
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCookieModalOpen(true)}
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cookie Settings
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@vimz.ai"
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/80 py-5 dark:border-slate-800/80">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8 dark:text-slate-500">
            <p>
              Processing runs 100% locally on your machine via WebAssembly &amp; HTML5 Canvas.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300">
                Privacy
              </Link>
              <span>·</span>
              <button
                onClick={() => navigate('/tools')}
                className="hover:text-slate-600 dark:hover:text-slate-300"
              >
                Browse All Tools
              </button>
              <span>·</span>
              <a
                href="mailto:support@vimz.ai"
                className="hover:text-slate-600 dark:hover:text-slate-300"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Settings Modal */}
      {cookieModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h4 id="cookie-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Cookie &amp; Privacy Preferences
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>Vimz.ai</strong> operates with strict privacy-by-design principles:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <strong>Zero advertising cookies:</strong> We never track you across other websites.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <strong>Essential preferences only:</strong> Theme (light/dark) and user bookmarks are stored in your own device's localStorage.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <strong>No telemetry on files:</strong> Your documents, photos, and calculations never leave your browser sandbox.
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="rounded-xl bg-[#9D388A] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#7c2a6e]"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}