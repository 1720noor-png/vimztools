import React from 'react'

export interface ToolCardWrapperProps {
  theme?: 'sky' | 'indigo' | 'emerald' | 'rose' | 'amber' | string
  className?: string
  children: React.ReactNode
}

export function ToolCardWrapper({
  theme = 'sky',
  className = '',
  children,
}: ToolCardWrapperProps) {
  return (
    <section
      data-theme={theme}
      aria-label="Image Tool Workspace"
      className={`rounded-2xl border border-sky-100 dark:border-sky-900/30 dark:bg-slate-900 p-5 shadow-sm bg-white transition-colors duration-200 ${className}`}
    >
      {children}
    </section>
  )
}

export default ToolCardWrapper
