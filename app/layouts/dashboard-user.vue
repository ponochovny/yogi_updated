<script lang="ts" setup>
import 'vue-sonner/style.css'
import SidebarDashboardLayout from '~/widgets/sidebar-dashboard/index.vue'
import { PlusIcon, ShoppingCartIcon, UserIcon } from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'

const sidebarProps = [
	{
		group: 'Platform',
		menuLinks: [
			{
				name: 'Profile settings',
				url: PagesConfig.PROFILE_SETTINGS,
				icon: UserIcon,
			},
			{
				name: 'My Bookings',
				url: PagesConfig.PROFILE_BOOKINGS,
				icon: ShoppingCartIcon,
			},
		],
	},
	{
		group: 'Business',
		menuLinks: [
			{
				name: 'Create studio',
				url: PagesConfig.BUSINESS,
				icon: PlusIcon,
			},
		],
	},
]
provide('sidebarProps', sidebarProps)
</script>

<template>
	<SidebarDashboardLayout>
		<div
			class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md bg-white/10 text-sm text-muted-foreground z-50 opacity-50 pointer-events-none"
		>
			<div>layouts/dashboard-user.vue</div>
		</div>
		<slot />
		<Toaster position="bottom-center" rich-colors />
	</SidebarDashboardLayout>
</template>
