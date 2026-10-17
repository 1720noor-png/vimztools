import { useCallback, useRef, useState, type DragEvent } from 'react'
import { FileUp, X } from 'lucide-react'

interface DropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  label?: string
}

export default function Dropzone({
  onFiles,
  accept,
  multiple = true,
  maxFiles,
  label = 'Drag & drop files here, or click to browse',
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const list = Array.from(files)
      if (maxFiles && list.length > maxFiles) {
        onFiles(list.slice(0, maxFiles))
      } else {
        onFiles(list)
      }
    },
    [maxFiles, onFiles],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all ${
        dragging
          ? 'border-primary-500 bg-primary-50 scale-[1.01]'
          : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-primary-50/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
          dragging ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700 group-hover:bg-primary-600 group-hover:text-white'
        }`}
      >
        <FileUp className="h-7 w-7" />
      </div>
      <div>
        <p className="font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-sm text-slate-400">
          Files stay on your device and are never uploaded
        </p>
      </div>
    </div>
  )
}

export function FileChip({
  file,
  index,
  onRemove,
}: {
  file: File
  index?: number
  onRemove?: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700">
        {index != null ? index + 1 : ''}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(index ?? 0)}
          className="rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}