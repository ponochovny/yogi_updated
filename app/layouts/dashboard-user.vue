<script lang="ts" setup>
import SidebarDashboardLayout from '~/widgets/sidebar-dashboard/index.vue'
import { InfoIcon, MapPinIcon, ShoppingCartIcon } from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'

const sidebarProps = {
	group: 'Platform',
	menuLinks: [
		{
			name: 'Profile settings',
			url: PagesConfig.PROFILE_SETTINGS,
			icon: InfoIcon,
		},
		{
			name: 'Location & Categories',
			// url: PagesConfig.PROFILE_ADDITIONAL,
			url: '#',
			icon: MapPinIcon,
		},
		{
			name: 'Purchase History',
			// url: PagesConfig.PROFILE_VENUES,
			url: '#',
			icon: ShoppingCartIcon,
		},
	],
}
provide('sidebarProps', sidebarProps)
</script>

<template>
	<SidebarDashboardLayout>
		<div
			class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md bg-white/10 text-sm text-white z-50 opacity-50 pointer-events-none"
		>
			<div>layouts/dashboard-user.vue</div>
		</div>
		<slot />
		<Toaster />
	</SidebarDashboardLayout>
</template>
