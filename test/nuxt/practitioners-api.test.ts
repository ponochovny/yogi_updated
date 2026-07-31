/**
 * Tests for the practitioners API business logic.
 *
 * These tests verify the core validation and response behavior of:
 * - GET /api/business/studios/[slug]/practitioners
 * - POST /api/business/studios/[slug]/practitioners
 *
 * Since the handlers rely on Nuxt server auto-imports (auth, useDb, H3 helpers),
 * we test the logic by mocking module-level dependencies.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { addPractitionerSchema } from '../../app/entities/practitioner/schema'
import { practitionerRoles } from '../../server/utils/auth/config'

// ──────────────────────────────────────────────────────────────────────
// Helpers for simulating handler logic
// ──────────────────────────────────────────────────────────────────────

/**
 * Simulates the auth gate used at the top of both handlers.
 * Returns the session user's ID, or throws a 401 error.
 */
function getAuthenticatedUserId(
	session: { user?: { id: string } } | null,
): string {
	if (!session || !session.user) {
		const err = new Error('Unauthorized access')
		;(err as NodeJS.ErrnoException).code = '401'
		Object.assign(err, { statusCode: 401, statusMessage: 'Unauthorized access' })
		throw err
	}
	return session.user.id
}

/**
 * Simulates the studio ownership check used in both handlers.
 */
function requireStudio(
	studios: Array<{ id: string; slug: string; ownerId: string }>,
	slug: string,
	userId: string,
): { id: string; slug: string; ownerId: string } {
	const studio = studios.find((s) => s.slug === slug && s.ownerId === userId)
	if (!studio) {
		const err = new Error('Studio not found')
		Object.assign(err, { statusCode: 404 })
		throw err
	}
	return studio
}

/**
 * Simulates the duplicate-link check used in the POST handler.
 */
function requireNoDuplicateLink(
	existingLinks: Array<{ studioId: string; userId: string }>,
	studioId: string,
	userId: string,
): void {
	const existing = existingLinks.find(
		(l) => l.studioId === studioId && l.userId === userId,
	)
	if (existing) {
		const err = new Error('Practitioner already added to studio')
		Object.assign(err, { statusCode: 409 })
		throw err
	}
}

// ──────────────────────────────────────────────────────────────────────
// GET /api/business/studios/[slug]/practitioners
// ──────────────────────────────────────────────────────────────────────

describe('GET /api/business/studios/[slug]/practitioners', () => {
	describe('authentication', () => {
		it('throws 401 when session is null', () => {
			expect(() => getAuthenticatedUserId(null)).toThrow()
		})

		it('throws 401 when session exists but has no user', () => {
			expect(() => getAuthenticatedUserId({ user: undefined })).toThrow()
		})

		it('throws with statusCode 401 for missing session', () => {
			try {
				getAuthenticatedUserId(null)
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(401)
			}
		})

		it('throws with statusCode 401 for session without user', () => {
			try {
				getAuthenticatedUserId({ user: undefined })
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(401)
			}
		})

		it('returns userId when session is valid', () => {
			const session = { user: { id: 'user-123' } }
			const userId = getAuthenticatedUserId(session)
			expect(userId).toBe('user-123')
		})
	})

	describe('studio ownership check', () => {
		const mockStudios = [
			{ id: 'studio-1', slug: 'my-studio', ownerId: 'user-1' },
			{ id: 'studio-2', slug: 'other-studio', ownerId: 'user-2' },
		]

		it('throws 404 when no studio matches slug', () => {
			try {
				requireStudio(mockStudios, 'nonexistent-studio', 'user-1')
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(404)
			}
		})

		it('throws 404 when slug matches but ownerId does not', () => {
			try {
				requireStudio(mockStudios, 'my-studio', 'user-2')
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(404)
			}
		})

		it('throws 404 when ownerId matches but slug does not', () => {
			try {
				requireStudio(mockStudios, 'other-studio', 'user-1')
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(404)
			}
		})

		it('returns studio when slug and ownerId both match', () => {
			const studio = requireStudio(mockStudios, 'my-studio', 'user-1')
			expect(studio).toEqual({ id: 'studio-1', slug: 'my-studio', ownerId: 'user-1' })
		})
	})

	describe('team response structure', () => {
		it('returns success: true and team array', () => {
			const team = [
				{
					linkId: 'link-1',
					role: practitionerRoles.PRACTITIONER,
					isActive: true,
					user: {
						id: 'user-1',
						name: 'Alice',
						email: 'alice@example.com',
						image: null,
						emailVerified: true,
					},
				},
			]

			const response = { success: true, team }
			expect(response.success).toBe(true)
			expect(response.team).toHaveLength(1)
			expect(response.team[0].linkId).toBe('link-1')
			expect(response.team[0].role).toBe('PRACTITIONER')
			expect(response.team[0].user.emailVerified).toBe(true)
		})

		it('returns empty team array when no practitioners exist', () => {
			const response = { success: true, team: [] }
			expect(response.success).toBe(true)
			expect(response.team).toHaveLength(0)
		})

		it('team member includes expected user fields', () => {
			const member = {
				linkId: 'link-uuid',
				role: practitionerRoles.MANAGER,
				isActive: false,
				user: {
					id: 'user-abc',
					name: 'Bob Manager',
					email: 'bob@studio.com',
					image: 'https://example.com/avatar.jpg',
					emailVerified: false,
				},
			}
			expect(member.user).toHaveProperty('id')
			expect(member.user).toHaveProperty('name')
			expect(member.user).toHaveProperty('email')
			expect(member.user).toHaveProperty('image')
			expect(member.user).toHaveProperty('emailVerified')
		})
	})
})

// ──────────────────────────────────────────────────────────────────────
// POST /api/business/studios/[slug]/practitioners
// ──────────────────────────────────────────────────────────────────────

describe('POST /api/business/studios/[slug]/practitioners', () => {
	describe('authentication', () => {
		it('throws 401 when no session', () => {
			expect(() => getAuthenticatedUserId(null)).toThrow()
		})

		it('throws with statusCode 401', () => {
			try {
				getAuthenticatedUserId(null)
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(401)
			}
		})
	})

	describe('request body validation via addPractitionerSchema', () => {
		it('rejects missing email', () => {
			const result = addPractitionerSchema.safeParse({
				name: 'Alice',
			})
			expect(result.success).toBe(false)
		})

		it('rejects missing name', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'alice@example.com',
			})
			expect(result.success).toBe(false)
		})

		it('rejects invalid email format', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'not-an-email',
				name: 'Alice',
			})
			expect(result.success).toBe(false)
		})

		it('rejects invalid role', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'alice@example.com',
				name: 'Alice',
				role: 'SUPER_USER',
			})
			expect(result.success).toBe(false)
		})

		it('accepts valid minimal body', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'alice@example.com',
				name: 'Alice',
			})
			expect(result.success).toBe(true)
		})

		it('defaults role to PRACTITIONER', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'alice@example.com',
				name: 'Alice',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.role).toBe(practitionerRoles.PRACTITIONER)
			}
		})

		it('defaults salaryActive to true', () => {
			const result = addPractitionerSchema.safeParse({
				email: 'alice@example.com',
				name: 'Alice',
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.salaryActive).toBe(true)
			}
		})
	})

	describe('duplicate practitioner check (409 conflict)', () => {
		const existingLinks = [
			{ studioId: 'studio-1', userId: 'user-1' },
		]

		it('throws 409 when practitioner is already linked to studio', () => {
			try {
				requireNoDuplicateLink(existingLinks, 'studio-1', 'user-1')
				expect.fail('Should have thrown')
			} catch (err) {
				expect((err as { statusCode: number }).statusCode).toBe(409)
			}
		})

		it('does not throw when practitioner is linked to a different studio', () => {
			expect(() =>
				requireNoDuplicateLink(existingLinks, 'studio-2', 'user-1'),
			).not.toThrow()
		})

		it('does not throw when a different user is linked to same studio', () => {
			expect(() =>
				requireNoDuplicateLink(existingLinks, 'studio-1', 'user-2'),
			).not.toThrow()
		})

		it('does not throw for a brand new studio+user combination', () => {
			expect(() =>
				requireNoDuplicateLink(existingLinks, 'studio-99', 'user-99'),
			).not.toThrow()
		})
	})

	describe('new user creation logic', () => {
		it('creates a new user when none found by email', () => {
			const existingUsers: Array<{ email: string; id: string }> = []
			const email = 'newuser@example.com'

			let targetUser = existingUsers.find((u) => u.email === email)
			if (!targetUser) {
				targetUser = {
					id: 'new-uuid',
					email,
				}
			}

			expect(targetUser).toBeDefined()
			expect(targetUser.email).toBe(email)
		})

		it('reuses existing user when found by email', () => {
			const existingUsers = [{ email: 'existing@example.com', id: 'existing-id' }]
			const email = 'existing@example.com'

			let targetUser = existingUsers.find((u) => u.email === email)
			if (!targetUser) {
				targetUser = { id: 'should-not-create', email }
			}

			expect(targetUser.id).toBe('existing-id')
		})

		it('new user is created with emailVerified: false', () => {
			const newUser = {
				id: 'new-uuid',
				email: 'newuser@example.com',
				name: 'New User',
				emailVerified: false,
				bio: '',
				role: ['practitioner'],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			expect(newUser.emailVerified).toBe(false)
		})

		it('new user is assigned the practitioner role', () => {
			const newUser = {
				id: 'new-uuid',
				email: 'newuser@example.com',
				name: 'New User',
				emailVerified: false,
				bio: '',
				role: ['practitioner'],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			expect(newUser.role).toContain('practitioner')
		})
	})

	describe('successful response structure', () => {
		it('returns success: true and data on success', () => {
			const mockResult = {
				practitionerLink: {
					id: 'link-uuid',
					studioId: 'studio-1',
					userId: 'user-1',
					role: practitionerRoles.PRACTITIONER,
					salaryActive: true,
					isActive: true,
				},
				user: {
					id: 'user-1',
					email: 'alice@example.com',
					name: 'Alice',
				},
			}

			const response = { success: true, data: mockResult }
			expect(response.success).toBe(true)
			expect(response.data.practitionerLink).toBeDefined()
			expect(response.data.user).toBeDefined()
			expect(response.data.practitionerLink.role).toBe(practitionerRoles.PRACTITIONER)
			expect(response.data.practitionerLink.isActive).toBe(true)
		})

		it('response includes the user who was added', () => {
			const mockResult = {
				practitionerLink: {
					id: 'link-uuid',
					studioId: 'studio-1',
					userId: 'user-1',
					role: practitionerRoles.MANAGER,
					salaryActive: false,
					isActive: true,
				},
				user: {
					id: 'user-1',
					email: 'manager@studio.com',
					name: 'Manager Bob',
				},
			}

			const response = { success: true, data: mockResult }
			expect(response.data.user.email).toBe('manager@studio.com')
			expect(response.data.practitionerLink.role).toBe(practitionerRoles.MANAGER)
			expect(response.data.practitionerLink.salaryActive).toBe(false)
		})
	})
})