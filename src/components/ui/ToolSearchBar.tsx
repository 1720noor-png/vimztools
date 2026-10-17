import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft, ArrowRight } from 'lucide-react'
import { useGlobalSearch } from '../../lib/winHooks'

export default function ToolSearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useGlobalSearch(query, 8)
  const showResults = focused && query.trim().length > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  const go = (path: string) => {
    setFocused(false)
    inputRef.current?.blur()
    navigate(path)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selected]) go(results[selected].path)
      else if (query.trim()) go('/tools')
    } else if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const selectTool = (index: number, path: string) => {
    setSelected(index)
    go(path)
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-xl transition-all duration-300 dark:bg-slate-800 ${
          showResults
            ? 'border-primary-400 shadow-primary-600/20'
            : 'border-slate-200 shadow-slate-900/10 hover:border-primary-300'
        }`}
      >
        <Search className="h-6 w-6 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Search tools..."
          className="w-full bg-transparent text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          aria-label="Search all tools"
        />
        <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-1.5 py-1 text-[11px] font-semibold text-slate-500 sm:flex">
          Ctrl K
        </kbd>
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800">
          {results.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No tools found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try a different keyword such as a tool name or what it does.
              </p>
            </div>
          ) : (
            <>
              <p className="border-b border-slate-100 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              <ul className="max-h-80 overflow-y-auto p-2">
                {results.map((tool, i) => (
                  <li key={`${tool.group}-${tool.id}`}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectTool(i, tool.path)}
                      onMouseEnter={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        selected === i ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${tool.group === 'wins' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-100 text-primary-700'}`}>
                        {tool.group === 'wins' ? 'W' : 'F'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">{tool.name}</span>
                        <span className="block truncate text-xs text-slate-400">{tool.category}</span>
                      </span>
                      <CornerDownLeft className="h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
                <span className="text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-500">W</span> new collection ·{' '}
                  <span className="font-semibold text-primary-600">F</span> featured
                </span>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setFocused(false)
                    navigate('/tools')
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  Browse all tools <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
