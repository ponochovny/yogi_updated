<script lang="ts" setup>
import SidebarDashboardLayout from '~/widgets/sidebar-dashboard/index.vue'
import { ChartNoAxesCombinedIcon, PlusIcon } from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'

const sidebarProps = {
	group: 'Business',
	menuLinks: [
		{
			name: 'Main Dashboard',
			url: PagesConfig.BUSINESS,
			icon: ChartNoAxesCombinedIcon,
		},
		{
			name: 'Create Studio',
			url: PagesConfig.BUSINESS + '/create',
			icon: PlusIcon,
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
			<div>layouts/business.vue</div>
		</div>
		<slot />
		<Toaster />
	</SidebarDashboardLayout>
</template>
