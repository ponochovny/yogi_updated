<script setup lang="ts">
import type { LucideIcon } from '@lucide/vue'

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/shared/ui/sidebar'

defineProps<{
	group: string
	menuItems: {
		name: string
		url: string
		icon: LucideIcon
	}[]
}>()
</script>

<template>
	<SidebarGroup class="group-data-[collapsible=icon]:hidden">
		<SidebarGroupLabel>{{ group }}</SidebarGroupLabel>
		<SidebarMenu>
			<SidebarMenuItem v-for="item in menuItems" :key="item.name">
				<SidebarMenuButton as-child>
					<NuxtLink :to="item.url">
						<component :is="item.icon" />
						<span>{{ item.name }}</span>
					</NuxtLink>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroup>
</template>
