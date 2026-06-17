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
		const ws = workspaces
			?.map((w) => {
				if (w.studio.slug === slug) {
					return w.role
				}
				return null
			})
			.filter(Boolean)
		return ws ? ws : null
	}

	return { hasBusinessAccess, getRolesInStudio }
}
