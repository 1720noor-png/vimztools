/**
 * Pure Engine: Universal Currency Converter with Baseline & Live Caching
 * Adheres strictly to The Golden Rule: 100% deterministic calculation.
 */

// Authoritative baseline exchange rates (Base USD = 1.0)
export const BASELINE_FOREX_RATES = {
  USD: 1.0,
  PKR: 278.50,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.78,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.37,
  AUD: 1.52,
  JPY: 155.20,
  CNY: 7.24,
  CHF: 0.91,
  TRY: 32.50,
  MYR: 4.71,
  SGD: 1.35,
  QAR: 3.64,
  KWD: 0.31,
  OMR: 0.38,
  BHD: 0.38,
  NZD: 1.64,
  THB: 36.80,
  BRL: 5.15,
  ZAR: 18.40,
  RUB: 91.50,
  KRW: 1365.0,
  SEK: 10.75,
  NOK: 10.85,
  MXN: 16.90,
  IDR: 16000.0,
  PHP: 57.80,
  EGP: 47.50,
  BDT: 117.0,
  LKR: 300.0
}

export const CURRENCY_NAMES = {
  USD: 'US Dollar ($)',
  PKR: 'Pakistani Rupee (₨)',
  INR: 'Indian Rupee (₹)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  AED: 'UAE Dirham (د.إ)',
  SAR: 'Saudi Riyal (﷼)',
  CAD: 'Canadian Dollar (C$)',
  AUD: 'Australian Dollar (A$)',
  JPY: 'Japanese Yen (¥)',
  CNY: 'Chinese Yuan (¥)',
  CHF: 'Swiss Franc (CHF)',
  TRY: 'Turkish Lira (₺)',
  MYR: 'Malaysian Ringgit (RM)',
  SGD: 'Singapore Dollar (S$)',
  QAR: 'Qatari Riyal (QR)',
  KWD: 'Kuwaiti Dinar (KD)',
  OMR: 'Omani Rial (OMR)',
  BHD: 'Bahraini Dinar (BD)',
  NZD: 'New Zealand Dollar (NZ$)',
  THB: 'Thai Baht (฿)',
  BRL: 'Brazilian Real (R$)',
  ZAR: 'South African Rand (R)',
  RUB: 'Russian Ruble (₽)',
  KRW: 'South Korean Won (₩)',
  SEK: 'Swedish Krona (kr)',
  NOK: 'Norwegian Krone (kr)',
  MXN: 'Mexican Peso (Mex$)',
  IDR: 'Indonesian Rupiah (Rp)',
  PHP: 'Philippine Peso (₱)',
  EGP: 'Egyptian Pound (E£)',
  BDT: 'Bangladeshi Taka (৳)',
  LKR: 'Sri Lankan Rupee (Rs)'
}

export function convertCurrency(options = {}) {
  const {
    amount = 1,
    from = 'USD',
    to = 'PKR',
    customRates = null
  } = options

  const amt = Number(amount)
  if (isNaN(amt) || amt < 0) {
    throw new Error('Amount must be a non-negative number')
  }

  const fromCode = String(from).toUpperCase().trim()
  const toCode = String(to).toUpperCase().trim()

  const rates = customRates || BASELINE_FOREX_RATES

  const rateFrom = rates[fromCode]
  const rateTo = rates[toCode]

  if (!rateFrom) {
    throw new Error(`Unsupported or unknown source currency: "${fromCode}"`)
  }
  if (!rateTo) {
    throw new Error(`Unsupported or unknown target currency: "${toCode}"`)
  }

  // Cross rate calculation via base USD
  // 1 unit of from = (rateTo / rateFrom) units of to
  const exchangeRate = rateTo / rateFrom
  const inverseRate = rateFrom / rateTo
  const convertedAmount = amt * exchangeRate

  return {
    amount: amt,
    from: fromCode,
    to: toCode,
    fromName: CURRENCY_NAMES[fromCode] || fromCode,
    toName: CURRENCY_NAMES[toCode] || toCode,
    result: Number(convertedAmount.toFixed(4)),
    resultFormatted: convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
    exchangeRate: Number(exchangeRate.toFixed(6)),
    inverseRate: Number(inverseRate.toFixed(6)),
    isCustomRates: !!customRates
  }
}
