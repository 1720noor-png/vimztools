import { ShieldCheck, Lock, EyeOff, FileDown, Cookie, Server } from 'lucide-react'
import Seo from '../components/ui/Seo'

const principles = [
  {
    icon: Lock,
    title: 'No file uploads — ever',
    body: 'Every file, image and document you work with is processed entirely on your device using client-side JavaScript (Web Workers and browser APIs). We have no servers that receive your files, and no upload endpoints exist in the codebase.',
  },
  {
    icon: EyeOff,
    title: 'No tracking of your content',
    body: 'We do not collect, store, transmit or analyze the contents of the files you process. Nothing you type, crop, compress or convert is sent anywhere.',
  },
  {
    icon: FileDown,
    title: 'Your data stays yours',
    body: 'Generated outputs — PDFs, images, resumes, invoices — are built locally and downloaded straight from your browser, so you own every byte of what you create.',
  },
  {
    icon: Cookie,
    title: 'Minimal cookies & storage',
    body: 'We do not use advertising or third-party tracking cookies. Any settings you save (like bookmarks) are stored only in your own browser\u2019s localStorage.',
  },
  {
    icon: Server,
    title: 'No required accounts',
    body: 'vimz.ai is free, anonymous and privacy-first. You never need an account, email address or login to use any tool.',
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy | vimz.ai"
        description="vimz.ai processes everything 100% locally in your browser. No uploads, no tracking, no accounts. Read our full privacy policy."
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/80 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-slate-900/40 dark:to-teal-950/20 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 text-emerald-600 shadow-2xs dark:border-emerald-800/80 dark:bg-slate-800/90 dark:text-emerald-300">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-800/80 dark:bg-slate-800/90 dark:text-emerald-300">
                100% Client-Side
              </span>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80">
                Last updated: September 2026
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-5 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <p className="text-sm font-semibold leading-relaxed text-emerald-900 dark:text-emerald-200">
              TL;DR — Your files are processed 100% locally in your browser and are never
              uploaded. We don't have your files. We don't want your files.
            </p>
          </div>

          {principles.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50 text-emerald-700 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <p.icon className="h-4.5 w-4.5" />
                </span>
                {p.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.body}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Questions about privacy? Since we collect nothing about you, there's very
              little to ask — but you can always reach out through the project repository.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}