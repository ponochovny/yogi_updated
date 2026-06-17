import type { userRoles } from '~~/server/auth/config'

interface IWorkSpaces {
	role: (typeof userRoles)[keyof typeof userRoles]
	studio: {
		id: string
		slug: string
		name: string
	}
}

export const useWorkspaces = (workspaces: IWorkSpaces[]) => {
	const hasBusinessAccess = computed(() => workspaces && workspaces.length > 0)

	const getRolesInStudio = (slug: string) => {
		const roles = workspaces
			.filter((w) => w.studio.slug === slug)
			.map((w) => w.role)
		return roles.length > 0 ? roles : null
	}

	return { hasBusinessAccess, getRolesInStudio }
}
