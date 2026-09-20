import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  requireAuthenticatedUser,
  requireStudioAccess
} from '~~/server/utils/api-helpers'
import { checkStudioAccess } from '~~/server/utils/permission'
import { userRoles } from '~~/server/auth/config'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn()
}))

vi.mock('~~/server/utils/auth', () => ({
  auth: { api: { getSession: mocks.getSession } }
}))

const event = { headers: new Headers() } as never

function mockDb(
  membership: Array<{ role: string; studioId: string }>,
  practitioners: Array<{ id: string }> = []
) {
  let whereCalls = 0
  const query = {
    select: vi.fn(() => query),
    from: vi.fn(() => query),
    innerJoin: vi.fn(() => query),
    where: vi.fn(() => {
      whereCalls += 1
      return whereCalls === 1 ? Promise.resolve(membership) : query
    }),
    limit: vi.fn(() => Promise.resolve(practitioners))
  }
  vi.stubGlobal('useDb', () => query)
}

describe('authorization rules', () => {
  beforeEach(() => {
    mocks.getSession.mockReset()
    vi.unstubAllGlobals()
  })

  it('rejects a guest from a direct API request', async () => {
    mocks.getSession.mockResolvedValue(null)

    await expect(requireAuthenticatedUser(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('returns the authenticated user', async () => {
    const user = { id: 'user-1', name: 'Member' }
    mocks.getSession.mockResolvedValue({ user })

    await expect(requireAuthenticatedUser(event)).resolves.toEqual(user)
  })

  it('requires studio membership and rejects a missing membership', async () => {
    mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockDb([])

    await expect(
      requireStudioAccess(event, 'studio', [userRoles.MANAGER])
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('rejects a member with the wrong role', async () => {
    mockDb([{ role: userRoles.PRACTITIONER, studioId: 'studio-1' }])

    await expect(
      checkStudioAccess('user-1', 'studio', [userRoles.MANAGER])
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('allows practitioner-only access only with a practitioner profile', async () => {
    mockDb(
      [{ role: userRoles.PRACTITIONER, studioId: 'studio-1' }],
      [{ id: 'practitioner-1' }]
    )

    await expect(
      checkStudioAccess('user-1', 'studio', [userRoles.PRACTITIONER])
    ).resolves.toMatchObject({
      studioId: 'studio-1',
      practitionerId: 'practitioner-1',
      roles: [userRoles.PRACTITIONER]
    })
  })
})
