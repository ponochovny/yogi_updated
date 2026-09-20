import { getSession } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async to => {
  const session = useSession()
  const authState = await getSession()

  if (authState.data?.user || session.value?.data?.user) return

  return navigateTo({
    path: '/login',
    query: { redirect: to.fullPath }
  })
})
