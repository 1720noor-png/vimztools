import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import Seo from '../components/ui/Seo'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found | vimz Tools" />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-primary-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-primary-50/30 p-10 shadow-lg dark:border-primary-900/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 sm:p-14">
          <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-600 sm:text-8xl">404</p>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Page not found</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            The page you're looking for doesn't exist or has been moved. Let's get you back
            on track.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition hover:brightness-110 active:scale-95"
            >
              <Home className="h-4 w-4" /> Back home
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-sm transition hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-500"
            >
              <Search className="h-4 w-4" /> Browse tools
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}