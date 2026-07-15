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

export const getWorkspaceRoles = (
  workspaces: ReadonlyArray<IWorkSpace> | undefined,
  slug?: string
): UserRole[] => {
  return (workspaces ?? [])
    .filter(workspace => !slug || workspace.studio.slug === slug)
    .map(workspace => workspace.role)
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

  watch(
    () => session.value?.data?.user,
    newUser => {
      if (!newUser) {
        userData.value = { ...emptyUserData }
        return
      }

      const workspaceRoles = getWorkspaceRoles(newUser?.workspaces)
      const userRoles = (newUser?.role as UserRole[] | undefined) ?? []

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
    if (session.value?.isPending) return []

    return getWorkspaceRoles(session.value?.data?.user?.workspaces, slug)
  }

  return { userData, getRolesInStudio, session }
}
