<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config'
import MemberChooseBusiness from './_components/MemberChooseBusiness.vue'
import BusinessOwnerStudiosList from './_components/BusinessOwnerStudiosList.vue'

definePageMeta({
	title: 'Main Dashboard',
	breadcrumbs: [{ name: 'Main Dashboard', url: '/business' }],
})

const session = useSession()

const isBusinessOwner = computed(() => {
	const roles =
		// @ts-expect-error: workspaces field error
		session.value?.data?.user?.workspaces.map(
			(w: { role: typeof userRoles }) => w.role,
		) as (typeof userRoles)[keyof typeof userRoles][]

	return roles?.includes(userRoles.BUSINESS)
})

useHead({
	title: 'Main Dashboard',
})
</script>

<template>
	<div>
		<!-- <p v-if="session.isRefetching || session.isPending">Loading ...</p> -->

		<!-- TODO: when session refreshes these blocks re-render with isBusinessOwner === false and MemberChooseBusiness shows and makes a request -->
		<BusinessOwnerStudiosList v-if="isBusinessOwner" />

		<MemberChooseBusiness v-else />
	</div>
</template>
