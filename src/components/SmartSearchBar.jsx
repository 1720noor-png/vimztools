import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchTools } from '@services/search/searchEngine.js'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
)

/**
 * SmartSearchBar Component (Zero-LLM Phase 1)
 * Fast client-side fuzzy search bar supporting English and Roman Urdu keywords.
 * Includes keyboard navigation (Arrows, Enter, Esc), debounced search, and quick results dropdown.
 *
 * @param {Object} props
 * @param {string} [props.placeholder] - Custom placeholder text
 * @param {string} [props.category] - Filter search to a specific category
 * @param {boolean} [props.autoFocus=false] - Auto focus input
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {function} [props.onSelect] - Callback when tool is selected
 */
export default function SmartSearchBar({
  placeholder = 'Search 1,000+ tools (e.g. GPA, mortgage, paisa double, attendance)...',
  category,
  autoFocus = false,
  className = '',
  onSelect
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    const matches = searchTools(query, { category, limit: 8 })
    setResults(matches)
    setIsOpen(matches.length > 0)
    setActiveIndex(-1)
  }, [query, category])

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (tool) => {
    setIsOpen(false)
    setQuery('')
    if (onSelect) {
      onSelect(tool)
    } else {
      navigate(tool.cat ? `/${tool.cat}/${tool.slug}` : `/tools/${tool.slug}`)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen || !results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex])
      } else if (results.length > 0) {
        handleSelect(results[0])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className={`smart-search-bar-wrap ${className}`} style={{ position: 'relative', width: '100%' }}>
      <div className="hero-search" style={{ position: 'relative' }}>
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="smart-search-results"
          aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length && setIsOpen(true)}
          placeholder={placeholder}
          className="big smart-search-input"
          style={{ width: '100%' }}
        />
        <span className="kbd-hint" aria-hidden="true">Ctrl K</span>
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="smart-search-results"
          ref={dropdownRef}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--bg-panel, #ffffff)',
            color: 'var(--text-main, #1e293b)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
            listStyle: 'none',
            padding: '8px 0',
            margin: 0,
            maxHeight: '380px',
            overflowY: 'auto'
          }}
        >
          {results.map((tool, idx) => {
            const isSelected = idx === activeIndex
            return (
              <li
                key={tool.slug}
                id={`result-${idx}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(tool)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-hover, rgba(99, 102, 241, 0.08))' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent, #6366f1)' : '3px solid transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{tool.icon || '🛠️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-heading, #0f172a)' }}>
                      {tool.name}
                    </span>
                    {tool.subcatName && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--badge-bg, #f1f5f9)',
                          color: 'var(--badge-text, #64748b)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tool.subcatName}
                      </span>
                    )}
                  </div>
                  {tool.desc && (
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted, #64748b)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tool.desc}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
