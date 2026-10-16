/**
 * @vitest-environment jsdom
 */
import React, { act } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from './AdminDashboard.jsx'

const mockAdminUser = { id: 1, email: 'admin@vimz.ai', role: 'admin', name: 'Super Admin' }
const mockLogout = vi.fn()

// Mock useAuth
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: mockAdminUser,
    isAdmin: true,
    loading: false,
    logout: mockLogout
  })
}))

// Mock adminApi
vi.mock('../api/client.js', () => ({
  adminApi: {
    getUsers: vi.fn().mockResolvedValue({ users: [{ id: 1, email: 'user@example.com', role: 'user', created_at: '2026-10-15' }] }),
    getPurchases: vi.fn().mockResolvedValue({ purchases: [] }),
    grantManualEntitlement: vi.fn().mockResolvedValue({ status: 'success' })
  }
}))

describe('AdminDashboard (Emerald Prestige 11-Screen Architecture)', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders the Emerald Prestige sidebar and displays the Payments Inactive badge', async () => {
    await act(async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(AdminDashboard)
        ),
        container
      )
    })

    // Check title and brand elements
    expect(container.textContent).toContain('Vimz.ai Admin')
    expect(container.textContent).toContain('EMERALD PRESTIGE')
    expect(container.textContent).toContain('Super Admin')

    // Check Blueprint mandatory "Payments Inactive" badge
    expect(container.textContent).toContain('Payments Inactive (Deferred)')

    // Check 11 sidebar navigation tabs
    expect(container.textContent).toContain('1. Overview')
    expect(container.textContent).toContain('2. Paid Tools (1,059)')
    expect(container.textContent).toContain('3. Pricing & Features')
    expect(container.textContent).toContain('4. Content & Tool Info')
    expect(container.textContent).toContain('5. Discounts & Coupons')
    expect(container.textContent).toContain('6. Premium Subs')
    expect(container.textContent).toContain('7. 30-Day Tool Passes')
    expect(container.textContent).toContain('8. Users & Entitlements')
    expect(container.textContent).toContain('9. Transactions & Events')
    expect(container.textContent).toContain('10. Reports & Analytics')
    expect(container.textContent).toContain('11. Roles & Audit Log')
  })

  it('navigates to Paid Tools (Screen 2) and renders catalog filters', async () => {
    await act(async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(AdminDashboard)
        ),
        container
      )
    })

    // Find and click "2. Paid Tools (1,059)" nav button
    const buttons = Array.from(container.querySelectorAll('.emerald-nav-btn'))
    const paidToolsBtn = buttons.find(b => b.textContent.includes('2. Paid Tools'))
    expect(paidToolsBtn).toBeDefined()

    await act(async () => {
      paidToolsBtn.click()
    })

    // Verify Paid Tools catalog header and counts
    expect(container.textContent).toContain('Paid Tools Catalog & Classification')
    expect(container.textContent).toContain('Master Catalog List')
    expect(container.textContent).toContain('1059 tools matching')

    // Verify download classification filter options
    expect(container.textContent).toContain('All Download Classes')
    expect(container.textContent).toContain('Downloadable Only')
    expect(container.textContent).toContain('Mixed (On-Screen + Export)')
    expect(container.textContent).toContain('On-Screen Only')
  })

  it('navigates to Transactions & Events (Screen 9) and displays truthful deferred payment notice', async () => {
    await act(async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(AdminDashboard)
        ),
        container
      )
    })

    // Find and click "9. Transactions & Events" nav button
    const buttons = Array.from(container.querySelectorAll('.emerald-nav-btn'))
    const transactionsBtn = buttons.find(b => b.textContent.includes('9. Transactions & Events'))
    expect(transactionsBtn).toBeDefined()

    await act(async () => {
      transactionsBtn.click()
    })

    // Verify truthful deferred payment presentation (Blueprint compliance: never fabricate transactions)
    expect(container.textContent).toContain('Payments Layer Inactive (Deferred Mode)')
    expect(container.textContent).toContain('Live webhooks, provider settlements, and credit card processing are deferred')
    expect(container.textContent).toContain('Provider Events & Idempotency Audit')
  })

  it('navigates to Reports & Analytics (Screen 10) and verifies download formats report', async () => {
    await act(async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(AdminDashboard)
        ),
        container
      )
    })

    // Find and click "10. Reports & Analytics" nav button
    const buttons = Array.from(container.querySelectorAll('.emerald-nav-btn'))
    const reportsBtn = buttons.find(b => b.textContent.includes('10. Reports & Analytics'))
    expect(reportsBtn).toBeDefined()

    await act(async () => {
      reportsBtn.click()
    })

    // Verify Reports content
    expect(container.textContent).toContain('Catalog Downloads Breakdown')
    expect(container.textContent).toContain('CSV Tabular Reports')
    expect(container.textContent).toContain('Plain Text (TXT) Documents')
    expect(container.textContent).toContain('PDF Print & Bates Stampers')
    expect(container.textContent).toContain('PNG / Image Assets')
    expect(container.textContent).toContain('JSON Data Structs')
  })

  it('navigates to Roles & Audit Log (Screen 11) and displays audit logs', async () => {
    await act(async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(AdminDashboard)
        ),
        container
      )
    })

    // Find and click "11. Roles & Audit Log" nav button
    const buttons = Array.from(container.querySelectorAll('.emerald-nav-btn'))
    const rolesBtn = buttons.find(b => b.textContent.includes('11. Roles & Audit Log'))
    expect(rolesBtn).toBeDefined()

    await act(async () => {
      rolesBtn.click()
    })

    // Verify Roles & Audit Log screen
    expect(container.textContent).toContain('Roles, Permissions & Append-Only Audit Log')
    expect(container.textContent).toContain('3-Tier Server-Side RBAC Architecture')
    expect(container.textContent).toContain('Append-Only Administrative Audit Trail')
    expect(container.textContent).toContain('CLASSIFY_CATALOG')
    expect(container.textContent).toContain('SET_PAYMENTS_MODE')
  })
})
