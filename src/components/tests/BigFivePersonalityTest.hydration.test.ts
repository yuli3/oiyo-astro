import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BigFivePersonalityTest from './BigFivePersonalityTest'

describe('Big Five shared-result hydration', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders the same initial tree on the server and browser for a ?b= result URL', () => {
    vi.stubGlobal('window', undefined)
    const serverHtml = renderToString(createElement(BigFivePersonalityTest, { locale: 'ko' }))

    vi.stubGlobal('window', { location: { search: '?b=82-68-41-57-24' } })
    const browserHtml = renderToString(createElement(BigFivePersonalityTest, { locale: 'ko' }))

    expect(browserHtml).toBe(serverHtml)
  })
})
