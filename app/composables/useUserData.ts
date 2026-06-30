import { placeholderImageUrl } from '~/config/constants'
import type { UserRole, userRoles } from '~~/server/auth/config'

export interface IWorkSpace {
	role: (typeof userRoles)[keyof typeof userRoles]
	studio: {
		id: string
		slug: string
		name: string
	}
}

export const useUserData = () => {
	const session = useSession()

	const userData = ref({
		name: session.value?.data?.user?.name || '',
		email: session.value?.data?.user?.email || '',
		avatar: session.value?.data?.user?.image || placeholderImageUrl,
		roles: session.value?.data?.user?.role as UserRole[],
	})

	watch(
		() => session.value?.data?.user,
		(newUser) => {
			if (!newUser) return

			const workspaceRoles =
				(newUser?.workspaces as { role: UserRole }[])?.map((el) => el.role) ??
				[]
			const userRoles = (newUser?.role as UserRole[]) ?? []

			userData.value = {
				name: newUser.name || '',
				email: newUser.email || '',
				avatar: newUser.image || placeholderImageUrl,
				roles: [...new Set([...workspaceRoles, ...userRoles])],
			}
		},
		{ immediate: true },
	)

	const getRolesInStudio = (slug: string): UserRole[] => {
		const workspaces =
			(session.value?.data?.user?.workspaces as IWorkSpace[]) ?? []

		const roles = workspaces
			.filter((w) => w.studio.slug === slug)
			.map((w) => w.role)
		return roles.length > 0 ? roles : []
	}

	return { userData, getRolesInStudio, session }
}
