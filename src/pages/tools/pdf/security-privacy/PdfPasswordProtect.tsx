import { useCallback, useMemo, useState } from 'react'
import * as pdfLib from 'pdf-lib'
import { configure, lock } from 'pdf-lib-encrypt'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, TextInput } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

configure(pdfLib)

const PERM_ALLOW_ALL = -4

export default function PdfPasswordProtect() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [algo, setAlgo] = useState<'aes256' | 'rc4'>('aes256')
  const [allowPrint, setAllowPrint] = useState(true)
  const [allowCopy, setAllowCopy] = useState(true)
  const [allowModify, setAllowModify] = useState(true)
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
    },
    [toast],
  )

  const permissions = useMemo(() => {
    let p = PERM_ALLOW_ALL
    if (!allowModify) p &= ~0x08
    if (!allowCopy) p &= ~0x10
    if (!allowPrint) p &= ~0x04
    return p
  }, [allowModify, allowCopy, allowPrint])

  const protect = async () => {
    if (!file) return
    if (password.length < 4) {
      toast('Please use a password with at least 4 characters.', 'error')
      return
    }
    if (password !== confirm) {
      toast('Passwords do not match.', 'error')
      return
    }
    setBusy(true)
    try {
      const bytes = await readFileAsArrayBuffer(file)
      const encrypted = await lock(bytes, password, { algo, permissions })
      downloadBlob(new Blob([new Uint8Array(encrypted)], { type: 'application/pdf' }), `${stripFileExtension(file.name)}-protected.pdf`)
      toast('PDF encrypted. Test it with your password before sharing!')
    } catch (e) {
      console.error(e)
      toast('Encryption failed. If on HTTP, AES-256 needs a secure (HTTPS) page.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPassword('')
    setConfirm('')
  }

  return (
    <>
      <Seo
        title="PDF Password Protect - Free Online | vimz Tools"
        description="Encrypt a PDF with a password so only authorized people can open it. AES-256 and RC4 supported, 100% in your browser with Web Crypto."
      />
      <ToolShell
        title="PDF Password Protect"
        description="Add a password to your PDF so it opens only with the correct key. Uses AES-256 encryption from the Web Crypto API — the file never leaves your device."
        icon={<Lock className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: choose a strong password and keep a copy — a lost password cannot be recovered."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to lock it with a password"
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Encrypted on-device, never uploaded.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>
                <Field label="Password">
                  <TextInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password (min 4 characters)"
                  />
                </Field>
                <Field label="Confirm password">
                  <TextInput
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat the password"
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Permissions
            </h3>
            {['Allow printing', 'Allow copying text', 'Allow modifying'].map((label, i) => {
              const checked = [allowPrint, allowCopy, allowModify][i]
              const set = [setAllowPrint, setAllowCopy, setAllowModify][i]
              return (
                <label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                  />
                  {label}
                </label>
              )
            })}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-slate-500">Encryption</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAlgo('aes256')}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    algo === 'aes256'
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  AES-256
                </button>
                <button
                  onClick={() => setAlgo('rc4')}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    algo === 'rc4'
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  RC4-128
                </button>
              </div>
              <p className="text-xs text-slate-400">
                AES-256 is standard and secure. RC4 helps when opening in very old readers.
              </p>
            </div>
            <Button onClick={protect} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {busy ? 'Encrypting...' : 'Encrypt & download'}
            </Button>
          </div>

          {busy && <LoadingOverlay message="Encrypting your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}