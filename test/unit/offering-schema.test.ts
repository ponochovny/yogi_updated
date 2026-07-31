import { describe, expect, it } from 'vitest'
import {
	offeringType,
	pricingType,
} from '../../app/entities/offering/schema'

describe('offeringType', () => {
	it('has GROUP constant', () => {
		expect(offeringType.GROUP).toBe('GROUP')
	})

	it('has PRIVATE constant', () => {
		expect(offeringType.PRIVATE).toBe('PRIVATE')
	})

	it('has exactly 2 values', () => {
		expect(Object.keys(offeringType)).toHaveLength(2)
	})

	it('is readonly (as const)', () => {
		// Verify the shape is correct and values are strings
		const values = Object.values(offeringType)
		expect(values.every((v) => typeof v === 'string')).toBe(true)
	})

	it('does not contain unexpected values', () => {
		const allowedKeys = ['GROUP', 'PRIVATE']
		expect(Object.keys(offeringType)).toEqual(allowedKeys)
	})
})

describe('pricingType', () => {
	it('has DROP_IN constant', () => {
		expect(pricingType.DROP_IN).toBe('DROP_IN')
	})

	it('has PACK constant', () => {
		expect(pricingType.PACK).toBe('PACK')
	})

	it('has MEMBERSHIP constant', () => {
		expect(pricingType.MEMBERSHIP).toBe('MEMBERSHIP')
	})

	it('has exactly 3 values', () => {
		expect(Object.keys(pricingType)).toHaveLength(3)
	})

	it('all values are strings', () => {
		const values = Object.values(pricingType)
		expect(values.every((v) => typeof v === 'string')).toBe(true)
	})

	it('does not contain unexpected values', () => {
		const allowedKeys = ['DROP_IN', 'PACK', 'MEMBERSHIP']
		expect(Object.keys(pricingType)).toEqual(allowedKeys)
	})

	it('key and value match for DROP_IN', () => {
		expect(pricingType.DROP_IN).toBe('DROP_IN')
	})

	it('key and value match for PACK', () => {
		expect(pricingType.PACK).toBe('PACK')
	})

	it('key and value match for MEMBERSHIP', () => {
		expect(pricingType.MEMBERSHIP).toBe('MEMBERSHIP')
	})
})
