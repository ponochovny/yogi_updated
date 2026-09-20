import { describe, expect, it } from 'vitest'
import { calculateClassPayout } from '../../server/utils/practitioner-earnings'

describe('calculateClassPayout', () => {
  it('calculates flat-rate payouts in cents', () => {
    expect(
      calculateClassPayout({
        compensationType: 'FLAT_RATE',
        compensationRate: 3500,
        attendedCount: 3,
        revenueCents: 120000
      })
    ).toBe(3500)
  })

  it('calculates per-attendee payouts in cents', () => {
    expect(
      calculateClassPayout({
        compensationType: 'PER_ATTENDEE',
        compensationRate: 4000,
        attendedCount: 3,
        revenueCents: 120000
      })
    ).toBe(12000)
  })

  it('calculates revenue-share payouts in cents', () => {
    expect(
      calculateClassPayout({
        compensationType: 'REVENUE_SHARE',
        compensationRate: 2000,
        attendedCount: 3,
        revenueCents: 120000
      })
    ).toBe(24000)
  })
})
