/**
 * Pure Engine: PDF Bates Numbering Generator & Position Calculator
 * Generates standardized sequential Bates series for legal discovery & audit exhibits.
 */

export function formatBatesNumber(number, prefix = '', digits = 6, suffix = '') {
  const num = parseInt(number, 10)
  if (isNaN(num) || num < 0) {
    throw new Error('Number must be a non-negative integer')
  }

  const padLen = Math.min(Math.max(parseInt(digits, 10) || 6, 2), 12)
  const numStr = String(num).padStart(padLen, '0')
  const cleanPrefix = prefix ? String(prefix).trim() : ''
  const cleanSuffix = suffix ? String(suffix).trim() : ''

  let result = ''
  if (cleanPrefix) result += `${cleanPrefix}-`
  result += numStr
  if (cleanSuffix) result += `-${cleanSuffix}`

  return result
}

export function generateBatesSequence(options = {}) {
  const {
    prefix = 'CONF-EXHIBIT',
    startNum = 1,
    digits = 6,
    suffix = '',
    totalPages = 10
  } = options

  const start = parseInt(startNum, 10)
  const count = parseInt(totalPages, 10)
  const padLen = parseInt(digits, 10)

  if (isNaN(start) || start < 0) {
    throw new Error('Starting number must be a non-negative integer')
  }
  if (isNaN(count) || count < 1 || count > 5000) {
    throw new Error('Total pages must be an integer between 1 and 5000')
  }
  if (isNaN(padLen) || padLen < 2 || padLen > 12) {
    throw new Error('Digit padding must be between 2 and 12')
  }

  const items = []
  for (let i = 0; i < count; i++) {
    const pageNum = i + 1
    const stamp = formatBatesNumber(start + i, prefix, padLen, suffix)
    items.push({
      page: pageNum,
      stamp
    })
  }

  const sampleRange = items.length > 0 ? `${items[0].stamp} to ${items[items.length - 1].stamp}` : ''

  return {
    prefix: prefix.trim(),
    startNum: start,
    digits: padLen,
    suffix: suffix.trim(),
    totalPages: count,
    items,
    sampleRange,
    firstStamp: items[0].stamp,
    lastStamp: items[items.length - 1].stamp,
    copyText: items.map(it => `Page ${it.page}: ${it.stamp}`).join('\n')
  }
}

export function calculateStampPosition(position = 'bottom-right', pageWidth = 612, pageHeight = 792, margin = 36) {
  let x = margin
  let y = margin
  let alignment = 'left'

  switch (position) {
    case 'bottom-center':
      x = pageWidth / 2
      y = margin
      alignment = 'center'
      break
    case 'bottom-left':
      x = margin
      y = margin
      alignment = 'left'
      break
    case 'top-right':
      x = pageWidth - margin
      y = pageHeight - margin
      alignment = 'right'
      break
    case 'top-center':
      x = pageWidth / 2
      y = pageHeight - margin
      alignment = 'center'
      break
    case 'top-left':
      x = margin
      y = pageHeight - margin
      alignment = 'left'
      break
    case 'bottom-right':
    default:
      x = pageWidth - margin
      y = margin
      alignment = 'right'
      break
  }

  return { x, y, alignment }
}
