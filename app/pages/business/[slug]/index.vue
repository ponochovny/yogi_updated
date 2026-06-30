<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config.js'
import StudioOwnerDashboard from './_components/StudioOwnerDashboard.vue'
import StudioManagerDashboard from './_components/StudioManagerDashboard.vue'
import StudioPractitionerDashboard from './_components/StudioPractitionerDashboard.vue'
import StudioPartnerOnboarding from './_components/StudioPartnerOnboarding.vue'

definePageMeta({
	title: 'Business Overview',
	breadcrumbs: [
		{ name: 'Businesses', url: '/business' },
		{ name: 'Business Overview' },
	],
})

const { userData } = useUserData()
</script>

<template>
	<div>
		<StudioOwnerDashboard v-if="userData.roles?.includes(userRoles.BUSINESS)" />

		<StudioManagerDashboard
			v-if="userData.roles?.includes(userRoles.MANAGER)"
		/>

		<StudioPractitionerDashboard
			v-if="userData.roles?.includes(userRoles.PRACTITIONER)"
		/>

		<StudioPartnerOnboarding v-if="!userData.roles?.length" />
	</div>
</template>
