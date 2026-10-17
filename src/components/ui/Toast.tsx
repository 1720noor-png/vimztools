import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}

const toastStyles: Record<ToastType, { icon: ReactNode; wrap: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
    wrap: 'border-emerald-200 bg-white',
  },
  error: {
    icon: <XCircle className="h-5 w-5 shrink-0 text-rose-500" />,
    wrap: 'border-rose-200 bg-white',
  },
  info: {
    icon: <Info className="h-5 w-5 shrink-0 text-sky-500" />,
    wrap: 'border-sky-200 bg-white',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++counter.current
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-slate-900/5 ${toastStyles[t.type].wrap}`}
          >
            {toastStyles[t.type].icon}
            <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}