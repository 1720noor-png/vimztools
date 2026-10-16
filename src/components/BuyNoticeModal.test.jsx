/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import BuyNoticeModal from './BuyNoticeModal.jsx'

describe('BuyNoticeModal (Blueprint Section 7 Compliance)', () => {
  it('returns null when isOpen is false', () => {
    const container = document.createElement('div')
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(BuyNoticeModal, {
          isOpen: false,
          onClose: vi.fn(),
          toolName: 'Mock Tool',
          plannedPrice: '$19.00'
        })
      ),
      container
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders required blueprint disclaimer text and buttons when open', () => {
    const container = document.createElement('div')
    const handleClose = vi.fn()

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(BuyNoticeModal, {
          isOpen: true,
          onClose: handleClose,
          toolName: 'Invoice Generator',
          plannedPrice: '$19.00'
        })
      ),
      container
    )

    // Check mandatory badge
    expect(container.textContent).toContain('PAYMENTS NOT CONNECTED')
    
    // Check mandatory blueprint text
    expect(container.textContent).toContain('Payments are not available yet; the payment account has not been connected.')
    expect(container.textContent).toContain('all basic tools stay 100% free forever')

    // Check tool name & price
    expect(container.textContent).toContain('Invoice Generator')
    expect(container.textContent).toContain('$19.00')

    // Test OK button triggers onClose
    const buttons = container.querySelectorAll('button')
    const okBtn = Array.from(buttons).find(b => b.textContent.trim() === 'OK')
    expect(okBtn).toBeDefined()
    okBtn.click()
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
