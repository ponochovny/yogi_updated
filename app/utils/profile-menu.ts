import { placeholderImageUrl } from '../config/constants'

export type ProfileMenuUser = {
  name?: string | null
  email?: string | null
  avatar?: string | null
}

export function getUserDisplayName(user: ProfileMenuUser) {
  const trimmedName = user.name?.trim()
  if (trimmedName) {
    return trimmedName
  }

  const trimmedEmail = user.email?.trim()
  if (!trimmedEmail) {
    return 'User'
  }

  const localPart = trimmedEmail.split('@')[0]?.trim()
  return localPart || trimmedEmail
}

export function getUserInitials(
  name?: string | null,
  email?: string | null,
  fallback = 'U'
) {
  const source = (name?.trim() || email?.trim() || fallback).trim()

  if (!source) {
    return fallback
  }

  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]?.[0]}${parts[1]?.[0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function getUserAvatarUrl(avatar?: string | null) {
  return avatar?.trim() ? avatar : placeholderImageUrl
}
