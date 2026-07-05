import { placeholderImageUrl } from '~/config/constants'
import type { UserRole } from '~~/server/auth/config'

export interface IWorkSpace {
  role: UserRole
  studio: {
    id: string
    slug: string
    name: string
  }
}

const emptyUserData = {
  name: '',
  email: '',
  avatar: placeholderImageUrl,
  roles: [] as UserRole[]
}

export const useUserData = () => {
  const session = useSession()

  const userData = ref({ ...emptyUserData })

  const roles = ref<UserRole[]>([])

  watch(
    () => session.value?.data?.user,
    newUser => {
      if (!newUser) {
        userData.value = { ...emptyUserData }
        return
      }

      const workspaceRoles =
        // @ts-expect-error: workspaces is not typed in the session object, but we know it exists
        (newUser?.workspaces as { role: UserRole }[])?.map(el => el.role) ?? []
      const userRoles = (newUser?.role as UserRole[]) ?? []

      userData.value = {
        name: newUser.name || '',
        email: newUser.email || '',
        avatar: newUser.image || placeholderImageUrl,
        roles: [...new Set([...workspaceRoles, ...userRoles])]
      }
    },
    { immediate: true }
  )

  const getRolesInStudio = (slug: string): UserRole[] => {
    if (session.value?.isPending) return roles.value

    // @ts-expect-error: workspaces is not typed in the session object, but we know it exists
    const userWorkspaces = session.value?.data?.user?.workspaces as
      | IWorkSpace[]
      | undefined

    const workspaces = userWorkspaces ?? []

    roles.value = workspaces
      .filter(w => w.studio.slug === slug)
      .map(w => w.role)
    return roles.value
  }

  return { userData, getRolesInStudio, session }
}
