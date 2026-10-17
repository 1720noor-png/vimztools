import { useCallback, useState } from 'react'
import * as pdfLib from 'pdf-lib'
import { configure, unlockInPlace } from 'pdf-lib-encrypt'
import { Loader2, Lock, Unlock } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, TextInput } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

configure(pdfLib)

export default function PdfPasswordRemove() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
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

  const decrypt = async () => {
    if (!file) return
    if (!password) {
      toast('Enter the password for this PDF.', 'error')
      return
    }
    setBusy(true)
    try {
      const bytes = await readFileAsArrayBuffer(file)
      const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true })
      const unlocked = await unlockInPlace(doc, password)
      if (!unlocked) {
        toast('This PDF is not password protected.', 'info')
        return
      }
      const plain = await doc.save({ useObjectStreams: false })
      downloadBlob(new Blob([new Uint8Array(plain)], { type: 'application/pdf' }), `${stripFileExtension(file.name)}-unlocked.pdf`)
      toast('Password removed. The unlocked copy is ready to download.')
    } catch (e) {
      console.error(e)
      toast('Could not unlock this PDF. Double-check the password.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPassword('')
  }

  return (
    <>
      <Seo
        title="PDF Password Remover - Free Online | vimz Tools"
        description="Remove a password from a PDF you own by entering its password, and save an open copy. Unlocking runs entirely in your browser."
      />
      <ToolShell
        title="PDF Password Remover"
        description="Unlock a password-protected PDF using the password you have, then save an open copy without restrictions. Processing happens on your device only."
        icon={<Unlock className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Only remove protection from documents you own or have permission to edit."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a protected PDF here to unlock it"
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Unlocked on-device, never uploaded.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>
                <Field label="PDF password">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <TextInput
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the PDF password"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Button onClick={decrypt} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                  {busy ? 'Unlocking...' : 'Unlock & download'}
                </Button>
              </div>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">How it works</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>Your file is read fully in the browser using Web Crypto.</li>
              <li>The correct password decrypts the document in place.</li>
              <li>An unrestricted copy is saved back to your device.</li>
            </ul>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              PDFs using very old AES-128 or compressed object streams may require another tool.
            </p>
          </div>

          {busy && <LoadingOverlay message="Decrypting your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}