import { describe, expect, it } from 'vitest'
import {
	addPractitionerSchema,
	type AddPractitionerInput,
} from '../../app/entities/practitioner/schema'
import { practitionerRoles } from '../../server/utils/auth/config'

describe('addPractitionerSchema', () => {
	describe('valid inputs', () => {
		it('accepts a minimal valid input with required fields only', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})

		it('applies default role of PRACTITIONER when not provided', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.role).toBe(practitionerRoles.PRACTITIONER)
			}
		})

		it('applies default salaryActive of true when not provided', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.salaryActive).toBe(true)
			}
		})

		it('accepts a full valid input with all fields', () => {
			const input = {
				email: 'jane@studio.com',
				name: 'Jane Smith',
				bio: 'Experienced yoga instructor with 10 years of practice.',
				role: practitionerRoles.MANAGER,
				salaryActive: false,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.email).toBe('jane@studio.com')
				expect(result.data.name).toBe('Jane Smith')
				expect(result.data.bio).toBe('Experienced yoga instructor with 10 years of practice.')
				expect(result.data.role).toBe(practitionerRoles.MANAGER)
				expect(result.data.salaryActive).toBe(false)
			}
		})

		it('accepts OWNER role', () => {
			const input = {
				email: 'owner@studio.com',
				name: 'Studio Owner',
				role: practitionerRoles.OWNER,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.role).toBe(practitionerRoles.OWNER)
			}
		})

		it('accepts MANAGER role', () => {
			const input = {
				email: 'manager@studio.com',
				name: 'Studio Manager',
				role: practitionerRoles.MANAGER,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.role).toBe(practitionerRoles.MANAGER)
			}
		})

		it('accepts PRACTITIONER role explicitly', () => {
			const input = {
				email: 'trainer@studio.com',
				name: 'Jane Trainer',
				role: practitionerRoles.PRACTITIONER,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.role).toBe(practitionerRoles.PRACTITIONER)
			}
		})

		it('trims whitespace from name', () => {
			const input = {
				email: 'john@example.com',
				name: '  John Doe  ',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.name).toBe('John Doe')
			}
		})

		it('trims whitespace from bio', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: '  Some bio text  ',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.bio).toBe('Some bio text')
			}
		})

		it('accepts a name with exactly 2 characters (boundary)', () => {
			const input = {
				email: 'ab@example.com',
				name: 'AB',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})

		it('accepts a bio with exactly 500 characters (boundary)', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: 'a'.repeat(500),
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})

		it('accepts salaryActive as false', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				salaryActive: false,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.salaryActive).toBe(false)
			}
		})

		it('omits bio when not provided (optional field)', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.bio).toBeUndefined()
			}
		})
	})

	describe('email validation', () => {
		it('rejects an empty email', () => {
			const input = { email: '', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a missing email', () => {
			const input = { name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects an email without @ symbol', () => {
			const input = { email: 'notanemail', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects an email without domain', () => {
			const input = { email: 'test@', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects an email without local part', () => {
			const input = { email: '@example.com', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a plain string as email', () => {
			const input = { email: 'just-a-string', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('produces the correct error message for invalid email', () => {
			const input = { email: 'invalid-email', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
			if (!result.success) {
				const emailError = result.error.errors.find((e) =>
					e.path.includes('email'),
				)
				expect(emailError?.message).toBe('Email is not valid')
			}
		})

		it('accepts email with subdomain', () => {
			const input = { email: 'user@mail.studio.com', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})

		it('accepts email with plus sign', () => {
			const input = { email: 'user+tag@example.com', name: 'John Doe' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})
	})

	describe('name validation', () => {
		it('rejects a missing name', () => {
			const input = { email: 'john@example.com' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects an empty name', () => {
			const input = { email: 'john@example.com', name: '' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a name with 1 character (below minimum)', () => {
			const input = { email: 'john@example.com', name: 'A' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('produces the correct error message for a short name', () => {
			const input = { email: 'john@example.com', name: 'A' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
			if (!result.success) {
				const nameError = result.error.errors.find((e) =>
					e.path.includes('name'),
				)
				expect(nameError?.message).toBe('Name must be at least 2 characters')
			}
		})

		it('rejects a name that is only whitespace (trims to empty)', () => {
			const input = { email: 'john@example.com', name: '   ' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a name that is only 1 char after trimming', () => {
			const input = { email: 'john@example.com', name: ' A ' }
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})
	})

	describe('bio validation', () => {
		it('rejects a bio longer than 500 characters', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: 'a'.repeat(501),
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('produces the correct error message for a bio that is too long', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: 'a'.repeat(501),
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
			if (!result.success) {
				const bioError = result.error.errors.find((e) =>
					e.path.includes('bio'),
				)
				expect(bioError?.message).toBe('Bio must be at most 500 characters')
			}
		})

		it('trims bio before checking length', () => {
			// A bio that is 499 chars + 2 spaces on each side (trimmed to 499 chars = valid)
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: ' ' + 'a'.repeat(499) + ' ',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})

		it('accepts undefined bio (optional)', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				bio: undefined,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(true)
		})
	})

	describe('role validation', () => {
		it('rejects an invalid role string', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				role: 'ADMIN',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a lowercase valid role (case sensitive)', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				role: 'owner',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a numeric role value', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				role: 1,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects null role value', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				role: null,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})
	})

	describe('salaryActive validation', () => {
		it('rejects a non-boolean salaryActive', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				salaryActive: 'yes',
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})

		it('rejects a numeric salaryActive', () => {
			const input = {
				email: 'john@example.com',
				name: 'John Doe',
				salaryActive: 1,
			}
			const result = addPractitionerSchema.safeParse(input)
			expect(result.success).toBe(false)
		})
	})

	describe('type inference (AddPractitionerInput)', () => {
		it('inferred type has all expected fields', () => {
			const validData: AddPractitionerInput = {
				email: 'test@example.com',
				name: 'Test User',
				bio: 'A short bio',
				role: practitionerRoles.PRACTITIONER,
				salaryActive: true,
			}
			// This tests that TypeScript type is correctly inferred (compilation check)
			expect(validData.email).toBe('test@example.com')
			expect(validData.name).toBe('Test User')
			expect(validData.role).toBe('PRACTITIONER')
			expect(validData.salaryActive).toBe(true)
		})

		it('inferred type allows optional bio', () => {
			const validData: AddPractitionerInput = {
				email: 'test@example.com',
				name: 'Test User',
				role: practitionerRoles.MANAGER,
				salaryActive: false,
			}
			expect(validData.bio).toBeUndefined()
		})
	})
})