/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import { useAutoFillParams } from './useAutoFillParams.js'

describe('useAutoFillParams Hook (Level 1 L1 Deep Linking)', () => {
  it('falls back to default values when no search params are present', () => {
    let captured = null

    function TestComponent() {
      captured = useAutoFillParams({ height: '175', gender: 'male' })
      return null
    }

    const div = document.createElement('div')
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/tools/test'] },
        React.createElement(TestComponent)
      ),
      div
    )

    expect(captured).toEqual({ height: '175', gender: 'male' })
  })

  it('extracts URL query parameters correctly over defaults', () => {
    let captured = null

    function TestComponent() {
      captured = useAutoFillParams({ height: '175', gender: 'male' })
      return null
    }

    const div = document.createElement('div')
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/tools/test?height=182&gender=female'] },
        React.createElement(TestComponent)
      ),
      div
    )

    expect(captured).toEqual({ height: '182', gender: 'female' })
  })

  it('gracefully returns default values outside Router context', () => {
    const res = useAutoFillParams({ testKey: 'default' })
    expect(res).toEqual({ testKey: 'default' })
  })
})
