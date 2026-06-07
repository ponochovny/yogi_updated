import { describe, expect, it } from 'vitest'
import {
	userRoles,
	practitionerRoles,
	type UserRole,
	type PractitionerRole,
} from '../../server/utils/auth/config'

describe('userRoles', () => {
	it('has USER constant', () => {
		expect(userRoles.USER).toBe('USER')
	})

	it('has PRACTITIONER constant', () => {
		expect(userRoles.PRACTITIONER).toBe('PRACTITIONER')
	})

	it('has BUSINESS constant', () => {
		expect(userRoles.BUSINESS).toBe('BUSINESS')
	})

	it('has SUPER_ADMIN constant', () => {
		expect(userRoles.SUPER_ADMIN).toBe('SUPER-ADMIN')
	})

	it('SUPER_ADMIN value uses a hyphen (SUPER-ADMIN), not underscore', () => {
		expect(userRoles.SUPER_ADMIN).not.toBe('SUPER_ADMIN')
		expect(userRoles.SUPER_ADMIN).toBe('SUPER-ADMIN')
	})

	it('has exactly 4 roles', () => {
		expect(Object.keys(userRoles)).toHaveLength(4)
	})

	it('all values are strings', () => {
		const values = Object.values(userRoles)
		expect(values.every((v) => typeof v === 'string')).toBe(true)
	})

	it('does not contain unexpected keys', () => {
		const expectedKeys = ['USER', 'PRACTITIONER', 'BUSINESS', 'SUPER_ADMIN']
		expect(Object.keys(userRoles)).toEqual(expectedKeys)
	})

	it('is assignable to UserRole type', () => {
		const role: UserRole = userRoles.USER
		expect(role).toBe('USER')
	})

	it('USER and PRACTITIONER are different values', () => {
		expect(userRoles.USER).not.toBe(userRoles.PRACTITIONER)
	})

	it('all role values are unique', () => {
		const values = Object.values(userRoles)
		const uniqueValues = new Set(values)
		expect(uniqueValues.size).toBe(values.length)
	})
})

describe('practitionerRoles', () => {
	it('has OWNER constant', () => {
		expect(practitionerRoles.OWNER).toBe('OWNER')
	})

	it('has PRACTITIONER constant', () => {
		expect(practitionerRoles.PRACTITIONER).toBe('PRACTITIONER')
	})

	it('has MANAGER constant', () => {
		expect(practitionerRoles.MANAGER).toBe('MANAGER')
	})

	it('has exactly 3 roles', () => {
		expect(Object.keys(practitionerRoles)).toHaveLength(3)
	})

	it('all values are strings', () => {
		const values = Object.values(practitionerRoles)
		expect(values.every((v) => typeof v === 'string')).toBe(true)
	})

	it('does not contain unexpected keys', () => {
		const expectedKeys = ['OWNER', 'PRACTITIONER', 'MANAGER']
		expect(Object.keys(practitionerRoles)).toEqual(expectedKeys)
	})

	it('is assignable to PractitionerRole type', () => {
		const role: PractitionerRole = practitionerRoles.OWNER
		expect(role).toBe('OWNER')
	})

	it('all role values are unique', () => {
		const values = Object.values(practitionerRoles)
		const uniqueValues = new Set(values)
		expect(uniqueValues.size).toBe(values.length)
	})

	it('OWNER and MANAGER are different values', () => {
		expect(practitionerRoles.OWNER).not.toBe(practitionerRoles.MANAGER)
	})

	it('PRACTITIONER and MANAGER are different values', () => {
		expect(practitionerRoles.PRACTITIONER).not.toBe(practitionerRoles.MANAGER)
	})
})

describe('type compatibility', () => {
	it('UserRole accepts only valid roles', () => {
		const validRoles: UserRole[] = [
			userRoles.USER,
			userRoles.PRACTITIONER,
			userRoles.BUSINESS,
			userRoles.SUPER_ADMIN,
		]
		expect(validRoles).toHaveLength(4)
	})

	it('PractitionerRole accepts only valid roles', () => {
		const validRoles: PractitionerRole[] = [
			practitionerRoles.OWNER,
			practitionerRoles.PRACTITIONER,
			practitionerRoles.MANAGER,
		]
		expect(validRoles).toHaveLength(3)
	})
})