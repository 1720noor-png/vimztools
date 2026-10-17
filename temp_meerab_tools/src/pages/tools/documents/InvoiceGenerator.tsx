import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { ReceiptText, Plus, Trash2, Download, Loader2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { downloadBlob, uid } from '../../../lib/utils'

interface InvoiceItem {
  id: string
  description: string
  qty: number
  rate: number
}

export default function InvoiceGenerator() {
  const [business, setBusiness] = useState({ name: '', email: '', address: '' })
  const [client, setClient] = useState({ name: '', email: '', address: '' })
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [currency, setCurrency] = useState('$')
  const [taxRate, setTaxRate] = useState(10)
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uid(), description: '', qty: 1, rate: 0 },
  ])
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.qty || 0) * (i.rate || 0), 0),
    [items],
  )
  const discountAmount = useMemo(() => (subtotal * (discount || 0)) / 100, [subtotal, discount])
  const taxAmount = useMemo(() => ((subtotal - discountAmount) * (taxRate || 0)) / 100, [subtotal, discountAmount, taxRate])
  const total = subtotal - discountAmount + taxAmount

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const downloadPdf = async () => {
    setBusy(true)
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()

      doc.setFillColor(109, 40, 217)
      doc.rect(0, 0, pageW, 42, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('INVOICE', 14, 18)
      doc.setFontSize(10)
      doc.text(business.name || 'Your Business', 14, 27)
      doc.text(business.address || '', 14, 33)
      doc.text(business.email || '', 14, 39)

      doc.setFont('helvetica', 'normal')
      doc.text(`Invoice #: ${invoiceNo}`, pageW - 14, 16, { align: 'right' })
      doc.text(`Date: ${date || '—'}`, pageW - 14, 22, { align: 'right' })

      doc.setTextColor(30, 41, 59)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Bill To', 14, 55)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(client.name || '—', 14, 61)
      doc.text(client.address || '', 14, 67)
      doc.text(client.email || '', 14, 73)

      autoTable(doc, {
        startY: 82,
        margin: { left: 14, right: 14 },
        head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
        body: items.map((it, i) => [
          String(i + 1),
          it.description || '—',
          String(it.qty || 0),
          `${currency}${(it.rate || 0).toFixed(2)}`,
          `${currency}${((it.qty || 0) * (it.rate || 0)).toFixed(2)}`,
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        columnStyles: {
          0: { cellWidth: 10 },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' },
        },
      })

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
      const summaryStart = Math.max(finalY + 12, 130)
      const colX = pageW - 14

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('Subtotal', colX - 70, summaryStart, { align: 'right' })
      doc.text(`${currency}${subtotal.toFixed(2)}`, colX, summaryStart, { align: 'right' })
      doc.text(`Discount (${discount}%)`, colX - 70, summaryStart + 6, { align: 'right' })
      doc.text(`-${currency}${discountAmount.toFixed(2)}`, colX, summaryStart + 6, { align: 'right' })
      doc.text(`Tax (${taxRate}%)`, colX - 70, summaryStart + 12, { align: 'right' })
      doc.text(`${currency}${taxAmount.toFixed(2)}`, colX, summaryStart + 12, { align: 'right' })

      doc.setFillColor(109, 40, 217)
      doc.rect(pageW - 14 - 80, summaryStart + 18, 80, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('TOTAL', colX - 80 + 6, summaryStart + 25)
      doc.text(`${currency}${total.toFixed(2)}`, colX - 6, summaryStart + 25, { align: 'right' })

      if (business.name || client.name) {
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text('Thank you for your business!', 14, 275)
      }

      const blob = doc.output('blob')
      downloadBlob(blob, `invoice-${invoiceNo.replace(/[^a-z0-9]/gi, '-') || 'export'}.pdf`)
      toast('Invoice PDF downloaded!')
    } catch (e) {
      console.error(e)
      toast('Could not generate the invoice.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="Invoice & Receipt Generator - Free Online | vimz Tools"
        description="Create itemized business invoices and receipts with automatic tax, discount and totals, then download as PDF. Free in-browser tool."
      />
      <ToolShell
        title="Invoice & Receipt Generator"
        description="Build professional itemized invoices with auto-calculated subtotal, discount, tax and grand total. Export a polished PDF instantly — all locally."
        icon={<ReceiptText className="h-6 w-6" />}
        breadcrumb="Document Generators"
      >
        <div className="mb-6 flex justify-end">
          <Button onClick={downloadPdf} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? 'Building PDF...' : 'Download invoice PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Your business</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Business name">
                  <TextInput value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} placeholder="Acme Services LLC" />
                </Field>
                <Field label="Email">
                  <TextInput value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} placeholder="billing@acme.com" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address">
                    <TextInput value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} placeholder="123 Main St, City" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Bill to</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Client name">
                  <TextInput value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client Ltd." />
                </Field>
                <Field label="Client email">
                  <TextInput value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="client@company.com" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Client address">
                    <TextInput value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} placeholder="456 Client St" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Invoice details</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Invoice #">
                  <TextInput value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                </Field>
                <Field label="Date">
                  <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Currency">
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {['$', '€', '£', '₹', '¥', '₦', 'R$', 'CAD $', 'AUD $'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label={`Tax ${taxRate}%`}>
                  <input type="number" min={0} max={40} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={`Discount ${discount}%`}>
                    <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-primary-700">Line items</h3>
                <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={() => setItems((p) => [...p, { id: uid(), description: '', qty: 1, rate: 0 }])}>
                  <Plus className="h-3.5 w-3.5" /> Add item
                </Button>
              </div>
              <div className="space-y-3">
                <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-semibold text-slate-400 sm:grid">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-2">Rate</span>
                  <span className="col-span-2 text-right">Amount</span>
                  <span className="col-span-1" />
                </div>
                {items.map((it) => (
                  <div key={it.id} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-12 sm:col-span-5">
                      <TextInput value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} placeholder="Item description" />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input type="number" min={0} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} className="w-full rounded-xl border border-slate-300 px-2.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input type="number" min={0} step={0.01} value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} className="w-full rounded-xl border border-slate-300 px-2.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" />
                    </div>
                    <div className="col-span-3 text-right text-sm font-semibold text-slate-700 sm:col-span-2">
                      {currency}{((it.qty || 0) * (it.rate || 0)).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500" aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount ({discount}%)</span>
                  <span className="font-semibold text-rose-500">-{currency}{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-semibold">{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-primary-600 px-4 py-3 text-white">
                  <span className="font-bold">Total due</span>
                  <span className="text-lg font-extrabold">{currency}{total.toFixed(2)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}