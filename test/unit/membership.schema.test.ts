import { describe, expect, it } from 'vitest'
import {
  createMembershipSchema,
  priceOptionsType
} from '../../app/entities/membership/schema'

describe('createMembershipSchema', () => {
  const baseInput = {
    name: 'Monthly Membership',
    description: 'Unlimited access to all classes',
    price: 29.99,
    isActive: true,
    applicableCategoryIds: ['category-1']
  }

  it('accepts a valid DROP_IN membership with a single credit', () => {
    const result = createMembershipSchema.safeParse({
      ...baseInput,
      type: priceOptionsType.DROP_IN,
      credits: 1,
      durationDays: 1
    })

    expect(result.success).toBe(true)
  })

  it('rejects a DROP_IN membership with more than one credit', () => {
    const result = createMembershipSchema.safeParse({
      ...baseInput,
      type: priceOptionsType.DROP_IN,
      credits: 2,
      durationDays: 1
    })

    expect(result.success).toBe(false)
  })

  it('requires integer credits and durationDays for PACK memberships', () => {
    const result = createMembershipSchema.safeParse({
      ...baseInput,
      type: priceOptionsType.PACK,
      credits: 10.5,
      durationDays: 30.5
    })

    expect(result.success).toBe(false)
  })

  it('requires MEMBERSHIP memberships to use null credits', () => {
    const result = createMembershipSchema.safeParse({
      ...baseInput,
      type: priceOptionsType.MEMBERSHIP,
      credits: 10,
      durationDays: 30
    })

    expect(result.success).toBe(false)
  })
})
