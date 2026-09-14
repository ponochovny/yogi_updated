import { describe, expect, it } from 'vitest'
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials
} from '../../app/utils/profile-menu'

describe('profile menu helpers', () => {
  it('returns the user name when available', () => {
    expect(
      getUserDisplayName({
        name: 'Jane Doe',
        email: 'jane@example.com'
      })
    ).toBe('Jane Doe')
  })

  it('falls back to email when name is missing', () => {
    expect(
      getUserDisplayName({
        name: '',
        email: 'jane@example.com'
      })
    ).toBe('jane')
  })

  it('builds initials and avatar fallback', () => {
    expect(getUserInitials('Jane Doe', 'jane@example.com')).toBe('JD')
    expect(getUserAvatarUrl('')).toMatch(/default\.png|placeholder/)
  })
})
