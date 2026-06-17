<script lang="ts" setup>
import 'vue-sonner/style.css'
import SidebarDashboardLayout from '~/widgets/sidebar-dashboard/index.vue'

const { visibleMenu } = useBusinessMenu()

provide('sidebarProps', visibleMenu)
</script>

<template>
	<SidebarDashboardLayout>
		<div
			class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md bg-white/10 text-sm text-white z-50 opacity-50 pointer-events-none"
		>
			<div>layouts/business.vue</div>
		</div>
		<slot />
		<Toaster position="bottom-center" rich-colors />
	</SidebarDashboardLayout>
</template>
