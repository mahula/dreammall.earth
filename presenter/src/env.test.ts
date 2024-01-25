import { describe, it, expect } from 'vitest'

import { META } from './env'

describe('env', () => {
  it('has correct default values', () => {
    expect(META).toEqual({
      DEFAULT_TITLE: 'DreamMall',
      DEFAULT_DESCRIPTION:
        'Deine Reichweite Erweitern Alle Möglichkeiten Miteinander Ausschöpfen Lebensqualität Leben',
      BASE_URL: 'http://localhost:3000',
    })
  })
})
