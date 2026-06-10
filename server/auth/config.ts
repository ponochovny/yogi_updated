export const userRoles = {
	USER: 'USER',
	PRACTITIONER: 'PRACTITIONER',
	BUSINESS: 'BUSINESS',
	SUPER_ADMIN: 'SUPER-ADMIN',
} as const

export const practitionerRoles = {
	OWNER: 'OWNER',
	PRACTITIONER: 'PRACTITIONER',
	MANAGER: 'MANAGER',
} as const

export type UserRole = (typeof userRoles)[keyof typeof userRoles]
export type PractitionerRole =
	(typeof practitionerRoles)[keyof typeof practitionerRoles]
