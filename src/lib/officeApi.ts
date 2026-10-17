export const OFFICE_API = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export interface TaxSlab {
  from_amount: number
  to_amount: number | null
  rate: number
}

export interface TaxBracketsPayload {
  country_code: string
  currency: string
  slabs: TaxSlab[]
}

export interface AppliedSlab {
  from_amount: number
  to_amount: number | null
  rate: number
  band_income: number
  amount: number
}

export interface SalaryTaxBreakdown {
  id: number
  label: string | null
  country_code: string
  currency: string
  gross_monthly: number
  gross_annual: number
  taxable_income: number
  income_tax_annual: number
  income_tax_monthly: number
  effective_tax_rate: number
  pension_emp_annual: number
  pension_emp_monthly: number
  pension_er_annual: number
  pension_er_monthly: number
  corporate_retention_annual: number
  corporate_retention_monthly: number
  employer_total_cost_annual: number
  employer_total_cost_monthly: number
  net_annual: number
  net_monthly: number
  slabs: AppliedSlab[]
  created_at: string
}

export interface SalaryTaxCalcPayload {
  label?: string
  country_code: string
  currency?: string
  gross_monthly: number
  pension_rate: number
  employer_pension_rate: number
  employer_levy_rate: number
  non_taxable_exemption: number
}

export interface OfficeCountry {
  code: string
  label: string
  currency: string
}

export const OFFICE_COUNTRIES: OfficeCountry[] = [
  { code: 'gh', label: 'Ghana (PAYE slabs)', currency: 'GHS' },
  { code: 'generic', label: 'Generic progressive slabs', currency: 'USD' },
]

async function fetchJson<T>(url: string, init?: RequestInit & { timeout?: number }): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), init?.timeout ?? 6000)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      const message = errText ? `${res.status}: ${errText.slice(0, 160)}` : `${res.status}`
      throw new Error(message)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function getTaxBrackets(country = 'gh'): Promise<TaxBracketsPayload> {
  const json = await fetchJson<{ data: TaxBracketsPayload }>(
    `${OFFICE_API}/office/salary-tax/brackets?country=${encodeURIComponent(country)}`,
  )
  return json.data
}

export async function listSalaryTaxBreakdowns(): Promise<SalaryTaxBreakdown[]> {
  const json = await fetchJson<{ data: SalaryTaxBreakdown[] }>(
    `${OFFICE_API}/office/salary-tax-calculations`,
  )
  return json.data
}

export async function createSalaryTaxBreakdown(
  payload: SalaryTaxCalcPayload,
): Promise<SalaryTaxBreakdown> {
  const json = await fetchJson<{ data: SalaryTaxBreakdown }>(
    `${OFFICE_API}/office/salary-tax-calculations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 8000,
    },
  )
  return json.data
}

export async function deleteSalaryTaxBreakdown(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`${OFFICE_API}/office/salary-tax-calculations/${id}`, {
    method: 'DELETE',
  })
}