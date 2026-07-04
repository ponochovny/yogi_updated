export const userRoles = {
  USER: 'USER',
  PRACTITIONER: 'PRACTITIONER',
  MANAGER: 'MANAGER',
  BUSINESS: 'BUSINESS',
  SUPER_ADMIN: 'SUPER-ADMIN'
} as const

export type UserRole = (typeof userRoles)[keyof typeof userRoles]
